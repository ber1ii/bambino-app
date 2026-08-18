package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/mail"
	"regexp"
	"strings"
	"time"

	"bambino-backend/internal/repository"
	"bambino-backend/internal/service"
)

type ReservationHandler struct {
	repo *repository.ReservationRepository
}

func NewReservationHandler(repo *repository.ReservationRepository) *ReservationHandler {
	return &ReservationHandler{repo: repo}
}

type CreateReservationPayload struct {
	PackageID   string    `json:"package_id"`
	ParentName  string    `json:"parent_name"`
	ChildName   string    `json:"child_name"`
	ChildAge    int       `json:"child_age"`
	PhoneNumber string    `json:"phone_number"`
	Email       string    `json:"email"`
	Notes       string    `json:"notes"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
}

func (h *ReservationHandler) Create(w http.ResponseWriter, r *http.Request) {
	var payload CreateReservationPayload

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error": "Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if msg := validateCreateReservation(payload); msg != "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": msg})
		return
	}

	reservation, err := h.repo.Create(r.Context(), repository.CreateReservationParams{
		PackageID:   payload.PackageID,
		ParentName:  payload.ParentName,
		ChildName:   payload.ChildName,
		ChildAge:    payload.ChildAge,
		PhoneNumber: payload.PhoneNumber,
		Email:       payload.Email,
		Notes:       payload.Notes,
		StartTime:   payload.StartTime,
		EndTime:     payload.EndTime,
	})

	if err != nil {
		if errors.Is(err, repository.ErrSlotUnavailable) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Izabrani termin je zauzet. Molimo izaberite drugo vreme.",
			})
			return
		}

		http.Error(w, `{"error": "Failed to create reservation"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(reservation)

	// Asynchronously send confirmation email and WhatsApp notification
	go func(r *repository.Reservation) {
		dateFormatted := r.StartTime.Format("02.01.2006.")
		timeFormatted := fmt.Sprintf("%s - %s", r.StartTime.Format("15:04"), r.EndTime.Format("15:04"))

		if err := service.SendConfirmationEmail(r.Email, r.ParentName, dateFormatted, timeFormatted); err != nil {
			log.Printf("[ERROR] Email send failed: %v", err)
		}
	}(reservation)
}

var phoneRegex = regexp.MustCompile(`^\+?[0-9\s\-()]{6,20}$`)
var uuidRegex = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

func validateCreateReservation(p CreateReservationPayload) string {
	if strings.TrimSpace(p.PackageID) == "" {
		return "package_id is required"
	}
	// Check for valid UUID format instead of slug strings
	if !uuidRegex.MatchString(p.PackageID) {
		return "invalid package_id selected"
	}
	if n := strings.TrimSpace(p.ParentName); n == "" || len(n) > 100 {
		return "parent_name is required and must be under 100 characters"
	}
	if n := strings.TrimSpace(p.ChildName); n == "" || len(n) > 100 {
		return "child_name is required and must be under 100 characters"
	}
	if p.ChildAge < 1 || p.ChildAge > 17 {
		return "child_age must be between 1 and 17"
	}
	if _, err := mail.ParseAddress(p.Email); err != nil {
		return "email is invalid"
	}
	if !phoneRegex.MatchString(p.PhoneNumber) {
		return "phone_number is invalid"
	}
	if len(p.Notes) > 1000 {
		return "notes must be under 1000 characters"
	}
	if !p.EndTime.After(p.StartTime) {
		return "end_time must be after start_time"
	}
	return ""
}

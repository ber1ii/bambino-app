package handler

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"bambino-backend/internal/config"
	"bambino-backend/internal/repository"
	"bambino-backend/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
)

type PinLoginPayload struct {
	Pin string `json:"pin"`
}

type BlockSlotPayload struct {
	Date      string `json:"date"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	Reason    string `json:"reason"`
}

func getPepperedPIN(pin string) []byte {
	pepper := os.Getenv("ADMIN_PEPPER")
	h := hmac.New(sha256.New, []byte(pepper))
	h.Write([]byte(pin))
	return h.Sum(nil)
}

func (h *ReservationHandler) Login(w http.ResponseWriter, r *http.Request) {
	var payload PinLoginPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	expectedPin := os.Getenv("ADMIN_PIN")
	if expectedPin == "" {
		if os.Getenv("ENV") == "production" {
			http.Error(w, `{"error":"server misconfigured"}`, http.StatusInternalServerError)
			return
		}
		expectedPin = "123456" // Default dev fallback
	}

	if !hmac.Equal(getPepperedPIN(payload.Pin), getPepperedPIN(expectedPin)) {
		http.Error(w, `{"error":"invalid pin"}`, http.StatusUnauthorized)
		return
	}

	secret := config.JWTSecret()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"admin": true,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(secret)
	if err != nil {
		http.Error(w, `{"error":"failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Bearer-token auth only. No cookie is set here (see middleware/auth.go) —
	// the frontend already stores this token and sends it as `Authorization: Bearer`,
	// so an HttpOnly cookie carrying the same token added nothing but a second,
	// weaker copy of the credential.
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "logged in",
		"token":   tokenString,
	})
}

func parsePagination(r *http.Request) (limit, offset int) {
	limit, offset = 20, 0
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}
	if v := r.URL.Query().Get("offset"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			offset = n
		}
	}
	return
}

func (h *ReservationHandler) GetAllReservations(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	} // podrazumevano 10 po strani

	reservations, totalCount, err := h.repo.GetAllReservationsPaginated(r.Context(), page, limit)
	if err != nil {
		http.Error(w, `{"error":"failed to fetch reservations"}`, http.StatusInternalServerError)
		return
	}

	totalPages := (totalCount + limit - 1) / limit

	response := map[string]interface{}{
		"data":        reservations,
		"page":        page,
		"limit":       limit,
		"total_count": totalCount,
		"total_pages": totalPages,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ReservationHandler) UpdateReservationStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var payload struct {
		Status    string `json:"status"`
		SendEmail bool   `json:"send_email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error":"invalid payload"}`, http.StatusBadRequest)
		return
	}

	status := strings.ToLower(strings.TrimSpace(payload.Status))
	var validStatuses = map[string]bool{
		"pending":   true,
		"confirmed": true,
		"completed": true,
		"cancelled": true,
	}

	if !validStatuses[status] {
		http.Error(w, `{"error":"invalid status value"}`, http.StatusBadRequest)
		return
	}

	updated, err := h.repo.UpdateReservationStatus(r.Context(), id, status)
	if err != nil {
		http.Error(w, `{"error":"failed to update status"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message":"status updated"}`))

	// "Potvrdi" (confirmed) and "Otkazi" (cancelled) both notify the customer,
	// but only if the owner opted in via the confirm dialog on the frontend.
	if payload.SendEmail {
		go func(res *repository.Reservation) {
			// res.StartTime/EndTime come from lower()/upper() on booking_range via pgx,
			// which scans timestamptz back as UTC. Create's email avoids this because it
			// formats the payload's already-local time directly. Convert to Belgrade time
			// here so Confirm/Cancel emails don't show a UTC-offset-shifted slot.
			loc, err := time.LoadLocation("Europe/Belgrade")
			if err != nil {
				loc = time.UTC
				log.Printf("[WARN] failed to load Europe/Belgrade location, falling back to UTC: %v", err)
			}
			startLocal := res.StartTime.In(loc)
			endLocal := res.EndTime.In(loc)

			dateFormatted := startLocal.Format("02.01.2006.")
			timeFormatted := fmt.Sprintf("%s - %s", startLocal.Format("15:04"), endLocal.Format("15:04"))

			if err := service.SendStatusUpdateEmail(res.Email, res.ParentName, dateFormatted, timeFormatted, status); err != nil {
				log.Printf("[ERROR] Status update email send failed: %v", err)
			}
		}(updated)
	}
}

func (h *ReservationHandler) BlockTimeSlot(w http.ResponseWriter, r *http.Request) {
	var payload BlockSlotPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error":"invalid payload"}`, http.StatusBadRequest)
		return
	}

	if payload.Date == "" || payload.StartTime == "" || payload.EndTime == "" {
		http.Error(w, `{"error":"date, startTime, and endTime are required"}`, http.StatusBadRequest)
		return
	}

	err := h.repo.BlockTimeSlot(r.Context(), payload.Date, payload.StartTime, payload.EndTime, payload.Reason)
	if err != nil {
		http.Error(w, `{"error":"failed to block time slot"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message":"time slot blocked successfully"}`))
}

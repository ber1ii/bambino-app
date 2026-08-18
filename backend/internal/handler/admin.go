package handler

import (
	"bambino-backend/internal/config"
	"bambino-backend/internal/repository"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type LoginPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *ReservationHandler) Login(w http.ResponseWriter, r *http.Request) {
	var payload LoginPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(payload.Email) == "" || payload.Password == "" {
		http.Error(w, `{"error":"email and password required"}`, http.StatusBadRequest)
		return
	}

	hash, err := h.repo.GetAdminHash(r.Context(), payload.Email)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(payload.Password)) != nil {
		http.Error(w, `{"error":"invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	secret := config.JWTSecret()
	if len(secret) == 0 {
		secret = []byte("super-secret-development-key")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": payload.Email,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(secret)
	if err != nil {
		http.Error(w, `{"error":"failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	isProd := os.Getenv("ENV") == "production"

	http.SetCookie(w, &http.Cookie{
		Name:     "admin_token",
		Value:    tokenString,
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   isProd, // true in production (requires HTTPS)
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
	})

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message":"logged in"}`))
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
	limit, offset := parsePagination(r)
	reservations, err := h.repo.GetAllReservations(r.Context(), limit, offset)
	if err != nil {
		http.Error(w, `{"error":"failed to fetch reservations"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if reservations == nil {
		reservations = []repository.Reservation{}
	}
	json.NewEncoder(w).Encode(reservations)
}

func (h *ReservationHandler) UpdateReservationStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var payload struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error":"invalid payload"}`, http.StatusBadRequest)
		return
	}

	var validStatuses = map[string]bool{"pending": true, "confirmed": true, "cancelled": true}

	if !validStatuses[payload.Status] {
		http.Error(w, `{"error":"invalid status value"}`, http.StatusBadRequest)
		return
	}

	if err := h.repo.UpdateReservationStatus(r.Context(), id, payload.Status); err != nil {
		http.Error(w, `{"error":"failed to update status"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message":"status updated"}`))
}

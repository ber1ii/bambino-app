package handler

import (
	"encoding/json"
	"net/http"

	"bambino-backend/internal/repository"
)

func (h *ReservationHandler) GetPackages(w http.ResponseWriter, r *http.Request) {
	packages, err := h.repo.GetPackages(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to fetch packages"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(packages)
}

func (h *ReservationHandler) GetAvailability(w http.ResponseWriter, r *http.Request) {
	dateStr := r.URL.Query().Get("date")
	if dateStr == "" {
		http.Error(w, `{"error":"date query parameter required (YYYY-MM-DD)"}`, http.StatusBadRequest)
		return
	}

	slots, err := h.repo.GetReservedSlotsByDate(r.Context(), dateStr)
	if err != nil {
		http.Error(w, `{"error":"failed to fetch availability"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if slots == nil {
		slots = []repository.TimeSlot{}
	}
	json.NewEncoder(w).Encode(slots)
}

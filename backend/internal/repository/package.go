package repository

import (
	"context"
	"time"
)

type Package struct {
	ID              string  `json:"id"`
	Title           string  `json:"title"`
	Description     string  `json:"description"`
	DurationMinutes int     `json:"duration_minutes"`
	Price           float64 `json:"price"`
}

type TimeSlot struct {
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
}

func (r *ReservationRepository) GetPackages(ctx context.Context) ([]Package, error) {
	query := `SELECT id, title, description, duration_minutes, price FROM packages ORDER BY price ASC`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var packages []Package
	for rows.Next() {
		var p Package
		if err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.DurationMinutes, &p.Price); err != nil {
			return nil, err
		}
		packages = append(packages, p)
	}
	return packages, nil
}

func (r *ReservationRepository) GetReservedSlotsByDate(ctx context.Context, date string) ([]TimeSlot, error) {
	query := `
		SELECT lower(booking_range) AS start_time, upper(booking_range) AS end_time 
		FROM reservations 
		WHERE status IN ('pending', 'confirmed') 
		  AND lower(booking_range)::date = $1::date
		ORDER BY start_time ASC`

	rows, err := r.db.Query(ctx, query, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var slots []TimeSlot
	for rows.Next() {
		var s TimeSlot
		if err := rows.Scan(&s.StartTime, &s.EndTime); err != nil {
			return nil, err
		}
		slots = append(slots, s)
	}
	return slots, nil
}

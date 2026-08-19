package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrSlotUnavailable = errors.New("the selected time slot is already booked")

type Reservation struct {
	ID          string    `json:"id"`
	PackageID   string    `json:"package_id"`
	PackageName string    `json:"package_name"`
	Price       float64   `json:"price"`
	ParentName  string    `json:"parent_name"`
	ChildName   string    `json:"child_name"`
	ChildAge    int       `json:"child_age"`
	PhoneNumber string    `json:"phone_number"`
	Email       string    `json:"email"`
	Notes       string    `json:"notes"`
	Status      string    `json:"status"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateReservationParams struct {
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

type ReservationRepository struct {
	db *pgxpool.Pool
}

type BlockedSlot struct {
	ID        string    `json:"id"`
	Date      string    `json:"date"`
	StartTime string    `json:"startTime"`
	EndTime   string    `json:"endTime"`
	Reason    string    `json:"reason"`
	CreatedAt time.Time `json:"createdAt"`
}

func NewReservationRepository(db *pgxpool.Pool) *ReservationRepository {
	return &ReservationRepository{db: db}
}

func (r *ReservationRepository) Create(ctx context.Context, params CreateReservationParams) (*Reservation, error) {
	query := `
		INSERT INTO reservations (
			package_id, parent_name, child_name, child_age, 
			phone_number, email, notes, booking_range
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, 
			tstzrange($8, $9, '[)')
		)
		RETURNING id, package_id, parent_name, child_name, child_age, phone_number, email, notes, status, created_at;
	`

	var res Reservation
	res.StartTime = params.StartTime
	res.EndTime = params.EndTime

	err := r.db.QueryRow(ctx, query,
		params.PackageID,
		params.ParentName,
		params.ChildName,
		params.ChildAge,
		params.PhoneNumber,
		params.Email,
		params.Notes,
		params.StartTime,
		params.EndTime,
	).Scan(
		&res.ID,
		&res.PackageID,
		&res.ParentName,
		&res.ChildName,
		&res.ChildAge,
		&res.PhoneNumber,
		&res.Email,
		&res.Notes,
		&res.Status,
		&res.CreatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23P01" { // exclusion_violation
			return nil, ErrSlotUnavailable
		}
		return nil, fmt.Errorf("failed to create reservation: %w", err)
	}

	return &res, nil
}

func (r *ReservationRepository) BlockTimeSlot(ctx context.Context, date, startTime, endTime, reason string) error {
	query := `
		INSERT INTO blocked_slots (date, start_time, end_time, reason, created_at)
		VALUES ($1, $2, $3, $4, NOW())
	`
	_, err := r.db.Exec(ctx, query, date, startTime, endTime, reason)
	return err
}

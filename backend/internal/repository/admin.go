package repository

import (
	"context"
)

func (r *ReservationRepository) GetAdminHash(ctx context.Context, email string) (string, error) {
	var hash string
	err := r.db.QueryRow(ctx, "SELECT password_hash FROM admin_users WHERE email = $1", email).Scan(&hash)
	return hash, err
}

func (r *ReservationRepository) GetAllReservations(ctx context.Context, limit, offset int) ([]Reservation, error) {
	query := `
		SELECT id, package_id, parent_name, child_name, child_age, phone_number, email, notes, status,
		       lower(booking_range) AS start_time, upper(booking_range) AS end_time, created_at
		FROM reservations
		ORDER BY start_time DESC
		LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resList []Reservation
	for rows.Next() {
		var res Reservation
		if err := rows.Scan(&res.ID, &res.PackageID, &res.ParentName, &res.ChildName, &res.ChildAge,
			&res.PhoneNumber, &res.Email, &res.Notes, &res.Status, &res.StartTime, &res.EndTime, &res.CreatedAt); err != nil {
			return nil, err
		}
		resList = append(resList, res)
	}
	return resList, nil
}

func (r *ReservationRepository) UpdateReservationStatus(ctx context.Context, id string, status string) error {
	query := `UPDATE reservations SET status = $1 WHERE id = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

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
		SELECT 
			r.id, r.package_id, COALESCE(p.title, 'Nepoznat paket') AS package_name, COALESCE(p.price, 0) AS price,
			r.parent_name, r.child_name, r.child_age, r.phone_number, r.email, r.notes, r.status,
			lower(r.booking_range) AS start_time, upper(r.booking_range) AS end_time, r.created_at
		FROM reservations r
		LEFT JOIN packages p ON r.package_id = p.id
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
		if err := rows.Scan(
			&res.ID, &res.PackageID, &res.PackageName, &res.Price,
			&res.ParentName, &res.ChildName, &res.ChildAge,
			&res.PhoneNumber, &res.Email, &res.Notes, &res.Status,
			&res.StartTime, &res.EndTime, &res.CreatedAt,
		); err != nil {
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

func (r *ReservationRepository) GetAllReservationsPaginated(ctx context.Context, page, limit int) ([]Reservation, int, error) {
	offset := (page - 1) * limit

	// 1. Ukupan broj zapisa
	var total int
	countQuery := `SELECT COUNT(*) FROM reservations`
	if err := r.db.QueryRow(ctx, countQuery).Scan(&total); err != nil {
		return nil, 0, err
	}

	// 2. Straničeni upit sa LEFT JOIN na pakete
	query := `
		SELECT 
			r.id, r.package_id, COALESCE(p.title, 'Nepoznat paket') AS package_name, COALESCE(p.price, 0) AS price,
			r.parent_name, r.child_name, r.child_age, r.phone_number, r.email, r.notes, r.status,
			lower(r.booking_range) AS start_time, upper(r.booking_range) AS end_time, r.created_at
		FROM reservations r
		LEFT JOIN packages p ON r.package_id = p.id
		ORDER BY start_time DESC
		LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var resList []Reservation
	for rows.Next() {
		var res Reservation
		if err := rows.Scan(
			&res.ID, &res.PackageID, &res.PackageName, &res.Price,
			&res.ParentName, &res.ChildName, &res.ChildAge,
			&res.PhoneNumber, &res.Email, &res.Notes, &res.Status,
			&res.StartTime, &res.EndTime, &res.CreatedAt,
		); err != nil {
			return nil, 0, err
		}
		resList = append(resList, res)
	}

	return resList, total, nil
}

package repository

import (
	"context"
	"fmt"
	"strings"
)

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

// UpdateReservationStatus updates the status and returns the updated reservation
// (parent name, email, and time window) so the caller can send a status-change email.
func (r *ReservationRepository) UpdateReservationStatus(ctx context.Context, id string, status string) (*Reservation, error) {
	query := `
		UPDATE reservations
		SET status = $1
		WHERE id = $2
		RETURNING id, parent_name, email, lower(booking_range), upper(booking_range)`

	var res Reservation
	err := r.db.QueryRow(ctx, query, status, id).Scan(
		&res.ID, &res.ParentName, &res.Email, &res.StartTime, &res.EndTime,
	)
	if err != nil {
		return nil, err
	}
	res.Status = status
	return &res, nil
}

func (r *ReservationRepository) GetAllReservationsPaginated(ctx context.Context, page, limit int, status, search string) ([]Reservation, int, error) {
	offset := (page - 1) * limit
	var args []interface{}
	var conditions []string

	// 1. Build dynamic filtering conditions
	if status != "" && status != "ALL" {
		args = append(args, strings.ToLower(status))
		conditions = append(conditions, fmt.Sprintf("r.status = $%d", len(args)))
	}

	if search != "" {
		searchTerm := "%" + search + "%"
		args = append(args, searchTerm)
		idx := len(args)
		// Case-insensitive search across multiple columns
		conditions = append(conditions, fmt.Sprintf("(r.child_name ILIKE $%d OR r.parent_name ILIKE $%d OR r.phone_number ILIKE $%d)", idx, idx, idx))
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// 2. Total count with filters applied
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM reservations r %s`, whereClause)
	var total int
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// 3. Paginated records
	args = append(args, limit, offset)
	query := fmt.Sprintf(`
		SELECT
			r.id, r.package_id, COALESCE(p.title, 'Nepoznat paket') AS package_name, COALESCE(p.price, 0) AS price,
			r.parent_name, r.child_name, r.child_age, r.phone_number, r.email, r.notes, r.status,
			lower(r.booking_range) AS start_time, upper(r.booking_range) AS end_time, r.created_at
		FROM reservations r
		LEFT JOIN packages p ON r.package_id = p.id
		%s
		ORDER BY start_time DESC
		LIMIT $%d OFFSET $%d`, whereClause, len(args)-1, len(args))

	rows, err := r.db.Query(ctx, query, args...)
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

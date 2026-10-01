package worker

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func StartBackgroundTasks(db *pgxpool.Pool) {
	ticker := time.NewTicker(15 * time.Minute)
	go func() {
		for range ticker.C {
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

			// 1. Auto-complete nakon 6 sati od isteka termina
			_, err := db.Exec(ctx, `
				UPDATE reservations 
				SET status = 'completed' 
				WHERE status = 'confirmed' 
				  AND upper(booking_range) + INTERVAL '6 hours' <= NOW()
			`)
			if err != nil {
				log.Printf("[Worker Error] Auto-complete failed: %v", err)
			}

			// 2. Trajno brisanje otkazanih rezervacija starijih od 30 dana
			_, err = db.Exec(ctx, `
				DELETE FROM reservations 
				WHERE status = 'cancelled' 
				  AND created_at <= NOW() - INTERVAL '30 days'
			`)
			if err != nil {
				log.Printf("[Worker Error] Auto-delete cancelled failed: %v", err)
			}

			// 3. Anonimizacija završenih rezervacija starijih od 90 dana (čuva statistiku)
			_, err = db.Exec(ctx, `
				UPDATE reservations 
				SET parent_name = 'Obrisano',
				    child_name = 'Obrisano',
				    phone_number = 'Obrisano',
				    email = 'Obrisano',
				    notes = 'Automatski anonimizovano zbog isteka 90 dana'
				WHERE status = 'completed' 
				  AND upper(booking_range) <= NOW() - INTERVAL '90 days'
				  AND parent_name != 'Obrisano'
			`)
			if err != nil {
				log.Printf("[Worker Error] Auto-anonymize failed: %v", err)
			}

			cancel()
		}
	}()
}

package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"bambino-backend/internal/handler"
	authmiddleware "bambino-backend/internal/middleware"
	"bambino-backend/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	DatabaseURL    string
	AllowedOrigins []string
}

func main() {
	_ = godotenv.Load()

	cfg := Config{
		Port:           getEnv("PORT", "8081"),
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5433/bambino_db?sslmode=disable"),
		AllowedOrigins: strings.Split(getEnv("ALLOWED_ORIGINS", "http://localhost:3000"), ","),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dbPool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer dbPool.Close()

	if err := dbPool.Ping(ctx); err != nil {
		log.Fatalf("Database ping failed: %v\n", err)
	}
	fmt.Println("Connected to PostgreSQL successfully.")

	// Initialize Repositories & Handlers
	resRepo := repository.NewReservationRepository(dbPool)
	resHandler := handler.NewReservationHandler(resRepo)

	// Router Setup
	r := chi.NewRouter()

	r.Use(middleware.ClientIPFromXFFTrustedProxies(1))
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if err := dbPool.Ping(r.Context()); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte(`{"status":"error","db":"unreachable"}`))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// API Routes Group
	r.Route("/api", func(r chi.Router) {
		// Public routes
		r.Get("/packages", resHandler.GetPackages)
		r.Get("/availability", resHandler.GetAvailability)
		r.Post("/reservations", resHandler.Create)

		// Admin auth
		r.With(httprate.LimitBy(5, time.Minute, func(r *http.Request) (string, error) {
			return httprate.CanonicalizeIP(middleware.GetClientIP(r.Context())), nil
		})).Post("/admin/login", resHandler.Login)

		// Protected admin routes
		r.Group(func(r chi.Router) {
			r.Use(authmiddleware.RequireAuth)
			r.Get("/admin/reservations", resHandler.GetAllReservations)
			r.Patch("/admin/reservations/{id}/status", resHandler.UpdateReservationStatus)
		})
	})

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	// Run server in a goroutine
	go func() {
		fmt.Printf("Server running on port %s\n", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	fmt.Println("Shutting down gracefully...")

	// The context is used to inform the server it has 5 seconds to finish
	shutdownCtx, cancelShutdown := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelShutdown()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	fmt.Println("Server exiting")
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}

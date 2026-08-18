package config

import "os"

func JWTSecret() []byte {
	secretStr := os.Getenv("JWT_SECRET")
	isProd := os.Getenv("ENV") == "production"

	if secretStr == "" {
		if isProd {
			panic("FATAL: JWT_SECRET environment variable is not set in production")
		}
		secretStr = "super-secret-development-key"
	}
	return []byte(secretStr)
}

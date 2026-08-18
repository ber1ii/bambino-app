package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type ResendEmailPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Html    string   `json:"html"`
}

func SendConfirmationEmail(toEmail, parentName, dateStr, timeStr string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY not set")
	}

	body := fmt.Sprintf(`
		<h2>Potvrda Rezervacije - Bambino</h2>
		<p>Poštovani/a <strong>%s</strong>,</p>
		<p>Hvala Vam na rezervaciji! Primili smo Vaš zahtev za proslavu:</p>
		<ul>
			<li><strong>Datum:</strong> %s</li>
			<li><strong>Vreme:</strong> %s</li>
		</ul>
		<p>Uskoro ćemo Vas kontaktirati radi konačne potvrde.</p>
	`, parentName, dateStr, timeStr)

	payload := ResendEmailPayload{
		From:    "Igraonica Bambino <onboarding@resend.dev>", // Replace with your domain in production
		To:      []string{toEmail},
		Subject: "Potvrda Rezervacije Proslave - Bambino",
		Html:    body,
	}

	jsonBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonBytes))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("resend API error: status %d", resp.StatusCode)
	}
	return nil
}

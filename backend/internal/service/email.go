package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"os"
	"strings"
)

type ResendEmailPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Html    string   `json:"html"`
}

func fromAddress() string {
	fromAddr := os.Getenv("RESEND_FROM_EMAIL")
	if fromAddr == "" {
		fromAddr = "Igraonica Bambino <rezervacije@bambinons.com>"
	}
	return fromAddr
}

func sendResendEmail(to []string, subject, htmlBody string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY not set")
	}

	payload := ResendEmailPayload{
		From:    fromAddress(),
		To:      to,
		Subject: subject,
		Html:    htmlBody,
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

func SendConfirmationEmail(toEmail, parentName, dateStr, timeStr string) error {
	// Escape user-supplied name so it can't inject HTML/links into the email.
	safeName := html.EscapeString(parentName)

	body := fmt.Sprintf(`
		<h2>Potvrda Rezervacije - Bambino</h2>
		<p>Poštovani/a <strong>%s</strong>,</p>
		<p>Hvala Vam na rezervaciji! Primili smo Vaš zahtev za proslavu:</p>
		<ul>
			<li><strong>Datum:</strong> %s</li>
			<li><strong>Vreme:</strong> %s</li>
		</ul>
		<p>Uskoro ćemo Vas kontaktirati radi konačne potvrde.</p>
	`, safeName, dateStr, timeStr)

	return sendResendEmail([]string{toEmail}, "Potvrda Rezervacije Proslave - Bambino", body)
}

// SendOwnerNotificationEmail alerts the business when a new reservation comes in.
// Recipients come from OWNER_NOTIFICATION_EMAIL (comma-separated for more than one inbox).
// If unset, this is a no-op — so it fails silently instead of blocking bookings.
func SendOwnerNotificationEmail(parentName, childName, phone, dateStr, timeStr, notes string) error {
	recipients := os.Getenv("OWNER_NOTIFICATION_EMAIL")
	if recipients == "" {
		return nil
	}
	to := strings.Split(recipients, ",")
	for i := range to {
		to[i] = strings.TrimSpace(to[i])
	}

	safeName := html.EscapeString(parentName)
	safeChild := html.EscapeString(childName)
	safeNotes := html.EscapeString(notes)

	body := fmt.Sprintf(`
		<h2>Nova Rezervacija - Bambino</h2>
		<ul>
			<li><strong>Roditelj:</strong> %s</li>
			<li><strong>Dete:</strong> %s</li>
			<li><strong>Telefon:</strong> %s</li>
			<li><strong>Datum:</strong> %s</li>
			<li><strong>Vreme:</strong> %s</li>
			<li><strong>Napomena:</strong> %s</li>
		</ul>
	`, safeName, safeChild, html.EscapeString(phone), dateStr, timeStr, safeNotes)

	return sendResendEmail(to, "Nova Rezervacija Proslave - Bambino", body)
}

# INKNOVIO-TECH-AI-UGC

## Authentication recovery deployment

Password recovery uses the existing `users` table and requires the same Turso and SMTP variables as the rest of the application. Phone recovery additionally requires a Twilio account configured with:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

Set `SESSION_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SMTP_USER`, `SMTP_PASS`, and the Twilio variables in Vercel. `SMTP_PASS` must be a provider app password, not a normal mailbox password. The deployment must use Turso in production; Vercel's temporary filesystem is not durable for user data.
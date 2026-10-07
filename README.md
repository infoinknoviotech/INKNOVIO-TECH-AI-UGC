# INKNOVIO-TECH-AI-UGC

## Deployment

- Cloudflare Pages serves the static frontend (`npm run build:pages`, output: `dist`).
- Netlify Functions runs the existing Express API from `netlify/functions/api.js`. Keep the Netlify site private until its environment variables are configured.
- The Cloudflare Pages `API_ORIGIN` variable must point to the Netlify function URL, for example `https://<site>.netlify.app/.netlify/functions/api`.
- The API continues to use the existing Turso database. Do not create a replacement database or use local SQLite in production.

The Netlify Free plan currently includes 300 usage credits per month. Its functions are subject to this monthly cap and may be paused if it is exhausted; do not enable paid credit packs or auto-recharge. Cloudflare serves the static frontend separately so its visitor bandwidth does not consume Netlify bandwidth credits.

## Production environment variables

Configure these in Netlify's environment variable settings, never in Git:

- `NODE_ENV=production`
- `SESSION_SECRET`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_HOST` (optional; use for a non-Gmail SMTP provider)
- `SMTP_PORT` and `SMTP_SECURE` (optional)
- `SMTP_FROM` and `LEAD_RECIPIENT` (optional)
- `AUTH_NOTIFICATION_RECIPIENT` (optional)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` (optional; enables phone password recovery)

`SMTP_PASS` must be a provider app password when using Gmail. Password recovery uses the existing `users` table and email configuration. Production uploads use ephemeral function storage; product images are attached to the meeting-request notification email, and should not be treated as durable file storage.
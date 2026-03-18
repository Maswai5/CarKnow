# Backend Connection Map — CarKnow 🔗

**Purpose:** This document lists all backend API connection points, required auth, environment variables, and external integrations to guide the frontend rebuild.

---

## Quick facts ✅
- **Backend base URL (local dev):** http://localhost:5000
- **API base path:** /api
- **Health checks:** GET /health, GET /db-check
- **Auth:** JWT in Authorization header: `Authorization: Bearer <token>`
- **Port env:** `PORT` (default 5000)

---

## Environment variables (required) 🔐
- DB: `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_HOST`, `DB_PORT`
- Auth: `JWT_SECRET`
- SeerBit payments: `SEERBIT_SECRET` (used to verify webhook signatures)
- SMS (Africa's Talking): `AT_API_KEY`, `AT_USERNAME`
- Email (Nodemailer): `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` (optional)

---

## Authentication & headers 🧾
- All protected routes use `verifyToken` middleware. Send `Authorization: Bearer <token>`.
- Webhook endpoint expects a SeerBit signature header: `x-seerbit-signature` (HMAC-SHA256 using `SEERBIT_SECRET`).
- Content-Type: `application/json` for JSON endpoints.

---

## API endpoints (grouped) 🔬

### Auth (`/api/auth`) 🔐
- POST `/signup` — register. Body: `{ username, email, password, confirmPassword }`.
- POST `/login` — get JWT. Body: `{ emailOrUsername, password }`.
- POST `/forgot-password` — request reset token. Body: `{ email }`.
- POST `/reset-password` — reset password with token. Body: `{ token, newPassword, confirmPassword }`.
- POST `/request-otp` — request OTP for sensitive actions.
- POST `/verify-otp` — verify OTP.

> Response: login returns `{ token, role }`.

### Payments (`/api/payments`) 💳
- POST `/initiate-payment` — public: create payment link for an email/username. Body: `{ emailOrUsername }`.
- POST `/create` — authenticated: same as above (requires JWT).
- POST `/webhook` — SeerBit webhook (no auth). Verify `x-seerbit-signature`. Body: `{ reference, email, amount, status, phoneNumber? }`.
  - On `status === 'APPROVED'`: unlock gate access, create receipt, send SMS & email.
- GET `/status/:reference` — authenticated: check payment logs.
- GET `/receipts/:reference` — authenticated: get receipt details.
- GET `/admin/payments` — `verifyToken + requireSuperAdmin` — list all payments.
- GET `/user` — authenticated: list user's payments.

### Auctions (`/api/auctions`) 🏁
- POST `/create` — `verifyToken + requireAuctioneer` — create auction. Body: `{ car_id, start_time, end_time, starting_bid }`.
- GET `/active` — public — list active auctions.
- POST `/bid/:auction_id` — `verifyToken + requireBidder` — place bid. Body: `{ bid_amount, payment_reference }`.
- GET `/:auction_id/bids` — `verifyToken` — get bids.
- GET `/my` — `verifyToken + requireAuctioneer` — auctioneer's auctions.
- GET `/my-bids` — `verifyToken + requireBidder` — user's bids.

### Cars (`/api/cars`) 🚗
- POST `/` — create car (no auth in current code).
- GET `/` — list cars (public).
- GET `/:id` — get car details.
- PUT `/:id` — update car.
- DELETE `/:id` — delete car.

> Note: consider restricting car creation/updating to admin in future.

### Ownership (`/api/ownership`) 🧾
- POST `/transfer` — `verifyToken` + admin check (role === 'admin') — transfer ownership. Body: `{ car_id, new_owner_id, transfer_date, mileage }`.
- POST `/update-insurance` — admin-only — update insurance status.
- GET `/audit/:car_id` — admin-only — view audit logs.
- GET `/user-cars` — `verifyToken` — get cars owned by current user.

### Reports (`/api/reports`) 📄
- GET `/public/:identifier` — public report by VIN/plate.
- GET `/private/:identifier` — `verifyToken` — role-based full/private report.
  - Roles influence which fields are returned (admin, buyer, garage).

### Users & Admin (`/api/users`) 🛂
- POST `/create-admin` — `verifyToken + requireSuperAdmin` — create admin user.
- DELETE `/remove-admin/:id` — superadmin-only.
- GET `/list` — superadmin-only.
- POST `/impersonate-request/:id` — superadmin-only — request impersonation.
- POST `/impersonate-respond/:requestId` — verifyToken — target user approves/rejects.
- POST `/impersonate/:requestId` — `verifyToken + requireSuperAdmin` — issue short-lived token for impersonation.
- POST `/update-phone` — `verifyToken` — update phone number.

### Health & DB checks ✅
- GET `/health` — simple status.
- GET `/db-check` — executes a `SELECT NOW()` to verify DB connectivity.

---

## External services & integration notes 🔗
- Payments: SeerBit (checkout and webhooks). Webhook signature verified using `SEERBIT_SECRET`.
- SMS: Africa's Talking (`AT_API_KEY`, `AT_USERNAME`) — use `utils/smsSender.js` (`sendSMS(phone, message)`).
- Email: Nodemailer (`EMAIL_*` env vars) — use `utils/emailSender.js` (`sendPaymentEmail({ to, subject, text, html })`).
- DB: PostgreSQL via `pg` pool (see `db.js`).

---

## Notes for frontend implementation 💡
- Set API baseURL to `http://localhost:${process.env.PORT || 5000}/api` in development (or configure via env per frontend app).
- For authenticated requests include header: `Authorization: Bearer <token>`.
- To receive webhook responses locally during development, use a tunnel (ngrok) and ensure webhook signature is validated by the backend.
- For payments flow: call `/api/payments/initiate-payment` or `/api/payments/create` to get a `paymentLink`, then redirect users to the payment provider.
- After payment, use `/api/payments/status/:reference` or `/api/payments/receipts/:reference` to poll for confirmation.

---

## Tasks to prepare before frontend rebuild ✅
- Create frontend `.env` variables for `VITE_API_BASE_URL` or similar.
- Add helper methods for: login (store JWT), refresh user role, handle impersonation tokens, payment initiation, webhook testing.
- Ensure CORS is configured properly on backend (already uses cors()).

---

If you want, I can now:
1. Create a new branch `feat/frontend-contracts` with this file committed, or
2. Generate TypeScript API client types (OpenAPI/Swagger) from the routes, or
3. Produce example request/response payloads and React hooks for each endpoint.

Reply with `commit doc`, `generate client`, or `create hooks` to continue. ✨
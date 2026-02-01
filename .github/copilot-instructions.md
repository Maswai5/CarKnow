# CarKnow Copilot Instructions

## Architecture Overview
CarKnow is a vehicle platform with dual frontend applications and a shared Node.js/Express backend using PostgreSQL.

- **Backend** (`vehicle-platform-backend/`): REST API with JWT authentication, role-based access (buyer/user, admin, superadmin, garage). Key entities: users, cars, ownerships, payments, accidents, services, reports.
- **Signed-in Dashboard** (`apps/signed-in-dashboard/`): React app for authenticated users, redirects by role (user → /dashboard, admin → /admin, superadmin → /superadmin). Uses AuthContext for JWT management.
- **Vehicle Platform Frontend** (`apps/vehicle-platform-frontend/`): Public React app for signup, login, vehicle lookup, payments. API baseURL: http://localhost:3001 (note: backend runs on 5000).

Data flows: Frontends fetch from backend APIs (e.g., `/api/payments/user`, `/api/ownership/user-cars`). Payments integrate with SeerBit via webhooks.

## Key Patterns
- **Authentication**: JWT in Authorization header ("Bearer <token>"). Middleware `verifyToken` attaches `req.user` with id, email, role. Role checks in routes (e.g., `if (req.user.role !== 'admin')`).
- **Database Queries**: Direct pool.query() in routes. Joins for related data (e.g., ownerships JOIN cars). Audit logs inserted into `report_views` on admin actions.
- **Error Handling**: Try-catch with 500 status, specific 400/403 for validation/auth. Console.error for logging.
- **Frontend Data Fetching**: Axios with baseURL. AuthContext decodes JWT from localStorage. No global error handling yet.
- **Role Inconsistencies**: Signup defaults to 'buyer', but redirects expect 'user'. Middleware checks 'super_admin' vs. seed 'superadmin'. Standardize to: user, admin, superadmin.
- **Payments**: Public `/initiate-payment`, authenticated `/create`. Webhook at `/webhook` updates status. Receipts/references for tracking.

## Development Workflow
- **Backend**: `npm run dev` (nodemon). Requires .env with DB_USER, DB_PASS, DB_NAME, JWT_SECRET. Health check at `/health`, DB check at `/db-check`.
- **Frontend**: `npm start` (react-scripts). Signed-in dashboard uses jwt-decode for token parsing.
- **Database**: PostgreSQL. Backups in `Backups/`. Seed users with `node routes/seedUsers.js` (hardcoded creds, update for prod).
- **Testing**: No automated tests yet. Manual: run backend, frontend, test auth flows, data fetches.
- **Build/Deploy**: Backend `npm start` for prod. Frontends `npm run build`. No CI/CD configured.

## Conventions
- **File Structure**: Routes in `routes/`, middleware in `middleware/`, utils in `utils/`. Controllers for complex logic (e.g., `paymentController.js`).
- **Imports**: Require for backend, ES6 import for React.
- **Environment**: .env for secrets. No config files for ports (hardcoded 5000).
- **Logging**: Console.log for auth verifications, errors. No structured logging.
- **Security**: Password strength check on signup. Bcrypt hashing. CORS enabled. No rate limiting.

## Common Tasks
- **Add New Route**: Create in `routes/`, require in `server.js`, use `app.use('/api/new', newRouter)`.
- **Role-Based UI**: Use `user.role` from AuthContext to conditionally render (e.g., admin panels).
- **Database Changes**: Update queries in routes. Backup before schema changes.
- **Integrations**: SMS via Africa's Talking (`utils/smsSender.js`), email via Nodemailer (`utils/emailSender.js`).

Reference: `server.js` for API structure, `AuthContext.js` for frontend auth, `payments.js` for payment flow.</content>
<parameter name="filePath">c:\Users\Test\projects\CarKnow\.github\copilot-instructions.md
# PCHS Bamenda - Online Student Registration

Progressive Comprehensive High School Bamenda – full-stack student registration web application.

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript, TypeScript (optional)
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Auth:** JWT, bcrypt

## Project Structure

```
g:\Online Reg\
├── backend/                 # Express API
│   ├── src/
│   │   ├── config/          # database.js
│   │   ├── controllers/     # authController, studentController
│   │   ├── middleware/      # auth.js, upload.js
│   │   ├── models/          # Admin.js, Student.js
│   │   ├── routes/          # auth.js, students.js
│   │   └── utils/           # validation.js
│   ├── uploads/             # Passport photos (created at runtime)
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── database/
│   └── schema.sql            # MySQL schema
├── public/                   # Static frontend (served by Express)
│   ├── index.html            # Landing
│   ├── register.html         # Student registration
│   ├── login.html            # Admin login
│   ├── admin.html            # Admin dashboard
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── main.js
│   │   ├── validation.js
│   │   ├── registration.js
│   │   ├── auth.js
│   │   └── admin.js
│   └── ts/                   # TypeScript source (optional compile)
│       ├── tsconfig.json
│       ├── types/student.ts
│       ├── services/StudentService.ts
│       └── validation/formValidation.ts
└── README.md
```

## Setup

### 1. Database

- **New install:** Create MySQL database and run the schema:

```bash
mysql -u root -p < database/schema.sql
```

- **Existing install (add fees/payment columns):** Run the migration:

```bash
mysql -u root -p < database/migrations/001_fees_and_payment.sql
```

- Registration fees: Form 1 = 50,000 XAF, then +5,000 per level (Form 2 → 55,000 … Upper Sixth → 80,000). Payment method can be Orange Money or MTN Mobile Money (payment integration can be added later).

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
npm install
npm start
```

- Server runs at `http://localhost:3000` (or `PORT` in `.env`).

### 3. Default Admin

- The only accepted admin login is **EVT** / **00533prince2@EVT**. This account is created automatically on first server start. Any other username or password is rejected with "Invalid login name or password." Admin registration via API is disabled.

### 4. Frontend (TypeScript – optional)

To compile TypeScript under `public/ts/` to `public/js/`:

```bash
cd public
npm init -y
npm install -D typescript
npx tsc -p ts/tsconfig.json
```

(Current `public/js/*.js` are plain JS and work without compiling TS.)

## Features

- **Landing:** School info, “Register Now”, responsive blue/white theme.
- **Registration:** Full name, DOB, gender, class, parent, phone, email, address, previous school, passport photo; client + server validation; API or localStorage fallback.
- **Admin login:** JWT-based; password hashing with bcrypt.
- **Admin dashboard:** View students, search, filter by status, approve/reject, delete, export CSV.
- **Security:** Input validation, bcrypt, JWT, file type/size limits.

## API Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST   | /api/auth/register | No  | Create admin |
| POST   | /api/auth/login    | No  | Login, returns JWT |
| GET    | /api/auth/me       | Yes | Current user |
| POST   | /api/students      | No  | Submit registration |
| GET    | /api/students      | Yes | List students |
| GET    | /api/students/stats | Yes | Counts by status |
| GET    | /api/students/export/csv | Yes | Download CSV |
| GET    | /api/students/:id  | Yes | One student |
| PATCH  | /api/students/:id/status | Yes | Approve/reject |
| DELETE | /api/students/:id  | Yes | Delete record |

## License

MIT.

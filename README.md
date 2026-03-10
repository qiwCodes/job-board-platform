# Full-Stack Job Board Platform

## Project overview

This project is a production-oriented job board platform with separate frontend and backend apps. Applicants can browse jobs and track applications, while companies can post roles, manage listings, and review candidates from protected dashboards.

## Tech stack

- Frontend: React 18, React Router, Tailwind CSS, Axios, React Hook Form
- Backend: Node.js, Express 5, express-validator, JWT authentication, Multer
- Database: PostgreSQL via Supabase
- Deployment targets: Vercel for `client`, Railway for `server`

## Local development setup

1. Install Node.js 20.x and npm.
2. Create local env files:
   - Copy `client/.env.example` to `client/.env`
   - Copy `server/.env.example` to `server/.env`
3. Install dependencies:

```bash
cd client
npm install

cd ../server
npm install
```

4. Create a Supabase project and run [`server/sql/schema.sql`](/C:/coding/Resume/Full-Stack/Full-Stack%20Job%20Board%20Platform/server/sql/schema.sql).
5. Update the env values in both apps.
6. Start both services in separate terminals:

```bash
cd server
npm run dev
```

```bash
cd client
npm start
```

7. Open `http://localhost:3000`.

## Environment variables

| Name | App | Description | Example |
| --- | --- | --- | --- |
| `REACT_APP_API_URL` | client | Base URL for the backend API, including `/api` | `http://localhost:5000/api` |
| `DATABASE_URL` | server | PostgreSQL connection string from Supabase | `postgresql://postgres:password@db.host.supabase.co:5432/postgres` |
| `JWT_SECRET` | server | Secret used to sign and verify JWT tokens | `use-a-long-random-secret-value` |
| `PORT` | server | Port used by the Express API | `5000` |
| `CLIENT_URL` | server | Allowed frontend origin for CORS | `http://localhost:3000` |
| `NODE_ENV` | server | Runtime environment for error handling and deployment behavior | `development` |

## Supabase setup

1. Create a new Supabase project.
2. Open the SQL Editor in Supabase.
3. Paste and run [`server/sql/schema.sql`](/C:/coding/Resume/Full-Stack/Full-Stack%20Job%20Board%20Platform/server/sql/schema.sql).
4. Go to Project Settings -> Database and copy the connection string.
5. Set that connection string as `DATABASE_URL` in `server/.env`.
6. Keep the database password in your deployment environment only. Do not hardcode it in source.

## Deploy instructions

### Railway backend

1. Push the repository to GitHub.
2. Create a new Railway project from that repository.
3. Set the Railway service root directory to `server`.
4. Railway already has [`server/railway.json`](/C:/coding/Resume/Full-Stack/Full-Stack%20Job%20Board%20Platform/server/railway.json) configured to start `node src/app.js`.
5. Add these environment variables in Railway:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT` with Railway's assigned port or leave Railway default
   - `CLIENT_URL` set to your Vercel frontend URL
   - `NODE_ENV=production`
6. Deploy and copy the public backend URL, for example `https://your-api.up.railway.app`.

### Vercel frontend

1. Import the same GitHub repository into Vercel.
2. Set the project root directory to `client`.
3. Keep the build command as `npm run build`.
4. Keep the output directory as `build`.
5. Add `REACT_APP_API_URL` and set it to your Railway backend URL plus `/api`, for example `https://your-api.up.railway.app/api`.
6. Deploy. Client-side routing rewrites are already configured in [`client/vercel.json`](/C:/coding/Resume/Full-Stack/Full-Stack%20Job%20Board%20Platform/client/vercel.json).

## API endpoints reference

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new applicant or company account | Public |
| `POST` | `/api/auth/login` | Login and receive a JWT token | Public |
| `GET` | `/api/auth/me` | Get the currently authenticated user | Bearer token |
| `GET` | `/api/jobs` | List active jobs with filters and pagination | Public |
| `GET` | `/api/jobs/:id` | Get one job by id | Public |
| `POST` | `/api/jobs` | Create a new job posting | Company |
| `PUT` | `/api/jobs/:id` | Update a company-owned job | Company |
| `DELETE` | `/api/jobs/:id` | Delete a company-owned job | Company |
| `GET` | `/api/jobs/company/me` | List jobs created by the signed-in company | Company |
| `GET` | `/api/jobs/:id/applications` | List applicants for a company-owned job | Company |
| `POST` | `/api/jobs/:id/apply` | Submit an application with a PDF resume | Applicant |
| `GET` | `/api/applications/me` | List the signed-in applicant's applications | Applicant |
| `PATCH` | `/api/applications/company/:id/status` | Update an application status | Company |
| `PUT` | `/api/applications/company/:id/status` | Alias for status updates | Company |

## Useful checks

```bash
cd client
npm run build
```

```bash
cd server
npm test
```

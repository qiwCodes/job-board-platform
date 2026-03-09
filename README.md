# job-board-platform

A full-stack job board platform built with React, Node.js, Express, and PostgreSQL. Features include job posting, job search, application tracking, and role-based dashboards for applicants and companies.

## Repository structure

- `client` React frontend
- `server` Express API

## Local development

Use Node.js 20.x for both apps.

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
cd client && npm install
cd ../server && npm install
```

Start each app in a separate terminal:

```bash
cd client && npm start
cd server && npm run dev
```

## GitHub push and PR workflow

1. Create a branch from `main`, for example `feature/job-filters` or `fix/auth-token`.
2. Run the same checks used by GitHub Actions:
   - `cd client && npm run ci`
   - `cd server && npm run ci`
3. Push your branch:
   - `git push -u origin <branch-name>`
4. Open a pull request targeting `main`.

CI runs automatically on every push and pull request. It validates the client production build and a server smoke test before merge.

## Protected branch policy

`main` is protected for pull-request based changes.

- Required checks:
  - `Client Build`
  - `Server Smoke Test`
- Branches must be up to date before merge.
- Review conversations should be resolved before merge.
- Linear history is enforced.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the working agreement used by this repository.

# Contributing

## Branch workflow

1. Branch from `main`.
2. Use a descriptive branch name such as `feature/job-search-filters` or `fix/auth-validation`.
3. Run the same checks required by GitHub before pushing:
   - `cd client && npm run ci`
   - `cd server && npm run ci`
4. Push your branch and open a pull request into `main`.

## Protected `main` rules

The `main` branch is intended to stay deployable.

- Changes must go through a pull request.
- Required checks must pass before merge:
  - `Client Build`
  - `Server Smoke Test`
- Branches must be up to date with `main` before merge.
- Review conversations should be resolved before merge.
- Force pushes and branch deletion on `main` are disabled.
- Linear history is enforced.

## PR checklist

- Scope is focused and explained clearly.
- CI passed on GitHub.
- Environment examples were updated if config changed.
- No secrets, tokens, or production credentials were committed.
- User-facing changes include screenshots or API notes when useful.

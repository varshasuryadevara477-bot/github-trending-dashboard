# GitHub Repository Dashboard

A React dashboard that lists the most-starred public GitHub repositories created in the last 7, 14, or 30 days. Expand a repository to view weekly activity and contributor charts.

## Technologies

- React + Vite
- React Hooks
- Redux Toolkit
- Redux Saga
- Material UI
- Highcharts

## Run the project

1. Extract this ZIP file.
2. Open the extracted `github-trending-dashboard` folder in VS Code.
3. Open the terminal in that folder.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL printed in the terminal (usually `http://localhost:5173`).

## GitHub API

The app uses the public GitHub REST API:

- Repository search: `GET /search/repositories`
- Weekly commit activity: `GET /repos/{owner}/{repo}/stats/commit_activity`
- Weekly additions/deletions: `GET /repos/{owner}/{repo}/stats/code_frequency`
- Contributor activity: `GET /repos/{owner}/{repo}/stats/contributors`

GitHub can return HTTP `202` while repository statistics are being calculated. The app retries a few times and displays a useful message if the statistics are not ready.

Unauthenticated GitHub API requests have a low rate limit. For local testing, you can optionally create a `.env` file by copying `.env.example` and adding a GitHub token to `VITE_GITHUB_TOKEN`. This is only suitable for a local assignment demo: Vite exposes `VITE_` variables in browser code, so do not deploy a real personal token or commit it to GitHub.

## Features

- 7-day, 14-day and 30-day filters
- Results sorted by stars (highest first)
- Infinite scrolling / automatic next-page loading
- Repository avatar, description, stars, issues, language and last-pushed time
- Expand/collapse repository activity
- Total Changes chart with Commits, Additions and Deletions
- Contributor Changes chart with interactive legend
- Hover tooltips showing week, value and contributor
- Loading, empty, API error and rate-limit states

## Notes

GitHub's contributor statistics are generated asynchronously and may not be available immediately for every repository. Some repositories may have no public contribution data. In those cases the dashboard shows an explanatory message rather than invented statistics.

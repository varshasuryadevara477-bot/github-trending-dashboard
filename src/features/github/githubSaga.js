import { all, call, put, takeLatest } from "redux-saga/effects";
import {
  fetchReposRequest,
  fetchActivityRequest,
  repositoriesLoading,
  repositoriesReceived,
  repositoriesFailed,
  activityLoading,
  activityReceived,
  activityFailed,
} from "./githubSlice";

const API = "https://api.github.com";

function getHeaders() {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) {
    let message = `GitHub API request failed (${response.status})`;
    if (response.status === 403) {
      message = "GitHub API rate limit reached. Wait a little and try again.";
    } else if (response.status === 404) {
      message = "GitHub could not find this repository's activity data.";
    }
    throw new Error(message);
  }

  return response.json();
}

async function fetchStatsWithRetry(url) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: getHeaders() });

      // GitHub returns 202 while it calculates repository statistics.
      if (response.status === 202) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1200 * (attempt + 1))
        );
        continue;
      }

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("GitHub API rate limit reached. Try again later.");
        }
        throw new Error(`Could not load statistics (${response.status}).`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt === 3) break;
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
  }

  throw lastError || new Error("Statistics are not ready. Please try again.");
}

function* loadRepositories(action) {
  const { days, page } = action.payload;
  try {
    yield put(repositoriesLoading());

    const since = new Date();
    since.setDate(since.getDate() - days);
    const dateString = since.toISOString().slice(0, 10);

    const query = encodeURIComponent(`created:>=${dateString}`);
    const url = `${API}/search/repositories?q=${query}&sort=stars&order=desc&per_page=20&page=${page}`;
    const result = yield call(fetchJson, url);

    yield put(
      repositoriesReceived({
        items: result.items || [],
        page,
      })
    );
  } catch (error) {
    yield put(repositoriesFailed(error.message));
  }
}

function* loadActivity(action) {
  const { owner, repo } = action.payload;
  const key = `${owner}/${repo}`;
  const base = `${API}/repos/${owner}/${repo}/stats`;

  try {
    yield put(activityLoading(key));

    const [commitActivity, codeFrequency, contributors] = yield all([
      call(fetchStatsWithRetry, `${base}/commit_activity`),
      call(fetchStatsWithRetry, `${base}/code_frequency`),
      call(fetchStatsWithRetry, `${base}/contributors`),
    ]);

    yield put(
      activityReceived({
        key,
        data: {
          commitActivity: Array.isArray(commitActivity) ? commitActivity : [],
          codeFrequency: Array.isArray(codeFrequency) ? codeFrequency : [],
          contributors: Array.isArray(contributors) ? contributors : [],
        },
      })
    );
  } catch (error) {
    yield put(activityFailed({ key, message: error.message }));
  }
}

export function* githubSaga() {
  yield all([
    takeLatest(fetchReposRequest.type, loadRepositories),
    takeLatest(fetchActivityRequest.type, loadActivity),
  ]);
}

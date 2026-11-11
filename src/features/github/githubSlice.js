import { createAction, createSlice } from "@reduxjs/toolkit";

export const fetchReposRequest = createAction("github/fetchReposRequest");
export const fetchActivityRequest = createAction("github/fetchActivityRequest");

const initialState = {
  repositories: [],
  days: 30,
  page: 1,
  hasMore: true,
  repositoriesLoading: false,
  repositoriesError: null,
  activityByRepo: {},
  activityLoadingByRepo: {},
  activityErrorByRepo: {},
};

const githubSlice = createSlice({
  name: "github",
  initialState,
  reducers: {
    setDays(state, action) {
      state.days = action.payload;
      state.repositories = [];
      state.page = 1;
      state.hasMore = true;
      state.repositoriesError = null;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    repositoriesLoading(state) {
      state.repositoriesLoading = true;
      state.repositoriesError = null;
    },
    repositoriesReceived(state, action) {
      const { items, page } = action.payload;
      if (page === 1) {
        state.repositories = items;
      } else {
        const seen = new Set(state.repositories.map((repo) => repo.id));
        state.repositories = [
          ...state.repositories,
          ...items.filter((repo) => !seen.has(repo.id)),
        ];
      }
      state.hasMore = items.length === 20;
      state.repositoriesLoading = false;
    },
    repositoriesFailed(state, action) {
      state.repositoriesLoading = false;
      state.repositoriesError = action.payload;
    },
    activityLoading(state, action) {
      state.activityLoadingByRepo[action.payload] = true;
      delete state.activityErrorByRepo[action.payload];
    },
    activityReceived(state, action) {
      const { key, data } = action.payload;
      state.activityByRepo[key] = data;
      state.activityLoadingByRepo[key] = false;
      delete state.activityErrorByRepo[key];
    },
    activityFailed(state, action) {
      const { key, message } = action.payload;
      state.activityLoadingByRepo[key] = false;
      state.activityErrorByRepo[key] = message;
    },
  },
});

export const {
  setDays,
  setPage,
  repositoriesLoading,
  repositoriesReceived,
  repositoriesFailed,
  activityLoading,
  activityReceived,
  activityFailed,
} = githubSlice.actions;

export default githubSlice.reducer;

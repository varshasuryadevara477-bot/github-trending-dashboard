import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import githubReducer from "../features/github/githubSlice";
import { githubSaga } from "../features/github/githubSaga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    github: githubReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(githubSaga);

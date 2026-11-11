import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import RepositoryCard from "./components/RepositoryCard";
import {
  fetchReposRequest,
  setDays,
  setPage,
} from "./features/github/githubSlice";

export default function App() {
  const dispatch = useDispatch();
  const {
    repositories,
    days,
    page,
    hasMore,
    repositoriesLoading,
    repositoriesError,
  } = useSelector((state) => state.github);

  const [expandedRepo, setExpandedRepo] = useState(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    dispatch(fetchReposRequest({ days, page: 1 }));
  }, [dispatch, days]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || repositoriesLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !repositoriesLoading && hasMore) {
          const nextPage = page + 1;
          dispatch(setPage(nextPage));
          dispatch(fetchReposRequest({ days, page: nextPage }));
        }
      },
      { rootMargin: "350px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [dispatch, days, page, hasMore, repositoriesLoading]);

  const handlePeriodChange = (event) => {
    const nextDays = Number(event.target.value);
    setExpandedRepo(null);
    dispatch(setDays(nextDays));
  };

  const retry = () => {
    dispatch(fetchReposRequest({ days, page: 1 }));
  };

  const handleToggle = (fullName) => {
    setExpandedRepo((current) => (current === fullName ? null : fullName));
  };

  return (
    <Box className="app-shell">
      <Box className="topbar">
        <Container maxWidth="lg" className="topbar-inner">
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box className="github-mark">
              <GitHubIcon />
            </Box>
            <Box>
              <Typography fontWeight={800} className="brand-title">
                GitHub Insights
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Repository activity dashboard
              </Typography>
            </Box>
          </Stack>
          <ChipLabel />
        </Container>
      </Box>

      <Container maxWidth="lg" className="main-content">
        <Box className="page-heading">
          <Box>
            <Typography variant="h4" className="page-title">
              Trending repositories
            </Typography>
            <Typography color="text.secondary">
              Explore the most-starred public repositories created recently.
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Created in
            </Typography>
            <Select
              size="small"
              value={days}
              onChange={handlePeriodChange}
              className="period-select"
              aria-label="Repository creation period"
            >
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={14}>Last 14 days</MenuItem>
              <MenuItem value={30}>Last 30 days</MenuItem>
            </Select>
          </Stack>
        </Box>

        <Paper elevation={0} className="list-heading">
          <Typography fontWeight={700}>Repositories</Typography>
          <Typography variant="body2" color="text.secondary">
            Sorted by stars · Highest first
          </Typography>
        </Paper>

        {repositoriesError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={retry}>
                Retry
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {repositoriesError}
          </Alert>
        )}

        <Stack gap={2}>
          {repositories.map((repo) => (
            <RepositoryCard
              key={repo.id}
              repo={repo}
              expanded={expandedRepo === repo.full_name}
              onToggle={() => handleToggle(repo.full_name)}
            />
          ))}
        </Stack>

        {!repositoriesLoading && !repositoriesError && repositories.length === 0 && (
          <Paper className="empty-state" elevation={0}>
            <Typography fontWeight={700}>No repositories found</Typography>
            <Typography color="text.secondary">
              Try another creation period.
            </Typography>
          </Paper>
        )}

        <Box ref={sentinelRef} className="loading-area">
          {repositoriesLoading ? (
            <>
              <CircularProgress size={25} />
              <Typography color="text.secondary" variant="body2">
                Loading repositories...
              </Typography>
            </>
          ) : hasMore && repositories.length > 0 ? (
            <Typography color="text.secondary" variant="caption">
              Scroll to load more repositories
            </Typography>
          ) : repositories.length > 0 ? (
            <Typography color="text.secondary" variant="caption">
              You have reached the end of the results.
            </Typography>
          ) : null}
        </Box>
      </Container>
    </Box>
  );
}

function ChipLabel() {
  return (
    <Box className="topbar-tag">
      <span className="live-dot" />
      <Typography variant="caption" fontWeight={650}>
        Live GitHub data
      </Typography>
    </Box>
  );
}

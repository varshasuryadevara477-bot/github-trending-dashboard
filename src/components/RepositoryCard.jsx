import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ActivityCharts from "./ActivityCharts";
import { fetchActivityRequest } from "../features/github/githubSlice";

function timeAgo(dateString) {
  if (!dateString) return "Unknown";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (!Number.isFinite(seconds) || seconds < 0) return "recently";
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, value] of units) {
    const amount = Math.floor(seconds / value);
    if (amount >= 1) return `${amount} ${name}${amount > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export default function RepositoryCard({ repo, expanded, onToggle }) {
  const dispatch = useDispatch();
  const key = `${repo.owner.login}/${repo.name}`;
  const stats = useSelector((state) => state.github.activityByRepo[key]);
  const loading = useSelector(
    (state) => state.github.activityLoadingByRepo[key]
  );
  const error = useSelector(
    (state) => state.github.activityErrorByRepo[key]
  );

  const handleToggle = () => {
    if (!expanded && !stats && !loading) {
      dispatch(
        fetchActivityRequest({
          owner: repo.owner.login,
          repo: repo.name,
        })
      );
    }
    onToggle();
  };

  return (
    <Box className={`repo-card ${expanded ? "repo-card-expanded" : ""}`}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={2}
        className="repo-summary"
      >
        <Stack direction="row" alignItems="center" gap={2} flex={1} minWidth={0}>
          <Avatar
            src={repo.owner.avatar_url}
            alt={`${repo.owner.login} avatar`}
            sx={{ width: 54, height: 54, flexShrink: 0 }}
          />
          <Box minWidth={0} flex={1}>
            <Typography className="repo-name" noWrap>
              {repo.full_name}
            </Typography>
            <Typography className="repo-description" title={repo.description || ""}>
              {repo.description || "No description provided."}
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
              <Chip
                size="small"
                icon={<StarRoundedIcon />}
                label={repo.stargazers_count.toLocaleString()}
                variant="outlined"
              />
              <Chip
                size="small"
                icon={<BugReportOutlinedIcon />}
                label={`${repo.open_issues_count.toLocaleString()} issues`}
                variant="outlined"
              />
              {repo.language && (
                <Chip size="small" label={repo.language} variant="outlined" />
              )}
            </Stack>
          </Box>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          className="repo-meta"
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Last pushed
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {timeAgo(repo.pushed_at)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              by {repo.owner.login}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center">
            <IconButton
              component="a"
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${repo.full_name} on GitHub`}
              size="small"
            >
              <OpenInNewRoundedIcon />
            </IconButton>
            <IconButton
              onClick={handleToggle}
              aria-label={expanded ? "Collapse activity" : "Show activity"}
              aria-expanded={expanded}
              className={expanded ? "chevron-open" : ""}
            >
              <KeyboardArrowDownRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <ActivityCharts stats={stats} loading={loading} error={error} />
      </Collapse>
    </Box>
  );
}

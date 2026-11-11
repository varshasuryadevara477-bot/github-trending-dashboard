import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { getContributorSeries, getTotalSeries } from "../services/chartData";

const metricLabels = {
  commits: "Commits",
  additions: "Additions",
  deletions: "Deletions",
};

export default function ActivityCharts({ stats, loading, error }) {
  const [metric, setMetric] = useState("commits");

  const totalData = useMemo(
    () => getTotalSeries(stats, metric),
    [stats, metric]
  );

  const contributorData = useMemo(
    () => getContributorSeries(stats, metric),
    [stats, metric]
  );

  if (loading) {
    return (
      <Box className="activity-message">
        <CircularProgress size={28} />
        <Typography color="text.secondary">
          Loading weekly repository statistics...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats || (!totalData.length && !contributorData.length)) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No public activity statistics are available for this repository yet.
        GitHub may still be calculating the statistics.
      </Alert>
    );
  }

  const commonOptions = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      height: 270,
      spacing: [12, 12, 12, 12],
    },
    credits: { enabled: false },
    title: { text: null },
    legend: { enabled: false },
    xAxis: {
      type: "datetime",
      tickPixelInterval: 100,
      labels: { format: "{value:%b %e}" },
      lineColor: "#dce3ee",
      tickColor: "#dce3ee",
    },
    yAxis: {
      min: 0,
      title: { text: "Number of changes" },
      gridLineColor: "#edf1f7",
    },
    tooltip: {
      xDateFormat: "%A, %b %e, %Y",
      shared: false,
      valueDecimals: 0,
    },
    plotOptions: {
      series: {
        marker: { enabled: false, radius: 3 },
        lineWidth: 2,
        states: { hover: { lineWidth: 3 } },
      },
    },
  };

  const totalOptions = {
    ...commonOptions,
    chart: { ...commonOptions.chart, height: 250 },
    tooltip: {
      ...commonOptions.tooltip,
      pointFormat: `<span style="color:{series.color}">●</span> {series.name}: <b>{point.y:,.0f}</b><br/>`,
    },
    series: [
      {
        name: metricLabels[metric],
        data: totalData,
        color: "#f05a3e",
      },
    ],
  };

  const contributorOptions = {
    ...commonOptions,
    chart: { ...commonOptions.chart, height: 290 },
    legend: {
      enabled: true,
      align: "right",
      verticalAlign: "middle",
      layout: "vertical",
      itemStyle: { color: "#526078", fontSize: "11px" },
    },
    tooltip: {
      ...commonOptions.tooltip,
      headerFormat: "<b>Week: {point.x:%b %e, %Y}</b><br/>",
      pointFormat:
        '<span style="color:{series.color}">●</span> {series.name}: <b>{point.y:,.0f}</b><br/>',
    },
    series: contributorData.map((person) => ({
      name: person.name,
      data: person.data,
    })),
  };

  return (
    <Box className="activity-panel">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={1}
        className="activity-toolbar"
      >
        <Typography variant="subtitle1" fontWeight={750}>
          Repository activity
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={metric}
            onChange={(event) => setMetric(event.target.value)}
            inputProps={{ "aria-label": "Activity metric" }}
          >
            <MenuItem value="commits">Commits</MenuItem>
            <MenuItem value="additions">Additions</MenuItem>
            <MenuItem value="deletions">Deletions</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Box className="chart-block">
        <Typography className="chart-heading">Total Changes</Typography>
        {totalData.length ? (
          <HighchartsReact highcharts={Highcharts} options={totalOptions} />
        ) : (
          <Typography color="text.secondary" className="chart-empty">
            No weekly {metric} data available.
          </Typography>
        )}
      </Box>

      <Box className="chart-block contributor-block">
        <Typography className="chart-heading">Contributor Changes</Typography>
        {contributorData.length ? (
          <HighchartsReact
            highcharts={Highcharts}
            options={contributorOptions}
          />
        ) : (
          <Typography color="text.secondary" className="chart-empty">
            No contributor statistics are available.
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          Select contributor names in the chart legend to show or hide their
          lines. Up to 10 contributors are displayed.
        </Typography>
      </Box>
    </Box>
  );
}

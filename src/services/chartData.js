export function formatWeek(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getTotalSeries(stats, metric) {
  if (!stats) return [];

  if (metric === "commits") {
    return (stats.commitActivity || []).map((week) => ({
      x: week.week * 1000,
      y: Number(week.total || 0),
    }));
  }

  return (stats.codeFrequency || []).map((week) => ({
    x: Number(week[0]) * 1000,
    y: Math.abs(Number(metric === "additions" ? week[1] : week[2])),
  }));
}

export function getContributorSeries(stats, metric) {
  if (!stats) return [];

  return (stats.contributors || [])
    .filter((person) => Array.isArray(person.weeks))
    .slice(0, 10)
    .map((person) => ({
      name: person.author?.login || "Unknown contributor",
      data: person.weeks.map((week) => ({
        x: Number(week.w) * 1000,
        y:
          metric === "commits"
            ? Number(week.c || 0)
            : Math.abs(
                Number(metric === "additions" ? week.a || 0 : week.d || 0)
              ),
      })),
    }));
}

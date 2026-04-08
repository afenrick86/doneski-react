import { todayString, getDaysInMonth } from "./dateHelpers.js";

export function getGoalProgress(kidId, log, goalConfig) {
  const type = goalConfig.type;
  const target = goalConfig.target || 80;
  const timeRange = goalConfig.timeRange || "month";
  const now = new Date();
  const today = todayString();

  function entriesInRange(startDate, endDate) {
    return log.filter(e => e.kidId === kidId && e.date >= startDate && e.date <= endDate);
  }

  function completedInRange(startDate, endDate) {
    return entriesInRange(startDate, endDate).filter(e => e.completed).length;
  }

  if (type === "percentage" || type === "perfect-bonus") {
    let startDate, totalDays, elapsed;
    if (timeRange === "week") {
      const dayOfWeek = now.getDay();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - dayOfWeek);
      startDate = weekStart.toISOString().split("T")[0];
      totalDays = 7;
      elapsed = Math.min(dayOfWeek + 1, 7);
    } else {
      startDate = now.toISOString().slice(0, 7) + "-01";
      totalDays = getDaysInMonth(now.getFullYear(), now.getMonth());
      elapsed = now.getDate();
    }
    const completed = completedInRange(startDate, today);
    const percent = elapsed > 0 ? Math.round((completed / elapsed) * 100) : 0;
    const overallPercent = Math.round((completed / totalDays) * 100);
    const achieved = percent >= target;
    const bonusAchieved = type === "perfect-bonus" && percent === 100;
    const period = timeRange === "week" ? "this week" : "this month";
    return {
      percent,
      barPercent: percent,
      completed,
      elapsed,
      totalDays,
      achieved,
      bonusAchieved,
      label: `${percent}% completed ${period}`,
      detail: `${completed} of ${elapsed} days so far`,
      targetLabel: `Goal: ${target}%`,
      reward: bonusAchieved ? (goalConfig.bonusReward || goalConfig.reward) : goalConfig.reward,
      overallPercent,
    };
  }

  if (type === "streak") {
    let streak = 0;
    const check = new Date(now);
    while (true) {
      const dateStr = check.toISOString().split("T")[0];
      const entry = log.find(e => e.kidId === kidId && e.date === dateStr);
      if (entry && entry.completed) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    const kidEntries = log
      .filter(e => e.kidId === kidId)
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    let best = 0, current = 0;
    kidEntries.forEach(e => {
      if (e.completed) { current++; best = Math.max(best, current); }
      else { current = 0; }
    });
    const percent = Math.min(Math.round((streak / target) * 100), 100);
    return {
      percent,
      barPercent: percent,
      completed: streak,
      achieved: streak >= target,
      label: `${streak} day streak`,
      detail: `Best ever: ${best} days`,
      targetLabel: `Goal: ${target} consecutive days`,
      reward: goalConfig.reward,
    };
  }

  if (type === "weekly") {
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    const startDate = weekStart.toISOString().split("T")[0];
    const completed = completedInRange(startDate, today);
    const percent = Math.min(Math.round((completed / target) * 100), 100);
    return {
      percent,
      barPercent: percent,
      completed,
      achieved: completed >= target,
      label: `${completed} of ${target} days this week`,
      detail: `Week resets every Sunday`,
      targetLabel: `Goal: ${target} days/week`,
      reward: goalConfig.reward,
    };
  }

  if (type === "total-count") {
    const completed = log.filter(e => e.kidId === kidId && e.completed).length;
    const percent = Math.min(Math.round((completed / target) * 100), 100);
    return {
      percent,
      barPercent: percent,
      completed,
      achieved: completed >= target,
      label: `${completed} of ${target} total completions`,
      detail: completed >= target ? "Goal reached!" : `${target - completed} to go`,
      targetLabel: `Goal: ${target} completions`,
      reward: goalConfig.reward,
    };
  }

  return { percent: 0, barPercent: 0, completed: 0, achieved: false, label: "", detail: "", targetLabel: "", reward: "" };
}

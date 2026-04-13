const BASE_LEVEL_XP = 100;
const LEVEL_XP_MULTIPLIER = 1.25;

const calculateXpForLevel = (level) => {
  const safeLevel = Math.max(1, Number(level) || 1);
  return Math.round(BASE_LEVEL_XP * LEVEL_XP_MULTIPLIER ** (safeLevel - 1));
};

const calculateLevelFromExperience = (totalExperience) => {
  let remainingXp = Math.max(0, Number(totalExperience) || 0);
  let level = 1;

  while (remainingXp >= calculateXpForLevel(level)) {
    remainingXp -= calculateXpForLevel(level);
    level += 1;
  }

  return {
    level,
    currentLevelXp: remainingXp,
    nextLevelXp: calculateXpForLevel(level),
  };
};

const calculateCompletionPercentage = (completed, total) => {
  const safeTotal = Math.max(0, Number(total) || 0);
  if (safeTotal === 0) return 0;
  const safeCompleted = Math.max(0, Number(completed) || 0);
  return Math.round((safeCompleted / safeTotal) * 100);
};

module.exports = {
  calculateXpForLevel,
  calculateLevelFromExperience,
  calculateCompletionPercentage,
};

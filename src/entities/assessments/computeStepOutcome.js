export const computeStepOutcome = (stepNumber, scorePercent) => {
  const score = Number(scorePercent) || 0;

  if (stepNumber === 1) {
    if (score < 25) {
      return { awardedLevel: null, canProceed: false, userStatus: 'Failed' };
    }
    if (score < 50) {
      return { awardedLevel: 'A1', canProceed: false, userStatus: 'Completed' };
    }
    if (score < 75) {
      return { awardedLevel: 'A2', canProceed: false, userStatus: 'Completed' };
    }
    return { awardedLevel: 'A2', canProceed: true, userStatus: 'InProgress' };
  }

  if (stepNumber === 2) {
    if (score < 25) {
      return { awardedLevel: 'A2', canProceed: false, userStatus: 'Completed' };
    }
    if (score < 50) {
      return { awardedLevel: 'B1', canProceed: false, userStatus: 'Completed' };
    }
    if (score < 75) {
      return { awardedLevel: 'B2', canProceed: false, userStatus: 'Completed' };
    }
    return { awardedLevel: 'B2', canProceed: true, userStatus: 'InProgress' };
  }

  // step 3
  if (score < 25) {
    return { awardedLevel: 'B2', canProceed: false, userStatus: 'Completed' };
  }
  if (score < 50) {
    return { awardedLevel: 'C1', canProceed: false, userStatus: 'Completed' };
  }
  return { awardedLevel: 'C2', canProceed: false, userStatus: 'Completed' };
};

export const levelPairForNextStep = (lastCompletedStepNumber) => {
  if (lastCompletedStepNumber === 1) return ['B1', 'B2'];
  if (lastCompletedStepNumber === 2) return ['C1', 'C2'];
  return null;
};



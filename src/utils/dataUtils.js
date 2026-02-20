// Initial state for user settings
export const getInitialSettings = () => ({
    targetSteps: 8000,
    targetCalories: 2100,
    targetProtein: 180,
    targetStrengthDays: 2
});

// Initial state for a single day's log
export const getInitialDayState = () => ({
    steps: '',
    calories: '',
    protein: '',
    strengthDone: false,
    nightSystemCompliant: false,
    notes: '',
    mood: '',
    binge: '',
    sleep: ''
});

// Initial state for a week, with option to carry over settings from previous week
export const getInitialWeekState = (previousWeekData = null) => {
    const settings = previousWeekData?.settings || getInitialSettings();

    return {
        monday: getInitialDayState(),
        tuesday: getInitialDayState(),
        wednesday: getInitialDayState(),
        thursday: getInitialDayState(),
        friday: getInitialDayState(),
        saturday: getInitialDayState(),
        sunday: getInitialDayState(),
        settings: { ...settings },
        weight: '' // track weekly weight end-of-week
    };
};

// Helper to calculate compliance for a specific metric across the week
// Expected days tracked: 7
export const calculateWeeklyCompliance = (weekData, targetStrengthDays = 2) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    let totalSteps = 0;
    let strengthDays = 0;
    let nightSystemDays = 0;

    let daysWithSteps = 0;

    days.forEach(day => {
        const data = weekData[day];

        if (data.steps) {
            totalSteps += Number(data.steps);
            daysWithSteps++;
        }

        if (data.strengthDone) strengthDays++;
        if (data.nightSystemCompliant) nightSystemDays++;
    });

    const avgSteps = daysWithSteps > 0 ? totalSteps / daysWithSteps : 0;

    // Calculate Strength Status dynamically
    let strengthStatus = 'perfect';
    if (strengthDays < targetStrengthDays) strengthStatus = 'under';
    else if (strengthDays > targetStrengthDays) strengthStatus = 'over';

    // Weekly averages for compliance display
    return {
        avgSteps: Math.round(avgSteps),
        strengthDays,
        strengthStatus,
        nightSystemDays,
        nightSystemCompliance: (nightSystemDays / 7) * 100,
        isCompliant: (nightSystemDays / 7) >= 0.85 // simple baseline: >=85% night system compliant
    };
};

// Calculate 3-week averages given an array of the last 3 weeks data
export const calculateRollingAverages = (pastWeeksData) => {
    if (!pastWeeksData || pastWeeksData.length === 0) return null;

    let totalWeight = 0;
    let totalSteps = 0;
    let totalCalories = 0;

    let weightWeeks = 0;
    let stepDays = 0;
    let calorieDays = 0;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    pastWeeksData.forEach(week => {
        if (week.weight) {
            totalWeight += Number(week.weight);
            weightWeeks++;
        }

        days.forEach(day => {
            const data = week[day];
            if (data.steps) {
                totalSteps += Number(data.steps);
                stepDays++;
            }
            if (data.calories) {
                totalCalories += Number(data.calories);
                calorieDays++;
            }
        });
    });

    return {
        avgWeight: weightWeeks ? (totalWeight / weightWeeks).toFixed(2) : null,
        avgSteps: stepDays ? Math.round(totalSteps / stepDays) : null,
        avgCalories: calorieDays ? Math.round(totalCalories / calorieDays) : null
    };
};

export const evaluateProgress = (weightDiff, currentCompliance) => {
    // Decision logic window
    // Only adjust if 3-week trend shows < 0.6 kg/week AND compliance >= 85%
    if (currentCompliance < 85) {
        return {
            status: 'warning',
            message: 'Compliance < 85%. Note weak points, do not punish with more restriction, just reinforce structure.'
        };
    }

    if (weightDiff !== null && weightDiff < 0.6) {
        return {
            status: 'action_needed',
            message: 'Weight loss under 0.6 kg/week with strong compliance. Consider adjusting calories or steps.'
        };
    }

    return {
        status: 'good',
        message: '≥85% compliance and progressing well. No adjustment needed.'
    };
};

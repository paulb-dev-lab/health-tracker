import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getInitialWeekState, calculateWeeklyCompliance, calculateRollingAverages, evaluateProgress, getInitialSettings } from '../utils/dataUtils';
import WeeklyLog from './WeeklyLog';
import WeeklyReview from './WeeklyReview';
import SettingsModal from './SettingsModal';
import { ChevronLeft, ChevronRight, Calendar, Settings } from 'lucide-react';

// Utility to get the Monday of the current week (or a given date)
const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay() || 7;
    if (day !== 1) date.setHours(-24 * (day - 1));
    return date.toISOString().split('T')[0];
};

const Dashboard = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const currentWeekKey = getMonday(currentDate);

    // Get previous week key for smart-defaulting targets if we generate a new week
    const lastWeekKey = getMonday(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Store all weeks data in a single object: { 'YYYY-MM-DD': weekData }
    const [allWeeksData, setAllWeeksData] = useLocalStorage('health_tracker_data', {});

    // Get current week data or initialize it (carrying over last week's settings if available)
    const currentWeekData = allWeeksData[currentWeekKey] || getInitialWeekState(allWeeksData[lastWeekKey]);

    const handleUpdateDay = (dayKey, field, value) => {
        setAllWeeksData(prev => ({
            ...prev,
            [currentWeekKey]: {
                ...(prev[currentWeekKey] || getInitialWeekState(prev[lastWeekKey])),
                [dayKey]: {
                    ...(prev[currentWeekKey]?.[dayKey] || {}),
                    [field]: value
                }
            }
        }));
    };

    const handleUpdateWeight = (weight) => {
        setAllWeeksData(prev => ({
            ...prev,
            [currentWeekKey]: {
                ...(prev[currentWeekKey] || getInitialWeekState(prev[lastWeekKey])),
                weight
            }
        }));
    };

    const handleUpdateSettings = (newSettings) => {
        setAllWeeksData(prev => ({
            ...prev,
            [currentWeekKey]: {
                ...(prev[currentWeekKey] || getInitialWeekState(prev[lastWeekKey])),
                settings: newSettings
            }
        }));
    };

    const changeWeek = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (offset * 7));
        setCurrentDate(newDate);
    };

    // Logic for Rolling Averages
    const pastWeeksData = useMemo(() => {
        const past = [];
        let tempDate = new Date(currentDate);
        // get previous 3 weeks excluding current week (or including? 3-week rolling "trend")
        // usually 3-week average means the last 3 completed weeks, but let's just grab the 3 weeks prior to current week
        for (let i = 1; i <= 3; i++) {
            tempDate.setDate(tempDate.getDate() - 7);
            const key = getMonday(tempDate);
            if (allWeeksData[key]) {
                past.push(allWeeksData[key]);
            }
        }
        return past;
    }, [allWeeksData, currentDate]);

    const activeSettings = currentWeekData.settings || getInitialSettings();
    const compliance = calculateWeeklyCompliance(currentWeekData, activeSettings.targetStrengthDays);
    const rollingAverages = calculateRollingAverages(pastWeeksData);

    // To evaluate progress, we need weight diff. Weight diff is rolling avg weight vs current week weight, or prev week vs current.
    // We'll use a simple approximation: current week weight minus last week's weight.
    let weightDiff = null;
    const lastWeekDate = allWeeksData[lastWeekKey];
    if (currentWeekData.weight && lastWeekDate && lastWeekDate.weight) {
        weightDiff = Number(currentWeekData.weight) - Number(lastWeekDate.weight);
    } else if (currentWeekData.weight && rollingAverages && rollingAverages.avgWeight) {
        weightDiff = Number(currentWeekData.weight) - Number(rollingAverages.avgWeight);
    }

    const progressStatus = evaluateProgress(weightDiff, compliance.nightSystemCompliance);

    // Formatting date for display
    const weekLabel = new Date(currentWeekKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    const handleImportData = (importedData) => {
        setAllWeeksData(importedData);
        setIsSettingsOpen(false);
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <div>
                        <h1>Health Tracker</h1>
                        <p className="subtitle">Minimal, actionable weekly log</p>
                    </div>
                    <div className="week-navigation">
                        <button onClick={() => changeWeek(-1)} className="nav-btn"><ChevronLeft size={20} /></button>
                        <div className="current-week-label">
                            <Calendar size={18} />
                            <span>Week of {weekLabel}</span>
                        </div>
                        <button onClick={() => changeWeek(1)} className="nav-btn"><ChevronRight size={20} /></button>
                        <div style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                            <button onClick={() => setIsSettingsOpen(true)} className="icon-btn" title="Settings for This Week">
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="main-content">
                    <WeeklyLog data={currentWeekData} onUpdateDay={handleUpdateDay} settings={activeSettings} />
                </div>

                <aside className="sidebar">
                    <WeeklyReview
                        weight={currentWeekData.weight}
                        onUpdateWeight={handleUpdateWeight}
                        compliance={compliance}
                        rollingAverages={rollingAverages}
                        progressStatus={progressStatus}
                        weightDiff={weightDiff}
                        settings={activeSettings}
                    />
                </aside>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={activeSettings}
                onSave={handleUpdateSettings}
                weekLabel={weekLabel}
                allData={allWeeksData}
                onImport={handleImportData}
            />
        </div>
    );
};

export default Dashboard;

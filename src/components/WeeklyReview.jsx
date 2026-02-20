import React from 'react';
import { Target, TrendingDown, Activity, AlertCircle, CheckCircle } from 'lucide-react';

const WeeklyReview = ({ weight, onUpdateWeight, compliance, rollingAverages, progressStatus, weightDiff, settings }) => {
    return (
        <div className="weekly-review-container">
            <div className="card summary-card weight-input-card">
                <h3>End of Week Weight</h3>
                <div className="weight-input-wrapper">
                    <input
                        type="number"
                        placeholder="e.g. 75.5"
                        value={weight}
                        onChange={(e) => onUpdateWeight(e.target.value)}
                        className="input-field large-input"
                        step="0.1"
                    />
                    <span className="unit">kg</span>
                </div>
            </div>

            <div className="card summary-card">
                <h3>Weekly Review</h3>

                <div className="stats-grid">
                    <div className="stat-box">
                        <span className="stat-label">Avg Steps</span>
                        <span className="stat-value">{compliance.avgSteps.toLocaleString()}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Strength (Goal: {settings?.targetStrengthDays || 2})</span>
                        <div className={`stat-value-container ${compliance.strengthStatus === 'perfect' ? 'text-success' : 'text-danger'}`}>
                            <span className="stat-value">{compliance.strengthDays}</span>
                            <span className="stat-subtext">
                                {compliance.strengthStatus === 'under' && '(Under)'}
                                {compliance.strengthStatus === 'over' && '(Over!)'}
                                {compliance.strengthStatus === 'perfect' && '(Perfect)'}
                            </span>
                        </div>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Night Sys Compliance</span>
                        <span className={`stat-value ${compliance.isCompliant ? 'text-success' : 'text-warning'}`}>
                            {Math.round(compliance.nightSystemCompliance)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="card summary-card">
                <h3>3-Week Rolling Averages</h3>
                {rollingAverages ? (
                    <div className="rolling-stats">
                        <div className="rolling-row">
                            <TrendingDown size={18} className="text-muted" />
                            <span>Weight:</span>
                            <strong>{rollingAverages.avgWeight ? `${rollingAverages.avgWeight} kg` : '-'}</strong>
                        </div>
                        <div className="rolling-row">
                            <Activity size={18} className="text-muted" />
                            <span>Steps:</span>
                            <strong>{rollingAverages.avgSteps ? rollingAverages.avgSteps.toLocaleString() : '-'}</strong>
                        </div>
                        <div className="rolling-row">
                            <Target size={18} className="text-muted" />
                            <span>Calories:</span>
                            <strong>{rollingAverages.avgCalories ? rollingAverages.avgCalories.toLocaleString() : '-'}</strong>
                        </div>
                    </div>
                ) : (
                    <p className="no-data-msg">Not enough past data yet.</p>
                )}
            </div>

            <div className={`card decision-card border-${progressStatus.status}`}>
                <h3>Decision Logic Window</h3>
                <div className="decision-content">
                    {progressStatus.status === 'warning' && <AlertCircle className="icon-warning" size={24} />}
                    {progressStatus.status === 'action_needed' && <AlertCircle className="icon-warning" size={24} />}
                    {progressStatus.status === 'good' && <CheckCircle className="icon-success" size={24} />}

                    <div className="decision-text">
                        {weightDiff !== null && (
                            <p className="weight-diff-text">
                                Weight change this week: <strong>{weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(2)} kg</strong>
                            </p>
                        )}
                        <p className="status-msg">{progressStatus.message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyReview;

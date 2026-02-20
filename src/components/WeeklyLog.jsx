import React from 'react';

const daysOfWeek = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
];

const WeeklyLog = ({ data, onUpdateDay, settings }) => {
    return (
        <div className="weekly-log-container card">
            <h2>Daily Logs</h2>
            <div className="table-responsive">
                <table className="log-table">
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Steps<br /><span className="target-subtext">Goal: {settings?.targetSteps || 8000}+</span></th>
                            <th>Calories<br /><span className="target-subtext">Target: ~{settings?.targetCalories || 2100}</span></th>
                            <th>Protein<br /><span className="target-subtext">Target: {settings?.targetProtein || 180}g</span></th>
                            <th className="checkbox-col">Strength<br />Done?</th>
                            <th className="checkbox-col">
                                Night Sys<br />Compliant?
                                <span className="target-subtext">Meal + Protein + Walk + Delay</span>
                            </th>
                            <th>Notes / Fatigue / Urges</th>
                            <th className="extra-col">Extra<br />(Mood/Binge/Sleep)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {daysOfWeek.map((day) => {
                            const dayData = data[day.key];
                            return (
                                <tr key={day.key}>
                                    <td className="day-label" data-label="Day">{day.label}</td>
                                    <td data-label={`Steps\n(Goal: ${settings?.targetSteps || 8000}+)`}>
                                        <input
                                            type="number"
                                            placeholder={`e.g. ${settings?.targetSteps || 5000}`}
                                            value={dayData.steps}
                                            onChange={(e) => onUpdateDay(day.key, 'steps', e.target.value)}
                                            className="input-field"
                                        />
                                    </td>
                                    <td data-label={`Calories\n(Target: ~${settings?.targetCalories || 2100})`}>
                                        <input
                                            type="number"
                                            placeholder={`e.g. ${settings?.targetCalories || 2100}`}
                                            value={dayData.calories}
                                            onChange={(e) => onUpdateDay(day.key, 'calories', e.target.value)}
                                            className="input-field"
                                        />
                                    </td>
                                    <td data-label={`Protein (g)\n(Target: ${settings?.targetProtein || 180}g)`}>
                                        <input
                                            type="number"
                                            placeholder={`e.g. ${settings?.targetProtein || 180}`}
                                            value={dayData.protein}
                                            onChange={(e) => onUpdateDay(day.key, 'protein', e.target.value)}
                                            className="input-field"
                                        />
                                    </td>
                                    <td className="checkbox-cell" data-label="Strength Done?">
                                        <label className="checkbox-wrapper">
                                            <input
                                                type="checkbox"
                                                checked={dayData.strengthDone}
                                                onChange={(e) => onUpdateDay(day.key, 'strengthDone', e.target.checked)}
                                            />
                                            <span className="checkmark"></span>
                                        </label>
                                    </td>
                                    <td className="checkbox-cell" data-label={"Night Sys Compliant?\n(Meal+Protein+Walk+Delay)"}>
                                        <label className="checkbox-wrapper">
                                            <input
                                                type="checkbox"
                                                checked={dayData.nightSystemCompliant}
                                                onChange={(e) => onUpdateDay(day.key, 'nightSystemCompliant', e.target.checked)}
                                            />
                                            <span className="checkmark"></span>
                                        </label>
                                    </td>
                                    <td data-label="Notes / Fatigue / Urges">
                                        <input
                                            type="text"
                                            placeholder="1-2 lines briefly..."
                                            value={dayData.notes}
                                            onChange={(e) => onUpdateDay(day.key, 'notes', e.target.value)}
                                            className="input-field text-input"
                                        />
                                    </td>
                                    <td className="extra-cell" data-label="Extra (Mood/Binge/Sleep)">
                                        <div className="mini-inputs">
                                            <input type="number" title="Mood (1-10)" placeholder="M" min="1" max="10" value={dayData.mood} onChange={(e) => onUpdateDay(day.key, 'mood', e.target.value)} />
                                            <input type="number" title="Binge (0-10)" placeholder="B" min="0" max="10" value={dayData.binge} onChange={(e) => onUpdateDay(day.key, 'binge', e.target.value)} />
                                            <input type="number" title="Sleep (1-10)" placeholder="S" min="1" max="10" value={dayData.sleep} onChange={(e) => onUpdateDay(day.key, 'sleep', e.target.value)} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WeeklyLog;

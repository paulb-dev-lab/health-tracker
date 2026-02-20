import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Download, Copy, Upload, FileJson } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, settings, onSave, weekLabel, allData, onImport }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [importText, setImportText] = useState('');
    const [importError, setImportError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const fileInputRef = useRef(null);

    // Sync state if modal opens or settings change from outside
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setLocalSettings(prev => ({
            ...prev,
            [field]: Number(value) || 0
        }));
    };

    const handleExportFile = () => {
        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportClipboard = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(allData, null, 2));
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy data', err);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                onImport(parsed);
            } catch (err) {
                setImportError('Invalid JSON file format.');
            }
        };
        reader.readAsText(file);
    };

    const handleTextImport = () => {
        try {
            if (!importText.trim()) throw new Error('Empty input');
            const parsed = JSON.parse(importText);
            onImport(parsed);
            setImportText('');
            setImportError('');
        } catch (err) {
            setImportError('Invalid JSON text format.');
        }
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };



    return (
        <div className="modal-overlay">
            <div className="modal-content card">
                <div className="modal-header" style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.25rem' }}>Targets Settings</h2>
                        <p className="subtitle" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 500 }}>
                            Applying to: Week of {weekLabel}
                        </p>
                    </div>
                    <button onClick={onClose} className="icon-btn"><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                        <label>Target Daily Steps</label>
                        <input
                            type="number"
                            className="input-field"
                            value={localSettings.targetSteps}
                            onChange={(e) => handleChange('targetSteps', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Target Daily Calories</label>
                        <input
                            type="number"
                            className="input-field"
                            value={localSettings.targetCalories}
                            onChange={(e) => handleChange('targetCalories', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Target Daily Protein (g)</label>
                        <input
                            type="number"
                            className="input-field"
                            value={localSettings.targetProtein}
                            onChange={(e) => handleChange('targetProtein', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Target Weekly Strength Sessions</label>
                        <input
                            type="number"
                            className="input-field"
                            value={localSettings.targetStrengthDays}
                            onChange={(e) => handleChange('targetStrengthDays', e.target.value)}
                        />
                    </div>
                </div>

                <div className="modal-body" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Data Management</h3>

                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                        <button onClick={handleExportFile} className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                            <Download size={16} /> Export File
                        </button>
                        <button onClick={handleExportClipboard} className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                            <Copy size={16} /> {copySuccess ? 'Copied!' : 'Copy Data'}
                        </button>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Import from Backup File:</p>
                        <input
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <button onClick={() => fileInputRef.current.click()} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                            <Upload size={16} /> Upload .json File
                        </button>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Or Import by Pasting JSON:</p>
                        <textarea
                            className="input-field"
                            style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                            placeholder='Paste JSON data here...'
                            value={importText}
                            onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
                        />
                        {importError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{importError}</p>}
                        <button
                            onClick={handleTextImport}
                            className="btn btn-secondary"
                            disabled={!importText.trim()}
                            style={{ width: '100%', justifyContent: 'center', opacity: !importText.trim() ? 0.5 : 1 }}
                        >
                            <FileJson size={16} /> Import Text
                        </button>
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={handleSave} className="btn btn-primary">
                        <Save size={18} /> Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

import React, { useState, useEffect } from 'react';
import './Studio.css';

// Auto-discover all rank components (finals + drafts) via Vite's import.meta.glob
const finalModules = import.meta.glob('./ranks/*.jsx', { eager: true });
const draftModules = import.meta.glob('./ranks/drafts/*.jsx', { eager: true });

// Convert filename to display name: "BlessedDraftF" → "Blessed Draft F"
function toDisplayName(filename, prefix) {
    const name = filename.replace(/\.jsx$/, '');
    // Insert a space before each uppercase letter (except the very first)
    const spaced = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    return `${spaced}${prefix ? ` ${prefix}` : ''}`;
}

// Build registry: { displayName: Component }
function buildRegistry() {
    const registry = {};

    // Finals (from ranks/*.jsx)
    for (const [path, mod] of Object.entries(finalModules)) {
        const filename = path.split('/').pop();
        const displayName = toDisplayName(filename, '(Final)');
        if (mod.default) registry[displayName] = mod.default;
    }

    // Drafts (from ranks/drafts/*.jsx)
    for (const [path, mod] of Object.entries(draftModules)) {
        const filename = path.split('/').pop();
        const displayName = toDisplayName(filename, '');
        if (mod.default) registry[displayName] = mod.default;
    }

    return registry;
}

const DRAFT_REGISTRY = buildRegistry();

const REGISTRY_KEYS = Object.keys(DRAFT_REGISTRY);
const DEFAULT_DRAFT_KEY = REGISTRY_KEYS[0] || '';

export default function Studio({ onExit }) {
    // Shared State mapped to localStorage
    const [playerName, setPlayerName] = useState(() => localStorage.getItem('studio_playerName') || 'SpaceNinja');
    const [memberNumber, setMemberNumber] = useState(() => localStorage.getItem('studio_memberNumber') || '1234');
    const [dateString, setDateString] = useState(() => localStorage.getItem('studio_dateString') || '');

    // Slots array where each slot selects a specific draft
    const [slots, setSlots] = useState(() => {
        const saved = localStorage.getItem('studio_slots');
        return saved ? JSON.parse(saved) : [{ id: 1, draftKey: DEFAULT_DRAFT_KEY }];
    });

    // Save to localStorage whenever these change
    useEffect(() => {
        localStorage.setItem('studio_playerName', playerName);
        localStorage.setItem('studio_memberNumber', memberNumber);
        localStorage.setItem('studio_dateString', dateString);
        localStorage.setItem('studio_slots', JSON.stringify(slots));
    }, [playerName, memberNumber, dateString, slots]);

    const addSlot = () => {
        setSlots([...slots, { id: Date.now(), draftKey: DEFAULT_DRAFT_KEY }]);
    };

    const removeSlot = (idToRemove) => {
        setSlots(slots.filter(s => s.id !== idToRemove));
    };

    const updateSlotDraft = (id, newDraftKey) => {
        setSlots(slots.map(s => s.id === id ? { ...s, draftKey: newDraftKey } : s));
    };

    return (
        <div className="studio-container">
            <aside className="studio-sidebar">
                <h2>Motif Draft Studio</h2>
                <div className="studio-controls">
                    <div className="control-group">
                        <label>Mock Player Name</label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                    </div>
                    <div className="control-group">
                        <label>Mock Member #</label>
                        <input
                            type="number"
                            value={memberNumber}
                            onChange={(e) => setMemberNumber(e.target.value)}
                        />
                    </div>
                    <div className="control-group">
                        <label>Override Date (Optional)</label>
                        <input
                            type="text"
                            value={dateString}
                            onChange={(e) => setDateString(e.target.value)}
                            placeholder="e.g. Mar 30, 2025"
                        />
                    </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <button className="secondary-button" onClick={onExit} style={{ width: '100%' }}>
                        &larr; Back to App
                    </button>
                </div>
            </aside>

            <main className="studio-main">
                <header className="studio-header">
                    <h3>Draft Viewer</h3>
                    <button className="primary-button" onClick={addSlot}>
                        + Add Comparison Slot
                    </button>
                </header>

                <div className="studio-grid">
                    {slots.map(slot => {
                        const ComponentToRender = DRAFT_REGISTRY[slot.draftKey] || Object.values(DRAFT_REGISTRY)[0];

                        return (
                            <div key={slot.id} className="slot-container">
                                <div className="slot-header">
                                    <select
                                        className="slot-select"
                                        value={slot.draftKey}
                                        onChange={(e) => updateSlotDraft(slot.id, e.target.value)}
                                    >
                                        {Object.keys(DRAFT_REGISTRY).map(key => (
                                            <option key={key} value={key}>{key}</option>
                                        ))}
                                    </select>
                                    <button className="danger-button" onClick={() => removeSlot(slot.id)}>Remove</button>
                                </div>

                                <div className="card-scale-wrapper">
                                    {/* The component will render at 1600x850 but CSS scales it down visually */}
                                    <ComponentToRender
                                        playerName={playerName}
                                        memberNumber={memberNumber}
                                        dateString={dateString}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    );
}

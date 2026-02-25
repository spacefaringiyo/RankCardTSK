import React, { useState, useEffect } from 'react';
import './Studio.css';
import BaseCard from './components/BaseCard';
import InteractiveCardWrapper from './components/InteractiveCardWrapper';

// 1. Auto-discover all layers via Vite's import.meta.glob
const palettesModules = import.meta.glob('./layers/palettes/*.js', { eager: true });
const backgroundsModules = import.meta.glob('./layers/backgrounds/*.jsx', { eager: true });
const motifsModules = import.meta.glob('./layers/motifs/*.jsx', { eager: true });
const texturesModules = import.meta.glob('./layers/textures/*.jsx', { eager: true });
const holoModules = import.meta.glob('./layers/holo/*.jsx', { eager: true });

// Convert filename to display name
function toDisplayName(path) {
    const filename = path.split('/').pop().replace(/\.(jsx|js)$/, '');
    // Insert a space before each uppercase letter (except the very first)
    return filename.replace(/([a-z])([A-Z])/g, '$1 $2');
}

// Build generic registry: { "Display Name": ExportedFunctionOrObject }
function buildRegistry(modules) {
    const registry = {};
    for (const [path, mod] of Object.entries(modules)) {
        const displayName = toDisplayName(path);

        // Find the main export. Usually it's either `default`, or a named export.
        // For Palettes it's likely an object `BlessedPalette`. For renderers it's `renderRadialGlow`.
        if (mod.default) {
            registry[displayName] = mod.default;
        } else {
            // Just grab the first exported value
            const firstExport = Object.values(mod)[0];
            if (firstExport) registry[displayName] = firstExport;
        }
    }
    // Always provide a "None" option if applicable (except maybe Palette)
    return registry;
}

const REGISTRIES = {
    palettes: buildRegistry(palettesModules),
    backgrounds: buildRegistry(backgroundsModules),
    motifs: buildRegistry(motifsModules),
    textures: buildRegistry(texturesModules),
    holo: buildRegistry(holoModules)
};

// Insert a "None" option into render registries (not palettes)
const safeRegistries = {
    palettes: REGISTRIES.palettes,
    backgrounds: { "None": null, ...REGISTRIES.backgrounds },
    motifs: { "None": null, ...REGISTRIES.motifs },
    textures: { "None": null, ...REGISTRIES.textures },
    holo: { "None": null, ...REGISTRIES.holo },
}

const DEFAULT_SELECTIONS = {
    palette: Object.keys(safeRegistries.palettes)[0] || '',
    background: Object.keys(safeRegistries.backgrounds)[0] || 'None',
    motif: Object.keys(safeRegistries.motifs)[0] || 'None',
    texture: Object.keys(safeRegistries.textures)[0] || 'None',
    holo: Object.keys(safeRegistries.holo)[0] || 'None',
};

export default function Studio({ onExit }) {
    // Shared State mapped to localStorage
    const [playerName, setPlayerName] = useState(() => localStorage.getItem('studio_playerName') || 'SpaceNinja');
    const [memberNumber, setMemberNumber] = useState(() => localStorage.getItem('studio_memberNumber') || '1234');
    const [dateString, setDateString] = useState(() => localStorage.getItem('studio_dateString') || '');

    // Slots array where each slot selects 5 properties
    const [slots, setSlots] = useState(() => {
        const saved = localStorage.getItem('studio_sandbox_slots');
        return saved ? JSON.parse(saved) : [{ id: 1, selections: { ...DEFAULT_SELECTIONS } }];
    });

    // Save to localStorage whenever these change
    useEffect(() => {
        localStorage.setItem('studio_playerName', playerName);
        localStorage.setItem('studio_memberNumber', memberNumber);
        localStorage.setItem('studio_dateString', dateString);
        localStorage.setItem('studio_sandbox_slots', JSON.stringify(slots));
    }, [playerName, memberNumber, dateString, slots]);

    const addSlot = () => {
        setSlots([...slots, { id: Date.now(), selections: { ...DEFAULT_SELECTIONS } }]);
    };

    const removeSlot = (idToRemove) => {
        setSlots(slots.filter(s => s.id !== idToRemove));
    };

    const updateSlotSelection = (id, category, value) => {
        setSlots(slots.map(s => s.id === id ? {
            ...s,
            selections: { ...s.selections, [category]: value }
        } : s));
    };

    const handleCopyConfig = (slot) => {
        const sel = slot.selections;

        // This generates a stringified representation of the JS code needed for rankConfigs.js
        const codeString = `export const DraftConfig = {
    id: 'draft-${Date.now()}',
    displayName: '${sel.palette} Draft',
    themeColors: ${sel.palette ? `${sel.palette.replace(' ', '')}Palette` : '{}'},
    layers: {
        background: render${sel.background.replace(' ', '')},
        motif: render${sel.motif.replace(' ', '')},
        texture: render${sel.texture.replace(' ', '')},
        holo: render${sel.holo.replace(' ', '')}
    },
    fx: {
        holoBlendMode: 'screen',
        textureBlendMode: 'overlay',
        textureOpacity: 0.5,
    }
};`;

        navigator.clipboard.writeText(codeString)
            .then(() => alert("Config copied to clipboard! Paste it into src/configs/rankConfigs.js"))
            .catch(() => alert("Failed to copy."));
    };

    return (
        <div className="studio-container">
            <aside className="studio-sidebar">
                <h2>Motif Sandbox</h2>
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
                    <h3>Mix-and-Match Viewer</h3>
                    <button className="primary-button" onClick={addSlot}>
                        + Add Sandbox Slot
                    </button>
                </header>

                <div className="studio-grid">
                    {slots.map(slot => {
                        const sel = slot.selections;

                        // Construct the ephemeral sandbox config
                        const sandboxConfig = {
                            displayName: sel.palette || 'Rank',
                            themeColors: safeRegistries.palettes[sel.palette] || {},
                            layers: {
                                background: safeRegistries.backgrounds[sel.background],
                                motif: safeRegistries.motifs[sel.motif],
                                texture: safeRegistries.textures[sel.texture],
                                holo: safeRegistries.holo[sel.holo]
                            },
                            fx: {
                                holoBlendMode: 'screen',
                                textureBlendMode: 'overlay',
                                textureOpacity: 0.5,
                            }
                        };

                        return (
                            <div key={slot.id} className="slot-container">
                                <div className="slot-header sandbox-header">
                                    <div className="sandbox-controls">
                                        <div className="sandbox-dropdown">
                                            <span className="dropdown-label">Palette</span>
                                            <select value={sel.palette} onChange={(e) => updateSlotSelection(slot.id, 'palette', e.target.value)}>
                                                {Object.keys(safeRegistries.palettes).map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                        <div className="sandbox-dropdown">
                                            <span className="dropdown-label">Background</span>
                                            <select value={sel.background} onChange={(e) => updateSlotSelection(slot.id, 'background', e.target.value)}>
                                                {Object.keys(safeRegistries.backgrounds).map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                        <div className="sandbox-dropdown">
                                            <span className="dropdown-label">Motif</span>
                                            <select value={sel.motif} onChange={(e) => updateSlotSelection(slot.id, 'motif', e.target.value)}>
                                                {Object.keys(safeRegistries.motifs).map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                        <div className="sandbox-dropdown">
                                            <span className="dropdown-label">Texture</span>
                                            <select value={sel.texture} onChange={(e) => updateSlotSelection(slot.id, 'texture', e.target.value)}>
                                                {Object.keys(safeRegistries.textures).map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                        <div className="sandbox-dropdown">
                                            <span className="dropdown-label">Holographic</span>
                                            <select value={sel.holo} onChange={(e) => updateSlotSelection(slot.id, 'holo', e.target.value)}>
                                                {Object.keys(safeRegistries.holo).map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <button className="danger-button remove-btn" onClick={() => removeSlot(slot.id)}>&times;</button>
                                </div>

                                <div className="card-scale-wrapper">
                                    <InteractiveCardWrapper>
                                        {({ lightX, lightY }) => (
                                            <BaseCard
                                                config={sandboxConfig}
                                                playerName={playerName}
                                                memberNumber={memberNumber}
                                                dateString={dateString}
                                                isShiny={sel.holo !== 'None'}
                                                lightX={lightX}
                                                lightY={lightY}
                                            />
                                        )}
                                    </InteractiveCardWrapper>
                                </div>

                                <div className="slot-footer">
                                    <button className="secondary-button" onClick={() => handleCopyConfig(slot)} style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}>
                                        📋 Copy Config JSON
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    );
}

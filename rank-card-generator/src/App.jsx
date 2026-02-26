import { useState, useRef, useCallback, useEffect } from 'react'
import './App.css'
import BaseCard from './components/BaseCard'
import InteractiveCardWrapper from './components/InteractiveCardWrapper'
import Studio from './Studio'
import { exportSvgToPng } from './utils/exportImage'
import { exportSvgToMp4 } from './utils/exportVideo'

// 1. Auto-discover all Rank Configs
const rankConfigModules = import.meta.glob('./configs/rankConfigs.js', { eager: true });
const RANK_CONFIGS = {};
import { StandardLayout } from './registry' // Import standard layout fallback
for (const [path, mod] of Object.entries(rankConfigModules)) {
  // We expect rankConfigs.js to export named configs like BlessedRankConfig
  for (const [exportName, configObj] of Object.entries(mod)) {
    if (configObj && configObj.id) {
      RANK_CONFIGS[configObj.id] = configObj;
    }
  }
}

// 2. Auto-discover all layers for the Sandbox Mode
const palettesModules = import.meta.glob('./layers/palettes/*.js', { eager: true });
const backgroundsModules = import.meta.glob('./layers/backgrounds/*.jsx', { eager: true });
const motifsModules = import.meta.glob('./layers/motifs/*.jsx', { eager: true });
const texturesModules = import.meta.glob('./layers/textures/*.jsx', { eager: true });
const holoModules = import.meta.glob('./layers/holo/*.jsx', { eager: true });
const layoutsModules = import.meta.glob('./layers/layouts/*.jsx', { eager: true });

function toDisplayName(path) {
  const filename = path.split('/').pop().replace(/\.(jsx|js)$/, '');
  return filename.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function buildRegistry(modules) {
  const registry = {};
  for (const [path, mod] of Object.entries(modules)) {
    const displayName = toDisplayName(path);
    if (mod.default) registry[displayName] = mod.default;
    else registry[displayName] = Object.values(mod)[0];
  }
  return registry;
}

const safeRegistries = {
  palettes: buildRegistry(palettesModules),
  backgrounds: { "None": null, ...buildRegistry(backgroundsModules) },
  motifs: { "None": null, ...buildRegistry(motifsModules) },
  textures: { "None": null, ...buildRegistry(texturesModules) },
  holo: { "None": null, ...buildRegistry(holoModules) },
  layouts: buildRegistry(layoutsModules),
}

const DEFAULT_SANDBOX = {
  palette: Object.keys(safeRegistries.palettes)[0] || '',
  background: Object.keys(safeRegistries.backgrounds)[0] || 'None',
  motif: Object.keys(safeRegistries.motifs)[0] || 'None',
  texture: Object.keys(safeRegistries.textures)[0] || 'None',
  holo: Object.keys(safeRegistries.holo)[0] || 'None',
  layout: Object.keys(safeRegistries.layouts)[0] || '',
};


function App() {
  const [generatorMode, setGeneratorMode] = useState(() => {
    return localStorage.getItem('generatorMode') || 'profile'; // 'profile' or 'sandbox'
  });

  const [selectedProfileId, setSelectedProfileId] = useState(() => {
    return localStorage.getItem('selectedProfileId') || Object.keys(RANK_CONFIGS)[0] || '';
  });

  const [sandboxSelections, setSandboxSelections] = useState(() => {
    const saved = localStorage.getItem('sandboxSelections');
    return saved ? JSON.parse(saved) : DEFAULT_SANDBOX;
  });

  const [showStudio, setShowStudio] = useState(false);
  const [cards, setCards] = useState([]);
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('playerName') || '';
  });
  const [memberNumber, setMemberNumber] = useState(() => {
    return localStorage.getItem('memberNumber') || '';
  });

  // Display Settings state
  const [showMemberNumber, setShowMemberNumber] = useState(() => {
    const saved = localStorage.getItem('showMemberNumber');
    return saved !== null ? saved === 'true' : true;
  });
  const [showDate, setShowDate] = useState(() => {
    const saved = localStorage.getItem('showDate');
    return saved !== null ? saved === 'true' : true;
  });
  const [customDate, setCustomDate] = useState(() => {
    return localStorage.getItem('customDate') || '';
  });

  useEffect(() => {
    localStorage.setItem('showMemberNumber', showMemberNumber);
    localStorage.setItem('showDate', showDate);
    localStorage.setItem('customDate', customDate);
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('memberNumber', memberNumber);
    localStorage.setItem('generatorMode', generatorMode);
    localStorage.setItem('selectedProfileId', selectedProfileId);
    localStorage.setItem('sandboxSelections', JSON.stringify(sandboxSelections));
  }, [showMemberNumber, showDate, customDate, playerName, memberNumber, generatorMode, selectedProfileId, sandboxSelections]);

  const handleResetSettings = () => {
    setShowMemberNumber(true);
    setShowDate(true);
    setCustomDate('');
    setPlayerName('');
    setMemberNumber('');
  };

  const handleDatePick = (e) => {
    const dateVal = e.target.value;
    if (dateVal) {
      // Create date and adjust for timezone offset to avoid being off-by-one day
      const dateObj = new Date(dateVal);
      const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);

      const formatted = adjustedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      setCustomDate(formatted);
    }
  };

  // MP4 export state
  const [exportProgress, setExportProgress] = useState(null); // null = not exporting
  const [exportLightOverride, setExportLightOverride] = useState(null); // { x, y } during export

  // Refs for export
  const staticSvgRefs = useRef({});
  const holoSvgRefs = useRef({});

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!playerName) return;
    if (showMemberNumber && !memberNumber) return;

    // Build the resolved config for this specific generated card
    let resolvedConfig = null;

    if (generatorMode === 'profile') {
      resolvedConfig = RANK_CONFIGS[selectedProfileId] || Object.values(RANK_CONFIGS)[0];
    } else {
      // Build ephemeral sandbox config
      resolvedConfig = {
        displayName: sandboxSelections.palette || 'Rank',
        themeColors: safeRegistries.palettes[sandboxSelections.palette] || {},
        layout: safeRegistries.layouts[sandboxSelections.layout] || StandardLayout,
        layers: {
          background: safeRegistries.backgrounds[sandboxSelections.background],
          motif: safeRegistries.motifs[sandboxSelections.motif],
          texture: safeRegistries.textures[sandboxSelections.texture],
          holo: safeRegistries.holo[sandboxSelections.holo]
        },
        fx: {
          holoBlendMode: 'screen',
          textureBlendMode: 'overlay',
          textureOpacity: 0.5,
        }
      };
    }

    const newCard = {
      id: Date.now(),
      playerName,
      memberNumber,
      showMemberNumber,
      showDate,
      customDate,
      config: resolvedConfig,
      isHoloEnabled: generatorMode === 'profile' ? !!resolvedConfig.layers?.holo : sandboxSelections.holo !== 'None'
    };

    setCards([newCard, ...cards]);
    // NOTE: Intentionally not clearing playerName anymore due to persistence QoL.
    // However, if member number is shown, and we want to advance to the next, we might clear member number.
    // For now, let's keep them persistent across card generations. 
  };

  const handleRemoveCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
    delete staticSvgRefs.current[id];
    delete holoSvgRefs.current[id];
  };

  const handleExportPng = (card) => {
    const svgEl = staticSvgRefs.current[card.id];
    if (svgEl) {
      exportSvgToPng(svgEl, `BLESSED_${card.playerName}_${card.memberNumber}.png`);
    }
  };

  const handleExportMp4 = useCallback(async (card) => {
    if (exportProgress) return; // Already exporting

    setExportProgress({ phase: 'loading', progress: 0, detail: 'Starting...' });

    try {
      await exportSvgToMp4({
        getSvgElement: () => holoSvgRefs.current[card.id],
        setLight: ({ x, y }) => setExportLightOverride({ x, y }),
        fps: 30,
        duration: 4,
        filename: `BLESSED_HOLO_${card.playerName}_${card.memberNumber}.mp4`,
        onProgress: setExportProgress,
      });
    } catch (err) {
      console.error('MP4 export failed:', err);
      setExportProgress({ phase: 'error', progress: 0, detail: err.message });
    } finally {
      // Reset after a short delay so user sees "done"
      setTimeout(() => {
        setExportProgress(null);
        setExportLightOverride(null);
      }, 2000);
    }
  }, [exportProgress]);

  if (showStudio) {
    return <Studio onExit={() => setShowStudio(false)} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>SVG Rank Card Generator</h1>
            <p>Create beautiful SVG rank cards for your community members.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="primary-button" onClick={() => setShowStudio(true)}>
              Open Motif Studio ✨
            </button>
          </div>
        </div>
      </header>

      <main className="app-content">
        <section className="input-section">
          <h2>Add New Member</h2>
          <form onSubmit={handleAddCard} className="card-form-container">
            <div className="card-form">
              <div className="input-group">
                <label htmlFor="playerName">Player Name</label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. SpaceNinja"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="memberNumber">Member #</label>
                <input
                  type="number"
                  id="memberNumber"
                  value={memberNumber}
                  onChange={(e) => setMemberNumber(e.target.value)}
                  placeholder="e.g. 1234"
                  required={showMemberNumber}
                  disabled={!showMemberNumber}
                  className={!showMemberNumber ? 'disabled-input' : ''}
                />
              </div>
            </div>

            <div className="settings-panel">
              <div className="settings-header">
                <h3>Display Settings</h3>
                <button type="button" className="reset-button" onClick={handleResetSettings}>
                  Reset Options
                </button>
              </div>
              <div className="settings-controls">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showMemberNumber}
                    onChange={(e) => setShowMemberNumber(e.target.checked)}
                  />
                  Show Member #
                </label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showDate}
                    onChange={(e) => setShowDate(e.target.checked)}
                  />
                  Show Date
                </label>
                <div className="settings-input-group">
                  <label htmlFor="customDate">Custom Date (optional)</label>
                  <div className="date-picker-wrapper">
                    <input
                      type="text"
                      id="customDate"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      placeholder="System Date (Default)"
                      disabled={!showDate}
                      className={!showDate ? 'disabled-input date-text' : 'date-text'}
                    />
                    <div className="date-icon-container" title="Select Date from Calendar">
                      📅
                      <input
                        type="date"
                        className="hidden-date-input"
                        onChange={handleDatePick}
                        disabled={!showDate}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GENERATOR MODE SELECTOR */}
            <div className="generator-mode-selector" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="genMode"
                    checked={generatorMode === 'profile'}
                    onChange={() => setGeneratorMode('profile')}
                  />
                  Use Profile
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="genMode"
                    checked={generatorMode === 'sandbox'}
                    onChange={() => setGeneratorMode('sandbox')}
                  />
                  Mix & Match
                </label>
              </div>

              {generatorMode === 'profile' ? (
                <div className="input-group">
                  <label>Select Rank Profile</label>
                  <select
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                    style={{ padding: '0.75rem', backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                  >
                    {Object.values(RANK_CONFIGS).map(cfg => (
                      <option key={cfg.id} value={cfg.id}>{cfg.displayName}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="sandbox-controls">
                  <div className="sandbox-dropdown">
                    <span className="dropdown-label">Palette</span>
                    <select value={sandboxSelections.palette} onChange={(e) => setSandboxSelections({ ...sandboxSelections, palette: e.target.value })}>
                      {Object.keys(safeRegistries.palettes).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="sandbox-dropdown">
                    <span className="dropdown-label">Background</span>
                    <select value={sandboxSelections.background} onChange={(e) => setSandboxSelections({ ...sandboxSelections, background: e.target.value })}>
                      {Object.keys(safeRegistries.backgrounds).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="sandbox-dropdown">
                    <span className="dropdown-label">Motif</span>
                    <select value={sandboxSelections.motif} onChange={(e) => setSandboxSelections({ ...sandboxSelections, motif: e.target.value })}>
                      {Object.keys(safeRegistries.motifs).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="sandbox-dropdown">
                    <span className="dropdown-label">Texture</span>
                    <select value={sandboxSelections.texture} onChange={(e) => setSandboxSelections({ ...sandboxSelections, texture: e.target.value })}>
                      {Object.keys(safeRegistries.textures).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="sandbox-dropdown">
                    <span className="dropdown-label">Holographic</span>
                    <select value={sandboxSelections.holo} onChange={(e) => setSandboxSelections({ ...sandboxSelections, holo: e.target.value })}>
                      {Object.keys(safeRegistries.holo).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="sandbox-dropdown">
                    <span className="dropdown-label">Layout</span>
                    <select value={sandboxSelections.layout} onChange={(e) => setSandboxSelections({ ...sandboxSelections, layout: e.target.value })}>
                      {Object.keys(safeRegistries.layouts).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="primary-button generate-button">
              Generate Rank Card
            </button>
          </form>
        </section>

        {/* MP4 Export Progress Overlay */}
        {exportProgress && (
          <div className="export-progress-bar">
            <div className="export-progress-label">
              {exportProgress.detail || exportProgress.phase}
            </div>
            <div className="export-progress-track">
              <div
                className="export-progress-fill"
                style={{ width: `${Math.round((exportProgress.progress || 0) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <section className="cards-section">
          <h2>Generated Cards ({cards.length})</h2>
          {cards.length === 0 ? (
            <div className="empty-state">
              <p>No cards generated yet. Fill out the form above to add one!</p>
            </div>
          ) : (
            <div className="cards-generated-list">
              {cards.map((card) => (
                <div key={card.id} className="generated-card-row">
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveCard(card.id)}
                    title="Remove Card"
                  >
                    &times;
                  </button>

                  <div className="card-panel">
                    <h3>Static Card</h3>
                    <div className="card-scale-wrapper">
                      <BaseCard
                        config={card.config || Object.values(RANK_CONFIGS)[0]}
                        playerName={card.playerName}
                        memberNumber={card.memberNumber}
                        showMemberNumber={card.showMemberNumber}
                        showDate={card.showDate}
                        customDate={card.customDate}
                        svgRef={(el) => { if (el) staticSvgRefs.current[card.id] = el; }}
                      />
                    </div>
                    <button className="export-button" onClick={() => handleExportPng(card)}>
                      📸 Export PNG
                    </button>
                  </div>

                  {/* Interactive Holographic Card (MP4) */}
                  <div className="card-panel">
                    <h3>Holographic Card ✨</h3>
                    <InteractiveCardWrapper>
                      {({ lightX, lightY }) => (
                        <BaseCard
                          config={card.config}
                          playerName={card.playerName}
                          memberNumber={card.memberNumber}
                          showMemberNumber={card.showMemberNumber}
                          showDate={card.showDate}
                          customDate={card.customDate}
                          isShiny={card.isHoloEnabled}
                          lightX={exportLightOverride ? exportLightOverride.x : lightX}
                          lightY={exportLightOverride ? exportLightOverride.y : lightY}
                          svgRef={(el) => { if (el) holoSvgRefs.current[card.id] = el; }}
                        />
                      )}
                    </InteractiveCardWrapper>
                    <button
                      className="export-button export-mp4"
                      onClick={() => handleExportMp4(card)}
                      disabled={!!exportProgress || !card.isHoloEnabled}
                    >
                      🎬 Export MP4 {card.isHoloEnabled ? '' : '(No Holo Layer)'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App


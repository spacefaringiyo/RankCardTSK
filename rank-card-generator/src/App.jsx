import { useState, useRef, useCallback, useEffect } from 'react'
import './App.css'
import BlessedRank from './ranks/BlessedRank'
import InteractiveCardWrapper from './components/InteractiveCardWrapper'
import Studio from './Studio'
import { exportSvgToPng } from './utils/exportImage'
import { exportSvgToMp4 } from './utils/exportVideo'

function App() {
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
  }, [showMemberNumber, showDate, customDate, playerName, memberNumber]);

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

    const newCard = {
      id: Date.now(),
      playerName,
      memberNumber,
      showMemberNumber,
      showDate,
      customDate,
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

                  {/* Static Card (PNG) */}
                  <div className="card-panel">
                    <h3>Static Card</h3>
                    <div className="card-scale-wrapper">
                      <BlessedRank
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
                        <BlessedRank
                          playerName={card.playerName}
                          memberNumber={card.memberNumber}
                          showMemberNumber={card.showMemberNumber}
                          showDate={card.showDate}
                          customDate={card.customDate}
                          isShiny={true}
                          lightX={exportLightOverride ? exportLightOverride.x : lightX}
                          lightY={exportLightOverride ? exportLightOverride.y : lightY}
                          svgRef={(el) => { if (el) holoSvgRefs.current[card.id] = el; }}
                        />
                      )}
                    </InteractiveCardWrapper>
                    <button
                      className="export-button export-mp4"
                      onClick={() => handleExportMp4(card)}
                      disabled={!!exportProgress}
                    >
                      🎬 Export MP4
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


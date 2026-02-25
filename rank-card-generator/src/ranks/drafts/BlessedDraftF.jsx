import React, { useRef } from 'react';
import BaseCard from '../../components/BaseCard';
import { exportSvgToPng } from '../../utils/exportImage';

const BlessedDraftF = ({ playerName, memberNumber, dateString }) => {
    const svgRef = useRef(null);

    const handleExport = () => {
        exportSvgToPng(svgRef.current, `BLESSED_DRAFT_F_${playerName}_${memberNumber}.png`);
    };

    const themeColors = {
        backgroundCanvas: "#000000",
        primaryText: "#f0f0e8",
        accentText: "#d07070",
        outerBorderStroke: "#701515",
        innerBorderStroke: "#a03030",
        logoText: "#d07070",
    };

    const renderBackground = (cardBounds) => (
        <>
            <defs>
                <radialGradient id="bgGradDraftF" cx="50%" cy="50%" r="75%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#ba2a2a" />
                    <stop offset="100%" stopColor="#7a1a1a" />
                </radialGradient>
            </defs>
            <rect width={cardBounds.width} height={cardBounds.height} rx={cardBounds.rx} ry={cardBounds.ry} fill="url(#bgGradDraftF)" />
        </>
    );

    const renderOverlay = (cardBounds) => (
        <>
            <defs>
                <filter id="noiseDraftF">
                    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="4" stitchTiles="stitch" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.15 0" />
                </filter>
            </defs>
            <rect width={cardBounds.width} height={cardBounds.height} rx={cardBounds.rx} ry={cardBounds.ry} filter="url(#noiseDraftF)" opacity="0.6" style={{ mixBlendMode: 'overlay' }} />
        </>
    );

    const renderMotif = () => (
        <>
            {/* Soft, overlapping circular bokeh/blobs */}
            <g opacity="0.45" style={{ mixBlendMode: 'screen' }}>
                <circle cx="150" cy="150" r="120" fill="#e54e4e" opacity="0.6" filter="blur(15px)" />
                <circle cx="350" cy="200" r="80" fill="#d03030" opacity="0.7" filter="blur(8px)" />
                <circle cx="100" cy="400" r="200" fill="#ff7a7a" opacity="0.4" filter="blur(25px)" />

                <circle cx="850" cy="100" r="180" fill="#ff5a5a" opacity="0.5" filter="blur(20px)" />
                <circle cx="1050" cy="300" r="100" fill="#c02020" opacity="0.8" filter="blur(10px)" />
                <circle cx="950" cy="-50" r="150" fill="#e04040" opacity="0.6" filter="blur(18px)" />

                <circle cx="250" cy="700" r="160" fill="#e54e4e" opacity="0.5" filter="blur(22px)" />
                <circle cx="450" cy="650" r="90" fill="#a01010" opacity="0.8" filter="blur(5px)" />
                <circle cx="0" cy="800" r="250" fill="#ff6a6a" opacity="0.4" filter="blur(30px)" />

                <circle cx="900" cy="750" r="220" fill="#ff5a5a" opacity="0.5" filter="blur(25px)" />
                <circle cx="750" cy="600" r="110" fill="#b01515" opacity="0.7" filter="blur(15px)" />
                <circle cx="1150" cy="650" r="140" fill="#d03030" opacity="0.6" filter="blur(18px)" />

                {/* Center highlights behind text */}
                <circle cx="550" cy="450" r="300" fill="#ff8a8a" opacity="0.3" filter="blur(40px)" />
            </g>
        </>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <BaseCard
                playerName={playerName}
                memberNumber={memberNumber}
                dateString={dateString}
                themeColors={themeColors}
                renderBackground={renderBackground}
                renderOverlay={renderOverlay}
                renderMotif={renderMotif}
                svgRef={svgRef}
            />
            <button className="export-button" onClick={handleExport}>
                Export PNG
            </button>
        </div>
    );
};

export default BlessedDraftF;

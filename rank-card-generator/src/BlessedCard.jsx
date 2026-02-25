import React, { useRef } from 'react';
import { exportSvgToPng } from './utils/exportImage';

const BlessedCard = ({ playerName, memberNumber }) => {
    const svgRef = useRef(null);

    const handleExport = () => {
        exportSvgToPng(svgRef.current, `BLESSED_${playerName}_${memberNumber}.png`);
    };

    // Get today's date in a nice format like "Mar 30, 2025" or similar
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Formatting member number to pad with zeros, e.g., #0001
    const formattedMemberNumber = `#${String(memberNumber).padStart(4, '0')}`;

    return (
        <div className="rank-card-container">
            <div className="svg-wrapper">
                {/* 
                    Added shape-rendering="geometricPrecision" and text-rendering="geometricPrecision"
                    to help with SVG rendering quality.
                */}
                <svg
                    ref={svgRef}
                    width="1600"
                    height="850"
                    viewBox="0 0 1600 850"
                    xmlns="http://www.w3.org/2000/svg"
                    shapeRendering="geometricPrecision"
                    textRendering="geometricPrecision"
                    style={{ background: '#000000' }}
                >
                    <defs>
                        {/* Motif Clip Path (Inner Border Area) */}
                        <clipPath id="innerBorderClip">
                            <rect x="50" y="50" width="1100" height="700" rx="15" ry="15" />
                        </clipPath>

                        {/* More subtle Background Gradient */}
                        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#c54545" />
                            <stop offset="100%" stopColor="#9a2a2a" />
                        </radialGradient>

                        {/* Improved, more realistic butterfly silhouette path */}
                        <g id="butterflyBetter">
                            <path d="M 0,0 
                                     C -2,-10 -5,-30 -25,-40 
                                     C -40,-50 -60,-30 -50,-10 
                                     C -45,0 -20,10 -10,12 
                                     C -25,25 -25,45 -10,50 
                                     C 5,55 5,30 0,15 
                                     C 5,30 5,55 20,50 
                                     C 35,45 35,25 20,12 
                                     C 30,10 55,0 60,-10 
                                     C 70,-30 50,-50 35,-40 
                                     C 15,-30 12,-10 10,0 
                                     Z" />
                        </g>

                        {/* Noise Filter for Texture */}
                        <filter id="noise">
                            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
                            <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.08 0" />
                        </filter>
                    </defs>

                    {/* Black Background for padding */}
                    <rect width="100%" height="100%" fill="#000000" />

                    {/* Wrapper group to center the 1200x800 card inside the 1600x850 canvas (with 25px top/bottom and 200px left/right padding) */}
                    <g transform="translate(200, 25)">
                        {/* Outer Card Base (Rounded Edges) */}
                        <rect width="1200" height="800" rx="40" ry="40" fill="url(#bgGrad)" />

                        {/* Texture Overlay (Rounded) */}
                        <rect width="1200" height="800" rx="40" ry="40" filter="url(#noise)" opacity="0.5" style={{ mixBlendMode: 'overlay' }} />

                        {/* Subtle Butterfly Pattern (Scattered densely within INNER borders only) */}
                        <g clipPath="url(#innerBorderClip)" fill="#801c1c" opacity="0.35">
                            <use href="#butterflyBetter" x="200" y="150" transform="rotate(-15, 200, 150) scale(1.5)" />
                            <use href="#butterflyBetter" x="500" y="100" transform="rotate(10, 500, 100) scale(1.2)" />
                            <use href="#butterflyBetter" x="850" y="150" transform="rotate(35, 850, 150) scale(1.7)" />
                            <use href="#butterflyBetter" x="1050" y="250" transform="rotate(-20, 1050, 250) scale(1.4)" />

                            <use href="#butterflyBetter" x="150" y="350" transform="rotate(-35, 150, 350) scale(1.3)" />
                            <use href="#butterflyBetter" x="950" y="380" transform="rotate(15, 950, 380) scale(1.6)" />
                            <use href="#butterflyBetter" x="300" y="550" transform="rotate(45, 300, 550) scale(1.8)" />
                            <use href="#butterflyBetter" x="800" y="600" transform="rotate(-10, 800, 600) scale(1.5)" />
                            <use href="#butterflyBetter" x="150" y="650" transform="rotate(25, 150, 650) scale(1.4)" />
                            <use href="#butterflyBetter" x="600" y="700" transform="rotate(-40, 600, 700) scale(1.9)" />
                            <use href="#butterflyBetter" x="1050" y="550" transform="rotate(5, 1050, 550) scale(1.3)" />

                            <use href="#butterflyBetter" x="400" y="250" transform="rotate(18, 400, 250) scale(1.5)" />
                            <use href="#butterflyBetter" x="700" y="450" transform="rotate(-25, 700, 450) scale(1.6)" />
                            <use href="#butterflyBetter" x="450" y="650" transform="rotate(35, 450, 650) scale(1.3)" />
                            <use href="#butterflyBetter" x="850" y="300" transform="rotate(-15, 850, 300) scale(1.4)" />
                        </g>

                        {/* Borders */}
                        {/* Thicker faint border */}
                        <rect x="40" y="40" width="1120" height="720" fill="none" stroke="#701515" strokeWidth="8" opacity="0.6" rx="20" ry="20" />
                        {/* Thinner sharp border (This defines the motif clipping area boundary visually) */}
                        <rect x="50" y="50" width="1100" height="700" fill="none" stroke="#a03030" strokeWidth="3" opacity="0.8" rx="15" ry="15" />

                        {/* Main Text Container */}

                        {/* BLESSED at the center vertically */}
                        <text
                            x="600"
                            y="410"
                            fontFamily="'Times New Roman', serif"
                            fontSize="140"
                            fontWeight="normal"
                            fill="#f0f0e8"
                            textAnchor="middle"
                            letterSpacing="10"
                        >
                            BLESSED
                        </text>

                        {/* Player Name below BLESSED */}
                        <text
                            x="600"
                            y="540"
                            fontFamily="'Times New Roman', serif"
                            fontSize="64"
                            fill="#f0f0e8"
                            textAnchor="middle"
                            letterSpacing="4"
                            opacity="0.9"
                        >
                            {playerName}
                        </text>

                        {/* Member Number (Bottom Left, within inner border) */}
                        <text
                            x="80"
                            y="720"
                            fontFamily="'Helvetica', 'Arial', sans-serif"
                            fontSize="32"
                            fontWeight="normal"
                            fill="#d07070"
                            textAnchor="start"
                            letterSpacing="3"
                            opacity="0.9"
                        >
                            {formattedMemberNumber}
                        </text>

                        {/* Date (Bottom Right, within inner border) */}
                        <text
                            x="1120"
                            y="720"
                            fontFamily="'Helvetica', 'Arial', sans-serif"
                            fontSize="32"
                            fontWeight="normal"
                            fill="#d07070"
                            textAnchor="end"
                            letterSpacing="2"
                            opacity="0.9"
                        >
                            {dateString}
                        </text>

                        {/* Subtle Watermark (Top Right) */}
                        <text
                            x="1135"
                            y="98"
                            fontFamily="'Helvetica', 'Arial', sans-serif"
                            fontSize="42"
                            fontWeight="bold"
                            fill="#d07070"
                            textAnchor="end"
                            letterSpacing="1"
                            opacity="0.6"
                        >
                            AimTSK
                        </text>
                    </g>
                </svg>
            </div>

            <button className="export-button" onClick={handleExport}>
                Export PNG
            </button>
        </div>
    );
};

export default BlessedCard;

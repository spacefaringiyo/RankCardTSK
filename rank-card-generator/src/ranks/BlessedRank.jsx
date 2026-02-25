import React, { useRef, useId, useCallback } from 'react';
import BaseCard from '../components/BaseCard';
import HolographicOverlay from '../components/HolographicOverlay';

const BlessedRank = ({ playerName, memberNumber, showMemberNumber = true, showDate = true, customDate = '', dateString, isShiny = false, lightX = 0.5, lightY = 0.5, svgRef: externalSvgRef }) => {
    const internalSvgRef = useRef(null);
    const uid = useId().replace(/:/g, '');

    // Merge internal ref with external callback/ref
    const mergedSvgRef = useCallback((el) => {
        internalSvgRef.current = el;
        if (typeof externalSvgRef === 'function') externalSvgRef(el);
        else if (externalSvgRef) externalSvgRef.current = el;
    }, [externalSvgRef]);

    // Blessed specific colors
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
                <radialGradient id={`bgGrad${uid}`} cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#c54545" />
                    <stop offset="100%" stopColor="#9a2a2a" />
                </radialGradient>
            </defs>
            <rect width={cardBounds.width} height={cardBounds.height} rx={cardBounds.rx} ry={cardBounds.ry} fill={`url(#bgGrad${uid})`} />
        </>
    );

    const renderOverlay = (cardBounds) => (
        <>
            <defs>
                <filter id={`noise${uid}`}>
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.08 0" />
                </filter>
            </defs>
            <rect width={cardBounds.width} height={cardBounds.height} rx={cardBounds.rx} ry={cardBounds.ry} filter={`url(#noise${uid})`} opacity="0.5" style={{ mixBlendMode: 'overlay' }} />

            {/* Holographic effect layer — only when isShiny */}
            {isShiny && (
                <HolographicOverlay
                    lightX={lightX}
                    lightY={lightY}
                    cardBounds={cardBounds}
                    type="rainbow"
                />
            )}
        </>
    );

    const renderMotif = () => (
        <>
            <defs>
                <g id={`butterfly${uid}`}>
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
            </defs>
            <g fill="#801c1c" opacity="0.35">
                <use href={`#butterfly${uid}`} x="200" y="150" transform="rotate(-15, 200, 150) scale(1.5)" />
                <use href={`#butterfly${uid}`} x="500" y="100" transform="rotate(10, 500, 100) scale(1.2)" />
                <use href={`#butterfly${uid}`} x="850" y="150" transform="rotate(35, 850, 150) scale(1.7)" />
                <use href={`#butterfly${uid}`} x="1050" y="250" transform="rotate(-20, 1050, 250) scale(1.4)" />
                <use href={`#butterfly${uid}`} x="150" y="350" transform="rotate(-35, 150, 350) scale(1.3)" />
                <use href={`#butterfly${uid}`} x="950" y="380" transform="rotate(15, 950, 380) scale(1.6)" />
                <use href={`#butterfly${uid}`} x="300" y="550" transform="rotate(45, 300, 550) scale(1.8)" />
                <use href={`#butterfly${uid}`} x="800" y="600" transform="rotate(-10, 800, 600) scale(1.5)" />
                <use href={`#butterfly${uid}`} x="150" y="650" transform="rotate(25, 150, 650) scale(1.4)" />
                <use href={`#butterfly${uid}`} x="600" y="700" transform="rotate(-40, 600, 700) scale(1.9)" />
                <use href={`#butterfly${uid}`} x="1050" y="550" transform="rotate(5, 1050, 550) scale(1.3)" />
                <use href={`#butterfly${uid}`} x="400" y="250" transform="rotate(18, 400, 250) scale(1.5)" />
                <use href={`#butterfly${uid}`} x="700" y="450" transform="rotate(-25, 700, 450) scale(1.6)" />
                <use href={`#butterfly${uid}`} x="450" y="650" transform="rotate(35, 450, 650) scale(1.3)" />
                <use href={`#butterfly${uid}`} x="850" y="300" transform="rotate(-15, 850, 300) scale(1.4)" />
            </g>
        </>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <BaseCard
                playerName={playerName}
                memberNumber={memberNumber}
                showMemberNumber={showMemberNumber}
                showDate={showDate}
                customDate={customDate}
                dateString={dateString}
                themeColors={themeColors}
                renderBackground={renderBackground}
                renderOverlay={renderOverlay}
                renderMotif={renderMotif}
                svgRef={mergedSvgRef}
            />
        </div>
    );
};

export default BlessedRank;


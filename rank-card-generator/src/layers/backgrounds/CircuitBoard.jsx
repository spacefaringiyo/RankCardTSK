import React from 'react';

export const renderCircuitBoard = (cardBounds, uid, themeColors) => {
    const traceColor = themeColors?.innerBorderStroke || themeColors?.accentText || '#ffffff';
    const canvas = themeColors?.backgroundCanvas || '#000000';
    const nodeColor = themeColors?.accentText || '#ffffff';

    const { width, height, rx, ry } = cardBounds;

    return (
        <React.Fragment>
            <defs>
                <clipPath id={`clip-circuit-${uid}`}>
                    <rect width={width} height={height} rx={rx} ry={ry} />
                </clipPath>
                <radialGradient id={`circuit-glow-${uid}`} cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor={themeColors?.backgroundGlowEdge || canvas} />
                    <stop offset="100%" stopColor={canvas} />
                </radialGradient>
            </defs>

            <rect width={width} height={height} rx={rx} ry={ry} fill={`url(#circuit-glow-${uid})`} />

            <g clipPath={`url(#clip-circuit-${uid})`} stroke={traceColor} fill="none" strokeWidth="1.5" opacity="0.4">
                {/* Horizontal & Vertical traces */}
                <path d="M 0 100 H 200 L 250 150 H 500 L 550 100 H 1200" />
                <path d="M 1200 400 H 900 L 850 450 H 400 L 350 400 H 0" />
                <path d="M 100 0 V 200 L 150 250 V 800" />
                <path d="M 1100 800 V 500 L 1050 450 V 0" />

                {/* Nodes */}
                <circle cx="200" cy="100" r="4" fill={nodeColor} stroke="none" />
                <circle cx="500" cy="150" r="4" fill={nodeColor} stroke="none" />
                <circle cx="900" cy="400" r="4" fill={nodeColor} stroke="none" />
                <circle cx="400" cy="450" r="4" fill={nodeColor} stroke="none" />
                <circle cx="150" cy="250" r="4" fill={nodeColor} stroke="none" />
                <circle cx="1050" cy="450" r="4" fill={nodeColor} stroke="none" />
            </g>
        </React.Fragment>
    );
};

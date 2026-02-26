import React from 'react';

export const renderGridSubstrate = (cardBounds, uid, themeColors) => {
    const gridColor = themeColors?.innerBorderStroke || themeColors?.accentText || 'gray';
    const canvas = themeColors?.backgroundCanvas || '#000000';
    const glow = themeColors?.backgroundGlowCenter || 'transparent';

    return (
        <React.Fragment>
            <defs>
                <pattern id={`grid${uid}`} width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke={gridColor} strokeWidth="0.5" opacity="0.2" />
                    <circle cx="0" cy="0" r="1.5" fill={gridColor} opacity="0.4" />
                </pattern>
                <radialGradient id={`glowGrad${uid}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={glow} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={glow} stopOpacity="0.2" />
                </radialGradient>
            </defs>

            <rect
                width={cardBounds.width}
                height={cardBounds.height}
                rx={cardBounds.rx}
                ry={cardBounds.ry}
                fill={themeColors?.backgroundGlowEdge || canvas}
            />

            <rect
                width={cardBounds.width}
                height={cardBounds.height}
                rx={cardBounds.rx}
                ry={cardBounds.ry}
                fill={`url(#glowGrad${uid})`}
            />

            <rect
                width={cardBounds.width}
                height={cardBounds.height}
                rx={cardBounds.rx}
                ry={cardBounds.ry}
                fill={`url(#grid${uid})`}
            />
        </React.Fragment>
    );
};

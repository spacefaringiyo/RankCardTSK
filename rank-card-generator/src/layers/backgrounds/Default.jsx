import React from 'react';

export const renderDefault = (cardBounds, uid, themeColors) => {
    const gridColor = themeColors?.backgroundGlowEdge || '#333333';
    const glowColor = themeColors?.backgroundGlowCenter || '#666666';
    const canvas = themeColors?.backgroundCanvas || '#000000';

    const { width, height, rx, ry } = cardBounds;

    return (
        <React.Fragment>
            <defs>
                <pattern id={`hex-pattern-${uid}`} width="52" height="90" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
                    {/* Perfect Pointy-Top Hex tiling */}
                    <path
                        d="M26 0 L52 15 V45 L26 60 L0 45 V15 Z M0 75 L26 60 L52 75 M26 90 L0 75 M26 90 L52 75"
                        fill="none"
                        stroke={gridColor}
                        strokeWidth="1"
                        opacity="0.08"
                    />
                </pattern>

                <radialGradient id={`hex-glow-${uid}`} cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor={glowColor} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={glowColor} stopOpacity="0.1" />
                </radialGradient>
            </defs>

            <rect width={width} height={height} rx={rx} ry={ry} fill={themeColors?.backgroundGlowEdge || canvas} />
            <rect width={width} height={height} rx={rx} ry={ry} fill={`url(#hex-glow-${uid})`} />
            <rect width={width} height={height} rx={rx} ry={ry} fill={`url(#hex-pattern-${uid})`} />
        </React.Fragment>
    );
};

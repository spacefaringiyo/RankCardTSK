import React from 'react';

export const renderRadialGlow = (cardBounds, uid, themeColors) => {
    // If no specific background canvas color or gradient stops, use fallbacks
    const bgColor = themeColors?.backgroundCanvas || '#000000';
    const centerColor = themeColors?.backgroundGlowCenter || '#c54545';
    const edgeColor = themeColors?.backgroundGlowEdge || '#9a2a2a';

    return (
        <React.Fragment>
            <defs>
                <radialGradient id={`bgGrad${uid}`} cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor={centerColor} />
                    <stop offset="100%" stopColor={edgeColor} />
                </radialGradient>
            </defs>
            <rect
                width={cardBounds.width}
                height={cardBounds.height}
                rx={cardBounds.rx}
                ry={cardBounds.ry}
                fill={`url(#bgGrad${uid})`}
            />
        </React.Fragment>
    );
};

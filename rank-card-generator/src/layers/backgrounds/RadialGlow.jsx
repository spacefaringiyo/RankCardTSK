import React from 'react';

export const renderRadialGlow = (cardBounds, uid, themeColors) => {
    const centerColor = themeColors?.backgroundGlowCenter || 'transparent';
    const edgeColor = themeColors?.backgroundGlowEdge || 'transparent';

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

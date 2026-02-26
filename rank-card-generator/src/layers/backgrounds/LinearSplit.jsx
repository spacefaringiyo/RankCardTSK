import React from 'react';

export const renderLinearSplit = (cardBounds, uid, themeColors) => {
    const centerColor = themeColors?.backgroundGlowCenter || 'currentColor';
    const edgeColor = themeColors?.backgroundGlowEdge || 'transparent';

    return (
        <React.Fragment>
            <defs>
                <linearGradient id={`splitGrad${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="49.5%" stopColor={centerColor} />
                    <stop offset="50.5%" stopColor={edgeColor} />
                </linearGradient>
            </defs>
            <rect
                width={cardBounds.width}
                height={cardBounds.height}
                rx={cardBounds.rx}
                ry={cardBounds.ry}
                fill={`url(#splitGrad${uid})`}
            />
        </React.Fragment>
    );
};

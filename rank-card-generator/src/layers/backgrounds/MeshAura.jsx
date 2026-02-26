import React from 'react';

export const renderMeshAura = (cardBounds, uid, themeColors) => {
    const primary = themeColors?.backgroundGlowCenter || 'transparent';
    const secondary = themeColors?.backgroundGlowEdge || 'transparent';
    const accent = themeColors?.accentText || themeColors?.primaryText || 'transparent';
    const canvas = themeColors?.backgroundCanvas || '#000000';

    return (
        <React.Fragment>
            <defs>
                <filter id={`auraBlur${uid}`}>
                    <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
                    <feColorMatrix in="blur" type="saturate" values="1.2" />
                </filter>
            </defs>

            {/* Base Canvas */}
            <rect
                width={cardBounds.width}
                height={cardBounds.height}
                rx={cardBounds.rx}
                ry={cardBounds.ry}
                fill={canvas}
            />

            <g filter={`url(#auraBlur${uid})`}>
                <circle cx="20%" cy="30%" r="350" fill={primary} opacity="0.6" />
                <circle cx="80%" cy="70%" r="400" fill={secondary} opacity="0.5" />
                <circle cx="50%" cy="50%" r="300" fill={accent} opacity="0.4" />
                <circle cx="90%" cy="20%" r="250" fill={primary} opacity="0.3" />
            </g>
        </React.Fragment>
    );
};

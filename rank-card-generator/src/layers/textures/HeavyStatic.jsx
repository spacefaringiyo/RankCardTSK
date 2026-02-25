import React from 'react';

export const renderHeavyStatic = (cardBounds, uid) => {
    return (
        <React.Fragment>
            <defs>
                <filter id={`heavyNoise${uid}`}>
                    {/* A much rougher, more visible high-contrast static for debugging/gritty effects */}
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch" />
                    <feColorMatrix type="matrix" values="
                        1 0 0 0 0, 
                        0 1 0 0 0, 
                        0 0 1 0 0, 
                        0 0 0 0.4 0" />
                </filter>
            </defs>
            <rect
                width={cardBounds.width}
                height={cardBounds.height}
                rx={cardBounds.rx}
                ry={cardBounds.ry}
                filter={`url(#heavyNoise${uid})`}
                opacity="1"
                style={{ mixBlendMode: 'color-dodge' }}
            />
        </React.Fragment>
    );
};

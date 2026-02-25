import React from 'react';

export const renderFineNoise = (cardBounds, uid) => {
    return (
        <React.Fragment>
            <defs>
                <filter id={`noise${uid}`}>
                    {/* A fine fractal noise filter to give the card some physical "texture" */}
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.08 0" />
                </filter>
            </defs>
            <rect
                width={cardBounds.width}
                height={cardBounds.height}
                rx={cardBounds.rx}
                ry={cardBounds.ry}
                filter={`url(#noise${uid})`}
                opacity="0.5"
                style={{ mixBlendMode: 'overlay' }}
            />
        </React.Fragment>
    );
};

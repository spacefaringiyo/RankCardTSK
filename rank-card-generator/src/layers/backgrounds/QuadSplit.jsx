import React from 'react';
import { lerpColor } from '../../utils/colorUtils';

export const renderQuadSplit = (cardBounds, uid, themeColors) => {
    const c1 = themeColors?.backgroundGlowCenter || '#000000';
    const c2 = themeColors?.backgroundGlowEdge || '#333333';

    // Generate intermediate colors via interpolation
    const mid1 = lerpColor(c1, c2, 0.33);
    const mid2 = lerpColor(c1, c2, 0.66);

    const { width, height, rx, ry } = cardBounds;
    const cx = width / 2;
    const cy = height / 2;

    return (
        <React.Fragment>
            <clipPath id={`clip-${uid}`}>
                <rect width={width} height={height} rx={rx} ry={ry} />
            </clipPath>

            <g clipPath={`url(#clip-${uid})`}>
                {/* Top-Left */}
                <path d={`M 0 0 L ${cx} ${cy} L 0 ${height} Z`} fill={c1} />
                {/* Top-Right */}
                <path d={`M 0 0 L ${width} 0 L ${cx} ${cy} Z`} fill={mid1} />
                {/* Bottom-Right */}
                <path d={`M ${width} 0 L ${width} ${height} L ${cx} ${cy} Z`} fill={c2} />
                {/* Bottom-Left */}
                <path d={`M 0 ${height} L ${cx} ${cy} L ${width} ${height} Z`} fill={mid2} />
            </g>
        </React.Fragment>
    );
};

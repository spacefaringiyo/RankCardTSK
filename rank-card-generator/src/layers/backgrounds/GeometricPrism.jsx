import React from 'react';
import { lerpColor } from '../../utils/colorUtils';

export const renderGeometricPrism = (cardBounds, uid, themeColors) => {
    const c1 = themeColors?.backgroundGlowCenter || '#000000';
    const c2 = themeColors?.backgroundGlowEdge || '#333333';
    const canvas = themeColors?.backgroundCanvas || '#000000';

    const { width, height, rx, ry } = cardBounds;
    const cx = width / 2;
    const cy = height / 2;

    // Fixed shard patterns for a prism effect
    const shards = [
        { d: `M 0 0 L ${cx} ${cy} L ${width * 0.3} 0 Z`, factor: 0.1 },
        { d: `M ${width * 0.3} 0 L ${cx} ${cy} L ${width * 0.7} 0 Z`, factor: 0.4 },
        { d: `M ${width * 0.7} 0 L ${cx} ${cy} L ${width} 0 Z`, factor: 0.2 },
        { d: `M ${width} 0 L ${width} ${height * 0.4} L ${cx} ${cy} Z`, factor: 0.6 },
        { d: `M ${width} ${height * 0.4} L ${width} ${height} L ${cx} ${cy} Z`, factor: 0.3 },
        { d: `M ${width} ${height} L ${width * 0.6} ${height} L ${cx} ${cy} Z`, factor: 0.8 },
        { d: `M ${width * 0.6} ${height} L ${width * 0.2} ${height} L ${cx} ${cy} Z`, factor: 0.5 },
        { d: `M ${width * 0.2} ${height} L 0 ${height} L ${cx} ${cy} Z`, factor: 0.9 },
        { d: `M 0 ${height} L 0 ${height * 0.5} L ${cx} ${cy} Z`, factor: 0.35 },
        { d: `M 0 ${height * 0.5} L 0 0 L ${cx} ${cy} Z`, factor: 0.75 },
    ];

    return (
        <React.Fragment>
            <clipPath id={`clip-prism-${uid}`}>
                <rect width={width} height={height} rx={rx} ry={ry} />
            </clipPath>

            <rect width={width} height={height} rx={rx} ry={ry} fill={canvas} />

            <g clipPath={`url(#clip-prism-${uid})`}>
                {shards.map((shard, i) => (
                    <path
                        key={i}
                        d={shard.d}
                        fill={lerpColor(c1, c2, shard.factor)}
                        opacity={0.8 + Math.random() * 0.2}
                    />
                ))}
            </g>
        </React.Fragment>
    );
};

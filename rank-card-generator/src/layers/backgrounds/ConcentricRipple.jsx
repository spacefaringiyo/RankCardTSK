import React from 'react';

export const renderConcentricRipple = (cardBounds, uid, themeColors) => {
    const primary = themeColors?.backgroundGlowCenter || '#ffffff';
    const secondary = themeColors?.backgroundGlowEdge || '#333333';
    const canvas = themeColors?.backgroundCanvas || '#000000';

    const { width, height, rx, ry } = cardBounds;
    const cx = width / 2;
    const cy = height / 2;

    const rings = [100, 200, 300, 400, 500, 600, 700];

    return (
        <React.Fragment>
            <defs>
                <clipPath id={`clip-ripple-${uid}`}>
                    <rect width={width} height={height} rx={rx} ry={ry} />
                </clipPath>
                <radialGradient id={`ripple-atmosphere-${uid}`} cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor={secondary} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={canvas} />
                </radialGradient>
            </defs>

            <rect width={width} height={height} rx={rx} ry={ry} fill={`url(#ripple-atmosphere-${uid})`} />

            <g clipPath={`url(#clip-ripple-${uid})`}>
                {rings.map((r, i) => (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={i % 2 === 0 ? primary : secondary}
                        strokeWidth={2 + i * 2}
                        opacity={0.3 - (i * 0.04)}
                    />
                ))}

                {/* Center Glow */}
                <radialGradient id={`ripple-glow-${uid}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={primary} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={primary} stopOpacity="0" />
                </radialGradient>
                <circle cx={cx} cy={cy} r="300" fill={`url(#ripple-glow-${uid})`} />
            </g>
        </React.Fragment>
    );
};

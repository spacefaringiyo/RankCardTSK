import React from 'react';

export const renderSilverGlass = (cardBounds, uid, lightX = 0.5, lightY = 0.5) => {
    const { width, height, rx, ry } = cardBounds;

    // Movement logic (cleaner, less offset than RainbowFoil)
    const shimmerOffsetX = (lightX - 0.5) * 1.5 * width;
    const glintOffsetX = (0.5 - lightX) * 1.8 * width;

    // Specular hotspot
    const specX = lightX * width;
    const specY = lightY * height;

    return (
        <React.Fragment>
            <defs>
                {/* Silver Glint - Neutral white/gray stops */}
                <linearGradient
                    id={`silverGrad${uid}`}
                    x1="0%" y1="0%" x2="100%" y2="100%"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform={`translate(${shimmerOffsetX} 0)`}
                >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.25" />
                    <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Vertical Polish Line */}
                <linearGradient
                    id={`silverPolish${uid}`}
                    x1="0%" y1="0%" x2="100%" y2="0%"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform={`translate(${glintOffsetX} 0)`}
                >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="48%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="52%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Soft Specular highlight */}
                <radialGradient
                    id={`silverSpec${uid}`}
                    cx={specX} cy={specY} r="500"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Main Glint */}
            <rect width={width} height={height} rx={rx} ry={ry}
                fill={`url(#silverGrad${uid})`}
                style={{ mixBlendMode: 'screen' }} />

            {/* Subtle Polish Line */}
            <rect width={width} height={height} rx={rx} ry={ry}
                fill={`url(#silverPolish${uid})`}
                style={{ mixBlendMode: 'screen' }} />

            {/* Specular highlight */}
            <rect width={width} height={height} rx={rx} ry={ry}
                fill={`url(#silverSpec${uid})`}
                style={{ mixBlendMode: 'screen' }} />
        </React.Fragment>
    );
};

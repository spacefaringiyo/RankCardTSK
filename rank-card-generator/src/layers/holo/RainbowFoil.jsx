import React from 'react';

export const renderRainbowFoil = (cardBounds, uid, lightX = 0.5, lightY = 0.5) => {
    const { width, height, rx, ry } = cardBounds;

    // Map 2D light (0..1 each) to gradient translate offsets
    const shimmerOffsetX = (lightX - 0.5) * 2 * width;   // -width to +width
    const shimmerOffsetY = (lightY - 0.5) * 2 * height;  // -height to +height

    // Glint moves opposite for parallax feel (horizontal only)
    const glintOffsetX = (0.5 - lightX) * 2.3 * width;

    // Specular hotspot follows mouse directly
    const specX = lightX * width;
    const specY = lightY * height;

    return (
        <React.Fragment>
            <defs>
                {/* Rainbow shimmer — position driven by 2D light */}
                <linearGradient
                    id={`holoGrad${uid}`}
                    x1="0%" y1="0%" x2="100%" y2="100%"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform={`translate(${shimmerOffsetX} ${shimmerOffsetY})`}
                >
                    <stop offset="0%" stopColor="#ff0000" stopOpacity="0" />
                    <stop offset="10%" stopColor="#ff4444" stopOpacity="0.12" />
                    <stop offset="20%" stopColor="#ffaa44" stopOpacity="0.18" />
                    <stop offset="30%" stopColor="#ffff44" stopOpacity="0.2" />
                    <stop offset="40%" stopColor="#44ff44" stopOpacity="0.22" />
                    <stop offset="50%" stopColor="#44ffff" stopOpacity="0.28" />
                    <stop offset="60%" stopColor="#4444ff" stopOpacity="0.22" />
                    <stop offset="70%" stopColor="#aa44ff" stopOpacity="0.2" />
                    <stop offset="80%" stopColor="#ff44aa" stopOpacity="0.18" />
                    <stop offset="90%" stopColor="#ff4444" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
                </linearGradient>

                {/* White glint band — moves opposite to shimmer */}
                <linearGradient
                    id={`holoGlint${uid}`}
                    x1="0%" y1="0%" x2="100%" y2="30%"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform={`translate(${glintOffsetX} 0)`}
                >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="46%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="54%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="65%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Radial specular highlight — hotspot follows mouse */}
                <radialGradient
                    id={`specular${uid}`}
                    cx={specX} cy={specY} r="400"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                    <stop offset="40%" stopColor="#ffffff" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Rainbow shimmer */}
            <rect width={width} height={height} rx={rx} ry={ry}
                fill={`url(#holoGrad${uid})`}
                style={{ mixBlendMode: 'screen' }} />

            {/* Glint band */}
            <rect width={width} height={height} rx={rx} ry={ry}
                fill={`url(#holoGlint${uid})`}
                style={{ mixBlendMode: 'screen' }} />

            {/* Specular hotspot */}
            <rect width={width} height={height} rx={rx} ry={ry}
                fill={`url(#specular${uid})`}
                style={{ mixBlendMode: 'screen' }} />
        </React.Fragment>
    );
};

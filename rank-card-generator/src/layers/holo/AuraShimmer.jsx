import React from 'react';

export const renderAuraShimmer = (cardBounds, uid, lightX = 0.5, lightY = 0.5, themeColors) => {
    const { width, height, rx, ry } = cardBounds;

    const accent = themeColors?.accentText || '#ffffff';
    const primary = themeColors?.backgroundGlowCenter || '#ffffff';

    const shimmerOffsetX = (lightX - 0.5) * 2 * width;
    const shimmerOffsetY = (lightY - 0.5) * 2 * height;

    const specX = lightX * width;
    const specY = lightY * height;

    return (
        <React.Fragment>
            <defs>
                {/* Theme-locked Aura shimmer */}
                <linearGradient
                    id={`auraHoloGrad${uid}`}
                    x1="0%" y1="0%" x2="100%" y2="100%"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform={`translate(${shimmerOffsetX} ${shimmerOffsetY})`}
                >
                    <stop offset="0%" stopColor={primary} stopOpacity="0" />
                    <stop offset="45%" stopColor={primary} stopOpacity="0" />
                    <stop offset="50%" stopColor={accent} stopOpacity="0.4" />
                    <stop offset="55%" stopColor={primary} stopOpacity="0" />
                    <stop offset="100%" stopColor={primary} stopOpacity="0" />
                </linearGradient>

                {/* Moving Aura Glow */}
                <radialGradient
                    id={`auraSpecHolo${uid}`}
                    cx={specX} cy={specY} r="600"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
                    <stop offset="40%" stopColor={primary} stopOpacity="0.1" />
                    <stop offset="100%" stopColor={primary} stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Aura shimmer band */}
            <rect width={width} height={height} rx={rx} ry={ry}
                fill={`url(#auraHoloGrad${uid})`}
                style={{ mixBlendMode: 'screen' }} />

            {/* Moving Aura glow */}
            <rect width={width} height={height} rx={rx} ry={ry}
                fill={`url(#auraSpecHolo${uid})`}
                style={{ mixBlendMode: 'screen' }} />
        </React.Fragment>
    );
};

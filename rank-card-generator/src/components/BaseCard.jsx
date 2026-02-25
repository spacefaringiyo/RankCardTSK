import React, { useId } from 'react';

const BaseCard = ({
    playerName,
    memberNumber,
    showMemberNumber = true,
    showDate = true,
    customDate = '',
    dateString,
    config, // NEW: The unified configuration recipe
    layoutOverrides = {},
    isShiny = false, // Flowed down for holo
    lightX = 0.5,
    lightY = 0.5,
    svgRef,
}) => {
    // Scoped ID to prevent clipPath collisions in multi-card views (Studio)
    const uid = useId().replace(/:/g, '');
    const clipId = `innerBorderClip${uid}`;
    // Default layout configuration
    const defaultLayout = {
        canvas: { width: 1600, height: 850, viewBox: "0 0 1600 850" },
        paddingOffset: { x: 200, y: 25 },
        card: { width: 1200, height: 800, rx: 40, ry: 40 },
        innerBorder: { x: 50, y: 50, width: 1100, height: 700, rx: 15, ry: 15, strokeWidth: 3 },
        outerBorder: { x: 40, y: 40, width: 1120, height: 720, rx: 20, ry: 20, strokeWidth: 8 },
        textTitle: { x: 600, y: 410, fontSize: 140, letterSpacing: 10 },
        textPlayerName: { x: 600, y: 540, fontSize: 64, letterSpacing: 4 },
        textMemberNum: { x: 80, y: 720, fontSize: 32, letterSpacing: 3 },
        textDate: { x: 1120, y: 720, fontSize: 32, letterSpacing: 2 },
        textLogo: { x: 1135, y: 98, fontSize: 42, letterSpacing: 1 },
    };

    // Default colors if not provided by the theme
    const defaultColors = {
        backgroundCanvas: "#000000",
        primaryText: "#f0f0e8",
        accentText: "#d07070",
        outerBorderStroke: "#701515",
        innerBorderStroke: "#a03030",
        logoText: "#d07070",
    };

    // Deep merge overrides with defaults
    const layout = { ...defaultLayout };
    for (const key in layoutOverrides) {
        if (layout[key]) {
            layout[key] = { ...layout[key], ...layoutOverrides[key] };
        }
    }

    // Safely extract from config
    const colors = { ...defaultColors, ...(config?.themeColors || {}) };
    const layers = config?.layers || {};
    const fx = config?.fx || {};

    // Set fallback date if not provided
    const userDate = customDate || dateString;
    const displayDate = userDate || new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const formattedMemberNumber = memberNumber ? `#${String(memberNumber).padStart(4, '0')}` : '';

    return (
        <div className="rank-card-container">
            <div className="svg-wrapper">
                <svg
                    ref={svgRef}
                    width={layout.canvas.width}
                    height={layout.canvas.height}
                    viewBox={layout.canvas.viewBox}
                    xmlns="http://www.w3.org/2000/svg"
                    shapeRendering="geometricPrecision"
                    textRendering="geometricPrecision"
                    style={{ background: colors.backgroundCanvas }}
                >
                    <defs>
                        {/* Essential clipping path for motifs */}
                        <clipPath id={clipId}>
                            <rect
                                x={layout.innerBorder.x} y={layout.innerBorder.y}
                                width={layout.innerBorder.width} height={layout.innerBorder.height}
                                rx={layout.innerBorder.rx} ry={layout.innerBorder.ry}
                            />
                        </clipPath>
                    </defs>

                    {/* Black Background for padding */}
                    <rect width="100%" height="100%" fill={colors.backgroundCanvas} />

                    <g transform={`translate(${layout.paddingOffset.x}, ${layout.paddingOffset.y})`}>

                        {/* 1. LAYER: Core Background (Gradients, Solid Fills) */}
                        {layers.background && layers.background(layout.card, uid, colors)}

                        {/* 2. LAYER: Base Texture Overlays (Noise, Patterns) */}
                        {layers.texture && layers.texture(layout.card, uid, colors, fx)}

                        {/* 3. LAYER: Holographic Effects (Only renders if isShiny=true) */}
                        {isShiny && layers.holo && layers.holo(layout.card, uid, lightX, lightY, fx)}

                        {/* 4. LAYER: Specific Motif (Butterflies, Lines, Particles) */}
                        <g clipPath={`url(#${clipId})`}>
                            {layers.motif && layers.motif(layout.card, uid, colors)}
                        </g>

                        {/* 5. LAYER: Standard Borders */}
                        {/* Outer Thicker border */}
                        <rect
                            x={layout.outerBorder.x} y={layout.outerBorder.y}
                            width={layout.outerBorder.width} height={layout.outerBorder.height}
                            fill="none" stroke={colors.outerBorderStroke}
                            strokeWidth={layout.outerBorder.strokeWidth} opacity="0.6"
                            rx={layout.outerBorder.rx} ry={layout.outerBorder.ry}
                        />

                        {/* Inner Thinner sharp border */}
                        <rect
                            x={layout.innerBorder.x} y={layout.innerBorder.y}
                            width={layout.innerBorder.width} height={layout.innerBorder.height}
                            fill="none" stroke={colors.innerBorderStroke}
                            strokeWidth={layout.innerBorder.strokeWidth} opacity="0.8"
                            rx={layout.innerBorder.rx} ry={layout.innerBorder.ry}
                        />

                        {/* 6. LAYER: Standard Text Elements */}
                        <text
                            x={layout.textTitle.x} y={layout.textTitle.y}
                            fontFamily="'Times New Roman', serif"
                            fontSize={layout.textTitle.fontSize}
                            fontWeight="normal" fill={colors.primaryText}
                            textAnchor="middle" letterSpacing={layout.textTitle.letterSpacing}
                        >
                            {config?.displayName
                                ? config.displayName.toUpperCase().replace(' PALETTE', '')
                                : 'RANK'}
                        </text>

                        <text
                            x={layout.textPlayerName.x} y={layout.textPlayerName.y}
                            fontFamily="'Times New Roman', serif"
                            fontSize={layout.textPlayerName.fontSize}
                            fill={colors.primaryText} textAnchor="middle"
                            letterSpacing={layout.textPlayerName.letterSpacing} opacity="0.9"
                        >
                            {playerName}
                        </text>

                        {showMemberNumber && (
                            <text
                                x={layout.textMemberNum.x} y={layout.textMemberNum.y}
                                fontFamily="'Helvetica', 'Arial', sans-serif"
                                fontSize={layout.textMemberNum.fontSize}
                                fontWeight="normal" fill={colors.accentText}
                                textAnchor="start" letterSpacing={layout.textMemberNum.letterSpacing} opacity="0.9"
                            >
                                {formattedMemberNumber}
                            </text>
                        )}

                        {showDate && (
                            <text
                                x={layout.textDate.x} y={layout.textDate.y}
                                fontFamily="'Helvetica', 'Arial', sans-serif"
                                fontSize={layout.textDate.fontSize}
                                fontWeight="normal" fill={colors.accentText}
                                textAnchor="end" letterSpacing={layout.textDate.letterSpacing} opacity="0.9"
                            >
                                {displayDate}
                            </text>
                        )}

                        <text
                            x={layout.textLogo.x} y={layout.textLogo.y}
                            fontFamily="'Helvetica', 'Arial', sans-serif"
                            fontSize={layout.textLogo.fontSize}
                            fontWeight="bold" fill={colors.logoText}
                            textAnchor="end" letterSpacing={layout.textLogo.letterSpacing} opacity="0.6"
                        >
                            AimTSK
                        </text>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default BaseCard;

import React, { useId } from 'react';
import { StandardLayout } from '../registry';

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
    // Base layout configuration object
    const layoutConfig = config?.layout || StandardLayout;

    // Deep merge overrides with defaults (for the properties)
    const layoutProps = { ...(layoutConfig.props || layoutConfig) };
    for (const key in layoutOverrides) {
        if (layoutProps[key]) {
            layoutProps[key] = { ...layoutProps[key], ...layoutOverrides[key] };
        }
    }

    // Default colors if not provided by the theme
    const defaultColors = {
        backgroundCanvas: "#000000",
        primaryText: "#f0f0e8",
        accentText: "#d07070",
        outerBorderStroke: "#701515",
        innerBorderStroke: "#a03030",
        logoText: "#d07070",
    };

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
                    width={layoutProps.canvas.width}
                    height={layoutProps.canvas.height}
                    viewBox={layoutProps.canvas.viewBox}
                    xmlns="http://www.w3.org/2000/svg"
                    shapeRendering="geometricPrecision"
                    textRendering="geometricPrecision"
                    style={{ background: colors.backgroundCanvas }}
                >
                    <defs>
                        {/* Essential clipping path for motifs */}
                        <clipPath id={clipId}>
                            <rect
                                x={layoutProps.innerBorder.x} y={layoutProps.innerBorder.y}
                                width={layoutProps.innerBorder.width} height={layoutProps.innerBorder.height}
                                rx={layoutProps.innerBorder.rx} ry={layoutProps.innerBorder.ry}
                            />
                        </clipPath>
                    </defs>

                    {/* Black Background for padding */}
                    <rect width="100%" height="100%" fill={colors.backgroundCanvas} />

                    <g transform={`translate(${layoutProps.paddingOffset.x}, ${layoutProps.paddingOffset.y})`}>

                        {/* 1. LAYER: Core Background (Gradients, Solid Fills) */}
                        {layers.background && layers.background(layoutProps.card, uid, colors)}

                        {/* 2. LAYER: Base Texture Overlays (Noise, Patterns) */}
                        {layers.texture && layers.texture(layoutProps.card, uid, colors, fx)}

                        {/* 3. LAYER: Holographic Effects (Only renders if isShiny=true) */}
                        {isShiny && layers.holo && layers.holo(layoutProps.card, uid, lightX, lightY, fx)}

                        {/* 4. LAYER: Specific Motif (Butterflies, Lines, Particles) */}
                        <g clipPath={`url(#${clipId})`}>
                            {layers.motif && layers.motif(layoutProps.card, uid, colors)}
                        </g>

                        {/* 5 & 6. LAYERS: Borders & Typography Structure (Handled by the Layout Renderer) */}
                        {layoutConfig.renderForeground &&
                            layoutConfig.renderForeground(colors, config, playerName, formattedMemberNumber, displayDate, showMemberNumber, showDate)
                        }

                    </g>
                </svg>
            </div>
        </div>
    );
};

export default BaseCard;

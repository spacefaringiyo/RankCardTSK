import React from 'react';

// The default dictionary of coordinates and sizes
const layoutProps = {
    canvas: { width: 1600, height: 850, viewBox: "0 0 1600 850" },
    paddingOffset: { x: 200, y: 25 },
    card: { width: 1200, height: 800, rx: 40, ry: 40 },
    innerBorder: { x: 50, y: 50, width: 1100, height: 700, rx: 15, ry: 15, strokeWidth: 3 },
    outerBorder: { x: 40, y: 40, width: 1120, height: 720, rx: 20, ry: 20, strokeWidth: 8 },
    textTitle: { x: 600, y: 380, fontSize: 200, letterSpacing: 10 },
    textPlayerName: { x: 600, y: 560, fontSize: 64, letterSpacing: 4 },
    textMemberNum: { x: 80, y: 720, fontSize: 32, letterSpacing: 3 },
    textDate: { x: 1120, y: 720, fontSize: 32, letterSpacing: 2 },
    textLogo: { x: 1135, y: 98, fontSize: 42, letterSpacing: 1 },
};

export const LargerRankNameLayout = {
    // We still export the raw data so the LayoutBuilder (future) can read it, 
    // and BaseCard can still use it for padding/canvas scaling.
    props: layoutProps,

    // The new Render Function that BaseCard will call for layers 5 & 6
    renderForeground: (colors, config, playerName, formattedMemberNumber, displayDate, showMemberNumber, showDate) => (
        <React.Fragment>
            {/* 5. LAYER: Standard Borders */}
            <rect
                x={layoutProps.outerBorder.x} y={layoutProps.outerBorder.y}
                width={layoutProps.outerBorder.width} height={layoutProps.outerBorder.height}
                fill="none" stroke={colors.outerBorderStroke}
                strokeWidth={layoutProps.outerBorder.strokeWidth} opacity="0.6"
                rx={layoutProps.outerBorder.rx} ry={layoutProps.outerBorder.ry}
            />
            <rect
                x={layoutProps.innerBorder.x} y={layoutProps.innerBorder.y}
                width={layoutProps.innerBorder.width} height={layoutProps.innerBorder.height}
                fill="none" stroke={colors.innerBorderStroke}
                strokeWidth={layoutProps.innerBorder.strokeWidth} opacity="0.8"
                rx={layoutProps.innerBorder.rx} ry={layoutProps.innerBorder.ry}
            />

            {/* 6. LAYER: Standard Text Elements */}
            <text
                x={layoutProps.textTitle.x} y={layoutProps.textTitle.y}
                fontFamily="'Times New Roman', serif"
                fontSize={layoutProps.textTitle.fontSize}
                fontWeight="normal" fill={colors.primaryText}
                textAnchor="middle" letterSpacing={layoutProps.textTitle.letterSpacing}
                dominantBaseline="central"
            >
                {(colors.name || config?.displayName || 'RANK').replace(' PALETTE', '')}
            </text>

            <text
                x={layoutProps.textPlayerName.x} y={layoutProps.textPlayerName.y}
                fontFamily="'Times New Roman', serif"
                fontSize={layoutProps.textPlayerName.fontSize}
                fill={colors.primaryText} textAnchor="middle"
                letterSpacing={layoutProps.textPlayerName.letterSpacing} opacity="0.9"
                dominantBaseline="central"
            >
                {playerName}
            </text>

            {showMemberNumber && (
                <text
                    x={layoutProps.textMemberNum.x} y={layoutProps.textMemberNum.y}
                    fontFamily="'Helvetica', 'Arial', sans-serif"
                    fontSize={layoutProps.textMemberNum.fontSize}
                    fontWeight="normal" fill={colors.accentText}
                    textAnchor="start" letterSpacing={layoutProps.textMemberNum.letterSpacing} opacity="0.9"
                >
                    {formattedMemberNumber}
                </text>
            )}

            {showDate && (
                <text
                    x={layoutProps.textDate.x} y={layoutProps.textDate.y}
                    fontFamily="'Helvetica', 'Arial', sans-serif"
                    fontSize={layoutProps.textDate.fontSize}
                    fontWeight="normal" fill={colors.accentText}
                    textAnchor="end" letterSpacing={layoutProps.textDate.letterSpacing} opacity="0.9"
                >
                    {displayDate}
                </text>
            )}

            <text
                x={layoutProps.textLogo.x} y={layoutProps.textLogo.y}
                fontFamily="'Helvetica', 'Arial', sans-serif"
                fontSize={layoutProps.textLogo.fontSize}
                fontWeight="bold" fill={colors.logoText}
                textAnchor="end" letterSpacing={layoutProps.textLogo.letterSpacing} opacity="0.6"
            >
                AimTSK
            </text>
        </React.Fragment>
    )
};

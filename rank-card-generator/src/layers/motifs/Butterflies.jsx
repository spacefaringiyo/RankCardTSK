import React from 'react';

export const renderButterflies = (cardBounds, uid, themeColors) => {
    // We use the accent color for the butterfly fill, with some fallback
    const butterflyColor = themeColors?.motifAccent || themeColors?.accentText || '#801c1c';

    // We could make opacity configurable in the future, for now standardizing to 0.35
    const opacity = 0.35;

    return (
        <React.Fragment>
            <defs>
                <g id={`butterfly${uid}`}>
                    <path d="M 0,0 
                             C -2,-10 -5,-30 -25,-40 
                             C -40,-50 -60,-30 -50,-10 
                             C -45,0 -20,10 -10,12 
                             C -25,25 -25,45 -10,50 
                             C 5,55 5,30 0,15 
                             C 5,30 5,55 20,50 
                             C 35,45 35,25 20,12 
                             C 30,10 55,0 60,-10 
                             C 70,-30 50,-50 35,-40 
                             C 15,-30 12,-10 10,0 
                             Z" />
                </g>
            </defs>
            <g fill={butterflyColor} opacity={opacity}>
                {/* 
                  Hardcoded positions for the butterfly swarm motif.
                  In the future, we could mathematically generate these,
                  but hand-placing them gives it that specific design feel.
                */}
                <use href={`#butterfly${uid}`} x="200" y="150" transform="rotate(-15, 200, 150) scale(1.5)" />
                <use href={`#butterfly${uid}`} x="500" y="100" transform="rotate(10, 500, 100) scale(1.2)" />
                <use href={`#butterfly${uid}`} x="850" y="150" transform="rotate(35, 850, 150) scale(1.7)" />
                <use href={`#butterfly${uid}`} x="1050" y="250" transform="rotate(-20, 1050, 250) scale(1.4)" />
                <use href={`#butterfly${uid}`} x="150" y="350" transform="rotate(-35, 150, 350) scale(1.3)" />
                <use href={`#butterfly${uid}`} x="950" y="380" transform="rotate(15, 950, 380) scale(1.6)" />
                <use href={`#butterfly${uid}`} x="300" y="550" transform="rotate(45, 300, 550) scale(1.8)" />
                <use href={`#butterfly${uid}`} x="800" y="600" transform="rotate(-10, 800, 600) scale(1.5)" />
                <use href={`#butterfly${uid}`} x="150" y="650" transform="rotate(25, 150, 650) scale(1.4)" />
                <use href={`#butterfly${uid}`} x="600" y="700" transform="rotate(-40, 600, 700) scale(1.9)" />
                <use href={`#butterfly${uid}`} x="1050" y="550" transform="rotate(5, 1050, 550) scale(1.3)" />
                <use href={`#butterfly${uid}`} x="400" y="250" transform="rotate(18, 400, 250) scale(1.5)" />
                <use href={`#butterfly${uid}`} x="700" y="450" transform="rotate(-25, 700, 450) scale(1.6)" />
                <use href={`#butterfly${uid}`} x="450" y="650" transform="rotate(35, 450, 650) scale(1.3)" />
                <use href={`#butterfly${uid}`} x="850" y="300" transform="rotate(-15, 850, 300) scale(1.4)" />
            </g>
        </React.Fragment>
    );
};

import React, { useState, useRef, useCallback } from 'react';
import { useSpring } from '../hooks/useSpring';
import './InteractiveCardWrapper.css';

/**
 * InteractiveCardWrapper — The Physics Engine
 * 
 * Handles all DOM interaction: mouse tracking, 3D tilt, spring physics,
 * grab & drag. Completely decoupled from SVG/card rendering.
 * 
 * Passes 2D light coordinates + state to children via render props:
 *   {({ lightX, lightY, isHovering, isGrabbing }) => <Card ... />}
 * 
 * @param {function} children - Render-prop function
 * @param {number} maxTilt - Maximum tilt angle in degrees (default: 20)
 * @param {object} springConfig - Spring physics config
 */
const InteractiveCardWrapper = ({
    children,
    maxTilt = 20,
    springConfig = { stiffness: 150, damping: 14, mass: 1 },
}) => {
    // Raw target values (set immediately on mouse move)
    const [targetTiltX, setTargetTiltX] = useState(0);
    const [targetTiltY, setTargetTiltY] = useState(0);
    const [targetScale, setTargetScale] = useState(1);
    const [lightX, setLightX] = useState(0.5);
    const [lightY, setLightY] = useState(0.5);

    const [isHovering, setIsHovering] = useState(false);
    const [isGrabbing, setIsGrabbing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });

    const cardContainerRef = useRef(null);
    const dragStartRef = useRef(null);

    // Spring-animated values (smooth follow with overshoot)
    const tiltX = useSpring(targetTiltX, springConfig);
    const tiltY = useSpring(targetTiltY, springConfig);
    const scale = useSpring(targetScale, { stiffness: 200, damping: 18, mass: 1 });

    const handleMouseMove = useCallback((e) => {
        if (!cardContainerRef.current) return;

        const rect = cardContainerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Normalized offset from center: -1..1
        const offsetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
        const offsetY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

        // Tilt: rotate around opposite axis
        setTargetTiltX(-offsetY * maxTilt);
        setTargetTiltY(offsetX * maxTilt);

        // 2D light coordinates: 0..1 each axis independently
        setLightX((offsetX + 1) / 2);
        setLightY((offsetY + 1) / 2);

        // Handle drag
        if (isGrabbing && dragStartRef.current) {
            setDragOffset({
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y,
            });
        }
    }, [isGrabbing, maxTilt]);

    const handleMouseEnter = () => {
        setIsHovering(true);
        setTargetScale(1.02);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setIsGrabbing(false);
        setTargetTiltX(0);
        setTargetTiltY(0);
        setTargetScale(1);
        setLightX(0.5);
        setLightY(0.5);

        // Commit any drag offset to position
        if (dragOffset.x !== 0 || dragOffset.y !== 0) {
            setCardPosition(prev => ({
                x: prev.x + dragOffset.x,
                y: prev.y + dragOffset.y,
            }));
            setDragOffset({ x: 0, y: 0 });
        }
    };

    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // left click only
        setIsGrabbing(true);
        setTargetScale(1.05);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
    };

    const handleMouseUp = () => {
        if (isGrabbing) {
            setIsGrabbing(false);
            setTargetScale(isHovering ? 1.02 : 1);
            // Commit drag
            setCardPosition(prev => ({
                x: prev.x + dragOffset.x,
                y: prev.y + dragOffset.y,
            }));
            setDragOffset({ x: 0, y: 0 });
        }
    };

    // Dynamic shadow based on tilt
    const shadowX = tiltY * 0.8;
    const shadowY = -tiltX * 0.8;
    const shadowBlur = isHovering ? 40 : 20;
    const shadowSpread = isHovering ? 5 : 0;

    const cardStyle = {
        transform: `
            translate(${cardPosition.x + dragOffset.x}px, ${cardPosition.y + dragOffset.y}px)
            rotateX(${tiltX}deg) 
            rotateY(${tiltY}deg)
            scale(${scale})
        `,
        boxShadow: `
            ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px rgba(0, 0, 0, 0.4),
            ${shadowX * 0.5}px ${shadowY * 0.5}px ${shadowBlur * 0.4}px rgba(180, 40, 40, 0.2)
        `,
        cursor: isGrabbing ? 'grabbing' : 'grab',
    };

    return (
        <div
            className="interactive-wrapper-stage"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={cardContainerRef}
                className="interactive-wrapper-card"
                style={cardStyle}
                onMouseEnter={handleMouseEnter}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                {children({ lightX, lightY, isHovering, isGrabbing })}
            </div>
        </div>
    );
};

export default InteractiveCardWrapper;

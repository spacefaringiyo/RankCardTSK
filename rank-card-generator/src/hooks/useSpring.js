import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useSpring — A physically-modeled damped spring hook.
 * 
 * Animates a value toward a target using spring dynamics (mass-spring-damper).
 * Produces natural overshoot + oscillation instead of rigid easing.
 * 
 * @param {number} target - The value to animate toward
 * @param {object} config - Spring configuration
 * @param {number} config.stiffness - Spring stiffness (higher = snappier). Default: 180
 * @param {number} config.damping - Friction (higher = less bounce). Default: 12  
 * @param {number} config.mass - Mass of the object (higher = more sluggish). Default: 1
 * @param {number} config.precision - Stop threshold. Default: 0.01
 * @returns {number} The current animated value
 */
export function useSpring(target, config = {}) {
    const {
        stiffness = 180,
        damping = 12,
        mass = 1,
        precision = 0.01,
    } = config;

    const [current, setCurrent] = useState(target);
    const velocityRef = useRef(0);
    const currentRef = useRef(target);
    const targetRef = useRef(target);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(null);

    // Update target ref when target changes
    targetRef.current = target;

    const tick = useCallback(() => {
        const now = performance.now();
        // Cap dt to avoid spiral-of-death on tab switch
        const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.064);
        lastTimeRef.current = now;

        const displacement = currentRef.current - targetRef.current;
        const springForce = -stiffness * displacement;
        const dampingForce = -damping * velocityRef.current;
        const acceleration = (springForce + dampingForce) / mass;

        velocityRef.current += acceleration * dt;
        currentRef.current += velocityRef.current * dt;

        // Check if we're close enough to rest
        if (Math.abs(velocityRef.current) < precision && Math.abs(displacement) < precision) {
            currentRef.current = targetRef.current;
            velocityRef.current = 0;
            setCurrent(targetRef.current);
            rafRef.current = null;
            lastTimeRef.current = null;
            return; // Stop the loop
        }

        setCurrent(currentRef.current);
        rafRef.current = requestAnimationFrame(tick);
    }, [stiffness, damping, mass, precision]);

    useEffect(() => {
        // Only start the animation loop if target changed and we're not already running
        if (currentRef.current !== target || velocityRef.current !== 0) {
            if (!rafRef.current) {
                lastTimeRef.current = performance.now();
                rafRef.current = requestAnimationFrame(tick);
            }
        }

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [target, tick]);

    return current;
}

/**
 * useSpring2D — Convenience wrapper for animating X and Y simultaneously.
 * 
 * @param {{ x: number, y: number }} target
 * @param {object} config - Spring config (shared for both axes)
 * @returns {{ x: number, y: number }}
 */
export function useSpring2D(target, config = {}) {
    const x = useSpring(target.x, config);
    const y = useSpring(target.y, config);
    return { x, y };
}

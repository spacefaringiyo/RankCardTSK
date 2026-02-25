import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

// Singleton FFmpeg instance — loaded once, reused across exports
let ffmpeg = null;
let ffmpegLoaded = false;

/**
 * Ensure ffmpeg.wasm is loaded (cached by browser after first load)
 */
async function ensureFFmpegLoaded(onProgress) {
    if (ffmpegLoaded && ffmpeg) return ffmpeg;

    ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
        // Optional: could pipe to a debug console
    });

    ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) onProgress({ phase: 'encoding', progress });
    });

    await ffmpeg.load();
    ffmpegLoaded = true;
    return ffmpeg;
}

/**
 * Rasterize an SVG element to a PNG data URL at its native resolution.
 * Returns a Promise<Blob>.
 */
function svgToCanvasBlob(svgElement) {
    return new Promise((resolve, reject) => {
        const xml = new XMLSerializer().serializeToString(svgElement);
        const svg64 = btoa(unescape(encodeURIComponent(xml)));
        const imgSrc = 'data:image/svg+xml;base64,' + svg64;

        const w = parseFloat(svgElement.getAttribute('width'));
        const h = parseFloat(svgElement.getAttribute('height'));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas toBlob failed'));
            }, 'image/png');
        };
        img.onerror = reject;
        img.src = imgSrc;
    });
}

/**
 * Export an animated SVG card as MP4.
 * 
 * The caller provides a `renderFrame(lightX, lightY)` function that updates
 * the card's light position and returns the SVG element to capture.
 * 
 * @param {object} options
 * @param {function} options.renderFrame - (lightX, lightY) => svgElement. 
 *   Should update React state and return the ref to the SVG after rendering.
 * @param {function} options.getSvgElement - () => svgElement. Gets the current SVG DOM node.
 * @param {function} options.setLight - ({ x, y }) => void. Sets light position in React state.
 * @param {number} options.fps - Frames per second (default: 30)
 * @param {number} options.duration - Loop duration in seconds (default: 4)
 * @param {string} options.filename - Output filename (default: 'rank-card.mp4')
 * @param {function} options.onProgress - ({ phase, progress, detail }) => void
 * @returns {Promise<void>}
 */
export async function exportSvgToMp4({
    getSvgElement,
    setLight,
    fps = 30,
    duration = 4,
    filename = 'rank-card.mp4',
    onProgress = () => { },
}) {
    const totalFrames = fps * duration;

    // Phase 1: Load ffmpeg
    onProgress({ phase: 'loading', progress: 0, detail: 'Loading encoder...' });
    const ff = await ensureFFmpegLoaded((p) => {
        onProgress({ phase: 'encoding', progress: p.progress, detail: 'Encoding video...' });
    });

    // Phase 2: Capture frames
    // We do a smooth loop: light sweeps in a figure-8 / circular pattern
    // so it loops seamlessly
    const frames = [];

    for (let i = 0; i < totalFrames; i++) {
        const t = i / totalFrames; // 0..1
        // Circular sweep for seamless loop
        const lightX = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
        const lightY = 0.5 + 0.5 * Math.cos(t * Math.PI * 2);

        // Update the React state
        setLight({ x: lightX, y: lightY });

        // Wait a tick for React to re-render
        await new Promise(resolve => requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        }));

        // Capture the SVG
        const svgEl = getSvgElement();
        if (!svgEl) throw new Error('SVG element not found during frame capture');

        const blob = await svgToCanvasBlob(svgEl);
        const buffer = await blob.arrayBuffer();
        const frameFilename = `frame${String(i).padStart(5, '0')}.png`;
        frames.push(frameFilename);

        await ff.writeFile(frameFilename, new Uint8Array(buffer));

        onProgress({
            phase: 'capturing',
            progress: (i + 1) / totalFrames,
            detail: `Capturing frame ${i + 1}/${totalFrames}`,
        });
    }

    // Phase 3: Encode to MP4
    onProgress({ phase: 'encoding', progress: 0, detail: 'Encoding MP4...' });

    await ff.exec([
        '-framerate', String(fps),
        '-i', 'frame%05d.png',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-crf', '18',
        '-y',
        'output.mp4',
    ]);

    // Phase 4: Download
    const data = await ff.readFile('output.mp4');
    const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(mp4Blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    // Cleanup frame files
    for (const f of frames) {
        try { await ff.deleteFile(f); } catch (e) { /* ignore */ }
    }
    try { await ff.deleteFile('output.mp4'); } catch (e) { /* ignore */ }

    onProgress({ phase: 'done', progress: 1, detail: 'Export complete!' });
}

export const exportSvgToPng = (svgElement, filename) => {
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // get SVG data
    const xml = new XMLSerializer().serializeToString(svgElement);

    // make it base64
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const b64Start = 'data:image/svg+xml;base64,';

    // prepend a "header"
    const image64 = b64Start + svg64;

    const img = new Image();
    img.onload = function () {
        // Determine the intrinsic size of the SVG
        const w = parseFloat(svgElement.getAttribute('width'));
        const h = parseFloat(svgElement.getAttribute('height'));

        canvas.width = w;
        canvas.height = h;

        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get the image URL from canvas
        const imgData = canvas.toDataURL('image/png');

        // Create a download link and click it
        const a = document.createElement('a');
        a.href = imgData;
        a.download = filename || 'rank-card.png';
        a.click();
    };
    img.src = image64;
};

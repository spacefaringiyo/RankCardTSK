# AimTSK Rank Card Generator

A powerful, SVG-based rank card generator for community members. This application allows users to design cards visually in a sandbox environment and export them as high-quality static images (PNG) or interactive holographic videos (MP4).

## ✨ Features

- **Motif Sandbox Studio**: A visual tool to mix and match palettes, backgrounds, motifs, textures, and layouts.
- **Pure SVG Rendering**: Visuals are rendered entirely as SVG for infinite scalability and crispness.
- **Interactive Holographic Cards**: 3D tilt and shimmer effects that respond to mouse/touch movement.
- **Multi-Format Export**: High-resolution PNG for static cards and MP4 for animated holographic cards.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 7, Vanilla CSS
- **Visuals**: Scalable Vector Graphics (SVG)
- **Video Encoding**: `@ffmpeg/ffmpeg` (WebAssembly-based FFmpeg)
- **Physics**: Custom spring and tilt engine for interactive effects

## 🚀 Getting Started

```bash
# Enter the project directory
cd rank-card-generator

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📜 Acknowledgments & Credits

- Created by **iyo**
- Developed with assistance from **Gemini** and **Claude**

## ⚖️ License & Attribution

This project is open-source.

### FFmpeg
Video export functionality is powered by **FFmpeg**.
- FFmpeg is a trademark of Fabrice Bellard, originator of the FFmpeg project.
- This project uses the `@ffmpeg/ffmpeg` wrapper and the FFmpeg core binary compiled with `libx264`, which is licensed under **GPLv2**.
- You can find the source code for FFmpeg at [ffmpeg.org](https://ffmpeg.org).

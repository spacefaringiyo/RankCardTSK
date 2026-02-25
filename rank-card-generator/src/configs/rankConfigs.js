import {
    BlessedPalette,
    CursedPalette,
    renderRadialGlow,
    renderButterflies,
    renderFineNoise,
    renderRainbowFoil
} from '../registry';

export const BlessedRankConfig = {
    id: 'blessed',
    displayName: 'Blessed',
    themeColors: BlessedPalette,
    // The recipe for blending layers together
    layers: {
        background: renderRadialGlow,
        motif: renderButterflies,
        texture: renderFineNoise,
        holo: renderRainbowFoil,
    },
    // Meta FX properties
    fx: {
        holoBlendMode: 'screen',
        textureBlendMode: 'overlay',
        textureOpacity: 0.5,
    }
};

export const CursedRankConfig = {
    id: 'cursed',
    displayName: 'Cursed',
    themeColors: CursedPalette,
    // The exact same rendering layers, totally different vibe due to palette
    layers: {
        background: renderRadialGlow,
        motif: renderButterflies,
        texture: renderFineNoise,
        holo: renderRainbowFoil,
    },
    fx: {
        holoBlendMode: 'screen',
        textureBlendMode: 'overlay',
        textureOpacity: 0.5,
    }
};

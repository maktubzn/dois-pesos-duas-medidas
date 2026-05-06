const OPTIMIZED_MEDIA_BASE = '/img-optimized'

export const MEDIA_ASSETS = {
  preShow: {
    logo: `${OPTIMIZED_MEDIA_BASE}/logoinfo.webp`,
    video: `${OPTIMIZED_MEDIA_BASE}/video1.mp4`,
    poster: `${OPTIMIZED_MEDIA_BASE}/video1-poster.webp`,
  },
  background: {
    idleImage: `${OPTIMIZED_MEDIA_BASE}/bg-FNL1.webp`,
    gameImage: '/img/01-background.png',
    video: `${OPTIMIZED_MEDIA_BASE}/BGVIDEO.mp4`,
  },
  groupCard: {
    texture: `${OPTIMIZED_MEDIA_BASE}/02.webp`,
  },
  questions: {
    senhorDestino: '/img das perguntas-optimized/senhor-destino.webp',
  },
} as const

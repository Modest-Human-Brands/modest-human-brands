// Stand-in artwork until MDrive/MMedia supply real image ids
const PLACEHOLDER_IMAGES = ['/images/bg-texture-teal.webp', '/images/bg-texture-purple.webp', '/images/bg-texture-green.webp', '/images/bg-texture-orange.webp', '/images/bg-texture-blue-purple.webp']

export function placeholderImage(seed: number | string = 0) {
  const index = typeof seed === 'number' ? seed : [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return PLACEHOLDER_IMAGES[Math.abs(index) % PLACEHOLDER_IMAGES.length]!
}

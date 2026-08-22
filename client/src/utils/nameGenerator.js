const adjectives = [
  'Midnight', 'Silver', 'Crimson', 'Neon', 'Ember',
  'Frost', 'Shadow', 'Golden', 'Cosmic', 'Thunder',
  'Violet', 'Solar', 'Arctic', 'Velvet', 'Storm',
  'Copper', 'Lunar', 'Onyx', 'Prism', 'Amber'
]

const nouns = [
  'Owl', 'Fox', 'Moth', 'Fern', 'Wolf',
  'Hawk', 'Lynx', 'Raven', 'Crane', 'Viper',
  'Bison', 'Finch', 'Heron', 'Puma', 'Dusk',
  'Cedar', 'Flint', 'Grove', 'Marsh', 'Pike'
]

export function generateName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adj}${noun}`
}
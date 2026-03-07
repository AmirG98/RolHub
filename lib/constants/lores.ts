export const LORES = [
  {
    id: 'MEDIEVAL_FANTASY',
    name: 'Medieval Fantasy',
    tagline: 'Dragones, hechiceros y leyendas ancestrales',
    description: 'Espadas, magia y reinos en guerra',
    icon: '🏰',
    color: '#C9A84C',
    gradient: 'from-gold via-gold-bright to-gold-dim'
  },
  {
    id: 'POST_APOCALYPTIC',
    name: 'Post-Apocalíptico',
    tagline: 'Sobrevive en un mundo devastado',
    description: 'Ruinas, mutantes y recursos escasos',
    icon: '☢️',
    color: '#8B1A1A',
    gradient: 'from-blood via-red-600 to-red-900'
  },
  {
    id: 'HARRY_POTTER',
    name: 'Mundo Mágico',
    tagline: 'Hechizos, pociones y criaturas mágicas',
    description: 'Escuela de magia y aventuras místicas',
    icon: '🧙‍♂️',
    color: '#B026FF',
    gradient: 'from-neon-purple via-purple-600 to-purple-900'
  },
  {
    id: 'SCI_FI',
    name: 'Sci-Fi',
    tagline: 'Galaxias lejanas y tecnología avanzada',
    description: 'Naves espaciales, aliens y planetas exóticos',
    icon: '🚀',
    color: '#00D9FF',
    gradient: 'from-neon-blue via-blue-500 to-cyan-900'
  },
  {
    id: 'STAR_WARS',
    name: 'Guerra de las Galaxias',
    tagline: 'La Fuerza, Jedis y el Imperio',
    description: 'Sables de luz en una galaxia muy lejana',
    icon: '⭐',
    color: '#FF6C11',
    gradient: 'from-neon-orange via-orange-500 to-yellow-600'
  },
  {
    id: 'CYBERPUNK',
    name: 'Cyberpunk',
    tagline: 'Alta tecnología, baja vida',
    description: 'Megacorporaciones, hackers y cyborgs',
    icon: '🌆',
    color: '#39FF14',
    gradient: 'from-neon-green via-green-500 to-emerald-900'
  },
  {
    id: 'HORROR_LOVECRAFT',
    name: 'Horror Cósmico',
    tagline: 'Misterios que no deberían conocerse',
    description: 'Entidades ancestrales y locura',
    icon: '🐙',
    color: '#1A3A2A',
    gradient: 'from-emerald via-green-900 to-gray-900'
  },
  {
    id: 'VIKINGS',
    name: 'Vikingos',
    tagline: 'Acero, honor y los dioses nórdicos',
    description: 'Sagas épicas en tierras heladas',
    icon: '⚔️',
    color: '#C9A84C',
    gradient: 'from-gold via-amber-600 to-red-800'
  },
  {
    id: 'ZOMBIE_SURVIVAL',
    name: 'Apocalipsis Zombie',
    tagline: 'Los muertos caminan entre nosotros',
    description: 'Sobrevive a la horda de no-muertos',
    icon: '🧟',
    color: '#8B1A1A',
    gradient: 'from-blood via-red-900 to-gray-900'
  }
] as const

export type LoreId = typeof LORES[number]['id']

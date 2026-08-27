// Directiva anti-IP para el prompt del DM.
//
// El modelo CONOCE las franquicias en las que se inspiran nuestros mundos, así
// que sin una instrucción fuerte inventa nombres protegidos por su cuenta
// (ej: generó "Mos Eisley" en el mundo de space opera aunque ese nombre no
// está en ningún archivo). Esta directiva es explícita y por-lore: le da al
// modelo los nombres CORRECTOS a usar y le prohíbe los de la franquicia.

interface LoreGuidance {
  es: string
  en: string
}

// Solo los 4 lores rebrandeados necesitan la directiva reforzada; el resto son
// géneros sin franquicia (zombies, vikingos, isekai, cyberpunk, lovecraft, cozy).
const GUIDANCE: Record<string, LoreGuidance> = {
  LOTR: {
    es: 'Este es un mundo de fantasía épica ORIGINAL llamado Tierra del Ocaso. USÁ estos nombres propios: Vado Viejo (pueblo), Aelinar y Aurelion (refugios élficos), Cenizar (tierra oscura), Malzhur (señor oscuro), Meridonia, Estepia, Torrealba. PROHIBIDO usar nombres de El Señor de los Anillos: nada de Bree, Rivendel, Mordor, Sauron, Gandalf, hobbits, la Comarca, Minas Tirith, orcos con nombres tolkienianos. Inventá nombres propios en el estilo de este mundo, nunca los de Tolkien.',
    en: 'This is an ORIGINAL epic fantasy world called Duskland. Render EVERY proper noun in natural English — if the world data hands you a Spanish name, translate it: Vado Viejo → Oldford (town), Aelinar and Aurelion (elven refuges — keep as-is, they are invented names), Cenizar → Ashmoor (dark land), Malzhur (dark lord — keep), Meridonia → Meridon, Estepia → the Steppes, Torrealba → Whitetower. FORBIDDEN to use Lord of the Rings names: no Bree, Rivendell, Mordor, Sauron, Gandalf, hobbits, the Shire, Minas Tirith. Never leave a Spanish word in the narration.',
  },
  STAR_WARS: {
    es: 'Este es un mundo de space opera ORIGINAL llamado Frontera Estelar. USÁ estos nombres propios: la Corriente (energía mística), los Vael (orden de guardianes), Umbra (su contraparte oscura), el Dominio Estelar (imperio), Coalición Libre (rebeldes), planetas Karshaar, Kryos y Mirval, Estación Eclipse, Puerto Zenna (cantina). PROHIBIDO usar nombres de Star Wars: nada de Jedi, Sith, la Fuerza, Mos Eisley, Tatooine, Coruscant, Imperio Galáctico, sables de luz (decí "hojas de plasma"), wookiees (decí "ranakkis"), droides (decí "autómatas"). Inventá nombres propios, nunca los de Star Wars.',
    en: 'This is an ORIGINAL space opera world called Stellar Frontier. Render EVERY proper noun in natural English — translate any Spanish name the data hands you: the Current (mystic energy), the Vael (guardian order), Umbra (dark counterpart), the Stellar Dominion (empire), the Free Coalition (rebels), planets Karshaar/Kryos/Mirval (invented — keep), Eclipse Station, Puerto Zenna → Port Zenna (cantina). FORBIDDEN to use Star Wars names: no Jedi, Sith, the Force, Mos Eisley, Tatooine, Coruscant, lightsabers (say "plasma blades"), wookiees (say "ranakkis"), droids (say "automatons"). Never leave a Spanish word in the narration.',
  },
  DND_CLASSIC: {
    es: 'Este es un mundo de fantasía ORIGINAL llamado Reinos de Valdrun. USÁ estos nombres propios: Puerto Corona (ciudad), Valdrun (continente), Brasaeterna, Pozo del Dragón (taberna), Costa del Alba, Hondura Sombría (submundo), umbríos (elfos oscuros). PROHIBIDO usar nombres de Reinos Olvidados / Forgotten Realms: nada de Waterdeep, Faerûn, Neverwinter, drow, Baldur, Menzoberranzan, Elminster, deidades como Torm/Bane/Mystra. Las MECÁNICAS de reglas (clases, dados, niveles) están bien; los NOMBRES del setting no. Inventá nombres propios.',
    en: 'This is an ORIGINAL fantasy world called the Realms of Valdrun. Render EVERY proper noun in natural English — translate any Spanish name the data hands you: Puerto Corona → Crownport (city), Valdrun (continent — keep), Brasaeterna → Emberhold, Pozo del Dragón → the Dragon\'s Well (tavern), Costa del Alba → the Dawn Coast, Hondura Sombría → the Shadowdeep (underworld), umbríos → shadowkin (dark elves). FORBIDDEN to use Forgotten Realms names: no Waterdeep, Faerûn, Neverwinter, drow, Baldur, Menzoberranzan, Elminster, deities like Torm/Bane/Mystra. The rules MECHANICS (classes, dice, levels) are fine; the setting NAMES are not. Never leave a Spanish word in the narration.',
  },
  ROMANTASY: {
    es: 'Este es un mundo de romantasy ORIGINAL. USÁ estos nombres propios: Sylvaria (reino), Lucerna (ciudad), la Corte Velada, alarios (guerreros alados). PROHIBIDO usar nombres de ACOTAR / Sarah J. Maas / Fourth Wing: nada de Velaris, Prythian, illyrianos, Rhysand, Feyre, Cortes con los nombres del libro, Basgiath. Inventá nombres propios en el estilo del mundo.',
    en: 'This is an ORIGINAL romantasy world. Render EVERY proper noun in natural English — translate any Spanish name the data hands you: Sylvaria (kingdom — keep), Lucerna (city — keep), the Veiled Court, alarios → alarians (winged warriors). FORBIDDEN to use ACOTAR / Sarah J. Maas / Fourth Wing names: no Velaris, Prythian, illyrians, Rhysand, Feyre, Basgiath. Never leave a Spanish word in the narration.',
  },
}

/**
 * Directiva anti-IP para un lore. Devuelve '' para los lores que no la
 * necesitan (géneros sin franquicia). Pensada para inyectarse como una
 * sección destacada del system prompt del DM.
 */
export function antiIpDirective(lore: string, locale: 'es' | 'en'): string {
  const g = GUIDANCE[lore]
  if (!g) return ''
  const header = locale === 'en'
    ? '⚠️ ORIGINAL WORLD — INTELLECTUAL PROPERTY RULE (mandatory):'
    : '⚠️ MUNDO ORIGINAL — REGLA DE PROPIEDAD INTELECTUAL (obligatoria):'
  return `\n\n${header}\n${g[locale]}`
}

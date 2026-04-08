/**
 * Templates de descripcion de personajes por lore
 * Usados para generar descripciones aleatorias durante el onboarding.
 *
 * Cada string es bilingüe: `{ es: "...", en: "..." }`. La función
 * generateRandomDescription recibe el locale del usuario y usa
 * getLocalized() para elegir el idioma correcto.
 */

import { type Lore, type LocalizedString } from '@/lib/types/lore'
import { getLocalized } from '@/lib/i18n/localize'

interface DescriptionTemplate {
  builds: LocalizedString[]       // complexion fisica
  features: LocalizedString[]     // rasgos faciales/distintivos
  attitudes: LocalizedString[]    // actitud/comportamiento
  accessories: LocalizedString[]  // accesorios/detalles
}

const TEMPLATES: Record<string, DescriptionTemplate> = {
  LOTR: {
    builds: [
      { es: 'De complexion atletica y paso firme', en: 'Athletic build and a steady stride' },
      { es: 'Alto y delgado, con porte elegante', en: 'Tall and slender, with an elegant bearing' },
      { es: 'Robusto y de hombros anchos', en: 'Sturdy and broad-shouldered' },
      { es: 'De estatura mediana pero fuerte', en: 'Of middling height but strong of arm' },
      { es: 'Esbelto y agil como un elfo', en: 'Slight and nimble as an elf' },
    ],
    features: [
      { es: 'ojos grises que reflejan sabiduria', en: 'gray eyes that carry old wisdom' },
      { es: 'una barba trenzada al estilo enano', en: 'a beard braided in the dwarven fashion' },
      { es: 'una cicatriz que cruza su mejilla', en: 'a scar crossing one cheek' },
      { es: 'cabello oscuro y ondulado', en: 'dark, wavy hair' },
      { es: 'rasgos afilados y penetrantes', en: 'sharp, piercing features' },
      { es: 'una mirada que ha visto demasiado', en: 'a gaze that has seen too much' },
    ],
    attitudes: [
      { es: 'Camina con la determinacion de quien tiene un proposito', en: 'Walks with the quiet purpose of someone who knows where they are going' },
      { es: 'Habla poco pero cada palabra tiene peso', en: 'Speaks seldom, but every word carries weight' },
      { es: 'Siempre alerta, observando cada sombra', en: 'Always watchful, marking every shadow' },
      { es: 'Transmite una calma inquebrantable', en: 'Carries an unshakable calm about them' },
      { es: 'Lleva consigo el peso de antiguas memorias', en: 'Bears the weight of ancient memories' },
    ],
    accessories: [
      { es: 'Una capa gastada por incontables viajes', en: 'A cloak worn thin by countless journeys' },
      { es: 'Un anillo con inscripciones antiguas', en: 'A ring etched with ancient inscriptions' },
      { es: 'Una pipa de madera tallada', en: 'A hand-carved wooden pipe' },
      { es: 'Un broche con el simbolo de su casa', en: 'A brooch bearing the sigil of their house' },
      { es: 'Botas de cuero desgastadas pero resistentes', en: 'Worn leather boots that still hold the road' },
    ],
  },

  ZOMBIES: {
    builds: [
      { es: 'De aspecto demacrado pero resistente', en: 'Gaunt but wiry, still holding on' },
      { es: 'Curtido por meses de supervivencia', en: 'Hardened by months of survival' },
      { es: 'Delgado, con musculos tensos por la alerta constante', en: 'Lean, with muscles tight from constant alertness' },
      { es: 'Fuerte a pesar de la escasez', en: 'Strong, in spite of the scarcity' },
      { es: 'Agil y nervioso, listo para correr', en: 'Jumpy and quick on their feet, ready to run' },
    ],
    features: [
      { es: 'ojeras profundas de noches sin dormir', en: 'deep circles from sleepless nights' },
      { es: 'cicatrices de encuentros cercanos', en: 'scars from close calls' },
      { es: 'tatuajes de una vida anterior', en: 'tattoos from a life that no longer exists' },
      { es: 'una mirada que ya no se sorprende de nada', en: 'a stare that no longer flinches at anything' },
      { es: 'el rostro manchado de polvo y sudor', en: 'a face streaked with dust and sweat' },
      { es: 'vendajes improvisados en los brazos', en: 'makeshift bandages on both arms' },
    ],
    attitudes: [
      { es: 'Se mueve en silencio, cada paso calculado', en: 'Moves in silence, every step measured' },
      { es: 'Nunca da la espalda a una puerta', en: 'Never turns their back on a door' },
      { es: 'Revisa las salidas antes de entrar a cualquier lugar', en: 'Checks the exits before walking into any room' },
      { es: 'Habla en susurros, el ruido atrae a los muertos', en: 'Speaks in whispers — noise brings the dead' },
      { es: 'Confía poco, pero protege ferozmente a los suyos', en: 'Trusts few, but fights hard for the few they trust' },
    ],
    accessories: [
      { es: 'Una mochila con lo esencial para sobrevivir', en: 'A backpack with the bare essentials to stay alive' },
      { es: 'Un cuchillo de caza siempre al alcance', en: 'A hunting knife always within reach' },
      { es: 'Ropa rasgada pero funcional', en: 'Clothes torn up but still holding together' },
      { es: 'Un walkie-talkie que ya no funciona', en: 'A walkie-talkie that no longer works' },
      { es: 'Guantes de cuero sin dedos', en: 'Fingerless leather gloves' },
    ],
  },

  ISEKAI: {
    builds: [
      { es: 'De apariencia juvenil y energica', en: 'Young and full of energy' },
      { es: 'Atletico, como si hubiera entrenado en secreto', en: 'Athletic, like they had been secretly training for this' },
      { es: 'De complexion normal, pero con un aura especial', en: 'Ordinary build, but with something special about them' },
      { es: 'Delgado con una gracia inesperada', en: 'Slim, with an unexpected grace' },
      { es: 'Robusto, destacando entre los habitantes locales', en: 'Sturdy, standing out among the locals' },
    ],
    features: [
      { es: 'ojos que brillan con curiosidad por este nuevo mundo', en: 'eyes that shine with curiosity at this new world' },
      { es: 'rasgos que delatan un origen distinto', en: 'features that betray a different origin' },
      { es: 'una sonrisa que desafia las adversidades', en: 'a smile that laughs in the face of trouble' },
      { es: 'cabello de un color inusual para estas tierras', en: 'hair in a color no one from these lands would have' },
      { es: 'una marca brillante en la mano, senial de su invocacion', en: 'a glowing mark on one hand — the sign of their summoning' },
    ],
    attitudes: [
      { es: 'Afronta cada reto como si fuera un nivel de videojuego', en: 'Treats every challenge like a video game level' },
      { es: 'Se sorprende constantemente con la magia de este mundo', en: 'Never stops marveling at the magic of this world' },
      { es: 'Habla de "stats" y "skills" sin que nadie lo entienda', en: 'Talks about "stats" and "skills" while no one has a clue what they mean' },
      { es: 'Mantiene un optimismo casi irritante', en: 'Keeps an optimism that borders on irritating' },
      { es: 'Analiza todo buscando la "mecanica oculta"', en: 'Analyzes everything looking for the "hidden mechanic"' },
    ],
    accessories: [
      { es: 'Ropa de otro mundo debajo de su armadura', en: 'Clothes from another world under their armor' },
      { es: 'Un smartphone sin bateria, recuerdo de su vida pasada', en: 'A dead smartphone, a keepsake from their old life' },
      { es: 'Un grimorio que aparecio con el', en: 'A grimoire that appeared beside them on arrival' },
      { es: 'Un collar con un cristal brillante', en: 'A necklace with a softly glowing crystal' },
      { es: 'Zapatillas deportivas que nadie reconoce', en: 'Sneakers that no one around here has ever seen before' },
    ],
  },

  VIKINGOS: {
    builds: [
      { es: 'Alto y musculoso, forjado en batalla', en: 'Tall and muscled, forged in battle' },
      { es: 'De complexion robusta como un oso', en: 'Built like a bear' },
      { es: 'Agil y fibroso como un lobo', en: 'Lean and sinewy as a wolf' },
      { es: 'Imponente, con cicatrices de honor', en: 'Imposing, bearing scars of honor' },
      { es: 'Fuerte como el roble de los bosques del norte', en: 'Strong as the oaks of the northern forests' },
    ],
    features: [
      { es: 'una barba trenzada con cuentas de hueso', en: 'a beard braided with bone beads' },
      { es: 'ojos azules frios como el hielo', en: 'blue eyes cold as winter ice' },
      { es: 'runas tatuadas en el cuello', en: 'runes tattooed down the neck' },
      { es: 'el cabello rapado a los lados', en: 'hair shaved close on the sides' },
      { es: 'cicatrices de guerra en el rostro', en: 'war scars across the face' },
      { es: 'una mirada que no conoce el miedo', en: 'a gaze that does not know fear' },
    ],
    attitudes: [
      { es: 'Rie ante el peligro, la muerte es solo un viaje', en: 'Laughs at danger — death is only another journey' },
      { es: 'Habla con la voz del trueno', en: 'Speaks with a voice like thunder' },
      { es: 'Valora el honor sobre la vida', en: 'Holds honor above life itself' },
      { es: 'Cuenta historias de sus ancestros con orgullo', en: 'Tells the tales of their ancestors with fierce pride' },
      { es: 'Bebe hidromiel como si fuera agua', en: 'Drinks mead like it were water' },
    ],
    accessories: [
      { es: 'Un martillo de Thor colgando del cuello', en: "A Mjolnir pendant hanging from their neck" },
      { es: 'Pieles de lobo sobre los hombros', en: 'Wolf pelts thrown over the shoulders' },
      { es: 'Brazaletes de plata robados en incursiones', en: 'Silver bracelets taken in raids' },
      { es: 'Un cuerno para beber en el cinturon', en: 'A drinking horn at the belt' },
      { es: 'Botas forradas para el frio eterno', en: 'Fur-lined boots for the long winter' },
    ],
  },

  STAR_WARS: {
    builds: [
      { es: 'De porte marcial, con movimientos precisos', en: 'Military bearing, every movement precise' },
      { es: 'Agil y ligero, perfecto para el combate', en: 'Quick and light on their feet, built for a fight' },
      { es: 'Robusto, curtido por mil batallas estelares', en: 'Sturdy, weathered by a thousand battles among the stars' },
      { es: 'De complexion normal pero con presencia imponente', en: 'Ordinary build, but with a presence you notice' },
      { es: 'Delgado y rapido como un piloto experimentado', en: 'Lean and fast, the frame of a seasoned pilot' },
    ],
    features: [
      { es: 'ojos que han visto la vastedad del espacio', en: 'eyes that have looked into the vastness of space' },
      { es: 'una cicatriz de un disparo de blaster', en: 'a scar left by a blaster bolt' },
      { es: 'rasgos endurecidos por la guerra', en: 'features hardened by war' },
      { es: 'una calma que solo da la conexion con la Fuerza', en: 'the kind of calm only the Force can give' },
      { es: 'tatuajes de su planeta natal', en: 'tattoos from their home planet' },
    ],
    attitudes: [
      { es: 'Siente las perturbaciones en la Fuerza', en: 'Feels the disturbances in the Force' },
      { es: 'Siempre tiene un mal presentimiento sobre esto', en: 'Always has a bad feeling about this' },
      { es: 'Actua primero, pregunta despues', en: 'Shoots first, asks questions later' },
      { es: 'Habla de creditos y trabajos con naturalidad', en: 'Talks about credits and jobs like it is all in a day’s work' },
      { es: 'Desconfia del Imperio, o de la Republica, segun el dia', en: 'Distrusts the Empire — or the Republic, depending on the day' },
    ],
    accessories: [
      { es: 'Un sable laser oculto bajo la tunica', en: 'A lightsaber hidden beneath their tunic' },
      { es: 'Una pistola blaster desgastada pero confiable', en: 'A worn but reliable blaster pistol' },
      { es: 'Un comunicador holografico', en: 'A holographic comlink' },
      { es: 'Guantes de piloto de la Alianza', en: 'Alliance pilot gloves' },
      { es: 'Un casco mandaloriano abolaldo', en: 'A dented Mandalorian helmet' },
    ],
  },

  CYBERPUNK: {
    builds: [
      { es: 'Cuerpo modificado con implantes visibles', en: 'A body reworked with visible implants' },
      { es: 'Atletico, mejorado con bioware', en: 'Athletic, tuned up with bioware' },
      { es: 'Delgado y fibroso, optimizado para velocidad', en: 'Lean and wired, optimized for speed' },
      { es: 'Robusto, con brazos cromaticos de acero', en: 'Bulky, with chrome steel arms' },
      { es: 'De apariencia normal, pero lleno de mejoras ocultas', en: 'Looks ordinary, but packed with hidden upgrades' },
    ],
    features: [
      { es: 'ojos ciberneticos que brillan en la oscuridad', en: 'cybernetic eyes that glow in the dark' },
      { es: 'puertos de datos visibles en las sienes', en: 'data ports visible at the temples' },
      { es: 'cabello neon que cambia de color', en: 'neon hair that shifts color on the fly' },
      { es: 'tatuajes animados con LEDs subcutaneos', en: 'tattoos animated by subdermal LEDs' },
      { es: 'cicatrices de cirugia de implantes', en: 'scars from implant surgery' },
      { es: 'una mandibula cromatica de acero', en: 'a chromed steel jaw' },
    ],
    attitudes: [
      { es: 'Desconfia de las corporaciones mas que de los gangs', en: 'Trusts the corps even less than the gangs' },
      { es: 'Siempre busca la proxima mejora, el proximo upgrade', en: 'Always chasing the next upgrade' },
      { es: 'Habla en jerga callejera mezclada con terminos tecnicos', en: 'Talks in street slang mixed with tech jargon' },
      { es: 'Vive al borde, cada trabajo puede ser el ultimo', en: 'Lives on the edge — every gig might be the last' },
      { es: 'Nunca se desconecta de la Red, ni siquiera para dormir', en: 'Never disconnects from the Net, not even to sleep' },
    ],
    accessories: [
      { es: 'Una chaqueta de cuero con logos de corps quemados', en: 'A leather jacket covered in burned-out corp logos' },
      { es: 'Auriculares de realidad virtual siempre al cuello', en: 'VR headphones hanging around their neck' },
      { es: 'Un deck de hacking modificado', en: 'A heavily modded hacking deck' },
      { es: 'Gafas de sol con HUD integrado', en: 'Sunglasses with a built-in HUD' },
      { es: 'Una katana plegable en la espalda', en: 'A folding katana strapped to their back' },
    ],
  },

  LOVECRAFT_HORROR: {
    builds: [
      { es: 'De aspecto fragil, consumido por sus investigaciones', en: 'Frail-looking, worn down by their research' },
      { es: 'De complexion normal, con una palidez enfermiza', en: 'Ordinary build, but with a sickly pallor' },
      { es: 'Delgado y nervioso, con ojeras permanentes', en: 'Thin and nervous, with permanent shadows under the eyes' },
      { es: 'Robusto pero con temblores en las manos', en: 'Sturdy, but the hands will not stop trembling' },
      { es: 'De apariencia respetable pero mirada perturbada', en: 'Respectable appearance betrayed by an unsettled gaze' },
    ],
    features: [
      { es: 'ojos hundidos que han visto demasiado', en: 'sunken eyes that have seen too much' },
      { es: 'cabello prematuramente canoso', en: 'hair gone prematurely gray' },
      { es: 'manos manchadas de tinta de antiguos tomos', en: 'hands stained with ink from ancient tomes' },
      { es: 'una mirada que evita las sombras', en: 'a gaze that keeps drifting away from the shadows' },
      { es: 'rasgos aristocraticos pero demacrados', en: 'aristocratic features, worn thin' },
      { es: 'tics nerviosos que no puede controlar', en: 'nervous tics they cannot quite control' },
    ],
    attitudes: [
      { es: 'Murmura en lenguas que nadie deberia conocer', en: 'Mutters in tongues no one should know' },
      { es: 'Consulta libros incluso en los momentos mas criticos', en: 'Consults books even in the most dire moments' },
      { es: 'Teme la oscuridad pero no puede dejar de investigarla', en: 'Fears the dark, yet cannot stop digging into it' },
      { es: 'Habla de "Ellos" como si siempre estuvieran escuchando', en: 'Speaks of "Them" as though They were always listening' },
      { es: 'Sufre pesadillas que no distingue de la realidad', en: 'Haunted by nightmares they can no longer tell from waking' },
    ],
    accessories: [
      { es: 'Un diario lleno de simbolos incomprensibles', en: 'A journal filled with unreadable symbols' },
      { es: 'Un medallon con un sello arcano', en: 'A medallion bearing an arcane seal' },
      { es: 'Gafas redondas para leer textos antiguos', en: 'Round spectacles for reading old texts' },
      { es: 'Un baston con empuniadura de plata', en: 'A walking cane with a silver handle' },
      { es: 'Guantes blancos manchados de algo que no es tinta', en: 'White gloves stained with something that is not ink' },
    ],
  },

  COZY_WITCH: {
    builds: [
      { es: 'De estatura mediana y manos curtidas por la jardinería', en: 'Of middling height, with hands weathered from the garden' },
      { es: 'Menud@ pero de presencia tranquila', en: 'Small-framed, but with a quiet presence' },
      { es: 'Robust@ de carne suave, brazos fuertes de amasar pan', en: 'Soft and solid, with strong arms from kneading bread' },
      { es: 'Alt@ y delgad@, con la postura de quien escucha mucho', en: 'Tall and slender, with the posture of someone who listens a lot' },
      { es: 'De porte sereno, como si nunca tuviera prisa', en: 'Serene in their bearing, as though they were never in a hurry' },
    ],
    features: [
      { es: 'ojos amables con líneas de risa en los bordes', en: 'kind eyes with laugh lines at the corners' },
      { es: 'cabello recogido con un pañuelo bordado', en: 'hair tied up with an embroidered kerchief' },
      { es: 'manchas de tierra en las uñas que nunca terminan de irse', en: 'soil under their nails that never quite washes away' },
      { es: 'una cicatriz pequeña en el pulgar de cuando aprendiste a usar el cuchillo curvo', en: 'a small scar on the thumb from learning to use the curved knife' },
      { es: 'las pecas de quien pasó muchas tardes en el jardín', en: 'freckles from too many afternoons in the garden' },
      { es: 'una sonrisa que llega antes que las palabras', en: 'a smile that arrives before any words do' },
    ],
    attitudes: [
      { es: 'Camina despacio y mira las plantas al pasar', en: 'Walks slowly and glances at the plants along the way' },
      { es: 'Habla en voz baja pero la gente la escucha', en: 'Speaks softly, but people lean in to listen' },
      { es: 'Siempre tiene té recién hecho para ofrecer', en: 'Always has fresh tea to offer' },
      { es: 'Se acuerda de los nombres de todos los gatos del pueblo', en: 'Remembers the name of every cat in the village' },
      { es: 'Tiene la calma de quien sabe que las cosas llegan a su tiempo', en: 'Has the calm of someone who knows things arrive in their own time' },
    ],
    accessories: [
      { es: 'Un delantal con bolsillos llenos de hierbas y un trozo de hilo', en: 'An apron with pockets full of herbs and a bit of string' },
      { es: 'Un saquito de tela con semillas para regalar', en: 'A small cloth pouch of seeds to give away' },
      { es: 'Una taza de cerámica reparada con oro (kintsugi)', en: 'A ceramic cup mended with gold (kintsugi-style)' },
      { es: 'Un pañuelo de cabeza bordado por una abuela', en: 'A headscarf embroidered by a grandmother' },
      { es: 'Una llave vieja que abre cualquier puerta del pueblo', en: 'An old key that opens any door in the village' },
    ],
  },

  ROMANTASY: {
    builds: [
      { es: 'De porte elegante y movimientos felinos', en: 'Elegant bearing and feline movements' },
      { es: 'Alta y esbelta como una nyfa cortesana', en: 'Tall and slender as a courtly fae' },
      { es: 'De silueta sensual y andar deliberado', en: 'A sensual silhouette and a deliberate stride' },
      { es: 'Robust@ pero con gracia inesperada', en: 'Solidly built, yet moving with unexpected grace' },
      { es: 'Etéreo y casi luminoso bajo la luz de las velas', en: 'Ethereal, almost luminous in candlelight' },
    ],
    features: [
      { es: 'ojos del color de un crepúsculo imposible', en: 'eyes the color of an impossible dusk' },
      { es: 'una marca de nacimiento con forma de luna', en: 'a crescent-moon birthmark' },
      { es: 'cabello que parece atrapar la luz como hilos de seda', en: 'hair that seems to catch the light like strands of silk' },
      { es: 'rasgos finos cincelados como por un escultor antiguo', en: 'features finely carved, as if by some ancient sculptor' },
      { es: 'una cicatriz pequeña que solo realza su belleza', en: 'a small scar that only sharpens their beauty' },
      { es: 'una mirada que promete tanto deseo como peligro', en: 'a gaze that promises desire and danger in equal measure' },
    ],
    attitudes: [
      { es: 'Camina como si todos los salones le pertenecieran', en: 'Walks through every hall as though they owned it' },
      { es: 'Sonríe con la misma facilidad con la que oculta secretos', en: 'Smiles as easily as they keep secrets' },
      { es: 'Cada gesto parece coreografiado por la pasión', en: 'Every gesture seems choreographed by passion' },
      { es: 'Habla en susurros cargados de intención', en: 'Speaks in whispers loaded with intention' },
      { es: 'Lleva el porte de quien sabe ser amad@ y temid@ al mismo tiempo', en: 'Carries themselves with the air of someone used to being loved and feared at once' },
    ],
    accessories: [
      { es: 'Un anillo con una gema que cambia de color según la emoción', en: 'A ring set with a gem that shifts color with emotion' },
      { es: 'Una capa de seda con bordados de hilo plateado', en: 'A silk cloak embroidered in silver thread' },
      { es: 'Un colgante con un mechón de cabello de un amor pasado', en: 'A locket holding a lock of hair from a past love' },
      { es: 'Una daga ceremonial siempre cerca, oculta entre los pliegues', en: 'A ceremonial dagger always close at hand, hidden in the folds of their dress' },
      { es: 'Un perfume embriagador con notas de jazmín nocturno', en: 'An intoxicating perfume with notes of night-blooming jasmine' },
    ],
  },

  CUSTOM: {
    builds: [
      { es: 'De complexion atletica y equilibrada', en: 'Athletic and well-balanced build' },
      { es: 'Alto y de presencia imponente', en: 'Tall, with an imposing presence' },
      { es: 'Agil y de movimientos fluidos', en: 'Quick, with fluid movements' },
      { es: 'Robusto y resistente', en: 'Sturdy and hardy' },
      { es: 'De estatura mediana pero con gran carisma', en: 'Of middling height, but with real presence' },
    ],
    features: [
      { es: 'rasgos distintivos dificiles de olvidar', en: 'distinctive features that are hard to forget' },
      { es: 'ojos que revelan una historia compleja', en: 'eyes that hint at a complicated history' },
      { es: 'cicatrices que cuentan batallas pasadas', en: 'scars that tell the story of past fights' },
      { es: 'una sonrisa enigmatica', en: 'an enigmatic smile' },
      { es: 'una mirada penetrante', en: 'a piercing gaze' },
    ],
    attitudes: [
      { es: 'Actua con determinacion y proposito', en: 'Acts with purpose and resolve' },
      { es: 'Observa mas de lo que habla', en: 'Watches more than they speak' },
      { es: 'Inspira confianza en quienes le rodean', en: 'Inspires trust in those around them' },
      { es: 'Mantiene sus secretos bien guardados', en: 'Keeps their secrets close' },
      { es: 'Enfrenta cada desafio con valentia', en: 'Faces every challenge head-on' },
    ],
    accessories: [
      { es: 'Un objeto personal de gran significado', en: 'A personal item of deep meaning' },
      { es: 'Ropa practica pero con estilo propio', en: 'Practical clothes with a style of their own' },
      { es: 'Un arma que ha visto muchas batallas', en: 'A weapon that has seen many fights' },
      { es: 'Un simbolo de su afiliacion', en: 'A symbol of their allegiance' },
      { es: 'Accesorios que reflejan su personalidad', en: 'Accessories that say something about who they are' },
    ],
  },
}

// Complexiones físicas por raza D&D 5e — sobreescriben las del lore
const RACE_BUILDS: Record<string, LocalizedString[]> = {
  human: [
    { es: 'De complexion atletica y equilibrada', en: 'Athletic and well-balanced build' },
    { es: 'De estatura media, con porte decidido', en: 'Of average height, with a resolute bearing' },
    { es: 'Fuerte y adaptable, como todo humano', en: 'Strong and adaptable, as humans tend to be' },
  ],
  elf: [
    { es: 'Esbelto y de gracia sobrenatural', en: 'Slender, with an unearthly grace' },
    { es: 'Alto y delgado, con porte elegante y etéreo', en: 'Tall and slim, with an elegant, ethereal bearing' },
    { es: 'De movimientos fluidos como el agua', en: 'Moves fluidly, like water' },
  ],
  'high-elf': [
    { es: 'Alto y de porte aristocratico, con gracia elfica', en: 'Tall and aristocratic, with an elven grace' },
    { es: 'Esbelto y elegante, con un aura de sabiduria antigua', en: 'Slender and refined, carrying an aura of ancient wisdom' },
  ],
  'wood-elf': [
    { es: 'Agil y fibroso, curtido por los bosques', en: 'Lithe and sinewy, shaped by the forest' },
    { es: 'De complexion atletica y piel bronceada por el sol del bosque', en: 'Athletic build and skin bronzed by the forest sun' },
  ],
  dwarf: [
    { es: 'Bajo y macizo como la roca de la montaña', en: 'Short and solid as mountain stone' },
    { es: 'Robusto y compacto, con brazos gruesos de herrero', en: 'Sturdy and compact, with a smith’s thick arms' },
    { es: 'De poca estatura pero de fuerza inmensa', en: 'Short of stature, but immense in strength' },
  ],
  'hill-dwarf': [
    { es: 'Bajo y robusto, con una resistencia inquebrantable', en: 'Short and sturdy, with an unshakable endurance' },
  ],
  'mountain-dwarf': [
    { es: 'Compacto como la piedra, con musculos de acero', en: 'Compact as stone, with muscles like steel' },
  ],
  halfling: [
    { es: 'Pequeño y agil, apenas llega a la cintura de un humano', en: 'Small and nimble, barely reaching a human’s waist' },
    { es: 'De estatura diminuta pero con una energia desbordante', en: 'Tiny in stature, but bursting with energy' },
    { es: 'Menudo y de pies grandes, con una sonrisa picara', en: 'Small-framed with big feet and a mischievous smile' },
  ],
  gnome: [
    { es: 'Pequeño y vivaz, apenas tres pies de alto', en: 'Small and lively, barely three feet tall' },
    { es: 'Diminuto pero lleno de energia, con ojos curiosos y brillantes', en: 'Tiny but full of energy, with bright, curious eyes' },
    { es: 'De estatura minuscula pero con una presencia sorprendente', en: 'Miniature in size, yet with a surprisingly large presence' },
    { es: 'Compacto y nervioso, siempre en movimiento', en: 'Compact and fidgety, always in motion' },
  ],
  'rock-gnome': [
    { es: 'Pequeño y de manos habiles, siempre toqueteando algun invento', en: 'Small and clever-handed, always tinkering with some invention' },
  ],
  'forest-gnome': [
    { es: 'Diminuto y silencioso, en armonia con la naturaleza', en: 'Tiny and silent, in harmony with the wild' },
  ],
  dragonborn: [
    { es: 'Alto e imponente, con escamas que brillan bajo la luz', en: 'Tall and imposing, with scales that catch the light' },
    { es: 'De complexion poderosa, con rasgos dracónicos intimidantes', en: 'A powerful build, with intimidating draconic features' },
    { es: 'Musculoso y cubierto de escamas, con mandibula pronunciada', en: 'Muscular and scaled, with a pronounced jaw' },
  ],
  'half-elf': [
    { es: 'De complexion grácil pero con la solidez humana', en: 'A graceful frame with human solidity' },
    { es: 'Con la elegancia elfica y la determinacion humana en su porte', en: 'Elven elegance and human resolve in their bearing' },
  ],
  'half-orc': [
    { es: 'Alto y musculoso, con mandibula prominente y colmillos asomando', en: 'Tall and muscled, with a heavy jaw and protruding tusks' },
    { es: 'Imponente y fuerte, de piel verdosa y mirada fiera', en: 'Imposing and strong, with greenish skin and a fierce gaze' },
    { es: 'De complexion brutal, con cicatrices de innumerables peleas', en: 'A brutal build, marked by scars from countless fights' },
  ],
  tiefling: [
    { es: 'De porte orgulloso, con cuernos curvados y cola sinuosa', en: 'A proud bearing, with curved horns and a sinuous tail' },
    { es: 'Esbelto y de aspecto infernal, con ojos sin pupilas', en: 'Slim and infernal in appearance, with pupil-less eyes' },
    { es: 'De belleza inquietante, con piel de tono carmesí', en: 'Unsettlingly beautiful, with crimson-hued skin' },
  ],
}

// Actitudes por clase D&D 5e — complementan las del lore
const CLASS_ATTITUDES: Record<string, LocalizedString[]> = {
  barbarian: [
    { es: 'Emana una furia contenida, lista para estallar', en: 'Radiates a held-back fury, ready to break loose' },
    { es: 'Se mueve con la ferocidad de una bestia al acecho', en: 'Moves with the ferocity of a prowling beast' },
  ],
  bard: [
    { es: 'Gesticula al hablar como si cada palabra fuera una cancion', en: 'Gestures while speaking as though every word were a song' },
    { es: 'Siempre tiene una sonrisa y una historia que contar', en: 'Always has a smile and a story to tell' },
  ],
  cleric: [
    { es: 'Irradia una serenidad que conforta a quienes le rodean', en: 'Radiates a serenity that comforts those around them' },
    { es: 'Reza en silencio, sus labios siempre moviéndose en oracion', en: 'Prays silently, lips always moving in quiet devotion' },
  ],
  druid: [
    { es: 'Huele a tierra mojada y hojas frescas', en: 'Smells of damp earth and fresh leaves' },
    { es: 'Observa la naturaleza con reverencia casi religiosa', en: 'Watches nature with an almost religious reverence' },
  ],
  fighter: [
    { es: 'Se mantiene erguido con disciplina militar', en: 'Stands tall with military discipline' },
    { es: 'Evalua cada habitacion buscando ventajas tacticas', en: 'Reads every room looking for tactical advantage' },
  ],
  monk: [
    { es: 'Se mueve con una economia de movimiento sobrenatural', en: 'Moves with an uncanny economy of motion' },
    { es: 'Transmite una paz interior que contrasta con su fuerza', en: 'Carries an inner peace that contrasts with their strength' },
  ],
  paladin: [
    { es: 'Camina con la rectitud de quien sirve a un juramento sagrado', en: 'Walks with the uprightness of someone bound by a sacred oath' },
    { es: 'Su presencia inspira coraje en los aliados y temor en los enemigos', en: 'Their presence stirs courage in allies and fear in foes' },
  ],
  ranger: [
    { es: 'Siempre alerta, leyendo las seniales del entorno', en: 'Always alert, reading the signs of their surroundings' },
    { es: 'Se mueve en silencio, como una sombra entre los arboles', en: 'Moves in silence, like a shadow between the trees' },
  ],
  rogue: [
    { es: 'Sus ojos danzan entre las sombras buscando oportunidades', en: 'Their eyes dance through the shadows looking for opportunities' },
    { es: 'Se mueve con sigilo, sus manos nunca lejos de sus bolsillos', en: 'Moves quietly, hands never far from their pockets' },
  ],
  sorcerer: [
    { es: 'Un poder arcano vibra bajo su piel, a veces visible como chispas', en: 'An arcane power hums beneath their skin, sometimes flickering as sparks' },
    { es: 'Sus ojos brillan con magia innata cuando se concentra', en: 'Their eyes glow with innate magic when they focus' },
  ],
  warlock: [
    { es: 'Lleva el peso de un pacto oscuro en su mirada', en: 'Carries the weight of a dark pact in their gaze' },
    { es: 'Susurra a algo que nadie mas puede ver ni oir', en: 'Whispers to something no one else can see or hear' },
  ],
  wizard: [
    { es: 'Entrecierra los ojos analizando todo con mente analitica', en: 'Narrows their eyes, analyzing everything with a sharp, studious mind' },
    { es: 'Siempre tiene un libro o pergamino entre las manos', en: 'Always has a book or scroll in hand' },
  ],
}

/**
 * Genera una descripcion aleatoria basada en el lore, raza, clase y locale.
 * Todos los strings internos son bilingues: getLocalized() elige el idioma
 * del usuario, y el conector de la oracion se adapta ("con" / "with").
 */
export function generateRandomDescription(
  lore: Lore,
  raceId?: string,
  classId?: string,
  locale: 'es' | 'en' = 'es'
): string {
  const template = TEMPLATES[lore] || TEMPLATES.CUSTOM
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  // Complexion: usar la de la raza si existe, sino la del lore
  const raceBuilds = raceId ? (RACE_BUILDS[raceId] || RACE_BUILDS[raceId.split('-')[0]]) : null
  const build = raceBuilds ? pick(raceBuilds) : pick(template.builds)

  const feature = pick(template.features)

  // Actitud: usar la de la clase si existe, sino la del lore
  const classAttitudes = classId ? CLASS_ATTITUDES[classId] : null
  const attitude = classAttitudes ? pick(classAttitudes) : pick(template.attitudes)

  const accessory = pick(template.accessories)

  const buildText     = getLocalized(build,     locale)
  const featureText   = getLocalized(feature,   locale)
  const attitudeText  = getLocalized(attitude,  locale)
  const accessoryText = getLocalized(accessory, locale)

  const connector = locale === 'en' ? 'with' : 'con'
  return `${buildText}, ${connector} ${featureText}. ${attitudeText}. ${accessoryText}.`
}

/**
 * Obtiene los templates disponibles para un lore (para UI avanzada)
 */
export function getTemplatesForLore(lore: Lore): DescriptionTemplate {
  return TEMPLATES[lore] || TEMPLATES.CUSTOM
}

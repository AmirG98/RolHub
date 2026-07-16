export interface Spell {
  slug: string
  name: string
  lore: string
  loreName: string
  level: number // 0 = cantrip/truco, 1-9 = nivel de hechizo
  school: string // evocación, nigromancia, ilusión, etc.
  castingTime: string
  range: string
  duration: string
  description: string // 2-3 oraciones en español
  effects: string[] // mecánicas de juego
  damage?: string
  imagePrompt: string
  tags: string[]
}

// Hechizos de Tierra del Ocaso (LOTR)
const LOTR_SPELLS: Spell[] = [
  {
    slug: 'palabra-de-mando', name: 'Palabra de Mando', lore: 'LOTR', loreName: 'Tierra del Ocaso',
    level: 5, school: 'Evocación', castingTime: '1 acción', range: '60 pies', duration: 'Instantáneo',
    description: 'El lanzador pronuncia una palabra de poder absoluto en lengua antigua que resuena con la autoridad de los Valar. Los enemigos son derribados y aturdidos por la fuerza de la voz.',
    effects: ['Todos los enemigos en 60 pies deben superar CD 16 WIS o quedan aturdidos 1 turno', 'Los enemigos que fallen por 5+ son además derribados', 'Criaturas de sombra reciben 2d8 daño radiante adicional'],
    damage: '4d6 trueno',
    imagePrompt: 'gandalf-like wizard shouting a word of power, shockwave emanating from mouth, enemies flying back, dramatic lighting, classic epic fantasy fantasy oil painting',
    tags: ['evocación', 'control', 'área', 'istari'],
  },
  {
    slug: 'luz-de-earendil', name: 'Luz de Eärendil', lore: 'LOTR', loreName: 'Tierra del Ocaso',
    level: 3, school: 'Abjuración', castingTime: '1 acción', range: 'Personal (30 pies de radio)', duration: '10 minutos',
    description: 'Una estrella brillante aparece en la mano del lanzador, emitiendo una luz pura que repele la oscuridad y las criaturas malignas. La luz de la Estrella de la Mañana no puede ser extinguida por magia oscura.',
    effects: ['Ilumina 30 pies con luz brillante y 30 pies más con luz tenue', 'Criaturas de sombra y no-muertos tienen desventaja en ataques dentro del área', 'Disipa oscuridad mágica de nivel 3 o inferior', 'Inmune a ser apagada por magia oscura'],
    imagePrompt: 'glowing star held in elvish hand, pure white light dispelling darkness, phial of galadriel style, classic epic fantasy fantasy luminous painting',
    tags: ['abjuración', 'luz', 'anti-oscuridad', 'élfico'],
  },
  {
    slug: 'cancion-de-poder', name: 'Canción de Poder', lore: 'LOTR', loreName: 'Tierra del Ocaso',
    level: 4, school: 'Encantamiento', castingTime: '1 acción (concentración)', range: '60 pies', duration: 'Concentración, hasta 1 minuto',
    description: 'El lanzador entona una melodía antigua que teje magia en cada nota, como hicieron Finrod y Malzhur en su duelo de canciones. La canción puede inspirar aliados, debilitar enemigos o alterar la realidad.',
    effects: ['Aliados en rango obtienen +2 a todas las tiradas durante la duración', 'Un enemigo objetivo debe superar CD 15 CHA o queda encantado', 'Cada turno el lanzador puede cambiar el efecto entre inspirar o debilitar'],
    imagePrompt: 'elf singing a song of power, musical notes turning into golden light, ancient forest setting, magical aura, classic epic fantasy fantasy art',
    tags: ['encantamiento', 'buff', 'debuff', 'concentración', 'élfico'],
  },
  {
    slug: 'curacion-elfica', name: 'Curación Élfica', lore: 'LOTR', loreName: 'Tierra del Ocaso',
    level: 2, school: 'Evocación', castingTime: '1 acción', range: 'Toque', duration: 'Instantáneo',
    description: 'Usando el conocimiento curativo de los Eldar, el lanzador coloca sus manos sobre las heridas y canaliza la vitalidad de Arda. Hojas de albahoja brillan con luz tenue mientras el cuerpo sana.',
    effects: ['Cura 3d8+WIS HP al objetivo tocado', 'Remueve una condición: envenenado, enfermo o cegado', 'Si se usan hojas de albahoja como componente, cura 2d8 adicionales'],
    imagePrompt: 'elven healer with glowing hands over a wound, albahoja leaves shining, soft golden light, peaceful forest, classic epic fantasy fantasy oil painting',
    tags: ['curación', 'restauración', 'toque', 'élfico'],
  },
  {
    slug: 'maldicion-de-morgul', name: 'Maldición de Morgul', lore: 'LOTR', loreName: 'Tierra del Ocaso',
    level: 6, school: 'Nigromancia', castingTime: '1 acción', range: '60 pies', duration: 'Hasta ser removida',
    description: 'Una magia oscura nacida en Minas Morgul que corrompe la esencia vital del objetivo. La víctima siente un frío mortal que se extiende desde la herida, acercándola al mundo de las sombras.',
    effects: ['El objetivo recibe 4d8 daño necrótico', 'CD 16 CON o el objetivo pierde 1d4 HP máximos por turno', 'Mientras esté maldito, el objetivo es visible para los Umbríos', 'Solo removible con Curación Élfica nivel 4+ o magia equivalente'],
    damage: '4d8 necrótico',
    imagePrompt: 'dark morgul curse spreading from a wound, black veins glowing, victim in agony, shadowy spectral realm visible, classic epic fantasy dark fantasy',
    tags: ['nigromancia', 'maldición', 'daño-continuo', 'oscuro'],
  },
  {
    slug: 'escudo-runico', name: 'Escudo Rúnico', lore: 'LOTR', loreName: 'Tierra del Ocaso',
    level: 1, school: 'Abjuración', castingTime: 'Reacción', range: 'Personal', duration: '1 turno',
    description: 'Runas enanas brillan en el aire formando un escudo protector ante un ataque. La magia ancestral de los Khazâd fue grabada en piedra durante milenios y ahora se manifiesta como barrera.',
    effects: ['+5 a CA hasta el inicio del próximo turno', 'Si el ataque falla gracias al escudo, el atacante recibe 1d4 daño de fuerza', 'Bloquea proyectiles mágicos de nivel 1 automáticamente'],
    imagePrompt: 'glowing dwarven runes forming a shield in the air, golden runic symbols, warrior behind magical barrier, classic epic fantasy fantasy art, dramatic',
    tags: ['abjuración', 'defensa', 'reacción', 'enano'],
  },
  {
    slug: 'invocar-aguilas', name: 'Invocar Águilas', lore: 'LOTR', loreName: 'Tierra del Ocaso',
    level: 7, school: 'Conjuración', castingTime: '1 minuto', range: '1 milla', duration: '1 hora',
    description: 'Un llamado resuena a través de las montañas alcanzando a las Grandes Águilas de Manwë. Estas criaturas majestuosas acuden en auxilio, capaces de transportar aliados o atacar desde los cielos.',
    effects: ['Invoca 1d4 Grandes Águilas que obedecen comandos simples', 'Cada águila puede transportar 1 criatura mediana', 'Las águilas atacan con garras: 3d6+5 cortante', 'Las águilas se retiran si bajan a menos del 25% de HP'],
    imagePrompt: 'great eagles of manwe descending from mountain peaks, massive wingspan, golden sunlight, epic classic epic fantasy fantasy painting, majestic birds',
    tags: ['conjuración', 'invocación', 'transporte', 'épico'],
  },
]

// Hechizos del Apocalipsis Zombie
const ZOMBIE_SPELLS: Spell[] = [
  {
    slug: 'primeros-auxilios', name: 'Primeros Auxilios', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    level: 0, school: 'Supervivencia', castingTime: '1 acción', range: 'Toque', duration: 'Instantáneo',
    description: 'Con vendas improvisadas y desinfectante escaso, estabilizás a un compañero herido. No es cirugía, pero en el apocalipsis es la diferencia entre vivir y morir desangrado.',
    effects: ['Cura 1d6+2 HP al objetivo', 'Estabiliza a un aliado a 0 HP', 'Requiere kit de primeros auxilios (consumible)'],
    imagePrompt: 'survivor bandaging wound in dark shelter, makeshift first aid kit, gritty post-apocalyptic photography, dim flashlight',
    tags: ['supervivencia', 'curación', 'toque', 'básico'],
  },
  {
    slug: 'adrenalina', name: 'Adrenalina', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    level: 1, school: 'Supervivencia', castingTime: 'Acción bonus', range: 'Personal', duration: '3 turnos',
    description: 'Tu cuerpo libera una descarga de adrenalina pura. Todo se vuelve más lento a tu alrededor, tus reflejos se agudizan y el dolor desaparece temporalmente.',
    effects: ['+2 a DEX y velocidad de movimiento duplicada por 3 turnos', 'Inmune a la condición aterrorizado', 'Al terminar: 1 nivel de agotamiento'],
    imagePrompt: 'survivor in adrenaline rush, motion blur background, intense focus in eyes, zombie horde behind, dark cinematic photography',
    tags: ['supervivencia', 'buff', 'temporal', 'riesgo'],
  },
  {
    slug: 'camuflaje-improvisado', name: 'Camuflaje Improvisado', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    level: 1, school: 'Supervivencia', castingTime: '1 minuto', range: 'Personal', duration: '30 minutos',
    description: 'Te cubrís con vísceras y barro podrido para oler como ellos. Los caminantes te ignoran mientras no hagas ruido ni movimientos bruscos. Repugnante pero efectivo.',
    effects: ['Los zombies comunes te ignoran completamente', 'Movimiento reducido a la mitad (movimientos lentos)', 'Cualquier ataque o acción brusca rompe el camuflaje', 'Corredores y Alfas detectan con CD 14 Percepción'],
    imagePrompt: 'survivor covered in zombie guts and mud, walking among zombies, tense stealth scene, desaturated gritty horror photography',
    tags: ['supervivencia', 'sigilo', 'disfraz', 'riesgo'],
  },
  {
    slug: 'grito-de-alerta', name: 'Grito de Alerta', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    level: 0, school: 'Supervivencia', castingTime: 'Reacción', range: '120 pies', duration: 'Instantáneo',
    description: 'Un grito fuerte y claro que alerta a tus compañeros de un peligro inminente. Puede salvar vidas, pero también atrae a todos los infectados en kilómetros a la redonda.',
    effects: ['Todos los aliados en 120 pies obtienen +5 a iniciativa', 'Los aliados no pueden ser sorprendidos este turno', 'Todos los zombies en 500 pies se dirigen a tu posición en 1d4 turnos'],
    imagePrompt: 'survivor screaming warning to group, abandoned warehouse, zombies turning toward sound, intense dark horror photography',
    tags: ['supervivencia', 'alerta', 'riesgo', 'área'],
  },
  {
    slug: 'reparacion-rapida', name: 'Reparación Rápida', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    level: 1, school: 'Supervivencia', castingTime: '1 acción', range: 'Toque', duration: 'Permanente',
    description: 'Con cinta adhesiva, alambre y creatividad desesperada, reparás un arma rota o reforzás una barricada. No es elegante, pero aguanta lo suficiente.',
    effects: ['Repara un arma o equipo roto (funciona con penalización -1)', 'Refuerza una barricada: +10 HP a la estructura', 'Requiere materiales de chatarra (consumible)'],
    imagePrompt: 'hands repairing weapon with duct tape and wire, workbench with scavenged parts, dark shelter, gritty post-apocalyptic photography',
    tags: ['supervivencia', 'utilidad', 'crafting', 'equipo'],
  },
  {
    slug: 'fortaleza-mental', name: 'Fortaleza Mental', lore: 'ZOMBIES', loreName: 'Apocalipsis Zombie',
    level: 2, school: 'Supervivencia', castingTime: '1 acción', range: 'Personal', duration: '1 hora',
    description: 'Cerrás los ojos, respirás hondo y bloqueás el horror. El trauma no desaparece, pero lo empujás lo suficientemente profundo como para seguir funcionando un rato más.',
    effects: ['Inmune a efectos de miedo y pánico por 1 hora', '+2 a tiradas de WIS y resistencia mental', 'Al terminar: CD 12 WIS o sufrir pesadillas en el próximo descanso'],
    imagePrompt: 'survivor meditating in dark room, eyes closed, calm face amid chaos, soft light through boarded window, cinematic photography',
    tags: ['supervivencia', 'mental', 'buff', 'temporal'],
  },
]

// Hechizos de la Saga Vikinga
const VIKING_SPELLS: Spell[] = [
  {
    slug: 'bendicion-de-odin', name: 'Bendición de Odín', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    level: 3, school: 'Adivinación', castingTime: '1 acción', range: 'Personal', duration: '1 hora',
    description: 'Invocás al Padre de Todo para que comparta su sabiduría. Un ojo se ilumina con luz azul mientras recibís fragmentos de conocimiento que no deberías poseer.',
    effects: ['Ventaja en todas las tiradas de INT y WIS por 1 hora', 'Podés hacer una pregunta al DM y recibir una respuesta críptica pero verdadera', 'Visión de verdad: detectás mentiras automáticamente durante la duración'],
    imagePrompt: 'viking warrior with one glowing blue eye, ravens flying overhead, norse runes floating, dark stormy sky, norse mythology epic painting',
    tags: ['adivinación', 'sabiduría', 'buff', 'divino'],
  },
  {
    slug: 'furia-del-berserker', name: 'Furia del Berserker', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    level: 2, school: 'Transmutación', castingTime: 'Acción bonus', range: 'Personal', duration: '1 minuto',
    description: 'La furia sagrada de los berserker consume tu mente. Tus ojos se inyectan en sangre, tus músculos se hinchan y el dolor se convierte en combustible. No distinguís amigo de enemigo.',
    effects: ['+4 a STR y CON, resistencia a daño contundente, cortante y perforante', 'Debes atacar a la criatura más cercana cada turno (amigo o enemigo)', 'No podés lanzar hechizos ni usar tácticas complejas', 'Al terminar: 2 niveles de agotamiento'],
    damage: '+2d6 en cada ataque cuerpo a cuerpo',
    imagePrompt: 'berserker viking warrior in blood rage, veins bulging, wild eyes, bear pelt, battlefield chaos, norse epic dark painting',
    tags: ['transmutación', 'buff', 'ofensivo', 'riesgo'],
  },
  {
    slug: 'runa-de-proteccion', name: 'Runa de Protección', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    level: 1, school: 'Abjuración', castingTime: '1 minuto', range: 'Toque', duration: '8 horas',
    description: 'Grabás una runa protectora en un escudo, armadura o umbral. La marca brilla con un tenue azul y repele el primer ataque significativo que reciba el portador.',
    effects: ['La primera vez que el portador recibiría daño, la runa lo absorbe completamente (hasta 20 de daño)', 'La runa se destruye después de absorber el golpe', 'Solo puede haber una runa activa por objeto'],
    imagePrompt: 'glowing norse rune carved on viking shield, blue magical light, snow falling, dark nordic landscape, norse mythology art',
    tags: ['abjuración', 'protección', 'runa', 'uso-único'],
  },
  {
    slug: 'invocar-tormenta', name: 'Invocar Tormenta', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    level: 5, school: 'Evocación', castingTime: '1 acción (concentración)', range: '300 pies', duration: 'Concentración, hasta 10 minutos',
    description: 'Alzás tu arma al cielo y rogás a Thor que desate su furia. Nubes negras se arremolinan, el viento aúlla y rayos caen donde señalás con tu voluntad.',
    effects: ['Cada turno podés dirigir un rayo a un punto: 4d10 daño eléctrico, CD 16 DEX mitad', 'Viento huracanado: movimiento reducido a la mitad para todos en el área', 'Lluvia torrencial: visibilidad reducida, desventaja en ataques a distancia', 'En el mar: olas de 6 metros amenazan embarcaciones'],
    damage: '4d10 eléctrico por rayo',
    imagePrompt: 'viking summoning lightning storm, raised hammer, dark clouds swirling, lightning bolts striking ground, epic norse mythology painting',
    tags: ['evocación', 'área', 'clima', 'concentración', 'épico'],
  },
  {
    slug: 'curar-con-seidr', name: 'Curar con Seiðr', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    level: 2, school: 'Nigromancia', castingTime: '1 acción', range: 'Toque', duration: 'Instantáneo',
    description: 'Usando la magia femenina del Seiðr, tejés hilos de destino para cerrar heridas y purificar venenos. Los escaldos cantan que Freyja enseñó esta magia a Odín mismo.',
    effects: ['Cura 2d10+WIS HP al objetivo tocado', 'Remueve la condición envenenado o enfermo', 'Si el objetivo está a 0 HP, se estabiliza con 1 HP'],
    imagePrompt: 'norse seidr magic healing ritual, glowing threads of fate, völva healer with staff, runes in the air, norse mythology art',
    tags: ['nigromancia', 'curación', 'toque', 'seiðr'],
  },
  {
    slug: 'ojo-del-cuervo', name: 'Ojo del Cuervo', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    level: 1, school: 'Adivinación', castingTime: '1 acción', range: '1 milla', duration: '10 minutos',
    description: 'Tus ojos se vuelven negros como los de Huginn y Muninn mientras tu visión se proyecta a través de un cuervo cercano. Ves lo que el cuervo ve, pero tu cuerpo queda indefenso.',
    effects: ['Ves a través de los ojos de un cuervo a hasta 1 milla de distancia', 'Podés dirigir el vuelo del cuervo', 'Tu cuerpo queda inconsciente y vulnerable durante la duración', 'Si el cuervo es dañado, el hechizo termina y sufrís 1d6 daño psíquico'],
    imagePrompt: 'viking with black eyes seeing through raven, split vision effect, snowy landscape from above, norse mythology dark art',
    tags: ['adivinación', 'exploración', 'sensorial', 'riesgo'],
  },
  {
    slug: 'marca-de-tyr', name: 'Marca de Tyr', lore: 'VIKINGOS', loreName: 'Saga Vikinga',
    level: 3, school: 'Evocación', castingTime: '1 acción', range: '60 pies', duration: '1 minuto',
    description: 'La runa de Tyr, dios de la justicia y la guerra, aparece brillando sobre un enemigo. El marcado no puede huir ni esconderse, y cada golpe que recibe arde con fuego divino.',
    effects: ['El objetivo marcado no puede volverse invisible ni teletransportarse', 'Todos los ataques contra el marcado hacen 1d6 daño radiante adicional', 'El lanzador siempre sabe la ubicación exacta del marcado', 'El marcado tiene desventaja en ataques contra el lanzador'],
    imagePrompt: 'glowing tyr rune mark on enemy warrior, divine judgment light, battlefield, norse mythology epic painting, golden rune',
    tags: ['evocación', 'marca', 'ofensivo', 'divino', 'justicia'],
  },
]

// Hechizos del Mundo Isekai
const ISEKAI_SPELLS: Spell[] = [
  {
    slug: 'bola-de-fuego', name: 'Bola de Fuego', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    level: 3, school: 'Evocación', castingTime: '1 acción', range: '150 pies', duration: 'Instantáneo',
    description: 'Un punto de luz surge de tu dedo y viaja hasta el objetivo donde explota en una esfera de llamas. El hechizo más clásico de cualquier mundo de fantasía, y en este isekai no es la excepción.',
    effects: ['Todos en esfera de 20 pies de radio deben tirar CD 14 DEX', 'Fallo: daño completo. Éxito: mitad de daño', 'Inflama materiales combustibles no portados'],
    damage: '8d6 fuego',
    imagePrompt: 'anime style fireball explosion, mage casting with dramatic pose, vibrant orange flames, fantasy world, studio ghibli inspired illustration',
    tags: ['evocación', 'área', 'fuego', 'daño', 'clásico'],
  },
  {
    slug: 'curacion-mayor', name: 'Curación Mayor', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    level: 4, school: 'Evocación', castingTime: '1 acción', range: '30 pies', duration: 'Instantáneo',
    description: 'Un aura dorada envuelve al objetivo mientras sus heridas se cierran y sus huesos se sueldan. Es el hechizo que todo grupo de aventureros necesita y que los sanadores siempre tienen preparado.',
    effects: ['Cura 5d8+WIS HP al objetivo', 'Remueve hasta 2 condiciones negativas (envenenado, cegado, ensordecido, paralizado)', 'Puede usarse a distancia sin necesidad de toque'],
    imagePrompt: 'anime healer casting golden healing spell, warm light surrounding wounded warrior, magical particles, vibrant fantasy, ghibli style',
    tags: ['evocación', 'curación', 'restauración', 'distancia'],
  },
  {
    slug: 'teletransporte', name: 'Teletransporte', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    level: 7, school: 'Conjuración', castingTime: '1 acción', range: 'Toque (grupo)', duration: 'Instantáneo',
    description: 'Un círculo mágico brillante aparece bajo tus pies y en un destello de luz transporta a todo el grupo a un lugar conocido. Cuanto menos conozcas el destino, mayor el riesgo de error.',
    effects: ['Transporta al lanzador y hasta 8 criaturas a un lugar conocido', 'Lugar muy familiar: sin riesgo', 'Lugar visto una vez: CD 14 INT o desviación 1d10 millas', 'Solo descripción: CD 18 INT o ubicación aleatoria'],
    imagePrompt: 'anime teleportation magic circle glowing on ground, party of adventurers being transported, bright light pillar, vibrant isekai fantasy',
    tags: ['conjuración', 'transporte', 'utilidad', 'épico'],
  },
  {
    slug: 'barrera-magica', name: 'Barrera Mágica', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    level: 2, school: 'Abjuración', castingTime: 'Reacción', range: 'Personal (10 pies)', duration: '1 turno',
    description: 'Un escudo translúcido de energía mágica se materializa frente a vos, bloqueando ataques entrantes. El clásico escudo mágico que todo protagonista isekai aprende temprano.',
    effects: ['Bloquea hasta 30 puntos de daño de cualquier fuente', 'Si el daño excede 30, el exceso pasa al lanzador', 'Puede proteger a aliados a 10 pies en la misma dirección'],
    imagePrompt: 'anime magical barrier shield, translucent hexagonal energy shield, mage concentrating, incoming attack deflected, vibrant isekai style',
    tags: ['abjuración', 'defensa', 'reacción', 'protección'],
  },
  {
    slug: 'rayo-sagrado', name: 'Rayo Sagrado', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    level: 1, school: 'Evocación', castingTime: '1 acción', range: '120 pies', duration: 'Instantáneo',
    description: 'Un rayo de luz divina cae del cielo sobre el enemigo designado. Especialmente devastador contra criaturas oscuras y no-muertos. El ataque preferido de los clérigos isekai.',
    effects: ['Ataque a distancia con hechizo contra un objetivo', 'Daño doble contra no-muertos y demonios', 'Si mata al objetivo, explota en luz que cura 1d4 HP a aliados en 10 pies'],
    damage: '3d8 radiante',
    imagePrompt: 'anime holy ray of light from sky striking dark creature, golden divine energy, dramatic angle, vibrant fantasy illustration',
    tags: ['evocación', 'radiante', 'anti-no-muerto', 'divino'],
  },
  {
    slug: 'invocacion-de-familiar', name: 'Invocación de Familiar', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    level: 1, school: 'Conjuración', castingTime: '10 minutos (ritual)', range: '10 pies', duration: 'Permanente',
    description: 'Un círculo de invocación brilla en el suelo y de él emerge una criatura mágica que se vincula a tu alma. Tu familiar puede ser un pequeño dragón, un espíritu elemental o una criatura fantástica.',
    effects: ['Invoca un familiar permanente (elegir tipo: dragón pequeño, espíritu, felino mágico, etc.)', 'Comunicación telepática a 100 pies', 'Podés ver a través de los sentidos del familiar como acción', 'Si el familiar muere, puede ser reinvocado con 10 minutos y componentes'],
    imagePrompt: 'anime summoning circle with cute magical familiar emerging, small dragon or spirit creature, sparkles and magic runes, isekai fantasy',
    tags: ['conjuración', 'invocación', 'ritual', 'permanente', 'compañero'],
  },
  {
    slug: 'metamorfosis', name: 'Metamorfosis', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    level: 4, school: 'Transmutación', castingTime: '1 acción', range: 'Personal', duration: '1 hora',
    description: 'Tu cuerpo se transforma completamente en otra criatura. Ganás sus capacidades físicas pero mantenés tu mente. Un hechizo de alto riesgo que los protagonistas isekai usan en momentos desesperados.',
    effects: ['Te transformás en cualquier bestia de CR igual o menor a tu nivel', 'Tus HP se reemplazan por los de la bestia', 'Mantenés tu INT, WIS y CHA', 'Si los HP de la bestia llegan a 0, volvés a tu forma con tus HP restantes'],
    imagePrompt: 'anime magical transformation sequence, character morphing into dragon, energy swirling, dramatic pose, vibrant isekai fantasy art',
    tags: ['transmutación', 'transformación', 'versatil', 'concentración'],
  },
  {
    slug: 'resurreccion', name: 'Resurrección', lore: 'ISEKAI', loreName: 'Mundo Isekai',
    level: 9, school: 'Nigromancia', castingTime: '1 hora (ritual)', range: 'Toque', duration: 'Instantáneo',
    description: 'El hechizo definitivo que desafía a la muerte misma. Requiere un enorme sacrificio de energía vital y componentes raros, pero devuelve a un alma del más allá a su cuerpo.',
    effects: ['Devuelve a la vida a una criatura muerta hace menos de 10 días', 'El objetivo revive con 1 HP y sin condiciones negativas', 'El lanzador sufre 4 niveles de agotamiento', 'No funciona si el alma no desea volver o fue destruida', 'Componente: gema del alma (valor 5000 monedas de oro)'],
    imagePrompt: 'anime resurrection ritual, massive glowing magic circle, soul returning to body, celestial light, emotional scene, epic isekai fantasy',
    tags: ['nigromancia', 'resurrección', 'ritual', 'legendario', 'épico'],
  },
]

// Hechizos de space opera
const STARWARS_SPELLS: Spell[] = [
  {
    slug: 'empujon-de-fuerza', name: 'Empujón de Fuerza', lore: 'STAR_WARS', loreName: 'space opera',
    level: 1, school: 'La Corriente (Telekinesis)', castingTime: '1 acción', range: '60 pies', duration: 'Instantáneo',
    description: 'Extendés la mano y canalizás la Corriente para empujar a un enemigo con violencia. Los objetos salen volando, los enemigos son lanzados hacia atrás y las paredes se agrietan.',
    effects: ['El objetivo debe superar CD 14 STR o es empujado 20 pies', 'Si choca contra una superficie sólida, recibe 2d6 daño contundente adicional', 'Puede afectar objetos de hasta 500 kg'],
    damage: '2d8 fuerza',
    imagePrompt: 'vael using force push, energy wave from extended hand, enemy flying backwards, debris in air, space opera cinematic lighting',
    tags: ['telekinesis', 'control', 'fuerza', 'lado-luminoso'],
  },
  {
    slug: 'truco-mental-vael', name: 'Truco Mental Vael', lore: 'STAR_WARS', loreName: 'space opera',
    level: 2, school: 'La Corriente (Control Mental)', castingTime: '1 acción', range: '30 pies', duration: '1 minuto',
    description: 'Con un sutil movimiento de la mano, implantás una sugerencia en la mente del objetivo. "Estos no son los autómatas que buscan." Solo funciona en mentes débiles.',
    effects: ['El objetivo debe superar CD 15 WIS o acepta una sugerencia razonable', 'No funciona en criaturas con INT 20+ o entrenadas contra manipulación mental', 'El objetivo no recuerda haber sido influenciado', 'Duración máxima 1 minuto o hasta que la sugerencia se cumpla'],
    imagePrompt: 'vael performing mind trick, subtle hand wave, confused soldado del Dominio, space opera setting, cinematic blue lighting',
    tags: ['control-mental', 'social', 'fuerza', 'lado-luminoso', 'sutil'],
  },
  {
    slug: 'estrangulamiento', name: 'Estrangulamiento (Dark Side)', lore: 'STAR_WARS', loreName: 'space opera',
    level: 3, school: 'La Corriente (Lado Oscuro)', castingTime: '1 acción (concentración)', range: '60 pies', duration: 'Concentración, hasta 1 minuto',
    description: 'Cerrás el puño y la Corriente aprieta la garganta del objetivo. Un poder del Lado Oscuro que corrompe a quien lo usa, pero es devastadoramente efectivo contra un solo enemigo.',
    effects: ['El objetivo queda agarrado y no puede hablar ni respirar', 'Cada turno: daño automático sin tirada de ataque', 'El objetivo puede intentar liberarse con CD 16 STR al inicio de su turno', 'El lanzador gana 1 punto de Lado Oscuro por uso'],
    damage: '3d6 necrótico por turno',
    imagePrompt: 'sith lord force choking victim, raised clenched fist, dark side red energy, victim levitating and gasping, space opera dark cinematic',
    tags: ['lado-oscuro', 'control', 'concentración', 'daño-continuo', 'corrupción'],
  },
  {
    slug: 'deflectar-blaster', name: 'Deflectar Blaster', lore: 'STAR_WARS', loreName: 'space opera',
    level: 0, school: 'La Corriente (Combate)', castingTime: 'Reacción', range: 'Personal', duration: 'Instantáneo',
    description: 'Usando la Corriente y tu hoja de plasma, deflectás un disparo de blaster. Con suficiente habilidad, podés redirigir el tiro de vuelta al atacante.',
    effects: ['Reduce el daño de un ataque a distancia en 1d10+DEX+nivel', 'Si el daño se reduce a 0, podés redirigir el disparo a un objetivo a 60 pies', 'El ataque redirigido usa tu modificador de Fuerza', 'Requiere hoja de plasma o similar'],
    imagePrompt: 'vael deflecting blaster bolt with plasma blade, green blade, energy reflection, dynamic action pose, space opera cinematic',
    tags: ['combate', 'defensa', 'reacción', 'sable-de-luz'],
  },
  {
    slug: 'vision-de-la-fuerza', name: 'Visión de la Corriente', lore: 'STAR_WARS', loreName: 'space opera',
    level: 3, school: 'La Corriente (Percepción)', castingTime: '10 minutos (meditación)', range: 'Ilimitado', duration: 'Instantáneo',
    description: 'En meditación profunda, la Corriente te muestra visiones del futuro, fragmentos de lo que fue y lo que podría ser. Las visiones son crípticas y siempre están en movimiento.',
    effects: ['Recibís una visión críptica sobre un evento futuro relevante', 'El DM revela una pista verdadera pero ambigua sobre la trama', 'Podés buscar a una persona específica: sabés su estado general y dirección', 'Las visiones pueden ser perturbadoras: CD 12 WIS o 1d4 daño psíquico'],
    imagePrompt: 'vael meditating with force visions, swirling images of future events, ethereal blue glow, space opera mystical scene',
    tags: ['percepción', 'adivinación', 'ritual', 'narrativo'],
  },
  {
    slug: 'curacion-con-la-fuerza', name: 'Curación con la Corriente', lore: 'STAR_WARS', loreName: 'space opera',
    level: 2, school: 'La Corriente (Sanación)', castingTime: '1 acción', range: 'Toque', duration: 'Instantáneo',
    description: 'Colocás tus manos sobre la herida y canalizás la energía de la Corriente para acelerar la curación natural. Un poder raro que pocos Vael dominan, que transfiere vitalidad del sanador al herido.',
    effects: ['Cura 3d8 HP al objetivo tocado', 'El lanzador pierde HP igual a la mitad de lo curado', 'Puede estabilizar a un aliado moribundo sin perder HP'],
    imagePrompt: 'vael healing with force, glowing hands over wound, golden light transfer, peaceful expression, space opera cinematic warm lighting',
    tags: ['sanación', 'curación', 'toque', 'lado-luminoso', 'sacrificio'],
  },
  {
    slug: 'rayo-de-fuerza', name: 'Rayo de Fuerza', lore: 'STAR_WARS', loreName: 'space opera',
    level: 5, school: 'La Corriente (Lado Oscuro)', castingTime: '1 acción', range: '60 pies (línea)', duration: 'Instantáneo',
    description: 'Relámpagos azules brotan de tus dedos destruyendo todo a su paso. El arma definitiva de los Umbra, capaz de derribar a los más poderosos guerreros. Su uso corrompe profundamente.',
    effects: ['Línea de 60 pies, todos deben tirar CD 17 DEX', 'Un hoja de plasma puede bloquear: reacción + CD 15 DEX para redirigir', 'El lanzador gana 2 puntos de Lado Oscuro', 'Puede sostenerse como acción en turnos siguientes por mitad de daño'],
    damage: '6d8 eléctrico',
    imagePrompt: 'sith force lightning from fingertips, blue-purple electric arcs, dark hooded figure, dramatic space opera dark side art',
    tags: ['lado-oscuro', 'daño', 'línea', 'corrupción', 'épico'],
  },
]

// Hechizos Cyberpunk
const CYBERPUNK_SPELLS: Spell[] = [
  {
    slug: 'hackeo-rapido', name: 'Hackeo Rápido', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    level: 0, school: 'Netrunning', castingTime: '1 acción', range: '30 pies (conexión inalámbrica)', duration: 'Instantáneo',
    description: 'Accedés a un dispositivo electrónico cercano y ejecutás un comando rápido: abrir una puerta, apagar cámaras, activar distracciones. Lo básico de cualquier netrunner de calle.',
    effects: ['Hackea un dispositivo electrónico simple (puertas, cámaras, pantallas)', 'CD 12 para dispositivos civiles, CD 16 para corporativos', 'Deja un rastro digital detectable en 1d4 minutos'],
    imagePrompt: 'cyberpunk hacker interfacing with holographic display, neon green code, dark alley, rain, neon lights reflection, cyberpunk art',
    tags: ['netrunning', 'utilidad', 'tecnología', 'básico'],
  },
  {
    slug: 'cortocircuito', name: 'Cortocircuito', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    level: 2, school: 'Netrunning', castingTime: '1 acción', range: '30 pies', duration: 'Instantáneo',
    description: 'Sobrecargas los implantes cibernéticos de un objetivo, causando un cortocircuito doloroso que fríe circuitos y quema tejido orgánico conectado. Inútil contra objetivos sin implantes.',
    effects: ['Solo funciona contra objetivos con implantes cibernéticos', 'El daño aumenta según cantidad de implantes: +1d6 por implante', 'CD 14 CON o el objetivo pierde su próxima acción por espasmos', 'Los implantes del objetivo no funcionan por 1 turno'],
    damage: '2d8 eléctrico + 1d6 por implante',
    imagePrompt: 'cyberpunk enemy short-circuiting, sparks flying from cybernetic implants, neon-lit street, electric arcs, dark cyberpunk art',
    tags: ['netrunning', 'daño', 'anti-ciborg', 'tecnología'],
  },
  {
    slug: 'contagio-virus', name: 'Contagio (Virus)', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    level: 3, school: 'Netrunning', castingTime: '1 acción', range: '30 pies', duration: '1 minuto',
    description: 'Inyectás un virus informático en la red local que se propaga entre dispositivos conectados. Cada enemigo con implantes en red se convierte en un vector de infección.',
    effects: ['Infecta a un objetivo con implantes en red', 'Al inicio de cada turno del infectado, el virus se propaga a 1 objetivo adyacente con implantes', 'Los infectados sufren daño al inicio de su turno', 'CD 16 INT para purgar el virus como acción'],
    damage: '2d4 eléctrico por turno (a cada infectado)',
    imagePrompt: 'cyberpunk virus spreading through neural network, red digital infection visuals, multiple enemies glitching, dark neon atmosphere',
    tags: ['netrunning', 'daño-continuo', 'propagación', 'área'],
  },
  {
    slug: 'reinicio-de-sistema', name: 'Reinicio de Sistema', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    level: 4, school: 'Netrunning', castingTime: '1 acción', range: 'Toque', duration: 'Instantáneo',
    description: 'Forzás un reinicio completo de todos los sistemas cibernéticos de un objetivo. El cuerpo se queda sin implantes activos durante un momento crítico — como si fuera completamente orgánico.',
    effects: ['Todos los implantes del objetivo se desactivan por 1d4 turnos', 'El objetivo pierde todos los bonuses de implantes cibernéticos', 'Si el objetivo depende de implantes para vivir (corazón artificial, etc.): CD 16 CON o cae a 0 HP', 'Requiere toque físico o conexión directa'],
    imagePrompt: 'cyberpunk full system reboot, victim with all implants shutting down, holographic error screens, falling to knees, dark neon',
    tags: ['netrunning', 'debuff', 'anti-ciborg', 'devastador'],
  },
  {
    slug: 'ping-de-red', name: 'Ping de Red', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    level: 0, school: 'Netrunning', castingTime: 'Acción bonus', range: '100 pies', duration: '1 minuto',
    description: 'Enviás un ping a la red local que revela todos los dispositivos conectados: cámaras, implantes, drones, terminales. Como un sonar digital que mapea la infraestructura enemiga.',
    effects: ['Revela todos los dispositivos electrónicos y cibernéticos en 100 pies', 'Conocés la cantidad y tipo de implantes de cada enemigo detectado', 'Los objetivos detectados no pueden beneficiarse de cobertura digital', 'El ping es detectable: los netrunners enemigos saben que estás ahí'],
    imagePrompt: 'cyberpunk network ping visualization, holographic radar pulse, highlighted devices and enemies, neon wireframe overlay, cyber art',
    tags: ['netrunning', 'detección', 'utilidad', 'básico', 'información'],
  },
  {
    slug: 'sobrecarga-de-implante', name: 'Sobrecarga de Implante', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    level: 5, school: 'Netrunning', castingTime: '1 acción', range: '60 pies', duration: 'Instantáneo',
    description: 'Tomás control de un implante específico y lo llevás más allá de sus límites. Un brazo cibernético que se cierra sobre su propio usuario, un ojo que dispara su laser hacia adentro.',
    effects: ['Elegís un implante visible del objetivo y lo sobrecargás', 'Implante de arma: se dispara contra el usuario, daño normal del arma', 'Implante de movimiento: el objetivo se mueve 30 pies en dirección que elegís', 'Implante neural: CD 18 CON o inconsciente por 1 turno'],
    damage: 'Variable según implante',
    imagePrompt: 'cyberpunk implant overload, cybernetic arm attacking its own user, sparks and electricity, dramatic neon lighting, dark cyber art',
    tags: ['netrunning', 'control', 'anti-ciborg', 'épico', 'devastador'],
  },
  {
    slug: 'camara-lenta-sandevistan', name: 'Cámara Lenta (Sandevistan)', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    level: 3, school: 'Implante', castingTime: 'Acción bonus', range: 'Personal', duration: '2 turnos',
    description: 'Activás el Sandevistan, un implante de columna que acelera tus reflejos a niveles sobrehumanos. El mundo se ralentiza a tu alrededor. Dos segundos se sienten como veinte.',
    effects: ['Obtenes una acción adicional cada turno por 2 turnos', '+5 a CA (esquivás balas literalmente)', 'Ventaja en todas las tiradas de DEX', 'Al terminar: CD 14 CON o 2 niveles de agotamiento por sobrecarga neural'],
    imagePrompt: 'cyberpunk sandevistan activation, time slowing down, bullets frozen in air, character moving at super speed, motion trails, neon',
    tags: ['implante', 'buff', 'velocidad', 'riesgo', 'épico'],
  },
  {
    slug: 'escudo-cibernetico', name: 'Escudo Cibernético', lore: 'CYBERPUNK', loreName: 'Cyberpunk',
    level: 1, school: 'Implante', castingTime: 'Reacción', range: 'Personal', duration: '1 turno',
    description: 'Un campo de energía se proyecta desde tu implante de antebrazo, creando una barrera translúcida que absorbe impactos. Tecnología militar de última generación, ahora en el mercado negro.',
    effects: ['Activás un escudo de energía que otorga +4 a CA hasta tu próximo turno', 'Absorbe los primeros 10 puntos de daño de cualquier fuente', 'Requiere 1 turno de recarga antes de poder usarse de nuevo'],
    imagePrompt: 'cyberpunk energy shield from arm implant, translucent blue hexagonal barrier, bullets stopping mid-air, neon city background',
    tags: ['implante', 'defensa', 'reacción', 'tecnología'],
  },
]

// Hechizos de Horrores Cósmicos (Lovecraft)
const LOVECRAFT_SPELLS: Spell[] = [
  {
    slug: 'invocar-entidad', name: 'Invocar Entidad', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    level: 7, school: 'Conjuración Prohibida', castingTime: '1 hora (ritual)', range: '30 pies', duration: '1d4 turnos',
    description: 'Un ritual blasfemo que abre una grieta entre dimensiones y atrae la atención de algo que no debería existir. La entidad invocada no obedece — negocia, y el precio siempre es demasiado alto.',
    effects: ['Invoca una entidad menor de los Mitos (el DM elige cuál)', 'La entidad no es controlada: requiere negociación o sacrificio', 'Todos los presentes deben tirar CD 16 WIS o sufrir 1d6 cordura', 'Si la negociación falla, la entidad ataca al invocador primero', 'El lanzador envejece 1d10 años'],
    imagePrompt: 'lovecraftian summoning ritual, tentacled entity emerging from portal, cultists in robes, eldritch symbols, cosmic horror dark art',
    tags: ['conjuración', 'ritual', 'peligroso', 'cordura', 'épico'],
  },
  {
    slug: 'senal-de-koth', name: 'Señal de Koth', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    level: 3, school: 'Abjuración Arcana', castingTime: '1 acción', range: '30 pies', duration: '24 horas',
    description: 'Trazás en el aire el símbolo arcano conocido como la Señal de Koth, usado por brujos ancestrales para sellar portales y contener entidades. La señal brilla con una luz enfermiza.',
    effects: ['Sella un portal o entrada dimensional en 30 pies', 'Criaturas extraplanares no pueden cruzar la señal', 'Criaturas de los Mitos con CR 10+ pueden intentar romperla: CD 18 CHA', 'El lanzador pierde 1d4 cordura al trazar la señal'],
    imagePrompt: 'elder sign of koth glowing sickly green in the air, portal being sealed, lovecraftian symbols, dark occult atmosphere, cosmic horror',
    tags: ['abjuración', 'sello', 'protección', 'portal', 'cordura'],
  },
  {
    slug: 'contactar-sonador', name: 'Contactar Soñador', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    level: 2, school: 'Adivinación Onírica', castingTime: '10 minutos (ritual de sueño)', range: 'Ilimitado', duration: 'Hasta despertar',
    description: 'Entrás en las Tierras del Sueño para buscar a otro soñador o explorar ciudades imposibles. El tiempo fluye distinto allí, y no todo lo que encontrás quiere dejarte volver.',
    effects: ['Entrás en las Tierras del Sueño de Lovecraft', 'Podés contactar a cualquier criatura que esté durmiendo en cualquier lugar', 'Lo que ocurre en el sueño puede causar daño real: todo el daño recibido se aplica al despertar', 'CD 14 WIS para despertar voluntariamente antes de tiempo'],
    imagePrompt: 'dreamlands of lovecraft, impossible architecture, floating cities, surreal landscape, dreamer walking through cosmic scenery, dark fantasy art',
    tags: ['adivinación', 'sueño', 'comunicación', 'ritual', 'exploración'],
  },
  {
    slug: 'polvo-del-sueno', name: 'Polvo del Sueño', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    level: 1, school: 'Encantamiento Onírico', castingTime: '1 acción', range: '20 pies (cono)', duration: '1 minuto',
    description: 'Soplás un polvo iridiscente extraído de las Tierras del Sueño que sumerge a las víctimas en un sopor profundo. Los dormidos tienen pesadillas que pueden revelar verdades ocultas.',
    effects: ['Todas las criaturas en un cono de 20 pies deben tirar CD 13 WIS', 'Fallo: caen dormidas por 1 minuto', 'Se despiertan si reciben daño o alguien usa una acción para sacudirlas', 'Las criaturas dormidas tienen visiones crípticas: el DM revela una pista menor'],
    imagePrompt: 'iridescent dream powder being blown from hand, sleeping victims with troubled expressions, surreal wisps, lovecraftian dark atmosphere',
    tags: ['encantamiento', 'sueño', 'control', 'área', 'información'],
  },
  {
    slug: 'destierro', name: 'Destierro', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    level: 5, school: 'Abjuración Prohibida', castingTime: '1 acción', range: '60 pies', duration: 'Permanente (si se concentra 1 minuto)',
    description: 'Pronunciás las palabras de destierro que envían a una criatura de vuelta a su plano de origen. Contra entidades de los Mitos, el esfuerzo mental es devastador y puede destruir tu cordura.',
    effects: ['El objetivo debe superar CD 17 CHA o es desterrado a su plano de origen', 'Si concentrás por 1 minuto completo, el destierro es permanente', 'Contra criaturas de los Mitos: el lanzador pierde 2d6 cordura independientemente del resultado', 'No funciona contra Primigenios (Cthulhu, Nyarlathotep, etc.)'],
    imagePrompt: 'banishing ritual against eldritch creature, reality tearing open, entity being pulled into void, cosmic light, lovecraftian horror art',
    tags: ['abjuración', 'destierro', 'anti-entidad', 'cordura', 'concentración'],
  },
  {
    slug: 'barrera-mental', name: 'Barrera Mental', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    level: 2, school: 'Abjuración Psíquica', castingTime: '1 acción', range: 'Personal', duration: '1 hora',
    description: 'Reforzás las murallas de tu mente contra la influencia de lo que acecha más allá del velo. No te hace inmune al horror, pero te da la fuerza para no quebrarte... esta vez.',
    effects: ['Ventaja en todas las tiradas de cordura y contra efectos mentales', 'Resistencia a daño psíquico', 'Si una tirada de cordura falla igualmente, pierdes la mitad de cordura en lugar del total', 'Al terminar la duración: CD 12 WIS o sufres pesadillas (sin beneficio de descanso largo)'],
    imagePrompt: 'mental barrier visualization, mind fortress against cosmic horror, psychic walls cracking but holding, dark eldritch tendrils repelled',
    tags: ['abjuración', 'mental', 'defensa', 'cordura', 'protección'],
  },
  {
    slug: 'ritual-de-proteccion', name: 'Ritual de Protección', lore: 'LOVECRAFT_HORROR', loreName: 'Horrores Cósmicos',
    level: 4, school: 'Abjuración Arcana', castingTime: '10 minutos (ritual)', range: '20 pies (radio)', duration: '8 horas',
    description: 'Dibujás un círculo de protección con sal, símbolos arcanos y sustancias que mejor no identificar. Dentro del círculo, las criaturas de los Mitos no pueden entrar ni afectar a los protegidos.',
    effects: ['Crea un círculo de 20 pies de radio que las criaturas de los Mitos no pueden cruzar', 'Los protegidos dentro tienen ventaja en tiradas de cordura', 'Las criaturas con CR 15+ pueden intentar romper el círculo: CD 20 CHA', 'Si algún protegido sale del círculo, la protección se debilita: CD reducida en 2', 'Requiere componentes específicos: sal, tiza, sangre del lanzador (1d4 daño)'],
    imagePrompt: 'protective ritual circle on floor, arcane symbols glowing, salt lines, group of investigators inside, lovecraftian darkness held at bay',
    tags: ['abjuración', 'ritual', 'protección', 'área', 'grupo'],
  },
]

export const ALL_SPELLS: Spell[] = [
  ...LOTR_SPELLS,
  ...ZOMBIE_SPELLS,
  ...VIKING_SPELLS,
  ...ISEKAI_SPELLS,
  ...STARWARS_SPELLS,
  ...CYBERPUNK_SPELLS,
  ...LOVECRAFT_SPELLS,
]

export function getSpellBySlug(slug: string): Spell | undefined {
  return ALL_SPELLS.find(s => s.slug === slug)
}

export function getSpellsByLore(lore: string): Spell[] {
  return ALL_SPELLS.filter(s => s.lore === lore)
}

export const SPELL_LORE_COLORS: Record<string, string> = {
  LOTR: 'text-gold',
  ZOMBIES: 'text-blood',
  VIKINGOS: 'text-gold-dim',
  ISEKAI: 'text-neon-purple',
  STAR_WARS: 'text-gold-bright',
  CYBERPUNK: 'text-neon-green',
  LOVECRAFT_HORROR: 'text-neon-blue',
}

export const SPELL_SCHOOL_ICONS: Record<string, string> = {
  'Evocación': '🔥',
  'Abjuración': '🛡️',
  'Encantamiento': '✨',
  'Nigromancia': '💀',
  'Conjuración': '🌀',
  'Transmutación': '🔄',
  'Adivinación': '👁️',
  'Supervivencia': '🩹',
  'La Corriente (Telekinesis)': '🤚',
  'La Corriente (Control Mental)': '🧠',
  'La Corriente (Lado Oscuro)': '⚡',
  'La Corriente (Combate)': '⚔️',
  'La Corriente (Percepción)': '👁️',
  'La Corriente (Sanación)': '💛',
  'Netrunning': '💻',
  'Implante': '🦾',
  'Conjuración Prohibida': '🕳️',
  'Abjuración Arcana': '🔮',
  'Adivinación Onírica': '🌙',
  'Encantamiento Onírico': '💤',
  'Abjuración Prohibida': '🚫',
  'Abjuración Psíquica': '🧠',
}

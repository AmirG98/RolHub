export type Locale = 'es' | 'en'

export const translations = {
  es: {
    // Navigation
    nav: {
      campaigns: 'Campañas',
      characters: 'Personajes',
      compendium: 'Compendio',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
    },

    // Home page
    home: {
      title: 'RPG Hub',
      subtitle: 'Tu Dungeon Master Digital',
      description: 'Aventuras de rol narrativo con un DM autónomo impulsado por IA. Elige tu mundo, crea tu personaje y vive historias épicas.',
      startAdventure: 'Comenzar Aventura',
      features: {
        ai: {
          title: 'DM Inteligente',
          description: 'Un narrador que se adapta a tus decisiones',
        },
        worlds: {
          title: 'Mundos Únicos',
          description: 'Desde fantasía medieval hasta apocalipsis zombie',
        },
        multiplayer: {
          title: 'Multijugador',
          description: 'Juega solo o con hasta 8 amigos',
        },
      },
    },

    // Onboarding
    onboarding: {
      chooseLore: {
        title: 'Elige Tu Mundo',
        subtitle: 'Cada universo tiene sus propias reglas, criaturas y misterios',
      },
      chooseMode: {
        title: '¿Cómo Querés Jugar?',
        subtitle: 'Elegí si querés jugar solo o invitar amigos',
        solo: 'Solo',
        soloDesc: 'Aventura en solitario',
        soloDetail: 'Tú y el DM virtual. Perfecto para aprender.',
        withFriends: 'Con Amigos',
        withFriendsDesc: 'Hasta 8 jugadores',
        withFriendsDetail: 'Invita a tus amigos con un código o link.',
      },
      duration: {
        title: 'Duración de la Aventura',
        subtitle: 'Elegí el tipo de experiencia que buscás',
        oneShot: 'Misión Única',
        oneShotDesc: 'Aventura de una sola sesión',
        oneShotDetail: '45-60 minutos de acción concentrada',
        campaign: 'Campaña',
        campaignDesc: 'Historia larga y épica',
        campaignDetail: 'Múltiples sesiones con evolución del personaje',
      },
      engine: {
        title: 'Motor de Reglas',
        subtitle: 'Define cómo se resuelven las acciones',
        storyMode: 'Modo Historia',
        storyModeDesc: 'Sin dados, narrativo puro',
        storyModeDetail: 'Todo se decide por la historia. Ideal para principiantes.',
        pbta: 'Powered by Apocalypse',
        pbtaDesc: '2d6, fallos interesantes',
        pbtaDetail: 'Sistema simple. Los fallos avanzan la historia.',
        yearZero: 'Year Zero Engine',
        yearZeroDesc: 'Pool de d6, supervivencia',
        yearZeroDetail: 'Recursos escasos y decisiones difíciles.',
        dnd: 'D&D 5e',
        dndDesc: 'd20, reglas clásicas',
        dndDetail: 'Sistema tradicional. Para veteranos de rol.',
        recommended: 'Recomendado',
      },
      experience: {
        title: 'Tu Experiencia',
        subtitle: 'Ajustamos tutoriales según tu nivel',
        novice: 'Primera vez',
        noviceDesc: 'Nunca jugué algo así - quiero un tutorial completo',
        casual: 'Jugué RPGs',
        casualDesc: 'Jugué videojuegos RPG como Skyrim o Baldur\'s Gate',
        experienced: 'Jugué D&D',
        experiencedDesc: 'Jugué D&D o similar alguna vez',
        veteran: 'Soy veterano',
        veteranDesc: 'Juego rol regularmente, sé lo que hago',
      },
      archetype: {
        title: 'Elige Tu Arquetipo',
        subtitle: 'en',
        hp: 'HP',
        combat: 'Combate',
        exploration: 'Exploración',
        social: 'Social',
        ability: 'Habilidad',
      },
      buttons: {
        back: '← Volver',
        continue: 'Continuar →',
        startAdventure: 'Comenzar Aventura',
      },
    },

    // Game session
    game: {
      yourTurn: 'Tu turno',
      dmThinking: 'El DM está pensando...',
      typeAction: 'Escribe tu acción...',
      send: 'Enviar',
      party: 'Grupo',
      hp: 'HP',
      level: 'Nivel',
      inventory: 'Inventario',
      conditions: 'Condiciones',
      none: 'Ninguna',
      online: 'En línea',
      offline: 'Desconectado',
      inviteCode: 'Código de invitación',
      copyCode: 'Copiar código',
      copyLink: 'Copiar link',
      copied: '¡Copiado!',
      waiting: 'Esperando jugadores...',
      startGame: 'Iniciar Partida',
      players: 'jugadores',
    },

    // Lobby
    lobby: {
      title: 'Sala de Espera',
      waitingForPlayers: 'Esperando jugadores...',
      shareCode: 'Comparte este código con tus amigos',
      orShareLink: 'O comparte este link',
      players: 'Jugadores',
      ready: 'Listo',
      notReady: 'No listo',
      owner: 'Anfitrión',
      startWhenReady: 'Iniciar cuando todos estén listos',
      minPlayers: 'Mínimo 2 jugadores para comenzar',
    },

    // Characters
    characters: {
      title: 'Tus Personajes',
      noCharacters: 'No tienes personajes todavía',
      createFirst: 'Crea tu primer personaje',
      level: 'Nivel',
      campaign: 'Campaña',
      noCampaign: 'Sin campaña',
    },

    // Join
    join: {
      title: 'Uniéndote a',
      currentCharacter: 'Tu personaje actual',
      continueWith: 'Continuar con este',
      change: 'Cambiar',
      useExisting: 'Usar Personaje Existente',
      createNew: 'Crear Nuevo',
      yourCharacters: 'Tus Personajes de',
      noCharactersForLore: 'No tienes personajes de',
      createFirstForLore: 'Crea tu primer personaje para esta ambientación',
      createCharacter: 'Crear Personaje',
      characterName: 'Nombre de tu personaje',
      namePlaceholder: 'Ingresa el nombre de tu héroe...',
      chooseArchetype: 'Elige tu Arquetipo',
      useThis: 'Usar Este Personaje',
      createAndStart: 'Crear y Comenzar',
      assigning: 'Asignando personaje...',
      creating: 'Creando personaje...',
    },

    // Common
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      back: 'Volver',
      next: 'Siguiente',
      close: 'Cerrar',
      confirm: 'Confirmar',
      yes: 'Sí',
      no: 'No',
      or: 'o',
      and: 'y',
      backToHome: 'Volver al Inicio',
      tryAgain: 'Intentar de nuevo',
      preparing: 'Preparando tu aventura...',
      creatingCharacter: 'Creando tu personaje en',
    },

    // Errors
    errors: {
      notFound: 'No encontrado',
      unauthorized: 'No autorizado',
      sessionNotFound: 'Sesión No Encontrada',
      sessionNotFoundDesc: 'La sesión que buscas no existe o no tienes acceso a ella.',
      campaignNotFound: 'Campaña no encontrada',
      characterNotFound: 'Personaje no encontrado',
      generic: 'Algo salió mal',
      createCharacter: 'Error al crear personaje',
    },

    // Lores
    lores: {
      LOTR: {
        name: 'Tierra Media',
        tagline: 'Las sombras crecen mientras los pueblos libres resisten',
        description: 'Hobbits, elfos, enanos y hombres unen fuerzas contra la oscuridad',
      },
      ZOMBIES: {
        name: 'Apocalipsis Zombie',
        tagline: 'El fin llegó. Los muertos caminan. Sobreviví',
        description: 'Ruinas, recursos escasos y hordas imparables',
      },
      ISEKAI: {
        name: 'Mundo Isekai',
        tagline: 'Fuiste transportado a un mundo de fantasía con magia real',
        description: 'Aventuras, gremios y mazmorras te esperan',
      },
      VIKINGOS: {
        name: 'Saga Vikinga',
        tagline: 'Conquista, gloria y el favor de los dioses',
        description: 'Los dioses son reales. El Valhalla espera a los valientes',
      },
      STAR_WARS: {
        name: 'Guerra de las Galaxias',
        tagline: 'Una galaxia muy, muy lejana llena de aventura',
        description: 'La Fuerza, sables de luz y el Imperio Galáctico',
      },
      CYBERPUNK: {
        name: 'Neón y Cromo',
        tagline: 'Alta tecnología, baja vida en la ciudad del futuro',
        description: 'Megacorporaciones, netrunners y la Red',
      },
      LOVECRAFT_HORROR: {
        name: 'Horrores Cósmicos',
        tagline: 'Hay cosas que la humanidad no debe saber',
        description: 'Años 1920. Investigaciones prohibidas y locura ancestral',
      },
    },

    // Archetype selector
    archetypeSelector: {
      noArchetypes: 'No hay arquetipos disponibles',
      noArchetypesDesc: 'Este mundo no tiene personajes configurados todavía.',
      chooseWhoYouAre: 'Elegí Quién Sos',
      inWorld: 'en',
      archetypeDefines: 'Tu arquetipo define tus habilidades y tu rol en la historia',
      hp: 'Vida',
      combat: 'Combate',
      exploration: 'Exploración',
      social: 'Social',
      stats: 'Estadísticas',
      specialAbility: 'Habilidad Especial',
      startingEquipment: 'Equipamiento Inicial',
      back: '← Volver',
      startAdventure: 'Comenzar Aventura →',
    },

    // Home page extras
    homeExtras: {
      narrator: 'Narrador / Game Master Autónomo',
      systemComplete: 'Sistema completo de juego de rol para cualquier nivel',
      epicAdventures: 'Embárcate en aventuras épicas en mundos infinitos. Desde la Tierra Media hasta galaxias lejanas, tu historia se escribe en tiempo real con un narrador IA que nunca duerme.',
      worlds: 'Mundos',
      available: 'Disponible',
      powered: 'Powered',
    },
  },

  en: {
    // Navigation
    nav: {
      campaigns: 'Campaigns',
      characters: 'Characters',
      compendium: 'Compendium',
      login: 'Login',
      register: 'Register',
    },

    // Home page
    home: {
      title: 'RPG Hub',
      subtitle: 'Your Digital Dungeon Master',
      description: 'Narrative role-playing adventures with an autonomous AI-powered DM. Choose your world, create your character, and live epic stories.',
      startAdventure: 'Start Adventure',
      features: {
        ai: {
          title: 'Smart DM',
          description: 'A narrator that adapts to your decisions',
        },
        worlds: {
          title: 'Unique Worlds',
          description: 'From medieval fantasy to zombie apocalypse',
        },
        multiplayer: {
          title: 'Multiplayer',
          description: 'Play solo or with up to 8 friends',
        },
      },
    },

    // Onboarding
    onboarding: {
      chooseLore: {
        title: 'Choose Your World',
        subtitle: 'Each universe has its own rules, creatures, and mysteries',
      },
      chooseMode: {
        title: 'How Do You Want to Play?',
        subtitle: 'Choose if you want to play solo or invite friends',
        solo: 'Solo',
        soloDesc: 'Solo adventure',
        soloDetail: 'You and the virtual DM. Perfect for learning.',
        withFriends: 'With Friends',
        withFriendsDesc: 'Up to 8 players',
        withFriendsDetail: 'Invite your friends with a code or link.',
      },
      duration: {
        title: 'Adventure Duration',
        subtitle: 'Choose the type of experience you want',
        oneShot: 'One-Shot',
        oneShotDesc: 'Single session adventure',
        oneShotDetail: '45-60 minutes of concentrated action',
        campaign: 'Campaign',
        campaignDesc: 'Long epic story',
        campaignDetail: 'Multiple sessions with character progression',
      },
      engine: {
        title: 'Rules Engine',
        subtitle: 'Defines how actions are resolved',
        storyMode: 'Story Mode',
        storyModeDesc: 'No dice, pure narrative',
        storyModeDetail: 'Everything is decided by the story. Ideal for beginners.',
        pbta: 'Powered by Apocalypse',
        pbtaDesc: '2d6, interesting failures',
        pbtaDetail: 'Simple system. Failures advance the story.',
        yearZero: 'Year Zero Engine',
        yearZeroDesc: 'd6 pool, survival',
        yearZeroDetail: 'Scarce resources and difficult decisions.',
        dnd: 'D&D 5e',
        dndDesc: 'd20, classic rules',
        dndDetail: 'Traditional system. For RPG veterans.',
        recommended: 'Recommended',
      },
      experience: {
        title: 'Your Experience',
        subtitle: 'We adjust tutorials based on your level',
        novice: 'First time',
        noviceDesc: 'Never played anything like this - I want a full tutorial',
        casual: 'Played RPGs',
        casualDesc: 'Played RPG video games like Skyrim or Baldur\'s Gate',
        experienced: 'Played D&D',
        experiencedDesc: 'Played D&D or similar before',
        veteran: 'I\'m a veteran',
        veteranDesc: 'I play RPGs regularly, I know what I\'m doing',
      },
      archetype: {
        title: 'Choose Your Archetype',
        subtitle: 'in',
        hp: 'HP',
        combat: 'Combat',
        exploration: 'Exploration',
        social: 'Social',
        ability: 'Ability',
      },
      buttons: {
        back: '← Back',
        continue: 'Continue →',
        startAdventure: 'Start Adventure',
      },
    },

    // Game session
    game: {
      yourTurn: 'Your turn',
      dmThinking: 'The DM is thinking...',
      typeAction: 'Type your action...',
      send: 'Send',
      party: 'Party',
      hp: 'HP',
      level: 'Level',
      inventory: 'Inventory',
      conditions: 'Conditions',
      none: 'None',
      online: 'Online',
      offline: 'Offline',
      inviteCode: 'Invite code',
      copyCode: 'Copy code',
      copyLink: 'Copy link',
      copied: 'Copied!',
      waiting: 'Waiting for players...',
      startGame: 'Start Game',
      players: 'players',
    },

    // Lobby
    lobby: {
      title: 'Waiting Room',
      waitingForPlayers: 'Waiting for players...',
      shareCode: 'Share this code with your friends',
      orShareLink: 'Or share this link',
      players: 'Players',
      ready: 'Ready',
      notReady: 'Not ready',
      owner: 'Host',
      startWhenReady: 'Start when everyone is ready',
      minPlayers: 'Minimum 2 players to start',
    },

    // Characters
    characters: {
      title: 'Your Characters',
      noCharacters: 'You don\'t have any characters yet',
      createFirst: 'Create your first character',
      level: 'Level',
      campaign: 'Campaign',
      noCampaign: 'No campaign',
    },

    // Join
    join: {
      title: 'Joining',
      currentCharacter: 'Your current character',
      continueWith: 'Continue with this',
      change: 'Change',
      useExisting: 'Use Existing Character',
      createNew: 'Create New',
      yourCharacters: 'Your Characters from',
      noCharactersForLore: 'You don\'t have characters from',
      createFirstForLore: 'Create your first character for this setting',
      createCharacter: 'Create Character',
      characterName: 'Your character\'s name',
      namePlaceholder: 'Enter your hero\'s name...',
      chooseArchetype: 'Choose Your Archetype',
      useThis: 'Use This Character',
      createAndStart: 'Create and Start',
      assigning: 'Assigning character...',
      creating: 'Creating character...',
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      and: 'and',
      backToHome: 'Back to Home',
      tryAgain: 'Try again',
      preparing: 'Preparing your adventure...',
      creatingCharacter: 'Creating your character in',
    },

    // Errors
    errors: {
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      sessionNotFound: 'Session Not Found',
      sessionNotFoundDesc: 'The session you\'re looking for doesn\'t exist or you don\'t have access to it.',
      campaignNotFound: 'Campaign not found',
      characterNotFound: 'Character not found',
      generic: 'Something went wrong',
      createCharacter: 'Error creating character',
    },

    // Lores
    lores: {
      LOTR: {
        name: 'Middle Earth',
        tagline: 'Shadows grow while the free peoples resist',
        description: 'Hobbits, elves, dwarves and men unite against darkness',
      },
      ZOMBIES: {
        name: 'Zombie Apocalypse',
        tagline: 'The end came. The dead walk. I survived',
        description: 'Ruins, scarce resources and unstoppable hordes',
      },
      ISEKAI: {
        name: 'Isekai World',
        tagline: 'You were transported to a fantasy world with real magic',
        description: 'Adventures, guilds and dungeons await you',
      },
      VIKINGOS: {
        name: 'Viking Saga',
        tagline: 'Conquest, glory and the favor of the gods',
        description: 'The gods are real. Valhalla awaits the brave',
      },
      STAR_WARS: {
        name: 'Galaxy Wars',
        tagline: 'A galaxy far, far away full of adventure',
        description: 'The Force, lightsabers and the Galactic Empire',
      },
      CYBERPUNK: {
        name: 'Neon and Chrome',
        tagline: 'High tech, low life in the city of the future',
        description: 'Megacorporations, netrunners and the Net',
      },
      LOVECRAFT_HORROR: {
        name: 'Cosmic Horrors',
        tagline: 'There are things humanity should not know',
        description: '1920s. Forbidden investigations and ancestral madness',
      },
    },

    // Archetype selector
    archetypeSelector: {
      noArchetypes: 'No archetypes available',
      noArchetypesDesc: 'This world doesn\'t have characters configured yet.',
      chooseWhoYouAre: 'Choose Who You Are',
      inWorld: 'in',
      archetypeDefines: 'Your archetype defines your abilities and your role in the story',
      hp: 'Health',
      combat: 'Combat',
      exploration: 'Exploration',
      social: 'Social',
      stats: 'Statistics',
      specialAbility: 'Special Ability',
      startingEquipment: 'Starting Equipment',
      back: '← Back',
      startAdventure: 'Start Adventure →',
    },

    // Home page extras
    homeExtras: {
      narrator: 'Autonomous Narrator / Game Master',
      systemComplete: 'Complete role-playing system for any level',
      epicAdventures: 'Embark on epic adventures in infinite worlds. From Middle Earth to distant galaxies, your story is written in real time with an AI narrator that never sleeps.',
      worlds: 'Worlds',
      available: 'Available',
      powered: 'Powered',
    },
  },
} as const

export type TranslationKey = keyof typeof translations.es

// Wrapper para Web Speech API
// Proporciona una interfaz limpia para reconocimiento de voz en el browser

// Tipos de la Web Speech API (no incluidos en TypeScript por defecto)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

// Extender Window con Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

/**
 * Resultado del reconocimiento de voz
 */
export interface SpeechResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

/**
 * Callback handlers para el reconocimiento de voz
 */
export interface SpeechCallbacks {
  onResult: (result: SpeechResult) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

/**
 * Interfaz del controlador de reconocimiento de voz
 */
export interface SpeechController {
  start: () => void
  stop: () => void
  isSupported: boolean
}

/**
 * Verifica si el browser soporta Web Speech API
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

/**
 * Crea un controlador de reconocimiento de voz
 * @param callbacks - Funciones callback para eventos
 * @param lang - Idioma para reconocimiento (default: 'es-ES')
 */
export function createSpeechRecognition(
  callbacks: SpeechCallbacks,
  lang: string = 'es-ES'
): SpeechController {
  const isSupported = isSpeechRecognitionSupported()

  if (!isSupported) {
    return {
      start: () => {
        callbacks.onError?.('El reconocimiento de voz no está disponible en este navegador')
      },
      stop: () => {},
      isSupported: false
    }
  }

  let recognition: SpeechRecognition | null = null

  const start = () => {
    // Crear nueva instancia cada vez para evitar problemas de estado
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognitionClass()

    recognition.lang = lang
    recognition.continuous = false // Solo una frase
    recognition.interimResults = false // Solo resultados finales
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      callbacks.onStart?.()
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0]
      if (result) {
        const alternative = result[0]
        callbacks.onResult({
          transcript: alternative.transcript,
          confidence: alternative.confidence,
          isFinal: result.isFinal
        })
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Error en el reconocimiento de voz'

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No se detectó ninguna voz'
          break
        case 'aborted':
          errorMessage = 'Reconocimiento cancelado'
          break
        case 'audio-capture':
          errorMessage = 'No se puede acceder al micrófono'
          break
        case 'network':
          errorMessage = 'Error de red'
          break
        case 'not-allowed':
          errorMessage = 'Permiso de micrófono denegado'
          break
        case 'service-not-allowed':
          errorMessage = 'Servicio de reconocimiento no disponible'
          break
      }

      callbacks.onError?.(errorMessage)
    }

    recognition.onend = () => {
      callbacks.onEnd?.()
    }

    try {
      recognition.start()
    } catch (err) {
      callbacks.onError?.('Error al iniciar el reconocimiento de voz')
    }
  }

  const stop = () => {
    if (recognition) {
      try {
        recognition.stop()
      } catch {
        // Ignorar errores al detener
      }
      recognition = null
    }
  }

  return {
    start,
    stop,
    isSupported
  }
}

/**
 * Hook-like function para usar en componentes React
 * (No es un hook real porque necesitamos control manual)
 */
export function useSpeechRecognitionLogic(
  onTranscript: (text: string) => void,
  lang: string = 'es-ES'
) {
  let isListening = false
  let controller: SpeechController | null = null

  const startListening = (callbacks: {
    onStart?: () => void
    onEnd?: () => void
    onError?: (error: string) => void
  }) => {
    if (isListening) return

    controller = createSpeechRecognition(
      {
        onResult: (result) => {
          if (result.isFinal) {
            onTranscript(result.transcript)
          }
        },
        onStart: () => {
          isListening = true
          callbacks.onStart?.()
        },
        onEnd: () => {
          isListening = false
          callbacks.onEnd?.()
        },
        onError: (error) => {
          isListening = false
          callbacks.onError?.(error)
        }
      },
      lang
    )

    controller.start()
  }

  const stopListening = () => {
    if (controller) {
      controller.stop()
      controller = null
    }
    isListening = false
  }

  return {
    startListening,
    stopListening,
    isSupported: isSpeechRecognitionSupported()
  }
}

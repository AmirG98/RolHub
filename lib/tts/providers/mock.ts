/**
 * Mock TTS Provider para desarrollo
 * No genera audio real, solo simula la respuesta
 */

import { TTSProvider, TTSOptions, TTSResult, Voice, estimateDuration } from '../types'

export class MockProvider implements TTSProvider {
  name = 'mock'

  isAvailable(): boolean {
    return true // Siempre disponible
  }

  async generateSpeech(text: string, options: TTSOptions): Promise<TTSResult> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 500))

    const duration = estimateDuration(text)

    return {
      // URL de audio de prueba (silencio de 1 segundo)
      audioUrl: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
      duration,
      cached: false,
      provider: this.name
    }
  }

  async getVoices(): Promise<Voice[]> {
    return [
      {
        id: 'mock_narrator_es',
        name: 'Narrador (Mock)',
        language: 'es',
        gender: 'male',
        description: 'Voz de prueba para desarrollo'
      },
      {
        id: 'mock_narrator_en',
        name: 'Narrator (Mock)',
        language: 'en',
        gender: 'male',
        description: 'Test voice for development'
      }
    ]
  }
}

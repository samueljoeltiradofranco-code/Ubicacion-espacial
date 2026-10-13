/**
 * AstroEspacio - Sistema de Locución / Voz Guía con Web Speech API
 * Diseñado especialmente para niños en edad preescolar y primaria que están aprendiendo a leer.
 */

class SpeechGuide {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.enabled = true;
    this.voice = null;
    this.pitch = 1.1; // Tono ligeramente más amigable y cálido
    this.rate = 0.92; // Velocidad ligeramente pausada para comprensión infantil

    if (this.synth) {
      this.initVoice();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Priorizar voces en español naturales
    const spanishVoices = voices.filter(v => v.lang.startsWith('es'));

    if (spanishVoices.length > 0) {
      // Buscar voces preferidas naturales si existen
      const preferred = spanishVoices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Natural') || 
        v.name.includes('Paulina') || 
        v.name.includes('Monica') || 
        v.name.includes('Sabina') || 
        v.name.includes('Helena')
      );
      this.voice = preferred || spanishVoices[0];
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    return this.enabled;
  }

  speak(text, onEnd) {
    if (!this.enabled || !this.synth) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel(); // Detener locución previa

      const cleanText = text.replace(/<[^>]*>?/gm, ''); // Quitar etiquetas HTML si las hubiera
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-ES';
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      if (this.voice) {
        utterance.voice = this.voice;
      }

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      this.synth.speak(utterance);
    } catch (err) {
      console.warn("Speech API error:", err);
      if (onEnd) onEnd();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

window.speechGuide = new SpeechGuide();

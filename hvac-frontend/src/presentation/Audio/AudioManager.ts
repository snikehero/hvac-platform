import * as THREE from "three"

class AudioManager {
  private listener: THREE.AudioListener | null = null

  // Posicionales (ventiladores, maquinaria)
  private positionalSounds: Map<string, THREE.PositionalAudio> = new Map()

  // Globales (eventos sistema)
  private globalSounds: Map<string, THREE.Audio> = new Map()

  private globalVolume = 1

  /* ------------------------------------------------ */
  /* INIT */
  /* ------------------------------------------------ */

  init(camera: THREE.Camera) {
    if (this.listener) return

    this.listener = new THREE.AudioListener()
    camera.add(this.listener)

    // Autoplay unlock
    const unlock = () => {
      const ctx = THREE.AudioContext.getContext()
      if (ctx.state === "suspended") {
        ctx.resume()
      }
    }

    window.addEventListener("click", unlock)
  }

  /* ------------------------------------------------ */
  /* POSITIONAL AUDIO */
  /* ------------------------------------------------ */

  loadPositional(
    key: string,
    url: string,
    object: THREE.Object3D,
    loop = true
  ) {
    if (!this.listener) return
    if (this.positionalSounds.has(key)) return

    const sound = new THREE.PositionalAudio(this.listener)
    const loader = new THREE.AudioLoader()

    loader.load(url, buffer => {
      sound.setBuffer(buffer)
      sound.setLoop(loop)
      sound.setRefDistance(5)
      sound.setVolume(0)
    })

    object.add(sound)
    this.positionalSounds.set(key, sound)
  }

  play(key: string) {
    const sound = this.positionalSounds.get(key)
    if (sound && !sound.isPlaying && sound.buffer) {
      sound.play()
    }
  }

  setVolume(key: string, volume: number) {
    const sound = this.positionalSounds.get(key)
    if (sound) {
      sound.setVolume(volume * this.globalVolume)
    }
  }

  setPlaybackRate(key: string, rate: number) {
    const sound = this.positionalSounds.get(key)
    if (sound) {
      sound.setPlaybackRate(rate)
    }
  }

  stop(key: string) {
    const sound = this.positionalSounds.get(key)
    if (sound?.isPlaying) {
      sound.stop()
    }
  }

  /* ------------------------------------------------ */
  /* GLOBAL AUDIO (CONNECT / DISCONNECT / ALERTS) */
  /* ------------------------------------------------ */

  loadGlobal(key: string, url: string) {
    if (!this.listener) return
    if (this.globalSounds.has(key)) return

    const sound = new THREE.Audio(this.listener)
    const loader = new THREE.AudioLoader()

    loader.load(url, buffer => {
      sound.setBuffer(buffer)
      sound.setLoop(false)
      sound.setVolume(this.globalVolume)
    })

    this.globalSounds.set(key, sound)
  }

  playOneShot(key: string) {
    const sound = this.globalSounds.get(key)
    if (!sound || !sound.buffer) return

    // Si ya está sonando, lo reinicia
    if (sound.isPlaying) {
      sound.stop()
    }

    sound.play()
  }

  /* ------------------------------------------------ */
  /* GLOBAL CONTROL */
  /* ------------------------------------------------ */

  setGlobalVolume(volume: number) {
    this.globalVolume = volume

    // actualizar posicionales
    this.positionalSounds.forEach(sound => {
      const current = sound.getVolume()
      sound.setVolume(current * volume)
    })

    // actualizar globales
    this.globalSounds.forEach(sound => {
      sound.setVolume(volume)
    })
  }

  muteAll() {
    this.setGlobalVolume(0)
  }

  unmuteAll() {
    this.setGlobalVolume(1)
  }
}

export const audioManager = new AudioManager()

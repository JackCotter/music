class PersistentAudioSource {
  private audioContext: AudioContext;
  private audioBuffer: AudioBuffer;
  private source: AudioBufferSourceNode | null = null;
  private isPlaying_: boolean = false;
  private offset_: number = 0;

  constructor(audioContext: AudioContext, audioBuffer: AudioBuffer) {
    this.audioContext = audioContext;
    this.audioBuffer = audioBuffer;
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.audioContext.destination);
  }

  get isPlaying() {
    return this.isPlaying_;
  }

  get duration(): number {
    return this.audioBuffer.duration;
  }

  set offset(offset: number) {
    this.offset_ = offset;
  }

  // Method to start the audio playback
  public start(): void {
    if (this.isPlaying || !this.source) {
      return;
    }

    this.source.onended = () => {
      this.isPlaying_ = false;
      this.source = this.audioContext.createBufferSource();
      this.source.buffer = this.audioBuffer;
      this.source.connect(this.audioContext.destination);
    };

    this.source.start(this.audioContext.currentTime, this.offset_);
    this.isPlaying_ = true;
  }

  public stop(): void {
    if (!this.isPlaying || !this.source) {
      return;
    }

    this.source.stop();
    this.isPlaying_ = false;
  }

  public disconnect(): void {
    if (this.isPlaying) {
      this.source?.stop();
    }
    if (this.source) {
      this.source.disconnect();
    }
  }
}

export default PersistentAudioSource;

class PersistentAudioSource {
    private audioContext: AudioContext;
    private audioBuffer: AudioBuffer;
    private source: AudioBufferSourceNode | null = null;
    private isPlaying: boolean = false;

    constructor(audioContext: AudioContext, audioBuffer: AudioBuffer) {
        this.audioContext = audioContext;
        this.audioBuffer = audioBuffer;
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.connect(this.audioContext.destination);
    }

    // Method to start the audio playback
    public start(when?:number): void {
        if (this.isPlaying || !this.source) {
            console.log("Audio is already playing.");
            return;
        }

        this.source.onended = () => {
            this.isPlaying = false;
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = this.audioBuffer;
            this.source.connect(this.audioContext.destination);
            console.log("Audio playback finished.");
        };

        this.source.start(when);
        this.isPlaying = true;
    }

    public stop(): void {
        if (!this.isPlaying || !this.source) {
            console.log("No audio is currently playing.");
            return;
        }

        this.source.stop();
        this.isPlaying = false;
    }

    public disconnect(): void {
        if (this.isPlaying ) {
            this.source?.stop();
        }
        if (this.source) {
            this.source.disconnect()
        }
    }
}

export default PersistentAudioSource

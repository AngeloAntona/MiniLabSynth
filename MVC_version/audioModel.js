class AudioModel {
    constructor() {
        this.context = new AudioContext();
        
        this.mainGain = this.context.createGain();
        this.keyGain = this.context.createGain();
        this.drumGain = this.context.createGain();

        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 256;

        this.compressor = this.context.createDynamicsCompressor();

        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.keyGain.connect(this.compressor);
        this.drumGain.connect(this.compressor);
        this.compressor.connect(this.mainGain);
        this.mainGain.connect(this.analyser);
        this.analyser.connect(this.context.destination);

        this.attackNote = 0.01;
        this.releaseNote = 0.10;
    }

    getAmplitude() {
        this.analyser.getByteTimeDomainData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            sum += Math.abs(this.dataArray[i] - 128) / 128;
        }
        return sum / this.bufferLength;
    }

    setMainGain(value){
        this.mainGain.gain.value=value;
    }
    setKeyGain(value){
        this.keyGain.gain.value=value;
    }
    setDrumGain(value){
        this.drumGain.gain.value=value;
    }

    playNote(note) {
        const oscillator = this.context.createOscillator();
        oscillator.type = "sawtooth";
        const gainNode = this.context.createGain();
        oscillator.frequency.value = 261.63 * Math.pow(2, (note - 57) / 12);
        oscillator.connect(gainNode);
        gainNode.connect(this.keyGain);

        gainNode.gain.setValueAtTime(0, this.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, this.context.currentTime + this.attackNote);

        oscillator.start();

        return { oscillator, gainNode };
    }
    stopNote(note) {
        const releaseTime = this.context.currentTime + this.releaseNote;
        const fadeOutDuration = 0.01;

        note.gainNode.gain.cancelScheduledValues(this.context.currentTime);
        note.gainNode.gain.setValueAtTime(note.gainNode.gain.value, releaseTime);
        note.gainNode.gain.linearRampToValueAtTime(0, releaseTime + fadeOutDuration);

        setTimeout(() => {
            note.oscillator.stop();
            note.oscillator.disconnect();
        }, (this.releaseNote + fadeOutDuration) * 1000);
    }

    playKick() {
        const duration = 2;
        const attackDuration = 0.01;
        const releaseDuration = 4;

        const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate);
        const bufferData = buffer.getChannelData(0);
        const initialFrequency = 30;
        const initialAmplitude = 10;

        for (let i = 0; i < bufferData.length; i++) {
            const amplitude = Math.exp(-i * (initialAmplitude / this.context.sampleRate));
            const frequency = 100 * Math.exp(-i * (initialFrequency / this.context.sampleRate));
            bufferData[i] = amplitude * Math.cos(2 * Math.PI * frequency * i / this.context.sampleRate);
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        source.connect(this.drumGain);
        source.start(0);
        source.stop(this.context.currentTime + duration);
    }

    playSnare() {
        const bufferSize = this.context.sampleRate * 0.1;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const bufferData = buffer.getChannelData(0);

        const noiseGain = this.context.createGain();
        noiseGain.gain.setValueAtTime(1, this.context.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0, this.context.currentTime + bufferSize / this.context.sampleRate);

        // Create white noise for the snare
        for (let i = 0; i < bufferSize; i++) {
            bufferData[i] = Math.random() * 2 - 1;
        }

        const toneOscillator = this.context.createOscillator();
        toneOscillator.type = 'sine';
        toneOscillator.frequency.value = 40;

        const toneGain = this.context.createGain();
        toneGain.gain.setValueAtTime(1 / 5, this.context.currentTime);
        toneGain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.02);

        // Connect the components
        noiseGain.connect(toneGain.gain);
        toneOscillator.connect(toneGain);
        toneGain.connect(this.drumGain);

        // Start the noise and the tone simultaneously
        noiseGain.connect(this.drumGain);
        toneOscillator.start();
        toneOscillator.stop(this.context.currentTime + 0.02);

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(noiseGain);
        source.start(0);
    }

    playClosedHiHat() {
        const bufferSize = this.context.sampleRate * 0.03;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const bufferData = buffer.getChannelData(0);

        const noiseGain = this.context.createGain();
        noiseGain.gain.setValueAtTime(1, this.context.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0, this.context.currentTime + bufferSize / this.context.sampleRate);

        // Create white noise for the closed hi-hat
        for (let i = 0; i < bufferSize; i++) {
            bufferData[i] = Math.random() * 2 - 1;
        }

        // Create a band-pass filter
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 1;

        // Connect the components
        noiseGain.connect(filter);
        filter.connect(this.drumGain);

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(noiseGain);
        source.start(0);
    }

    playCrashCymbal() {
        const bufferSize = this.context.sampleRate * 1;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const bufferData = buffer.getChannelData(0);

        const noiseGain = this.context.createGain();
        noiseGain.gain.setValueAtTime(0.5, this.context.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0, this.context.currentTime + bufferSize / this.context.sampleRate);

        // Create white noise for the crash cymbal
        for (let i = 0; i < bufferSize; i++) {
            bufferData[i] = Math.random() * 1.5 - 1;
        }

        // Create a low-pass filter to shape the cymbal sound
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(9900, this.context.currentTime);
        filter.Q.setValueAtTime(1, this.context.currentTime);

        // Connect the components
        noiseGain.connect(filter);
        filter.connect(this.drumGain);

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(noiseGain);
        source.start(0);
    }
}
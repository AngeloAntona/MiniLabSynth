class AudioModel {
    constructor() {
        this.context = new AudioContext();

        this.mainGain = this.context.createGain();
        this.instGain = this.context.createGain();
        this.drumGain = this.context.createGain();
        this.keyGain = this.context.createGain();
        this.bassGain = this.context.createGain();

        this.lowPassFilterKey = this.context.createBiquadFilter();
        this.lowPassFilterKey.type = 'lowpass';
        this.lowPassFilterBass = this.context.createBiquadFilter();
        this.lowPassFilterBass.type = 'lowpass';

        this.hiPassFilterKey = this.context.createBiquadFilter();
        this.hiPassFilterKey.type = 'highpass';
        this.hiPassFilterBass = this.context.createBiquadFilter();
        this.hiPassFilterBass.type = 'highpass';

        this.delayKey1 = this.context.createDelay();
        this.delayKey2 = this.context.createDelay();
        this.delayBass1 = this.context.createDelay();
        this.delayBass2 = this.context.createDelay();

        this.feedbackKey1 = this.context.createGain();
        this.feedbackKey2 = this.context.createGain();
        this.feedbackBass1 = this.context.createGain();
        this.feedbackBass2 = this.context.createGain();

        this.delayKey1.connect(this.feedbackKey1);
        this.delayKey2.connect(this.feedbackKey2);
        this.delayBass1.connect(this.feedbackBass1);
        this.delayBass2.connect(this.feedbackBass2);

        this.feedbackKey1.connect(this.delayKey2); // Connect to the next delay
        this.feedbackKey2.connect(this.delayKey1); // Connect to the previous delay
        this.feedbackBass1.connect(this.delayBass2); // Connect to the next delay
        this.feedbackBass2.connect(this.delayBass1); // Connect to the previous delay


        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 256;

        this.compressor = this.context.createDynamicsCompressor();

        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        this.lowPassFilterKey.connect(this.hiPassFilterKey);
        this.lowPassFilterBass.connect(this.hiPassFilterBass);
        this.hiPassFilterKey.connect(this.keyGain);
        this.hiPassFilterBass.connect(this.bassGain);


        this.hiPassFilterKey.connect(this.delayKey1);
        this.hiPassFilterKey.connect(this.delayKey2);
        this.hiPassFilterBass.connect(this.delayBass1);
        this.hiPassFilterBass.connect(this.delayBass2);

        this.feedbackKey1.connect(this.keyGain);
        this.feedbackKey2.connect(this.keyGain);
        this.feedbackBass1.connect(this.bassGain);
        this.feedbackBass2.connect(this.bassGain);

        this.keyGain.connect(this.instGain);
        this.bassGain.connect(this.instGain);
        this.instGain.connect(this.mainGain);
        this.drumGain.connect(this.mainGain);
        this.mainGain.connect(this.analyser);
        this.analyser.connect(this.compressor);
        this.compressor.connect(this.context.destination);
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

    setNoteOscillator(oscillatorType) {
        this.noteOscillator = oscillatorType;
    }

    setMainGain(value) {
        this.mainGain.gain.value = value;
    }
    setInstGain(value) {
        this.instGain.gain.value = value;
    }
    setDrumGain(value) {
        this.drumGain.gain.value = value;
    }
    setKeyGain(value) {
        this.keyGain.gain.value = value;
    }
    setBassGain(value) {
        this.bassGain.gain.value = value;
    }
    setLowPassFilterFrequency(frequency, inst) {
        if (inst === 'key') { this.lowPassFilterKey.frequency.setValueAtTime(frequency, this.context.currentTime); }
        else if (inst === 'bass') { this.lowPassFilterBass.frequency.setValueAtTime(frequency, this.context.currentTime); }
        else { console.log('Error in setLowPassFilterFrequency (audioModel)'); }
    }
    setHiPassFilterFrequency(frequency, inst) {
        if (inst === 'key') { this.hiPassFilterKey.frequency.setValueAtTime(frequency, this.context.currentTime); }
        else if (inst === 'bass') { this.hiPassFilterBass.frequency.setValueAtTime(frequency, this.context.currentTime); }
        else { console.log('Error in setHighPassFilterFrequency (audioModel)'); }
    }
    setDelayTime(time, inst) {
        if (inst === 'key') {
            this.delayKey1.delayTime.value = 0.8*time;
            this.delayKey2.delayTime.value = 0.4*time;
        }
        else if (inst === 'bass') {
            this.delayBass1.delayTime.value = 0.8*time;
            this.delayBass2.delayTime.value = 0.4*time;
        }
        else { console.log('Error in steDelayTime (audioModel)'); }
    }

    setDelayFeedback(feedback, inst) {
        if (inst === 'key') {
            this.feedbackKey1.gain.value = 0.8*feedback;
            this.feedbackKey2.gain.value = 0.4*feedback;
        }
        else if (inst === 'bass') {
            this.feedbackBass1.gain.value = 0.8*feedback;
            this.feedbackBass2.gain.value = 0.4*feedback;
        }
        else { console.log('Error in steDelayFeedback (audioModel)'); }
    }

    playNote(note, oscillatorType, inst) {
        const oscillator = this.context.createOscillator();
        oscillator.type = oscillatorType;
        const gainNode = this.context.createGain();
        oscillator.frequency.value = 261.63 * Math.pow(2, (note - 57) / 12);
        oscillator.connect(gainNode);
        if (inst == 'key') { gainNode.connect(this.lowPassFilterKey); }
        else if (inst == 'bass') { gainNode.connect(this.lowPassFilterBass); }

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
// model.js
class Model {
    constructor(audioModel) {
        this.audioModel = audioModel;

        //Preset parameters
        this.knobsLevel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.cntrlPedalLinks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.activateBass = false;
        this.activateKey = false;
        this.bassOscillator = " ";
        this.keyOscillator = " ";
        this.bassOctave = 1;
        this.keyOctave = 1;
        this.bassSustain = false;
        this.keySustain = false;
        this.bassMono = false;
        this.keyMono = false;
        this.bassWeel = false;
        this.keyWheel = false;
        this.currentOptionKeyIndex = 0;
        this.currentOptionBassIndex = 0;
        this.split = false;

        this.waveformOptions = ['sine', 'square', 'sawtooth', 'triangle'];

        this.isSustainPedalDown = false;
        this.pressedBass = {};
        this.sustainedBass = {};


        this.pressedKeys = {};
        this.sustainedNotes = {};
        this.pads = [0, 0, 0, 0, 0, 0, 0, 0];

        this.defaultPreset = {
            knobsLevel: [0.5, 0.5, 1, 0, 0, 0, 0, 0, 0, 0.8, 1, 0, 0, 0, 0, 0, 0, 0.3, 0.3],
            cntrlPedalLinks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            activateBass: false,
            activateKey: true,
            currentOptionKeyIndex: 0,
            currentOptionBassIndex: 0,
            bassOctave: 1 / 2,
            keyOctave: 1,
            bassSustain: true,
            keySustain: true,
            bassMono: true,
            keyMono: false,
            bassWeel: false,
            keyWheel: false,
            split: false,
        };

        this.psychoPreset = {
            knobsLevel: [0.5, 0.5, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0.3, 1],
            cntrlPedalLinks: [0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            activateBass: true,
            activateKey: true,
            currentOptionKeyIndex: 1,
            currentOptionBassIndex: 2,
            bassOctave: 1 / 4,
            keyOctave: 1,
            bassSustain: true,
            keySustain: false,
            bassMono: true,
            keyMono: false,
            bassWeel: false,
            keyWheel: false,
            split: true,
        };

        // Apply the preset to the model
        this.setPreset(this.psychoPreset);

        this.refreshAudioParameters();
    }

    setPreset(preset) {
        // Apply the preset to the model
        this.knobsLevel = Array.from(preset.knobsLevel) || this.knobsLevel;
        this.cntrlPedalLinks = preset.cntrlPedalLinks;
        this.activateBass = preset.activateBass;
        this.activateKey = preset.activateKey;
        this.currentOptionBassIndex = preset.currentOptionBassIndex;
        this.currentOptionKeyIndex = preset.currentOptionKeyIndex;
        this.bassOctave = preset.bassOctave;
        this.keyOctave = preset.keyOctave;
        this.bassSustain = preset.bassSustain;
        this.keySustain = preset.keySustain;
        this.bassMono = preset.bassMono;
        this.keyMono = preset.keyMono;
        this.bassWeel = preset.bassWeel;
        this.keyWheel = preset.keyWheel;
        this.split = preset.split;
        this.refreshAudioParameters();
        this.setWaveform();
    }


    // Function to save the current state as a JSON string
    savePreset() {
        const preset = {
            knobsLevel: this.knobsLevel,
            activateBass: this.activateBass,
            activateKey: this.activateKey,
            bassOscillator: this.bassOscillator,
            keyOscillator: this.keyOscillator,
            bassOctave: this.bassOctave,
            keyOctave: this.keyOctave,
            bassSustain: this.bassSustain,
            keySustain: this.keySustain,
            bassMono: this.bassMono,
            keyMono: this.keyMono,
            bassWeel: this.bassWeel,
            keyWheel: this.keyWheel,
        };

        // Convert the preset to a JSON string
        const jsonString = JSON.stringify(preset);

        // Store the JSON string or do something with it (e.g., save to local storage)
        console.log(jsonString);

        return jsonString;
    }

    // Function to load a preset from a JSON string
    loadPreset(jsonString) {
        try {
            // Parse the JSON string to get the preset object
            const preset = JSON.parse(jsonString);

            // Apply the preset to the model
            this.setPreset(preset);

            // Return true if the loading was successful
            return true;
        } catch (error) {
            // Handle errors, e.g., invalid JSON format
            console.error('Error loading preset:', error);
            return false;
        }
    }

    flipSplit() {
        this.split = !this.split;
    }

    updateKnobLevel(idx, value) {
        this.knobsLevel[idx] = value;
    }

    setWaveform() {
        this.keyOscillator = this.waveformOptions[this.currentOptionKeyIndex];
        this.bassOscillator = this.waveformOptions[this.currentOptionBassIndex];
    }

    shiftOctave(inst, direction) {
        if (inst === 'key') {
            if (direction === '+' && this.keyOctave <= 8) { this.keyOctave = this.keyOctave * 2 }
            else if (direction === '-' && this.keyOctave >= 1 / 8) { this.keyOctave = this.keyOctave / 2 }
        }
        if (inst === 'bass') {
            if (direction === '+' && this.bassOctave <= 8) { this.bassOctave = this.bassOctave * 2 }
            else if (direction === '-' && this.bassOctave >= 1 / 8) { this.bassOctave = this.bassOctave / 2 }
        }
    }

    flipMono(inst) {
        if (inst === 'key') {
            this.keyMono = !this.keyMono;
        }
        else if (inst === 'bass') {
            this.bassMono = !this.bassMono;
        }
    }
    flipSust(inst) {
        if (inst === 'key') {
            this.keySustain = !this.keySustain;
        }
        else if (inst === 'bass') {
            this.bassSustain = !this.bassSustain;
        }
    }

    activateInstrument(instrument, status) {
        if (instrument === 'bass') {
            if (status === 'active') {
                this.activateBass = true;
            }
            else {
                this.activateBass = false;
            }
        }
        else if (instrument === 'key') {
            if (status === 'active') {
                this.activateKey = true;
            }
            else {
                this.activateKey = false;
            }
        }
    }

    getOctave(inst) {
        if (inst == 'key') { return Math.log2(this.keyOctave); }
        else if (inst == 'bass') { return Math.log2(this.bassOctave); }
    }

    getKeyShift(note) {
        const oct = Math.log2(this.keyOctave);
        return note + (Math.round(oct) * 12);
    }

    getBassShift(note) {
        const oct = Math.log2(this.bassOctave);
        return note + (Math.round(oct) * 12);
    }

    handleSustain(note) {
        if (note && this.isSustainPedalDown) {
            this.sustainedNotes[note] = this.pressedKeys[note];
            delete this.pressedKeys[note];
        } else {
            this.deleteAllSustainedNotes('key');
        }
    }

    handleNoteOn(note) {
        const currentNote = this.getKeyShift(note);
        if (!this.pressedKeys[currentNote]) {
            this.pressedKeys[currentNote] = this.audioModel.playNote(currentNote, this.keyOscillator, 'key');
            const ledSelector = '#key' + String(Math.abs(note) % 24 + 1);
            const keySelector = '#key' + String(Math.abs(note) % 24 + 1);
            return { display, ledSelector, keySelector };
        }
        return null;
    }

    handleNoteOff(note) {
        const currentNote = this.getKeyShift(note);
        if (this.pressedKeys[currentNote]) {
            const ledSelector = '#key' + String(Math.abs(note) % 24 + 1);
            const keySelector = '#key' + String(Math.abs(note) % 24 + 1);
            if (this.isSustainPedalDown && !this.sustainedNotes[currentNote] && this.keySustain) {
                this.handleSustain(currentNote);
            } else {
                this.audioModel.stopNote(this.pressedKeys[currentNote]);
                delete this.pressedKeys[currentNote];
            }
            return { display, ledSelector, keySelector };
        }
        return null;
    }

    deleteAllNotes(inst) {
        if (inst == 'key') {
            const keysToDelete = Object.keys(this.pressedKeys);
            keysToDelete.forEach(note => {
                this.audioModel.stopNote(this.pressedKeys[note]);
                delete this.pressedKeys[note];
            });
        }
        else if (inst == 'bass') {
            const bassToDelete = Object.keys(this.pressedBass);
            bassToDelete.forEach(bass => {
                this.audioModel.stopNote(this.pressedBass[bass]);
                delete this.pressedBass[bass];
            });
        }
    }

    deleteAllSustainedNotes(inst) {
        if (inst == 'key') {
            const keysToDelete = Object.keys(this.sustainedNotes);
            keysToDelete.forEach(note => {
                this.audioModel.stopNote(this.sustainedNotes[note]);
                delete this.sustainedNotes[note];
            });
        }
        else if (inst == 'bass') {
            const bassToDelete = Object.keys(this.sustainedBass);
            bassToDelete.forEach(bass => {
                this.audioModel.stopNote(this.sustainedBass[bass]);
                delete this.sustainedBass[bass];
            });
        }
    }


    handleBassSustain(note) {
        if (note && this.isSustainPedalDown) {
            this.sustainedBass[note] = this.pressedBass[note];
            delete this.pressedBass[note];
        } else {
            this.deleteAllSustainedNotes('bass');
        }
    }

    handleBassOn(note) {
        const currentNote = this.getBassShift(note);
        if (!this.pressedBass[currentNote]) {
            this.pressedBass[currentNote] = this.audioModel.playNote(currentNote, this.bassOscillator, 'bass');
            const ledSelector = '#key' + String(Math.abs(note) % 24 + 1);
            const keySelector = '#key' + String(Math.abs(note) % 24 + 1);
            return { display, ledSelector, keySelector };
        }
        return null;
    }

    handleBassOff(note) {
        const currentNote = this.getBassShift(note);
        if (this.pressedBass[currentNote]) {
            const ledSelector = '#key' + String(Math.abs(note) % 24 + 1);
            const keySelector = '#key' + String(Math.abs(note) % 24 + 1);
            if (this.isSustainPedalDown && !this.sustainedBass[currentNote] && this.bassSustain) {
                this.handleBassSustain(currentNote);
            } else {
                this.audioModel.stopNote(this.pressedBass[currentNote]);
                delete this.pressedBass[currentNote];
            }
            return { display, ledSelector, keySelector };
        }
        return null;
    }



    handlePadOn(note) {
        if (this.pads[note] === 0) {
            if (note === 0) {
                this.audioModel.playKick();
            } else if (note === 1) {
                this.audioModel.playSnare();
            } else if (note === 2) {
                this.audioModel.playClosedHiHat();
            } else if (note === 3) {
                this.audioModel.playCrashCymbal();
            } else if (note === 4) { }
            else if (note === 5) { }
            else if (note === 6) { }
            else if (note === 7) { }
            this.pads[note] = 1;
            return true;
        }
        return false;
    }

    handlePadOff(note) {
        if (this.pads[note] === 1) {
            let padIndex = null;
            if (note === 0 || note === 1 || note === 2 || note === 3) {
                padIndex = note;
            }
            this.pads[note] = 0;
            return { display, padIndex };
        }
        return null;
    }

    handleControlChangeEvent(device, controllerNumber, value) {

        if ((device === 'midiKey' || device === 'touch') && (this.cntrlPedalLinks[controllerNumber - 19] === 0)) {
            const id = controllerNumber - 19;
            this.knobsLevel[id] = value / 127;
            const knob = document.getElementById('knob' + id);
            this.refreshAudioParameters();
            return { knob };
        }
        else if (device === 'cntrlPedal') {
            const id = controllerNumber;
            const divisor = 110; //SISTEMARE DIVISORE QUANDO HAI UN PEDALE CHE FUNZIONA DECENTEMENTE
            for (let i = 0; i < this.knobsLevel.length; i++) {
                if (this.cntrlPedalLinks[i] === 1) { this.knobsLevel[i] = Math.min(1, Math.max(0, Math.pow(1.1, Math.max(0, value * 8 / divisor)) - 1)); }
                else if (this.cntrlPedalLinks[i] === -1) { this.knobsLevel[i] = Math.min(1, Math.max(0, 1 - Math.log(1 + (value * 2 / divisor)))); }
            }
            const knob = document.getElementById('knob' + id);
            this.refreshAudioParameters();
            return { knob };
        }
    }

    connectPedalKnobs(knobNumber, mode) {
        console.log(knobNumber + ' ' + mode);
        this.cntrlPedalLinks[knobNumber] = mode;
    }

    refreshAudioParameters() {
        this.audioModel.setMainGain(this.knobsLevel[0]);
        this.audioModel.setInstGain(this.knobsLevel[1]);
        this.audioModel.setLowPassFilterFrequency(this.knobsLevel[2] * 14990 + 100, 'key');
        this.audioModel.setHiPassFilterFrequency(this.knobsLevel[3] * 14990 + 100, 'key');
        this.audioModel.setDelayTime(this.knobsLevel[4], 'key');
        this.audioModel.setDelayFeedback(this.knobsLevel[5], 'key');
        this.audioModel.setDrumGain(this.knobsLevel[9]);
        this.audioModel.setLowPassFilterFrequency(this.knobsLevel[10] * 14990 + 100, 'bass');
        this.audioModel.setHiPassFilterFrequency(this.knobsLevel[11] * 14990 + 100, 'bass');
        this.audioModel.setDelayTime(this.knobsLevel[12], 'bass');
        this.audioModel.setDelayFeedback(this.knobsLevel[13], 'bass');
        this.audioModel.setKeyGain(this.knobsLevel[17]);
        this.audioModel.setBassGain(this.knobsLevel[18]);
    }
}
// model.js
class Model {
    constructor(audioModel) {
        this.audioModel = audioModel;
        console.log('Costruttore model.js');
        this.knobsLevel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.pads = [0, 0, 0, 0, 0, 0, 0, 0];
        this.sustainedNotes = {};
        this.isSustainPedalDown = false;


        this.activateBass = false;
        this.pressedBass = {};
        this.sustainedBass = {};
        this.bassOscillator = "sine";
        this.bassOctave = 1;
        this.bassSustain = false;
        this.bassMono = false;
        this.bassWeel = false;

        this.activateKey = false;
        this.pressedKeys = {};
        this.sustainedNotes = {};
        this.keyOscillator = "sine";
        this.keyOctave = 1;
        this.keySustain = false;
        this.keyMono = false;
        this.keyWheel = false;



        this.refreshAudioParameters();
    }

    updateKnobLevel(idx, value) {
        this.knobsLevel[idx] = value;
    }

    setWaveform(inst, waveform){
        if(inst==='key'){this.keyOscillator=waveform}
        else if (inst==='bass'){this.bassOscillator=waveform}
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

    flipMono(inst){
        if (inst==='key'){
            this.keyMono=!this.keyMono;
        }
        else if(inst==='bass'){
            this.bassMono=!this.bassMono;
        }
    }
    flipSust(inst){
        if (inst==='key'){
            this.keySustain=!this.keySustain;
        }
        else if(inst==='bass'){
            this.bassSustain=!this.bassSustain;
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

    getOctave(inst){
        if(inst=='key'){return Math.log2(this.keyOctave);}
        else if(inst=='bass'){return Math.log2(this.bassOctave);}
    }

    getKeyShift(note) {
        const oct = Math.log2(this.keyOctave);
        return note + (Math.round(oct) * 12);
    }

    getBassShift(note) {
        const oct = Math.log2(this.bassOctave);
        return note + (Math.round(oct) * 12);
    }

    /*delAllSustExcept1(instrument, not){
        if (instrument=='bass'){
            const note=this.getBassOctave(not);
            Object.keys(this.sustainedBass).forEach((bassNote) => {
                if (bassNote!=note) {
                    this.audioModel.stopNote(this.sustainedBass[bassNote]);
                    delete this.sustainedBass[bassNote];
                }
                else if(bassNote!=note&&this.pressedBass[note])
                {
                    delete this.sustainedBass[note];
                }
            });
        }  
    }*/


    handleSustain(note) {
        if (note) {
            this.sustainedNotes[note] = this.pressedKeys[note];
            delete this.pressedKeys[note];
        } else {
            Object.keys(this.sustainedNotes).forEach((key) => {
                if (!this.pressedKeys[key]) {
                    this.audioModel.stopNote(this.sustainedNotes[key]);
                    delete this.sustainedNotes[key];
                }
            });
        }
    }

    handleNoteOn(note) {
        const currentNote = this.getKeyShift(note);
        if (!this.pressedKeys[currentNote]) {
            this.pressedKeys[currentNote] = this.audioModel.playNote(currentNote, this.keyOscillator);
            const ledSelector = '#key' + String(Math.abs(note) % 24 + 1);
            const keySelector = '#key' + String(Math.abs(note) % 24 + 1);
            return { display, ledSelector, keySelector };
        }
        return null;
    }

    handleNoteOff(note,inst) {
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
        if (note) {
            this.sustainedBass[note] = this.pressedBass[note];
            delete this.pressedBass[note];
        } else {
            Object.keys(this.sustainedBass).forEach((bassNote) => {
                if (!this.pressedBass[bassNote]) {
                    this.audioModel.stopNote(this.sustainedBass[bassNote]);
                    delete this.sustainedBass[bassNote];
                }
            });
        }
    }

    handleBassOn(note) {
        const currentNote = this.getBassShift(note);
        if (!this.pressedBass[currentNote]) {
            this.pressedBass[currentNote] = this.audioModel.playNote(currentNote, this.bassOscillator);
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

    handleControlChangeEvent(controllerNumber, value) {
        const id = controllerNumber - 19;
        this.knobsLevel[id] = value / 127;
        this.refreshAudioParameters();
        const knob = document.getElementById('knob' + id);
        return { knob };
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
    refreshAudioParameters() {
        this.audioModel.setMainGain(this.knobsLevel[0]);
        this.audioModel.setKeyGain(this.knobsLevel[1]);
        this.audioModel.setDrumGain(this.knobsLevel[9]);
    }
}
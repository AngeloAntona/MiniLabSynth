// model.js
class Model {
    constructor(audioModel) {
        this.audioModel = audioModel;
        console.log('Costruttore model.js');
        this.knobsLevel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.pads = [0, 0, 0, 0, 0, 0, 0, 0];
        this.pressedKeys = {};
        this.sustainedNotes = {};
        this.isSustainPedalDown = false;
        this.refreshAudioParameters()
    }

    updateKnobLevel(idx, value) {
        this.knobsLevel[idx] = value;
    }

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
        if (!this.pressedKeys[note]) {
            this.pressedKeys[note] = this.audioModel.playNote(note);
            const ledSelector = '#key' + String(Math.abs(note) % 24 + 1);
            const keySelector = '#key' + String(Math.abs(note) % 24 + 1);
            return { display, ledSelector, keySelector };
        }
        return null;
    }

    handleNoteOff(note) {
        if (this.pressedKeys[note]) {
            const ledSelector = '#key' + String(Math.abs(note) % 24 + 1);
            const keySelector = '#key' + String(Math.abs(note) % 24 + 1);
            if (this.isSustainPedalDown && !this.sustainedNotes[note]) {
                this.handleSustain(note);
            } else {
                this.audioModel.stopNote(this.pressedKeys[note]);
                delete this.pressedKeys[note];
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
            } else if (note === 4) {} 
             else if (note === 5) {}
             else if (note === 6) {}
             else if (note === 7) {}
            this.pads[note] = 1;
            return true;
        }
        return false;
    }

    handleControlChangeEvent(controllerNumber, value) {
        const id = controllerNumber - 19;
        this.knobsLevel[id] = value / 127;
        this.refreshAudioParameters();
        console.log(this.knobsLevel);
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
    refreshAudioParameters(){
        this.audioModel.setMainGain(this.knobsLevel[0]);
        this.audioModel.setKeyGain(this.knobsLevel[1]);
        this.audioModel.setDrumGain(this.knobsLevel[9]);
    }
}
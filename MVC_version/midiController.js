class MidiController {

    constructor(controller) {
        this.controller = controller;
        this.midiAccess = null;
        this.keyboardName = "Arturia MiniLab mkII";
        this.cntrlPedalName = "beat bars controller";

        this.attachEventListeners();
        console.log('MidiController ok.');
    }
    attachEventListeners() {
        this.initializeMIDI();
        this.setupMIDIInput();
    }

    initializeMIDI() {
        navigator.requestMIDIAccess().then((midiAccess) => {
            this.midiAccess = midiAccess;
            this.setupMIDIInput();
        }).catch((error) => {
            console.error('Error accessing MIDI:', error);
        });
    }

    setupMIDIInput() {
        if (!this.midiAccess) return;

        this.midiAccess.inputs.forEach((input) => {
            console.log(input.name);
            if (input.name === this.keyboardName) {
                input.onmidimessage = (event) => {
                    this.handleKeyboardMIDIMessage(event);
                };
            }
            if (input.name === this.cntrlPedalName) {
                input.onmidimessage = (event) => {
                    this.handlecntrlPedalMIDIMessage(event);
                };
            }
        });
    }

    handleKeyboardMIDIMessage(event) {
        const statusByte = event.data[0] & 0xf0; // Extract the top 4 bits
        if (event.data[0] === 224) {
            if (event.data[1] === 0) { this.controller.handleWheel(event.data[2]); }
        }
        else if (statusByte === 0xB0) {
            const controllerNumber = event.data[1];
            const value = event.data[2];
            // Control Change message (knob or slider)
            if (controllerNumber === 64) {
                // Sustain pedal event
                if (value > 0) {
                    this.controller.model.isSustainPedalDown = true;
                } else {
                    this.controller.model.isSustainPedalDown = false;
                    this.controller.handleSustain();
                }
            }
            else if (controllerNumber === 113) { this.controller.handleMidiPresetChange(1); }
            else if (controllerNumber === 115) { this.controller.handleMidiPresetChange(2); }
            else {
                // Handle MIDI control change events (knob rotations)
                this.controller.handleControlChangeEvent('midiKey', controllerNumber, value);
            }
        } else if (statusByte === 0x90 || statusByte === 0x80) {
            // Note On or Note Off message
            const noteNumber = event.data[1];
            const velocity = event.data[2];
            // Handle other MIDI note events
            if (noteNumber > 7) {
                // Handle MIDI note events for keys
                if (statusByte === 0x90 && velocity > 0) {
                    this.controller.handleNoteOn(noteNumber);
                } else if ((statusByte === 0x80 || (statusByte === 0x90 && velocity === 0))) {
                    this.controller.handleNoteOff(noteNumber);
                }
            } else {
                // Handle MIDI note events for pads
                if (statusByte === 0x90 && velocity > 0) {
                    this.controller.handlePadOn(noteNumber);
                } else if ((statusByte === 0x80 || (statusByte === 0x90 && velocity === 0))) {
                    this.controller.handlePadOff(noteNumber);
                }
            }
        }
    }

    handlecntrlPedalMIDIMessage(event) {

        if (event.data[1] === 0) {
            //switchPedal
        }
        else if (event.data[1] == 1) {
            //console.log('controlNumber: '+ event.data[1]+', Value: '+ event.data[2]);
            this.controller.handleControlChangeEvent('cntrlPedal', event.data[1], event.data[2]);
        }
    }
}
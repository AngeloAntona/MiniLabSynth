// controller.js
class Controller {
    constructor(model, view, presets) {

        // Initialize the controller
        this.model = model;
        this.view = view;
        this.currentKnobIndex = -1;
        // Get references to the clickable objects and the context menus


        this.loadPresetButton = document.getElementById("loadPreset");
        this.deletePresetButton = document.getElementById("deletePreset");
        this.nameInput = document.getElementById('nameInput');
        this.saveMenu = document.getElementById('savePresetMenu');
        this.loginSubtitle = document.getElementById('loginSubtitle');
        this.openLogin = document.getElementById('openLogin');
        this.simpleCircle1 = document.getElementById('simpleCircle1');
        this.simpleCircle2 = document.getElementById('simpleCircle2');
        this.closeLogin = document.getElementById('closeLogin');
        this.loginConfirm = document.getElementById('loginConfirm');
        this.loginDiv = document.getElementById('loginDiv');
        this.email = document.getElementById('email');
        this.password = document.getElementById('password');
        this.savePresetButton = document.getElementById("savePreset");


        this.mainFrame = document.getElementById('mainFrame');
        this.display = document.getElementById('display');
        this.knobs = document.querySelectorAll('.knob');
        this.displayMenu = document.getElementById('displayMenu');

        this.knobMenu = document.getElementById('knobMenu');
        this.leds = document.querySelectorAll('.dot');

        this.keySelection = document.getElementById('keySelection');
        this.bassSelection = document.getElementById('bassSelection');
        this.keyOptions = document.getElementById('selectKeyType');
        this.bassOptions = document.getElementById('selectBassType');
        this.dispKeyOctave = document.getElementById('keyOctave');
        this.dispBassOctave = document.getElementById('bassOctave');
        this.keyActive = document.getElementById('turnOnKey');
        this.bassActive = document.getElementById('turnOnBass');
        this.keyVolumeIndicator = document.getElementById('keyVolumeIndicator');
        this.bassVolumeIndicator = document.getElementById('bassVolumeIndicator');
        this.buttons = document.querySelectorAll('.mono');
        this.arpSelection = document.getElementById("arpSelection");
        this.arpActive = document.getElementById("turnOnArp");
        this.arpOptions = document.getElementById("selectArpType");
        this.arpOctaveMinus = document.getElementById("arpOctaveMinus");
        this.dispArpOctave = document.getElementById("arpOctave");
        this.arpOctavePlus = document.getElementById("arpOctavePlus");
        this.whoFollow = document.getElementById("whoFollow");
        this.susArp = document.getElementById("susArp");
        this.arpVolumeIndicator = document.getElementById("ArpVolumeIndicator");

        this.splitIndicator = document.getElementById('splitIndicator');
        this.splitDot = document.getElementById('splitDot1');


        this.keys = document.querySelectorAll('.key');
        this.blacKeys = document.querySelectorAll('.blacKey');
        this.displayPads = document.querySelectorAll('.pad');

        // Get references to the selection menu components
        this.presetOptions = document.getElementById('presetOptions');
        this.pedalOptions = document.getElementById('pedalOptions');
        this.presetSelect = document.getElementById('presetSelect');
        this.pedalSelect = document.getElementById('pedalSelect');

        this.knobElements = document.querySelectorAll('.knob');
        this.ledInterval = null;
        this.renderAll();
        this.attachEventListeners();
        console.log('Controller ok.');
    }

    attachEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateLedClasses();
            this.view.animateAmplitudePlot(
                this.knobElements,
                this.displayPads,
                this.display,
                this.keyOptions,
                this.bassOptions,
                this.arpOptions,
                this.keyVolumeIndicator,
                this.bassVolumeIndicator,
                this.arpVolumeIndicator,
                this.buttons,
                this.leds,
            );
            this.renderAll();
        });
    }

    flipPad(idx) {
        let padRow = document.getElementById('padrow');
        let pad = padRow.children[idx];
        this.view.flipPad(pad);
    }

    //Menu-----------------------------------------------------------


    setPreset(selectedOption) {
        let bool = false;
        this.model.presets.forEach((preset) => {
            if (preset.name === selectedOption) {
                bool = true;
                this.model.setPreset(preset);
            }
        });
        if (!bool) { alert('Invalid preset'); }
        this.renderAll();
    }

    //Knobs-----------------------------------------------------------

    synchronizeKnobs() {
        this.knobElements.forEach((knob, idx) => {
            this.view.rotateKnob(knob, this.model.knobsLevel[idx] * 100);
        });
    }

    //Play controls
    handleSustain(note) {
        this.model.handleSustain(note);
        this.model.handleBassSustain(note);
        this.model.handleArpSustain(note);
        this.renderAll();
    }

    handleNoteOn(note) {
        const actKey = this.model.activateKey;
        const actBass = this.model.activateBass;
        const actArp = this.model.activeArp;
        let result = null;
        if (actArp && (this.model.splitArp === false || note >= 60)) {
            result = this.model.handleArpeggioOn(note);
        }

        if (actKey && (this.model.split === false || note >= 60)) {
            if (this.model.keyMono) {
                this.model.deleteAllNotes('key');
                this.model.deleteAllSustainedNotes('key');
            }
            result = this.model.handleNoteOn(note);
        }

        if (actBass && (this.model.split === false || note < 60)) {
            if (this.model.bassMono) {
                this.model.deleteAllNotes('bass');
                this.model.deleteAllSustainedNotes('bass');
            }
            const result2 = this.model.handleBassOn(note);
            if (!(result || result2)) { console.log("Error in handleNoteOn (Controller)"); }
        }
        this.updateKeyClasses();
        this.renderAll();
    }

    handleNoteOff(note) {
        const result1 = this.model.handleNoteOff(note);
        const result2 = this.model.handleBassOff(note);
        this.model.handleArpeggioOff(note);
        const result = result1 || result2;
        this.updateKeyClasses();
        this.renderAll();
    }

    handlePadOn(note) {
        const result = this.model.handlePadOn(note);
        if (result) {
            this.flipPad(note);
        }
        this.renderAll();
    }
    handlePadOff(note) {
        const result = this.model.handlePadOff(note);
        if (result) {
            this.flipPad(note);
        }
        this.renderAll();
    }

    handleControlChangeEvent(device, controllerNumber, value) {
        const result = this.model.handleControlChangeEvent(device, controllerNumber, value);
        if (result) {
            this.renderAll();
        }
    }

    manageChangeMode(inst) {
        this.model.deleteAllNotes(inst);
    }


    flipWheel(inst) {
        this.model.flipWheel(inst);
        this.renderAll();
    }

    handleWheel(value) {
        this.model.handleWheel(value);
        this.renderAll();
    }
    shiftOctave(inst, direction) {
        this.model.shiftOctave(inst, direction);
        this.manageChangeMode(inst);
        this.renderAll();
    }

    turnOn(inst) {
        if (inst === 'key') { this.model.activateKey = !this.model.activateKey; }
        else if (inst == 'bass') { this.model.activateBass = !this.model.activateBass; }
        this.renderAll();
    }
    waveformChanger(inst) {
        if (inst === 'key') { this.model.currentOptionKeyIndex = (this.model.currentOptionKeyIndex + 1) % this.model.waveformOptions.length; }
        if (inst === 'bass') { this.model.currentOptionBassIndex = (this.model.currentOptionBassIndex + 1) % this.model.waveformOptions.length; }
        if (inst === 'arp') { this.model.currentOptionArpIndex = (this.model.currentOptionArpIndex + 1) % this.model.waveformOptions.length; }
        this.model.setWaveform();
        this.renderAll();
    }

    flipMono(inst) {
        this.model.flipMono(inst);
        this.renderAll();
    }
    flipSustain(inst) {
        this.model.flipSust(inst);
        this.renderAll();
    }

    updateKeyClasses() {
        for (let i = 1; i <= 25; i++) {
            const keyElement = document.getElementById(`key${i}`);
            if (this.model.pressedKeys[this.model.getKeyShift(i + 47)] || this.model.pressedBass[this.model.getBassShift(i + 47)]) {
                if (keyElement.classList.contains('blacKey')) {
                    keyElement.classList.remove('blacKey');
                    keyElement.classList.add('blacKey_active');
                } else if (keyElement.classList.contains('key')) {
                    keyElement.classList.add('key_active');
                }
            } else {
                if (keyElement.classList.contains('blacKey_active')) {
                    keyElement.classList.remove('blacKey_active');
                    keyElement.classList.add('blacKey');
                } else if (keyElement.classList.contains('key_active')) {
                    keyElement.classList.remove('key_active');
                    keyElement.classList.add('key');
                }
            }
        }
    }

    updateLedClasses() {
        this.ledInterval = setInterval(() => {
            for (let i = 1; i <= 25; i++) {
                const ledElement = document.getElementById(`dot${i}`)
                if (this.model.currentArpNote === 0) {
                    if (ledElement.classList.contains('activeDot')) {
                        ledElement.classList.remove('activeDot');
                        ledElement.classList.add('dot');
                    }
                }
                else if (this.model.currentArpNote === this.model.getArpShift(i + 47)) {
                    if (ledElement.classList.contains('dot')) {
                        ledElement.classList.remove('dot');
                        ledElement.classList.add('activeDot');
                    }
                } else {
                    if (ledElement.classList.contains('activeDot')) {
                        ledElement.classList.remove('activeDot');
                        ledElement.classList.add('dot');
                    }
                }
            }
        }, this.model.knobsLevel[4]);
    }

    splitManager(inst) {
        if (inst === 'arp') {
            this.model.flipSplitArp();
        }
        else {
            this.model.flipSplit();
        }
        this.renderAll();
    }

    connectPedalKnobs(knobNumber, mode) {
        this.model.connectPedalKnobs(knobNumber, mode);
    }

    handleArp() {
        this.model.activateInstrument('arp', '.');
        if (this.model.activeArp) {
            this.updateLedClasses();
        }
        else {
            clearInterval(this.ledInterval);
        }
        this.renderAll();
    }

    renderAll() {
        this.view.updateDisplayVolumeIndicator(this.keyVolumeIndicator, this.model.knobsLevel[17] * 100);
        this.view.updateDisplayVolumeIndicator(this.bassVolumeIndicator, this.model.knobsLevel[18] * 100);
        this.view.updateDisplayVolumeIndicator(this.arpVolumeIndicator, this.model.knobsLevel[8] * 100);
        this.view.flipButton(document.getElementById('susKey'), this.model.keySustain);
        this.view.flipButton(document.getElementById('susBass'), this.model.bassSustain);
        this.view.flipButton(document.getElementById('susArp'), this.model.arpSustain);
        this.view.flipButton(document.getElementById('monoKey'), this.model.keyMono);
        this.view.flipButton(document.getElementById('monoBass'), this.model.bassMono);
        this.view.flipButton(document.getElementById('splitIndicator'), this.model.split);
        this.view.flipButton(document.getElementById('arpSplit'), this.model.splitArp);
        this.view.flipButton(document.getElementById('arpWheel'), this.model.arpWheel);
        this.view.flipButton(document.getElementById('bassWheel'), this.model.bassWheel);
        this.view.flipButton(document.getElementById('keyWheel'), this.model.keyWheel);
        this.view.updateDisplayOctave(this.model.getOctave('key'), this.dispKeyOctave);
        this.view.updateDisplayOctave(this.model.getOctave('bass'), this.dispBassOctave);
        this.view.updateDisplayOctave(this.model.getOctave('arp'), this.dispArpOctave);
        this.view.showOscillatorType(this.keyOptions, this.model.waveformOptions[this.model.currentOptionKeyIndex]);
        this.view.showOscillatorType(this.bassOptions, this.model.waveformOptions[this.model.currentOptionBassIndex]);
        this.view.showOscillatorType(this.arpOptions, this.model.waveformOptions[this.model.currentOptionArpIndex]);
        this.view.renderActiveIndicator(this.keyActive, this.model.activateKey);
        this.view.renderActiveIndicator(this.arpActive, this.model.activeArp);
        this.view.renderActiveIndicator(this.bassActive, this.model.activateBass);
        this.view.updateSplitDot(this.splitDot, this.model.split);
        this.synchronizeKnobs();
    }

}
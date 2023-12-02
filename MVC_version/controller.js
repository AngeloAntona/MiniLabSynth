// controller.js
class Controller {
    constructor(model, view) {

        // Initialize the controller
        this.model = model;
        this.view = view;
        this.currentKnobIndex = -1;
        // Get references to the clickable objects and the context menus

        this.mainFrame = document.getElementById('mainFrame');
        this.display = document.getElementById('display');
        this.knobs = document.querySelectorAll('.knob');
        this.displayMenu = document.getElementById('displayMenu');
        this.knobMenu = document.getElementById('knobMenu');

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
        this.renderAll();
        this.attachEventListeners();
    }

    attachEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.preventRightClick();
            this.displayContextMenu();
            this.knobContextMenu();
            this.documentClick();
            this.renderAll();
        });
    }

    //lights-----------------------------------------------------------
    // flipLed(id) {
    //     let led = document.querySelector(id);
    //     this.view.flipLed(led.children[0]);
    // }

    // flipKey(id) {
    //     let key = document.querySelector(id);
    //     this.view.flipKey(key, key.getAttribute('keyType'));
    // }

    flipPad(idx) {
        let padRow = document.getElementById('padrow');
        let pad = padRow.children[idx];
        this.view.flipPad(pad);
    }

    //Menu-----------------------------------------------------------
    preventRightClick() {
        mainFrame.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    displayContextMenu() {
        this.display.addEventListener('contextmenu', (event) => {
            this.handleContextMenu(this.display, event, this.view, this.displayMenu);
        });
    }

    knobContextMenu() {
        this.knobs.forEach((knob) => {
            knob.addEventListener('contextmenu', (event) => {
                this.currentKnobIndex = knob.getAttribute('idx');
                console.log(this.currentKnobIndex);
                this.handleContextMenu(knob, event, this.view, this.knobMenu);
            });
        });
    }

    presetSelectClick() {
        this.presetSelect.addEventListener('click', () => {
            const selectedOption = this.presetOptions.value;
            if (selectedOption != 'NewPreset') {
                this.setPreset(selectedOption);
            }
            else {
                alert('New preset: ' + selectedOption);
            }
            this.view.hideContextMenu(this.displayMenu);
        });
    }

    setPreset(selectedOption) {
        if (selectedOption === 'Default') {
            this.model.setPreset(this.model.defaultPreset);
        }
        else if (selectedOption === 'Psycho') {
            this.model.setPreset(this.model.psychoPreset);
        }
        else {
            alert('Selected option: ' + selectedOption);
        }
        this.renderAll();
    }

    pedalSelectClick(knobIdx) {
        this.pedalSelect.addEventListener('click', () => {
            if (this.currentKnobIndex === knobIdx) {
                console.log(knobIdx);
                const selectedOption = this.pedalOptions.value;
                var choice = 0;
                if (selectedOption === 'Direct') { choice = 1; }
                else if (selectedOption === 'Inverse') { choice = -1; }
                this.model.connectPedalKnobs(knobIdx, choice);
                this.view.hideContextMenu(this.knobMenu);
            }
        });
    }

    documentClick() {
        document.addEventListener('click', (e) => {
            if (!this.displayMenu.contains(e.target) && !this.knobMenu.contains(e.target)) {
                this.view.hideContextMenu(this.displayMenu);
                this.view.hideContextMenu(this.knobMenu);
            }
        });
    }

    handleContextMenu(htmlElement, event, view, contextMenu) {
        const x = event.clientX;
        const y = event.clientY;
        this.view.showContextMenu(contextMenu, x, y);
        //console.log('htmlElement.getAttribute(\'id\')===\'display\': '+ (htmlElement.getAttribute('id')==='display'));
        //console.log('htmlElement.classList.value===\'knob\': '+ (htmlElement.classList.value==='knob'));
        if (htmlElement.getAttribute('id') === 'display') {
            this.presetSelectClick();
        }
        else if (htmlElement.classList.value === 'knob') {
            const idx = htmlElement.getAttribute('idx');
            this.pedalSelectClick(idx);
        }
    }

    //Knobs-----------------------------------------------------------

    synchronizeKnobs() {
        this.knobElements.forEach((knob, idx) => {
            this.view.rotateKnob(knob, this.model.knobsLevel[idx] * 100)
        });
        this.view.updateDisplayVolumeIndicator(this.keyVolumeIndicator, this.model.knobsLevel[17] * 100);
        this.view.updateDisplayVolumeIndicator(this.bassVolumeIndicator, this.model.knobsLevel[18] * 100);
    }

    //Play controls
    handleSustain(note) {
        this.model.handleSustain(note);
        this.model.handleBassSustain(note);
    }

    handleNoteOn(note) {
        const actKey = this.model.activateKey;
        const actBass = this.model.activateBass;
        let result = null;
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
    }

    handleNoteOff(note) {
        const result1 = this.model.handleNoteOff(note);
        const result2 = this.model.handleBassOff(note);
        const result = result1 || result2;
        this.updateKeyClasses();
    }

    handlePadOn(note) {
        const result = this.model.handlePadOn(note);
        if (result) {
            this.flipPad(note);
        }
    }
    handlePadOff(note) {
        const result = this.model.handlePadOff(note);
        if (result) {
            this.flipPad(note);
        }
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

    splitManager() {
        this.model.flipSplit();
        this.renderAll();
    }

    handleControlPedalEvent(value) {
        // for(const i=0; i<this.model.knobsLevel.length; i++){
        //     if(this.cntrlPedalLinks[i]===1)
    }

    connectPedalKnobs(knobNumber, mode) {
        this.model.connectPedalKnobs(knobNumber, mode);
    }

    renderAll() {
        this.view.flipButton(document.getElementById('susKey'), this.model.keySustain);
        this.view.flipButton(document.getElementById('susBass'), this.model.bassSustain);
        this.view.flipButton(document.getElementById('monoKey'), this.model.keyMono);
        this.view.flipButton(document.getElementById('monoBass'), this.model.bassMono);
        this.view.flipButton(document.getElementById('splitIndicator'), this.model.split);
        this.view.updateDisplayOctave(this.model.getOctave('key'), this.dispKeyOctave);
        this.view.updateDisplayOctave(this.model.getOctave('bass'), this.dispBassOctave);
        this.view.showOscillatorType(this.keyOptions, this.model.waveformOptions[this.model.currentOptionKeyIndex]);
        this.view.showOscillatorType(this.bassOptions, this.model.waveformOptions[this.model.currentOptionBassIndex]);
        this.view.renderActiveIndicator(this.keyActive, this.model.activateKey);
        this.view.renderActiveIndicator(this.bassActive, this.model.activateBass);
        this.view.updateSplitDot(this.splitDot, this.model.split)
        this.synchronizeKnobs();
    }

}
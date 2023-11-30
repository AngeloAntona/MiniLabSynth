// controller.js
class Controller {
    constructor(model, view) {
        console.log('Costruttore controller.js');

        // Initialize the controller
        this.model = model;
        this.view = view;
        // Get references to the clickable objects and the context menus

        this.mainFrame = document.getElementById('mainFrame');
        this.display = document.getElementById('display');
        this.knobs = document.querySelectorAll('.knob');
        this.displayMenu = document.getElementById('displayMenu');
        this.knobMenu = document.getElementById('knobMenu');

        this.keySelection = document.getElementById('keySelection');
        this.bassSelection = document.getElementById('bassSelection');
        this.keyOptions = document.getElementById('selectKeyType');
        this.currentOptionKeyIndex=0;
        this.currentOptionBassIndex=0;
        this.bassOptions = document.getElementById('selectBassType');
        this.dispKeyOctave = document.getElementById('keyOctave');
        this.dispBassOctave = document.getElementById('bassOctave');
        this.keyActive = document.getElementById('turnOnKey');
        this.bassActive = document.getElementById('turnOnBass');
        this.waveformOptions = ['sine', 'square', 'sawtooth', 'triangle'];



        this.keys = document.querySelectorAll('.key');
        this.blacKeys = document.querySelectorAll('.blacKey');
        this.displayPads = document.querySelectorAll('.pad');

        // Get references to the selection menu components
        this.presetOptions = document.getElementById('presetOptions');
        this.pedalOptions = document.getElementById('pedalOptions');
        this.presetSelect = document.getElementById('presetSelect');
        this.pedalSelect = document.getElementById('pedalSelect');

        this.knobElements = document.querySelectorAll('.knob');
        this.attachEventListeners();

    }

    attachEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.preventRightClick();
            this.displayContextMenu();
            this.knobContextMenu();
            this.presetSelectClick();
            this.pedalSelectClick();
            this.documentClick();
        });
    }

    //lights-----------------------------------------------------------
    flipLed(id) {
        let led = document.querySelector(id);
        this.view.flipLed(led.children[0]);
    }

    flipKey(id) {
        let key = document.querySelector(id);
        this.view.flipKey(key, key.getAttribute('keyType'));
    }

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
            this.handleContextMenu(event, this.view, this.displayMenu);
        });
    }

    knobContextMenu() {
        this.knobs.forEach((knob) => {
            knob.addEventListener('contextmenu', (event) => {
                this.handleContextMenu(event, this.view, this.knobMenu);
            });
        });
    }

    presetSelectClick() {
        this.presetSelect.addEventListener('click', () => {
            const selectedOption = this.presetOptions.value;
            alert('Selected option: ' + selectedOption);
            this.view.hideContextMenu(this.displayMenu);
        });
    }

    pedalSelectClick() {
        this.pedalSelect.addEventListener('click', () => {
            const selectedOption = this.pedalOptions.value;
            alert('Selected option: ' + selectedOption);
            this.view.hideContextMenu(this.knobMenu);
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

    handleContextMenu(event, view, contextMenu) {
        const x = event.clientX;
        const y = event.clientY;
        view.showContextMenu(contextMenu, x, y);
    }

    //Knobs-----------------------------------------------------------

    synchronizeKnobs() {
        this.knobElements.forEach((knob, idx) => {
            this.view.rotateKnob(knob, this.model.knobsLevel[idx] * 100)
        });
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
        if (actKey) { 
            if(this.model.keyMono)
            {
                this.model.deleteAllNotes('key');
                this.model.deleteAllSustainedNotes('key');
            }
            result = this.model.handleNoteOn(note); 
        }
        if (actBass) {
            if(this.model.bassMono)
            {
                this.model.deleteAllNotes('bass');
                this.model.deleteAllSustainedNotes('bass');
            }
            const result2 = this.model.handleBassOn(note);
            result = result || result2;
        }
        if (result) {
            this.flipLed(result.ledSelector);
            this.flipKey(result.keySelector);
        }
    }

    handleNoteOff(note) {
        const result1 = this.model.handleNoteOff(note);
        const result2 = this.model.handleBassOff(note);
        const result = result1 || result2;
        if (result) {
            this.flipLed(result.ledSelector);
            this.flipKey(result.keySelector);
        }
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

    handleControlChangeEvent(controllerNumber, value) {
        const result = this.model.handleControlChangeEvent(controllerNumber, value);
        if (result) {
            this.synchronizeKnobs()
        }
    }

    manageChangeMode(inst) {
        this.model.deleteAllNotes(inst);
    }

    shiftOctave(inst, direction) {
        this.model.shiftOctave(inst, direction);
        this.manageChangeMode(inst);
        if (inst === 'key') { this.view.updateDisplayOctave(this.model.getOctave(inst), this.dispKeyOctave) }
        else if (inst == 'bass') { this.view.updateDisplayOctave(this.model.getOctave(inst), this.dispBassOctave) }
    }

    turnOn(inst) {
        if (inst === 'key') {
            this.model.activateKey = !this.model.activateKey;
            this.view.renderActiveIndicator(this.keyActive, this.model.activateKey);
        }
        else if (inst == 'bass') {
            this.model.activateBass = !this.model.activateBass;
            this.view.renderActiveIndicator(this.bassActive, this.model.activateBass);
        }
    }
    waveformChanger(inst) {
        if (inst === 'key') {
            // Increment the index (loop back to 0 if reaching the end)
            this.currentOptionKeyIndex = (this.currentOptionKeyIndex + 1) % this.waveformOptions.length;
            // Update the text content of the element with the new option
            this.view.showOscillatorType(this.keyOptions,this.waveformOptions[this.currentOptionKeyIndex]);
            this.model.setWaveform(inst, this.waveformOptions[this.currentOptionKeyIndex]);
        }
        if (inst === 'bass') {
            // Increment the index (loop back to 0 if reaching the end)
            this.currentOptionBassIndex = (this.currentOptionBassIndex + 1) % this.waveformOptions.length;
            // Update the text content of the element with the new option
            this.view.showOscillatorType(this.bassOptions,this.waveformOptions[this.currentOptionBassIndex]);
            this.model.setWaveform(inst, this.waveformOptions[this.currentOptionBassIndex]);
        }
    }
    flipMono(inst){
        this.model.flipMono(inst);
        if(inst==='key'){
            this.view.flipButton(document.getElementById('monoKey'));
        }
        else if(inst==='bass'){
            this.view.flipButton(document.getElementById('monoBass'));
        }
    }
    flipSustain(inst){
        this.model.flipSust(inst);
        if(inst==='key'){
            this.view.flipButton(document.getElementById('susKey'));
        }
        else if(inst==='bass'){
            this.view.flipButton(document.getElementById('susBass'));
        }
    }
}
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

        this.keys = document.querySelectorAll('.key');
        this.blacKeys = document.querySelectorAll('.blacKey');
        this.displayPads=document.querySelectorAll('.pad');

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

    synchronizeKnobs(){
        this.knobElements.forEach((knob, idx) => {
            this.view.rotateKnob(knob, this.model.knobsLevel[idx]*100)
        });
    }

    //Play controls
    handleSustain(note) {
        this.model.handleSustain(note);
    }

    handleNoteOn(note) {
        const result = this.model.handleNoteOn(note);
        if (result) {
            this.flipLed(result.ledSelector);
            this.flipKey(result.keySelector);
        }
    }

    handleNoteOff(note) {
        const result = this.model.handleNoteOff(note);
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
}

class TouchController {
    constructor(controller) {
        this.controller = controller;
        this.initialValue = 0;
        this.attachKnobEventListeners();

        this.attachKeysEventListeners(this.controller.keys);
        this.attachKeysEventListeners(this.controller.blacKeys);
        this.attachPadsEventListeners();
        this.attachDisplayButtonsEventListeners();
        this.attachDisplaySplitEventListener();
    }

    //Knobs

    attachKnobEventListeners() {
        this.controller.knobElements.forEach((knob, idx) => {
            let isDragging = false;
            this.controller.synchronizeKnobs();

            knob.addEventListener('mousedown', (e) => {
                isDragging = true;
                this.initialValue = this.controller.model.knobsLevel[idx] * 127 - e.clientY;
            });

            window.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    const newValue = Math.min(100, Math.max(0, this.initialValue + e.clientY));
                    this.controller.handleControlChangeEvent('touch', idx + 19, newValue * 1.27);
                }
            });

            window.addEventListener('mouseup', () => {
                isDragging = false;
            });
        });
    }

    //Keys
    attachKeysEventListeners(keys) {
        keys.forEach((key) => {
            const note = Number(key.getAttribute('dataNote'));

            key.addEventListener('mousedown', () => {
                this.controller.handleNoteOn(47 + note);
            });

            key.addEventListener('mouseup', () => {
                this.controller.handleNoteOff(47 + note);
            });

            key.addEventListener('mouseleave', () => {
                this.controller.handleNoteOff(47 + note);
            });
        });
    }

    //Pads
    attachPadsEventListeners() {
        this.controller.displayPads.forEach((pad, idx) => {
            pad.addEventListener('mousedown', () => {
                this.controller.handlePadOn(idx);
            });

            pad.addEventListener('mouseup', () => {
                this.controller.handlePadOff(idx);
            });

            pad.addEventListener('mouseleave', () => {
                this.controller.handlePadOff(idx);
            });
        });
    }

    //Display
    attachDisplayButtonsEventListeners() {
        const arpSel = this.controller.arpSelection;
        const ArpChildrenNumber = arpSel.childElementCount;
        for (let i = 0; i < ArpChildrenNumber; i++) {
            const button = arpSel.children[i];
            const buttType = button.getAttribute('id');
            if (buttType === 'turnOnArp') {
                button.addEventListener('mousedown', () => { this.controller.handleArp() });
            }
            else if (buttType === 'selectArpType') {
                button.addEventListener('mousedown', () => { this.controller.waveformChanger('arp') });
            }
            else if (buttType === 'arpOctaveMinus') {
                button.addEventListener('mousedown', () => { this.controller.shiftOctave('arp', '-') });
            }
            else if (buttType === 'arpOctavePlus') {
                button.addEventListener('mousedown', () => { this.controller.shiftOctave('arp', '+'); });
            }
            else if (buttType === 'arpSplit') {
                button.addEventListener('mousedown', () => { this.controller.splitManager('arp'); });
            }
            else if (buttType === 'susArp') {
                button.addEventListener('mousedown', () => { this.controller.flipSustain('arp') });
            }
        }


        const keySel = this.controller.keySelection;
        const instChildrenNumber = keySel.childElementCount;
        for (let i = 0; i < instChildrenNumber; i++) {
            const button = keySel.children[i];
            const buttType = button.getAttribute('id');
            if (buttType === 'turnOnKey') {
                button.addEventListener('mousedown', () => { this.controller.turnOn('key') });
            }
            else if (buttType === 'selectKeyType') {
                button.addEventListener('mousedown', () => { this.controller.waveformChanger('key') });
            }
            else if (buttType === 'keyOctaveMinus') {
                button.addEventListener('mousedown', () => { this.controller.shiftOctave('key', '-') });
            }
            else if (buttType === 'keyOctavePlus') {
                button.addEventListener('mousedown', () => { this.controller.shiftOctave('key', '+'); });
            }
            else if (buttType === 'monoKey') {
                button.addEventListener('mousedown', () => { this.controller.flipMono('key') });
            }
            else if (buttType === 'susKey') {
                button.addEventListener('mousedown', () => { this.controller.flipSustain('key') });
            }
        }

        const bassSel = this.controller.bassSelection;
        const childrenNum = bassSel.childElementCount;
        for (let i = 0; i < childrenNum; i++) {
            const button = bassSel.children[i];
            const buttType = button.getAttribute('id');
            if (buttType === 'turnOnBass') {
                button.addEventListener('mousedown', () => { this.controller.turnOn('bass') });
            }
            else if (buttType === 'selectBassType') {
                button.addEventListener('mousedown', () => { this.controller.waveformChanger('bass') });
            }
            else if (buttType === 'bassOctaveMinus') {
                button.addEventListener('mousedown', () => { this.controller.shiftOctave('bass', '-') });
            }
            else if (buttType === 'bassOctavePlus') {
                button.addEventListener('mousedown', () => { this.controller.shiftOctave('bass', '+'); });
            }
            else if (buttType === 'monoBass') {
                button.addEventListener('mousedown', () => { this.controller.flipMono('bass') });
            }
            else if (buttType === 'susBass') {
                button.addEventListener('mousedown', () => { this.controller.flipSustain('bass') });
            }
        }
    }

    attachDisplaySplitEventListener() {
        const split = this.controller.splitIndicator;
        split.addEventListener('mousedown', () => {
            this.controller.splitManager();
        });
    }
}
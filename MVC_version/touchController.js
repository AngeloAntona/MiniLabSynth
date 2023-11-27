class TouchController {
    constructor(controller) {
        this.controller = controller;
        this.initialValue = 0;
        this.attachKnobEventListeners();

        this.attachKeysEventListeners(this.controller.keys);
        this.attachKeysEventListeners(this.controller.blacKeys);
        this.attachPadsEventListeners();
    }

    //Knobs

    attachKnobEventListeners() {
        this.controller.knobElements.forEach((knob, idx) => {
            let isDragging = false;
            this.controller.synchronizeKnobs();

            knob.addEventListener('mousedown', (e) => {
                isDragging = true;
                this.initialValue = this.controller.model.knobsLevel[idx]*127 - e.clientY;
            });

            window.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    const newValue = Math.min(100, Math.max(0, this.initialValue + e.clientY));
                    this.controller.handleControlChangeEvent(idx+19, newValue*1.27)
                }
            });

            window.addEventListener('mouseup', () => {
                isDragging = false;
            });
        });
    }

    //Keys
    attachKeysEventListeners(keys){
        keys.forEach((key) => {
            const note = Number(key.getAttribute('dataNote'));
        
            key.addEventListener('mousedown', () => {
                this.controller.handleNoteOn(47+note);
            });
        
            key.addEventListener('mouseup', () => {
                this.controller.handleNoteOff(47+note);
            });
        
            key.addEventListener('mouseleave', () => {
                this.controller.handleNoteOff(47+note);
            });
        });
    }
    
    //Pads
    attachPadsEventListeners(){
        this.controller.displayPads.forEach((pad,idx) => {
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
}
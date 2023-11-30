// view.js
class View {
    constructor(audioModel) {
        // Initialize the view
        console.log('Costruttore view.js');
        this.audioModel = audioModel;
        this.canvas = document.getElementById('signalCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.frequency = 0.02;
        this.phase = 0;
        this.centerX = this.canvas.width / 2;
        this.animateSinusoid();
    }
    //lights-----------------------------------------------------------
    flipLed(led) {
        if (led.classList.value === 'dot') {
            led.classList.add('activeDot');
            led.classList.toggle('dot');
        } else if (led.classList.value === 'activeDot') {
            led.classList.add('dot');
            led.classList.toggle('activeDot');
        }
    }


    flipKey(keyElement, keyType) {
        if (keyElement.classList.value === keyType) {
            keyElement.classList.add(`${keyType}_active`);
            keyElement.classList.toggle(keyType);
        } else if (keyElement.classList.value === `${keyType}_active`) {
            keyElement.classList.add(keyType);
            keyElement.classList.toggle(`${keyType}_active`);
        } else {
            // Handle other cases if needed
        }
    }

    flipPad(padElement) {
        if (padElement.classList.value === 'pad') {
            padElement.classList.add('activePad');
            padElement.classList.toggle('pad');
        } else if (padElement.classList.value === 'activePad') {
            padElement.classList.add('pad');
            padElement.classList.toggle('activePad');
        }
    }

    //Menu-----------------------------------------------------------
    hideContextMenu(contextMenu) {
        contextMenu.classList.add('hidden');
    }

    showContextMenu(contextMenu, x, y) {
        contextMenu.style.position = 'absolute';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.classList.remove('hidden');
    }

    //Knobs-----------------------------------------------------------
    rotateKnob(knob, rotation) {
        knob.children[0].style.transform = `rotate(${rotation * 2.7 - 135}deg)`;
        knob.children[1].innerHTML = rotation.toFixed(0);
    }

    //Visualizer-----------------------------------------------------------
    drawSinusoidalSignal() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.clearRect(0, 0, width, height);

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 20;

        for (let x = 0; x < width; x++) {
            const currentAmplitude = this.audioModel.getAmplitude();
            const y = height / 2 + Math.sin(this.frequency * x + this.phase) * 200 * currentAmplitude;
            this.ctx.lineTo(x, y);
        }

        this.ctx.stroke();
    }

    animateSinusoid() {
        this.phase += 0.01; // Adjust the animation speed
        this.drawSinusoidalSignal();
        requestAnimationFrame(this.animateSinusoid.bind(this));
    }

    //display-----------------------------------------------------------
    updateDisplayOctave(octave, displayObj){
        displayObj.innerHTML=octave;
    }

    renderActiveIndicator(indicator, boolean){
        if (boolean){
            indicator.classList.add('turnOnActive');
            indicator.classList.toggle('turnOn');
        }
        else{
            indicator.classList.add('turnOn');
            indicator.classList.toggle('turnOnActive');
        }
    }

    showOscillatorType(cell,text){
        cell.textContent = text;
    }

    flipButton(button, boolean){
        if (boolean){
            button.classList.add('monoActive');
            button.classList.toggle('mono');
        }
        else{
            button.classList.add('mono');
            button.classList.toggle('monoActive');
        }
    }
}

// view.js
class View {
    constructor(audioModel) {
        this.audioModel = audioModel;
        this.canvas = document.getElementById('signalCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.frequency = 0.02;
        this.phase = 0;
        this.centerX = this.canvas.width / 2;
        this.amplitudeHistory = [];
        this.maxHistoryLength = 250;
        //this.animateSinusoid();
        this.animateAmplitudePlot();
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
    updateDisplayVolumeIndicator(VolumeIndicator, value) {
        VolumeIndicator.innerHTML = value.toFixed(0);
    }

    // //Visualizer-----------------------------------------------------------
    // drawSinusoidalSignal() {
    //     const width = this.canvas.width;
    //     const height = this.canvas.height;

    //     this.ctx.clearRect(0, 0, width, height);

    //     this.ctx.beginPath();
    //     this.ctx.strokeStyle = 'black';
    //     this.ctx.lineWidth = 20;

    //     for (let x = 0; x < width; x++) {
    //         const currentAmplitude = this.audioModel.getAmplitude();
    //         const y = height / 2 + Math.sin(this.frequency * x + this.phase) * 200 * currentAmplitude;
    //         this.ctx.lineTo(x, y);
    //     }

    //     this.ctx.stroke();
    // }

    // animateSinusoid() {
    //     this.phase += 0.01; // Adjust the animation speed
    //     this.drawSinusoidalSignal();
    //     requestAnimationFrame(this.animateSinusoid.bind(this));
    // }


    // Visualizer-----------------------------------------------------------
    drawAmplitudePlot() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.clearRect(0, 0, width, height);

        //ExternLine
        this.ctx.beginPath();
        
        const sum = this.amplitudeHistory.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        // Calculate the average
        const average = sum / this.amplitudeHistory.length;

        this.ctx.strokeStyle = 'rgb(128, 128, 128)';
        this.ctx.lineWidth = 15;
        if (this.amplitudeHistory.length === this.maxHistoryLength) { this.amplitudeHistory.shift(); }
        this.amplitudeHistory.push((this.audioModel.getAmplitude()));
        const historyLength = this.amplitudeHistory.length;

        if (historyLength > 1) {
            const xStep = width / historyLength;

            for (let i = 0; i < historyLength; i++) {
                const x = i * xStep;
                const y = height / 2 - this.amplitudeHistory[i] * 280 * Math.pow(-1, i);
                this.ctx.lineTo(x, y);
            }

            this.ctx.stroke();
        }

        //BorderLine
        this.ctx.beginPath();
        
        this.ctx.strokeStyle = 'rgb(128, 128, 128)';
        this.ctx.lineWidth = 10;
        if (this.amplitudeHistory.length === this.maxHistoryLength) { this.amplitudeHistory.shift(); }
        this.amplitudeHistory.push((this.audioModel.getAmplitude()));

        if (historyLength > 1) {
            const xStep = width / historyLength;

            for (let i = 0; i < historyLength; i++) {
                const x = i * xStep;
                const y = height / 2 - this.amplitudeHistory[i] * 80 * Math.pow(-1, i);
                this.ctx.lineTo(x, y);
            }

            this.ctx.stroke();
        }

        //InternLine
        this.ctx.beginPath();
        
        this.ctx.strokeStyle = 'rgb(' + 2000*average + ',' + 2000*average + ',' + 2000*average + ')';
        this.ctx.lineWidth = 10;
        if (this.amplitudeHistory.length === this.maxHistoryLength) { this.amplitudeHistory.shift(); }
        this.amplitudeHistory.push((this.audioModel.getAmplitude()));

        if (historyLength > 1) {
            const xStep = width / historyLength;

            for (let i = 0; i < historyLength; i++) {
                const x = i * xStep;
                const y = height / 2 - this.amplitudeHistory[i] * 30 * Math.pow(-1, i);
                this.ctx.lineTo(x, y);
            }

            this.ctx.stroke();
        }
    }

    animateAmplitudePlot() {
        this.drawAmplitudePlot();
        requestAnimationFrame(this.animateAmplitudePlot.bind(this));
    }


    //display-----------------------------------------------------------
    updateDisplayOctave(octave, displayObj) {
        displayObj.innerHTML = octave;
    }

    renderActiveIndicator(indicator, boolean) {
        if (boolean && indicator.classList.value === 'turnOn') {
            indicator.classList.add('turnOnActive');
            indicator.classList.toggle('turnOn');
        }
        else if (!boolean && indicator.classList.value === 'turnOnActive') {
            indicator.classList.add('turnOn');
            indicator.classList.toggle('turnOnActive');
        }
    }

    showOscillatorType(cell, text) {
        cell.textContent = text.toUpperCase();
    }

    flipButton(button, boolean) {
        if (boolean && button.classList.value === 'mono') {
            button.classList.add('monoActive');
            button.classList.toggle('mono');
        }
        else if (!boolean && button.classList.value === 'monoActive') {
            button.classList.add('mono');
            button.classList.toggle('monoActive');
        }
    }
    updateSplitDot(dot, boolean) {
        if (boolean && dot.classList.value === 'splitDot') {
            dot.classList.add('splitDotActive');
            dot.classList.toggle('splitDot');
        }
        else if (!boolean && dot.classList.value === 'splitDotActive') {
            dot.classList.add('splitDot');
            dot.classList.toggle('splitDotActive');
        }
    }
}

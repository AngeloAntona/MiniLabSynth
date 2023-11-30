// app.js
const audioModel = new AudioModel();
const model = new Model(audioModel);
const view = new View(audioModel);
const controller = new Controller(model, view);
const midiController = new MidiController(controller);
const touchController = new TouchController(controller);
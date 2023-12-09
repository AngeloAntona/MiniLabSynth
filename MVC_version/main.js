import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

//Create functions.
const audioModel = new AudioModel();
const model = new Model(audioModel);
const view = new View(audioModel);
const controller = new Controller(model, view);
const midiController = new MidiController(controller);
const touchController = new TouchController(controller);

//Importing HTML elements.
const loadPresetButton = document.getElementById("loadPreset");
const displayMenu = document.getElementById('displayMenu');
const nameInput = document.getElementById('nameInput');
const saveMenu = document.getElementById('savePresetMenu');
const loginSubtitle = document.getElementById('loginSubtitle');
const openLogin = document.getElementById('openLogin');
const simpleCircle1 = document.getElementById('simpleCircle1');
const simpleCircle2 = document.getElementById('simpleCircle2');
const closeLogin = document.getElementById('closeLogin');
const loginConfirm = document.getElementById('loginConfirm');
const loginDiv = document.getElementById('loginDiv');
const email = document.getElementById('email');
const password = document.getElementById('password');
const opacityIntervals = [];

//Firebase access.
const firebaseApp = initializeApp({
    apiKey: "AIzaSyBuBF7NGE3NozDgLmOetor5RhLHIn-t9Wo",
    authDomain: "analogkeylab.firebaseapp.com",
    projectId: "analogkeylab",
    storageBucket: "analogkeylab.appspot.com",
    messagingSenderId: "488767414188",
    appId: "1:488767414188:web:31bdaade37455d46ae2409",
    measurementId: "G-T34VCS71PG"
});
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
onAuthStateChanged(auth, (user) => {
    if (user != null) {
        console.log('Logged in.');
    } else {
        console.log('No user');
    }
});

let collRef = '';

function updatePresets() {
    collRef = collection(db, 'defaultPresets');
    getDocs(collRef)
        .then((querySnapshot) => {
            const defaultPresets = [];
            querySnapshot.forEach((doc) => {
                const presets = doc.data();
                defaultPresets.push(presets);
            });
            model.setPresets(defaultPresets);
            controller.renderAll();
        })
        .catch((error) => { console.error('Error getting documents: ', error); });
}

function login() {
    const emailData = email.value;
    const passwordData = password.value;
    signInWithEmailAndPassword(auth, emailData, passwordData)
        .then((userCredential) => {
            opacityIntervals.forEach(interval => { clearInterval(interval); });
            loginSubtitle.innerHTML = 'Logged in';
            const accessIndicatorDot = openLogin.children[0]
            accessIndicatorDot.style.backgroundColor = 'green';
            const user = userCredential.user;
            for (let i = 100; i >= 0; i--) {
                j = i;
                const timeout = setTimeout(() => { loginDiv.style.opacity = i + '%' }, (1000 - (i * 10)));
                opacityIntervals.push(timeout);
            }
            const interval = setTimeout(() => loginDiv.classList.add('hidden'), 1000);
            loginConfirm.classList.add('hidden');
            simpleCircle2.style.backgroundColor = 'green';
            simpleCircle1.style.backgroundColor = 'green';
            opacityIntervals.push(interval);
            console.log('Logged in:', user);
        })
        .catch((error) => {
            // Handle login errors
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Login error:', errorCode, errorMessage);
            alert('Login error:', errorCode, errorMessage);
        });
}


//Menu functions.
function createMenu() {
    controller.options = model.getPresetNames();
    controller.presetOptions.innerHTML = '';
    controller.options.forEach((optionText) => {
        const option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText.toUpperCase();
        controller.presetOptions.appendChild(option);
    });
}

function preventRightClick() {
    mainFrame.addEventListener('contextmenu', (event) => { event.preventDefault(); });
}

function knobContextMenu() {
    controller.knobs.forEach((knob) => {
        knob.addEventListener('contextmenu', (event) => {
            controller.currentKnobIndex = knob.getAttribute('idx');
            handleContextMenu(knob, event);
        });
    });
}

function presetSelectClick() {
    controller.presetSelect.addEventListener('click', () => {
        const selectedOption = controller.presetOptions.value;
        if (selectedOption != 'NewPreset') { controller.setPreset(selectedOption); }
        else { alert('New preset: ' + selectedOption); }
        view.hideContextMenu(controller.displayMenu);
    });
}

function pedalSelectClick(knobIdx) {
    controller.pedalSelect.addEventListener('click', () => {
        if (controller.currentKnobIndex === knobIdx) {
            const selectedOption = controller.pedalOptions.value;
            var choice = 0;
            if (selectedOption === 'Direct') { choice = 1; }
            else if (selectedOption === 'Inverse') { choice = -1; }
            model.connectPedalKnobs(knobIdx, choice);
            view.hideContextMenu(controller.knobMenu);
        }
    });
}

function documentClick() {
    document.addEventListener('click', (e) => {
        if (!controller.displayMenu.contains(e.target) &&
            !controller.knobMenu.contains(e.target) &&
            !saveMenu.contains(e.target) &&
            !savePresetButton.contains(e.target) &&
            !loadPresetButton.contains(e.target)) { hideMenu(); }
    });
}

function hideMenu() {
    view.hideContextMenu(controller.displayMenu);
    view.hideContextMenu(controller.knobMenu);
    view.hideContextMenu(saveMenu);
}

function handleContextMenu(htmlElement, event) {
    hideMenu();
    console.log(event);
    const x = event.clientX;
    const y = event.clientY;
    if (htmlElement.getAttribute('id') === 'loadPreset') {
        view.showContextMenu(controller.displayMenu, x, y - 110);
        presetSelectClick();
    }
    else if (htmlElement.classList.value === 'knob') {
        view.showContextMenu(controller.knobMenu, x, y);
        const idx = htmlElement.getAttribute('idx');
        pedalSelectClick(idx);
    }
    else if (htmlElement.getAttribute('id') === 'savePreset') {
        nameInput.value = '';
        console.log(x, y)
        view.showContextMenu(saveMenu, x, y + 10);
    }
}

function displayLoadMenu() {
    loadPresetButton.addEventListener('click', (event) => {
        console.log('loadButton');
        createMenu();
        handleContextMenu(loadPresetButton, event);
    });
}

const savePresetButton = document.getElementById("savePreset");
function displaySaveMenu() {
    savePresetButton.addEventListener('click', (event) => {
        console.log('saveButton');
        handleContextMenu(savePresetButton, event);
    });
}

function savePresetSelectClick() {
    const presetNamesubmit = document.getElementById('submitButton');
    presetNamesubmit.addEventListener('click', () => {
        hideMenu();
        const newPreset = model.exportCurrentPreset(nameInput.value);
        addDoc(collRef, newPreset)
            .then((docRef) => { console.log('Document written with ID: ', docRef.id); })
            .catch((error) => { console.error('Error adding document: ', error); });
        updatePresets();
    });
}

loginConfirm.addEventListener('click', () => {
    login();
});

let j = 0;
openLogin.addEventListener('click', () => {
    if (j < 10 && loginDiv.classList.contains('hidden')) {
        opacityIntervals.forEach(interval => { clearInterval(interval); });
        loginDiv.classList.remove('hidden');
        for (let i = 0; i <= 100; i++) {
            j = i;
            const timeout = setTimeout(() => { loginDiv.style.opacity = (i) + '%'; }, i * 10);
            opacityIntervals.push(timeout);
        }
    }
});

closeLogin.addEventListener('click', () => {
    if (j > 90 && !loginDiv.classList.contains('hidden')) {
        opacityIntervals.forEach(interval => {
            clearInterval(interval);
        });
        for (let i = 100; i >= 0; i--) {
            j = i;
            const timeout = setTimeout(() => { loginDiv.style.opacity = i + '%' }, (1000 - (i * 10)));
            opacityIntervals.push(timeout);
        }
        setTimeout(() => loginDiv.classList.add('hidden'), 1000);
    }
});

savePresetSelectClick();
preventRightClick();
knobContextMenu();
documentClick();
displaySaveMenu();
displayLoadMenu();
updatePresets();

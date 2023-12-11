import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc, query, where, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

//Model.
const audioModel = new AudioModel();
const model = new Model(audioModel);
const view = new View(audioModel);
const controller = new Controller(model, view);
const midiController = new MidiController(controller);
const touchController = new TouchController(controller);

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

function logOut() {
    signOut(auth);
    renderLogOut();
}
logOut();

onAuthStateChanged(auth, (user) => {
    if (user != null) {
        getUserPresets();
        console.log('Current User:', user);
    } else {
        userPresets.length = 0;
        getDefaultPresets();
        console.log('No user');
    }
});

let defaultPresets = [];
let userPresets = [];
const opacityIntervals = [];
let j = 0;

function getDefaultPresets() {
    const defCollectionRef = collection(db, 'defaultPresets');
    getDocs(defCollectionRef)
        .then((querySnapshot) => {
            defaultPresets.length = 0;
            querySnapshot.forEach((doc) => {
                const preset = doc.data();
                defaultPresets.push(preset);
            });
            model.setPresets(defaultPresets);
            controller.renderAll();
        })
        .catch((error) => { console.error('Error getting defaultPresets: ', error); });
}

function getUserPresets() {
    const user = auth.currentUser;
    const userId = user ? user.uid : null;
    if (userId) {
        const userCollectionRef = collection(db, 'users', 'presets/' + userId);
        getDocs(userCollectionRef)
            .then((querySnapshot) => {
                userPresets.length = 0;
                querySnapshot.forEach((doc) => {
                    const preset = doc.data();
                    userPresets.push(preset);
                });
                const presets = [...defaultPresets, ...userPresets];
                model.setPresets(presets);
                controller.renderAll();
            })
            .catch((error) => { console.error('Error getting userPresets: ', error); });
    }
}

function loginWithMail() {
    const emailData = controller.email.value;
    const passwordData = controller.password.value;
    console.log(emailData, passwordData);
    logOut();
    signInWithEmailAndPassword(auth, emailData, passwordData)
        .then(() => {
            renderLogIn();
        })
        .catch((error) => { console.error('Login error:', error.code, error.message); });
}

function pushNewUserPreset(newPreset) {
    const user = auth.currentUser;
    const userId = user ? user.uid : null;
    if (userId) {
        const userCollectionRef = collection(db, 'users', 'presets/' + userId);
        addDoc(userCollectionRef, newPreset)
            .then((docRef) => {
                console.log('Document written with ID:', docRef.id);
            })
            .catch((error) => {
                console.error('Error adding document:', error);
            });
    }
    else { alert('You must log-in first!'); }
}

async function deletePreset(preset) {
    let isDefaultPreset = false;
    defaultPresets.forEach((defaultPreset) => {
        if (defaultPreset.name === preset) {
            alert('Cannot delete a default preset.');
            isDefaultPreset = true;
        }
    });
    if (!isDefaultPreset) {
        try {
            const user = auth.currentUser;
            const userId = user ? user.uid : null;
            const userCollectionRef = collection(db, 'users', 'presets/' + userId);

            // Query for the document with the specified name
            const q = query(userCollectionRef, where('name', '==', preset));
            const querySnapshot = await getDocs(q);

            // If the document exists, delete it
            if (querySnapshot.size > 0) {
                querySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                    console.log('Document deleted successfully:', doc.id);
                });
                getUserPresets();
            } else {
                console.error('Document not found with name:', preset.name);
            }
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    }
}

function handleNewPreset(newPreset) {
    // If the user is logged in with email and password
    pushNewUserPreset(newPreset);
    getUserPresets();
}

//Controller: menu functions.
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

function hideMenu() {
    view.hideContextMenu(controller.displayMenu);
    view.hideContextMenu(controller.knobMenu);
    view.hideContextMenu(controller.saveMenu);
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

function presetSelectClick(operation) {
    controller.presetSelect.addEventListener('click', () => {
        const selectedOption = controller.presetOptions.value;
        if (operation === 'choice') { controller.setPreset(selectedOption); }
        else if (operation === 'delete') { deletePreset(selectedOption); }
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
            !controller.saveMenu.contains(e.target) &&
            !controller.savePresetButton.contains(e.target) &&
            !controller.loadPresetButton.contains(e.target)) { hideMenu(); }
    });
}

function handleContextMenu(htmlElement, event) {
    hideMenu();
    const x = event.clientX;
    const y = event.clientY;
    if (htmlElement.getAttribute('id') === 'loadPreset') {
        view.showContextMenu(controller.displayMenu, x, y - 110);
        presetSelectClick('choice');
    }
    else if (htmlElement.classList.value === 'knob') {
        view.showContextMenu(controller.knobMenu, x, y);
        const idx = htmlElement.getAttribute('idx');
        pedalSelectClick(idx);
    }
    else if (htmlElement.getAttribute('id') === 'savePreset') {
        controller.nameInput.value = '';
        view.showContextMenu(controller.saveMenu, x, y + 10);
    }
    else if (htmlElement.getAttribute('id') === 'deletePreset') {
        view.showContextMenu(controller.displayMenu, x, y);
        presetSelectClick('delete');
    }
}

function displayLoadMenu() {
    controller.loadPresetButton.addEventListener('click', (event) => {
        createMenu();
        handleContextMenu(controller.loadPresetButton, event);
    });
}

function displayDeleteMenu() {
    controller.deletePresetButton.addEventListener('contextmenu', (event) => {
        createMenu();
        handleContextMenu(controller.deletePresetButton, event);
    });
}

function displaySaveMenu() {
    controller.savePresetButton.addEventListener('click', (event) => {
        handleContextMenu(controller.savePresetButton, event);
    });
}

function savePresetSelectClick() {
    const presetNamesubmit = document.getElementById('submitButton');
    presetNamesubmit.addEventListener('click', () => {
        hideMenu();
        const newPreset = model.exportCurrentPreset(controller.nameInput.value);
        handleNewPreset(newPreset);
    });
}

// Controller: login functions.
function manageLoginConfirm() {
    controller.loginConfirm.addEventListener('click', () => {
        if (controller.loginConfirm.innerHTML === '↵') {
            loginWithMail();
        }
        else {
            logOut();
        }
    });
}

function openCloseLoginMenu() {
    controller.openLogin.addEventListener('click', () => {
        renderOpenLogin();
    });

    controller.closeLogin.addEventListener('click', () => {
        renderCloseLogin();
    });
}

// Controller: attach event listeners.
displayDeleteMenu();
savePresetSelectClick();
preventRightClick();
knobContextMenu();
documentClick();
displaySaveMenu();
displayLoadMenu();
getDefaultPresets();
manageLoginConfirm();
openCloseLoginMenu();


// View.

function renderLogOut() {
    controller.loginConfirm.innerHTML = '↵';
    controller.loginConfirm.style.backgroundColor = 'white';
    controller.loginConfirm.style.color = 'black';
    controller.loginConfirm.style.fontSize = '350%'
    controller.simpleCircle2.style.backgroundColor = 'red';
        controller.simpleCircle1.style.backgroundColor = 'red';
    controller.email.disabled = false;
    controller.password.disabled = false;
    controller.loginSubtitle.innerHTML = 'Log-in to your account.';

    controller.deletePresetButton.classList.remove('dbPresets');
    controller.deletePresetButton.classList.add('hidden');
    controller.loadPresetButton.style.transform = 'translate(0%,0%)';
    document.querySelectorAll('.dbPresets').forEach((element) => {
        element.style.marginTop = '28%';
    });
}

function renderCloseLogin(){
    if (j > 90 && !controller.loginDiv.classList.contains('hidden')) {
        opacityIntervals.forEach(interval => { clearInterval(interval); });
        for (let i = 100; i >= 0; i--) {
            console.log(j);
            j = i;
            const timeout = setTimeout(() => { controller.loginDiv.style.opacity = i + '%' }, (700 - (i*7 )));
            opacityIntervals.push(timeout);
        }
        setTimeout(() => controller.loginDiv.classList.add('hidden'), 1000);
    }
}

function renderOpenLogin(){
    if (j < 10 && controller.loginDiv.classList.contains('hidden')) {
        opacityIntervals.forEach(interval => { clearInterval(interval); });
        controller.loginDiv.classList.remove('hidden');
        for (let i = 0; i <= 100; i++) {
            console.log(j);
            j = i;
            const timeout = setTimeout(() => { controller.loginDiv.style.opacity = (i) + '%'; }, i*7 );
            opacityIntervals.push(timeout);
        }
    }
}

function renderLogIn() {
    renderCloseLogin();
    const interval = setTimeout(() => {
        controller.email.disabled = true;
        controller.password.disabled = true;
        controller.loginDiv.classList.add('hidden');
        controller.loginConfirm.innerHTML = 'X';
        controller.loginConfirm.style.fontSize = '330%'
        controller.loginConfirm.color = 'rgb(8, 0, 35)'
        controller.loginConfirm.style.backgroundColor = 'red';
        controller.loginSubtitle.innerHTML = 'Logged in';
        controller.simpleCircle2.style.backgroundColor = 'green';
        controller.simpleCircle1.style.backgroundColor = 'green';
    }, 1000);
    opacityIntervals.push(interval);
    controller.deletePresetButton.classList.remove('hidden');
    controller.deletePresetButton.classList.add('dbPresets');
    controller.loadPresetButton.style.transform = 'translate(0%,-130%)';
    document.querySelectorAll('.dbPresets').forEach((element) => {
        element.style.marginTop = '30%';
    })
}
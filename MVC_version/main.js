import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc, query, where, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

//Create functions.
const audioModel = new AudioModel();
const model = new Model(audioModel);
const view = new View(audioModel);
const controller = new Controller(model, view);
const midiController = new MidiController(controller);
const touchController = new TouchController(controller);

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

let defaultPresets = [];
let userPresets = [];

// Console loginConfirm. 
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

function loginWithMail() {
    const emailData = email.value;
    const passwordData = password.value;
    console.log(emailData, passwordData);
    logOut();
    signInWithEmailAndPassword(auth, emailData, passwordData)
        .then((userCredential) => {
            opacityIntervals.forEach(interval => { clearInterval(interval); });
            const user = userCredential.user;
            setTimeout(() => {
                for (let i = 100; i >= 0; i--) {
                    j = i;
                    const timeout = setTimeout(() => { loginDiv.style.opacity = i + '%' }, (1000 - (i * 10)));
                    opacityIntervals.push(timeout);
                }
            }, 200)
            const interval = setTimeout(() => {
                email.disabled = true;
                password.disabled = true;
                loginDiv.classList.add('hidden');
                loginConfirm.innerHTML = 'X';
                loginConfirm.style.fontSize = '330%'
                loginConfirm.color = 'rgb(8, 0, 35)'
                loginConfirm.style.backgroundColor = 'red';
                loginSubtitle.innerHTML = 'Logged in';
                simpleCircle2.style.backgroundColor = 'green';
                simpleCircle1.style.backgroundColor = 'green';
            }, 1000);
            opacityIntervals.push(interval);
            deletePresetButton.classList.remove('hidden');
            deletePresetButton.classList.add('dbPresets');
            loadPresetButton.style.transform = 'translate(0%,-130%)';
            document.querySelectorAll('.dbPresets').forEach((element) => {
                element.style.marginTop = '30%';
            })

        })
        .catch((error) => { console.error('Login error:', error.code, error.message); });
}

function logOut() {
    signOut(auth);
    loginConfirm.innerHTML = '↵';
    loginConfirm.style.backgroundColor = 'white';
    loginConfirm.style.color = 'black';
    loginConfirm.style.fontSize = '350%'
    email.disabled = false;
    password.disabled = false;

    deletePresetButton.classList.remove('dbPresets');
    deletePresetButton.classList.add('hidden');
    loadPresetButton.style.transform = 'translate(0%,0%)';
    document.querySelectorAll('.dbPresets').forEach((element) => {
        element.style.marginTop = '28%';
    })
}

function pushNewUserPreset(newPreset) {
    const user = auth.currentUser;
    const userId = user ? user.uid : null;
    const userCollectionRef = collection(db, 'users', 'presets/' + userId);
    addDoc(userCollectionRef, newPreset)
        .then((docRef) => {
            console.log('Document written with ID:', docRef.id);
        })
        .catch((error) => {
            console.error('Error adding document:', error);
        });
}

async function deletePreset(preset) {
    let isDefaultPreset=false;
    defaultPresets.forEach((defaultPreset) => {
        if (defaultPreset.name === preset) {
            alert('Cannot delete a default preset.');
            isDefaultPreset=true;
        }
    });
    if(!isDefaultPreset){
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

//Importing HTML elements.
const loadPresetButton = document.getElementById("loadPreset");
const deletePresetButton = document.getElementById("deletePreset");
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
const savePresetButton = document.getElementById("savePreset");
const opacityIntervals = [];
let j = 0;

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

function hideMenu() {
    view.hideContextMenu(controller.displayMenu);
    view.hideContextMenu(controller.knobMenu);
    view.hideContextMenu(saveMenu);
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
            !saveMenu.contains(e.target) &&
            !savePresetButton.contains(e.target) &&
            !loadPresetButton.contains(e.target)) { hideMenu(); }
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
        nameInput.value = '';
        view.showContextMenu(saveMenu, x, y + 10);
    }
    else if (htmlElement.getAttribute('id') === 'deletePreset') {
        view.showContextMenu(controller.displayMenu, x, y);
        presetSelectClick('delete');
    }
}

function displayLoadMenu() {
    loadPresetButton.addEventListener('click', (event) => {
        createMenu();
        handleContextMenu(loadPresetButton, event);
    });
}
function displayDeleteMenu() {
    deletePresetButton.addEventListener('contextmenu', (event) => {
        createMenu();
        handleContextMenu(deletePresetButton, event);
    });
}


function displaySaveMenu() {
    savePresetButton.addEventListener('click', (event) => {
        handleContextMenu(savePresetButton, event);
    });
}

function savePresetSelectClick() {
    const presetNamesubmit = document.getElementById('submitButton');
    presetNamesubmit.addEventListener('click', () => {
        hideMenu();
        const newPreset = model.exportCurrentPreset(nameInput.value);
        handleNewPreset(newPreset);
    });
}

//Login functions
function manageLoginConfirm() {
    loginConfirm.addEventListener('click', () => {
        if (loginConfirm.innerHTML === '↵') {
            loginWithMail();
        }
        else {
            logOut();
        }
    });
}

function openCloseLoginMenu() {
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
}







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






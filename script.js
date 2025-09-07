// Firebase libraries are now loaded directly in index.html, so no import statements are needed here.

// Global variables for Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB1LCgmA9eb1tNsmdmQTuHPhRKhet4RaWM",
    authDomain: "language-entry.firebaseapp.com",
    databaseURL: "https://language-entry-default-rtdb.firebaseio.com",
    projectId: "language-entry",
    storageBucket: "language-entry.firebasestorage.app",
    messagingSenderId: "72772945167",
    appId: "1:72772945167:web:3a6f9d2c3e2083952daa7a",
    measurementId: "G-33RV4B0SP5"
};
const appId = "1:72772945167:web:3a6f9d2c3e2083952daa7a";

let db;
let auth;
let userId;

// Element selectors
const authStatusEl = document.getElementById('auth-status');
const userIdEl = document.getElementById('user-id');
const form = document.getElementById('word-form');
const formTitleEl = document.getElementById('form-title');
const englishInput = document.getElementById('english-word');
const spanishInput = document.getElementById('spanish-word');
const commentInput = document.getElementById('comment');
const typeInput = document.getElementById('word-type');
const wordsContainer = document.getElementById('words-container');
const messageBox = document.getElementById('message-box');
const searchInput = document.getElementById('search-input');
const wordList = document.getElementById('word-list');
const wordIdToEditEl = document.getElementById('word-id-to-edit');
const mainContent = document.getElementById('main-content');

// Mode buttons and sidebar
const listModeBtn = document.getElementById('list-mode-btn');
const flashcardModeBtn = document.getElementById('flashcard-mode-btn');
const gameModeBtn = document.getElementById('game-mode-btn');
const modesSidebar = document.getElementById('modes-sidebar');
const sidebarToggleBtn = document.getElementById('sidebar-toggle');

// Mode sections
const listModeContent = document.getElementById('list-mode-content');
const flashcardSection = document.getElementById('flashcard-section');
const gameSection = document.getElementById('game-section');

// List Mode elements
const newWordBtn = document.getElementById('new-word-btn');
const wordFormSection = document.getElementById('word-form-section');
const wordDetailsSection = document.getElementById('word-details-section');
const wordDetailsCard = document.getElementById('word-details-card');
const addWordBtn = document.getElementById('add-word-btn');
const editButtons = document.getElementById('edit-buttons');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Other buttons
const shuffleBtn = document.getElementById('shuffle-btn');
const startGameBtn = document.getElementById('start-game-btn');
const languageToggle = document.getElementById('language-toggle');
const hideLearnedToggle = document.getElementById('hide-learned-toggle');
const gameQuestionEl = document.getElementById('game-question');
const gameChoicesEl = document.getElementById('game-choices');
const listSection = document.getElementById('list-section');

let allWords = [];
let currentWordPair;

// Function to show a message box
function showMessage(message, type = 'success') {
    messageBox.textContent = message;
    messageBox.style.backgroundColor = type === 'success' ? '#22c55e' : '#ef4444';
    messageBox.classList.add('show');
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 2000);
}

// Function to render the words in the sidebar list
function renderWordList(wordsToRender = allWords) {
    wordList.innerHTML = '';
    const displayEnglish = !languageToggle.checked;
    wordsToRender.forEach(wordPair => {
        const li = document.createElement('li');
        li.className = 'word-list-item text-gray-700 hover:text-blue-600 cursor-pointer p-2 rounded-md transition duration-200';
        li.textContent = displayEnglish ? wordPair.english : wordPair.spanish;
        li.dataset.wordId = wordPair.id;
        li.addEventListener('click', () => {
            selectWord(wordPair.id);
        });
        wordList.appendChild(li);
    });
}

// Function to handle word selection from the list
function selectWord(wordId) {
    const selectedWord = allWords.find(word => word.id === wordId);
    if (selectedWord) {
        displayWordDetails(selectedWord);
    }
    document.querySelectorAll('.word-list-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-word-id='${wordId}']`).classList.add('selected');
}

// Function to display the details of a selected word
function displayWordDetails(word) {
    wordFormSection.classList.add('hidden');
    wordDetailsSection.classList.remove('hidden');
    wordDetailsCard.innerHTML = `
        <div class="space-y-2">
            <p><span class="font-bold text-gray-800">English:</span> ${word.english}</p>
            <p><span class="font-bold text-gray-800">Spanish:</span> ${word.spanish}</p>
            <p><span class="font-bold text-gray-800">Type:</span> ${word.type}</p>
            ${word.comment ? `<p><span class="font-bold text-gray-800">Comment:</span> ${word.comment}</p>` : ''}
            <p><span class="font-bold text-gray-800">Learned:</span> ${word.learned ? 'Yes' : 'No'}</p>
        </div>
        <div class="flex space-x-4 mt-4">
            <button onclick="editWord('${word.id}')" class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
                Edit
            </button>
            <button onclick="toggleLearned('${word.id}', ${!word.learned})" class="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
                Mark as ${word.learned ? 'Unlearned' : 'Learned'}
            </button>
            <button onclick="deleteWord('${word.id}')" class="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition duration-300">
                Delete
            </button>
        </div>
    `;
}

// Function to enter edit mode
window.editWord = (wordId) => {
    const word = allWords.find(w => w.id === wordId);
    if (!word) {
        showMessage('Word not found.', 'error');
        return;
    }

    wordIdToEditEl.value = wordId;
    englishInput.value = word.english;
    spanishInput.value = word.spanish;
    commentInput.value = word.comment || '';
    typeInput.value = word.type;

    formTitleEl.textContent = 'Edit Word';
    addWordBtn.classList.add('hidden');
    editButtons.classList.remove('hidden');
    wordDetailsSection.classList.add('hidden');
    wordFormSection.classList.remove('hidden');
};

// Function to exit edit mode and reset the form
const cancelEdit = () => {
    form.reset();
    wordIdToEditEl.value = '';
    formTitleEl.textContent = 'Add a New Word';
    addWordBtn.classList.remove('hidden');
    editButtons.classList.add('hidden');
};

// Function to enter "List Mode"
const enterListMode = () => {
    // UI state
     listSection.classList.remove('hidden');
    listModeContent.classList.remove('hidden');
    flashcardSection.classList.add('hidden');
    gameSection.classList.add('hidden');

    // Button states
    listModeBtn.classList.remove('bg-gray-200', 'text-gray-700');
    listModeBtn.classList.add('bg-purple-600', 'text-white');
    flashcardModeBtn.classList.remove('bg-purple-600', 'text-white');
    flashcardModeBtn.classList.add('bg-gray-200', 'text-gray-700');
    gameModeBtn.classList.remove('bg-purple-600', 'text-white');
    gameModeBtn.classList.add('bg-gray-200', 'text-gray-700');

    // Default view is the form to add a new word
    cancelEdit();
    wordDetailsSection.classList.add('hidden');
    wordFormSection.classList.remove('hidden');
};

// Function to render flashcards
function renderFlashcards(wordsToRender) {
    wordsContainer.innerHTML = '';
    const wordsToDisplay = wordsToRender || allWords;
    const isSpanish = languageToggle.checked;

    wordsToDisplay.forEach(wordPair => {
        const card = document.createElement('div');
        const learnedColor = wordPair.learned ? 'text-green-500' : 'text-gray-400';

        const frontContent = isSpanish ? wordPair.spanish : wordPair.english;
        const backContent = isSpanish ? wordPair.english : wordPair.spanish;

        card.className = 'card bg-white rounded-xl shadow-lg transform transition duration-300 hover:scale-105 cursor-pointer relative';
        card.innerHTML = `
            <div class="card-inner w-full h-full min-h-[150px] flex flex-col justify-between">
                <div class="card-front p-4 sm:p-6 text-xl font-semibold flex flex-col items-center justify-center">
                    <span class="mb-2">${frontContent}</span>
                    <span class="text-xs font-normal text-gray-400">${wordPair.type}</span>
                    <button class="absolute top-2 left-2 text-xl hover:text-green-600 transition ${learnedColor}" onclick="event.stopPropagation(); toggleLearned('${wordPair.id}', ${!wordPair.learned});">
                        &#10003;
                    </button>
                </div>
                <div class="card-back p-4 sm:p-6 text-xl font-semibold flex flex-col items-center justify-center">
                    <span class="mb-2">${backContent}</span>
                    ${wordPair.comment ? `<p class="text-sm font-normal text-gray-300 mt-2 text-center break-words">${wordPair.comment}</p>` : ''}
                    <button class="absolute top-2 right-2 text-white hover:text-red-400 transition" onclick="event.stopPropagation(); deleteWord('${wordPair.id}');">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
        wordsContainer.appendChild(card);
    });
}

// Game Logic
function startGame() {
    listModeContent.classList.add('hidden');
    flashcardSection.classList.add('hidden');
    gameSection.classList.remove('hidden');

    const unlearnedWords = allWords.filter(word => !word.learned);

    if (unlearnedWords.length < 3) {
        gameQuestionEl.textContent = 'Add at least 3 words to play, or un-mark some as learned!';
        gameChoicesEl.innerHTML = '';
        return;
    }

    const shuffledWords = shuffleArray(unlearnedWords);
    currentWordPair = shuffledWords[0];

    gameQuestionEl.textContent = currentWordPair.english;

    const choices = [currentWordPair.spanish];
    let incorrectWords = shuffledWords.slice(1);
    while (choices.length < 3 && incorrectWords.length > 0) {
        choices.push(incorrectWords.pop().spanish);
    }
    shuffleArray(choices);

    gameChoicesEl.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.className = 'bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl hover:bg-gray-300 transition duration-300 transform hover:scale-105';
        button.onclick = () => checkAnswer(choice, button);
        gameChoicesEl.appendChild(button);
    });

    startGameBtn.textContent = 'Next Round';
}

function checkAnswer(selectedChoice, button) {
    if (selectedChoice === currentWordPair.spanish) {
        button.classList.remove('bg-gray-200', 'hover:bg-gray-300');
        button.classList.add('bg-green-500', 'text-white');
        showMessage('Correct!', 'success');
        setTimeout(startGame, 1000);
    } else {
        button.classList.remove('bg-gray-200', 'hover:bg-gray-300');
        button.classList.add('bg-red-500', 'text-white');
        showMessage('Incorrect. Try again!', 'error');

        const allButtons = gameChoicesEl.querySelectorAll('button');
        allButtons.forEach(btn => {
            if (btn.textContent === currentWordPair.spanish) {
                btn.classList.add('bg-green-500', 'text-white');
            }
        });
    }

    const allButtons = gameChoicesEl.querySelectorAll('button');
    allButtons.forEach(btn => btn.disabled = true);
}

function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

// Initialize Firebase and Authentication
async function initialize() {
    try {
        const app = firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        authStatusEl.textContent = 'Connected to database.';
        userIdEl.textContent = '';
        listenForWords();
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        authStatusEl.textContent = `Error: ${error.message}`;
    }
}

// Listen for real-time changes to the 'vocabulary' collection
function listenForWords() {
    const dbRef = db.ref('vocabulary');
    dbRef.on('value', (snapshot) => {
        const data = snapshot.val();
        allWords = [];
        if (data) {
            for (const id in data) {
                allWords.push({ id, ...data[id] });
            }
        }
        allWords.sort((a, b) => a.english.localeCompare(b.english));
        renderWordList();
        renderFlashcards(hideLearnedToggle.checked ? allWords.filter(word => !word.learned) : allWords);
    });
}

// Add/Update word to the database
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const wordId = wordIdToEditEl.value;
    const english = englishInput.value.trim();
    const spanish = spanishInput.value.trim();
    const comment = commentInput.value.trim();
    const type = typeInput.value;

    if (english && spanish) {
        try {
            if (wordId) {
                const dbRef = db.ref(`vocabulary/${wordId}`);
                await dbRef.update({ english, spanish, comment, type });
                showMessage('Word updated successfully!', 'success');
                cancelEdit();
            } else {
                const dbRef = db.ref('vocabulary');
                await dbRef.push({ english, spanish, comment, type, learned: false });
                showMessage('Word added successfully!', 'success');
                form.reset();
            }
        } catch (error) {
            console.error("Error adding/updating word:", error);
            showMessage('Failed to save word.', 'error');
        }
    } else {
        showMessage('Please enter both English and Spanish words.', 'error');
    }
});

// Toggle the 'learned' status of a word
window.toggleLearned = async (wordId, learnedStatus) => {
    try {
        const dbRef = db.ref(`vocabulary/${wordId}`);
        await dbRef.update({ learned: learnedStatus });
        showMessage('Word status updated!', 'success');
    } catch (error) {
            console.error("Error updating word status:", error);
        showMessage('Failed to update word status.', 'error');
    }
};

// Delete a word
window.deleteWord = async (wordId) => {
    if (wordId) {
        try {
            const dbRef = db.ref(`vocabulary/${wordId}`);
            await dbRef.remove();
            showMessage('Word deleted successfully!', 'success');
            // Show the form to add a new word after deletion in List Mode
            cancelEdit();
            wordDetailsSection.classList.add('hidden');
            wordFormSection.classList.remove('hidden');
        } catch (error) {
            console.error("Error deleting word:", error);
            showMessage('Failed to delete word.', 'error');
        }
    }
};

// Event listeners for the new search input
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredWords = allWords.filter(word =>
        word.english.toLowerCase().includes(searchTerm) ||
        word.spanish.toLowerCase().includes(searchTerm)
    );
    renderWordList(filteredWords);
});

// Mode switching event listeners
listModeBtn.addEventListener('click', enterListMode);

flashcardModeBtn.addEventListener('click', () => {


  
    listSection.classList.add('hidden');
    listModeContent.classList.add('hidden');
    flashcardSection.classList.remove('hidden');
    // flashcardSection.classList.remove('hidden');
    gameSection.classList.add('hidden');
    listModeBtn.classList.remove('bg-purple-600', 'text-white');
    listModeBtn.classList.add('bg-gray-200', 'text-gray-700');
    flashcardModeBtn.classList.remove('bg-gray-200', 'text-gray-700');
    flashcardModeBtn.classList.add('bg-purple-600', 'text-white');
    gameModeBtn.classList.remove('bg-purple-600', 'text-white');
    gameModeBtn.classList.add('bg-gray-200', 'text-gray-700');
    renderFlashcards(hideLearnedToggle.checked ? allWords.filter(word => !word.learned) : allWords);
});
gameModeBtn.addEventListener('click', () => {
    listSection.classList.add('hidden');
    listModeContent.classList.add('hidden');
    flashcardSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
    gameModeBtn.classList.remove('bg-gray-200', 'text-gray-700');
    gameModeBtn.classList.add('bg-purple-600', 'text-white');
    listModeBtn.classList.remove('bg-purple-600', 'text-white');
    listModeBtn.classList.add('bg-gray-200', 'text-gray-700');
    flashcardModeBtn.classList.remove('bg-purple-600', 'text-white');
    flashcardModeBtn.classList.add('bg-gray-200', 'text-gray-700');

    
    startGame();
});

// New button event listener to create a new word in list mode
newWordBtn.addEventListener('click', () => {
    cancelEdit();
    wordDetailsSection.classList.add('hidden');
    wordFormSection.classList.remove('hidden');
    document.querySelectorAll('.word-list-item').forEach(item => {
        item.classList.remove('selected');
    });
});

// Other event listeners
cancelEditBtn.addEventListener('click', cancelEdit);
shuffleBtn.addEventListener('click', () => {
    const wordsToShuffle = hideLearnedToggle.checked ? allWords.filter(word => !word.learned) : allWords;
    const shuffledWords = shuffleArray(wordsToShuffle);
    renderFlashcards(shuffledWords);
});
startGameBtn.addEventListener('click', startGame);

// New event listener for the language toggle
languageToggle.addEventListener('change', () => {
    renderWordList();
    renderFlashcards(hideLearnedToggle.checked ? allWords.filter(word => !word.learned) : allWords);
});

hideLearnedToggle.addEventListener('change', () => {
    renderFlashcards(hideLearnedToggle.checked ? allWords.filter(word => !word.learned) : allWords);
});

// New event listener for the sidebar toggle button
sidebarToggleBtn.addEventListener('click', () => {
    modesSidebar.classList.toggle('collapsed');
    
    // Toggle width classes to expand/collapse the layout
    modesSidebar.classList.toggle('sm:w-1/6');
    modesSidebar.classList.toggle('sm:w-[60px]'); // Use a fixed width for the collapsed state
    
    mainContent.classList.toggle('sm:w-1/2');
    mainContent.classList.toggle('sm:w-3/4');
});

// // Add this function to your script.js
// function setActiveModeButton(selectedButton) {
//     const allModeButtons = [listModeBtn, flashcardModeBtn, gameModeBtn];
//     allModeButtons.forEach(btn => {
//         btn.classList.remove('bg-purple-600', 'text-white');
//         btn.classList.add('bg-gray-200', 'text-gray-700');
//     });
//     selectedButton.classList.remove('bg-gray-200', 'text-gray-700');
//     selectedButton.classList.add('bg-purple-600', 'text-white');
// }

// // Then, in your mode switching functions:

// // In enterListMode():
// setActiveModeButton(listModeBtn);

// // In the flashcardModeBtn listener:
// setActiveModeButton(flashcardModeBtn);

// // In the gameModeBtn listener:
// setActiveModeButton(gameModeBtn);


// Initialize the app on window load
window.onload = initialize;
// SpellCraft - Educational Spelling App
// Global Variables
let currentLanguage = '';
let currentLevel = 1;
let currentWordIndex = 0;
let score = 0;
let words = [];
let completedLevels = new Set();
let audioRecorder = null;
let audioStream = null;
let audioChunks = [];
let recordedAudioUrl = null;
let deviceTimeEarned = 0;

// Spelling word lists by language and level
const wordLists = {
    english: {
        1: [
            { word: 'cat', hint: 'A furry pet that says meow' },
            { word: 'dog', hint: 'A friendly animal that barks' },
            { word: 'sun', hint: 'Bright star in the sky' },
            { word: 'tree', hint: 'Has leaves and branches' },
            { word: 'book', hint: 'You read this' }
        ],
        2: [
            { word: 'house', hint: 'A place where you live' },
            { word: 'water', hint: 'You drink this' },
            { word: 'happy', hint: 'Feeling joyful' },
            { word: 'table', hint: 'You eat at this' },
            { word: 'green', hint: 'Color of grass' }
        ],
        3: [
            { word: 'beautiful', hint: 'Very pretty' },
            { word: 'elephant', hint: 'Large animal with a trunk' },
            { word: 'butterfly', hint: 'Insect with colorful wings' },
            { word: 'computer', hint: 'Electronic device for work' },
            { word: 'rainbow', hint: 'Appears after rain' }
        ],
        4: [
            { word: 'excellent', hint: 'Very good, outstanding' },
            { word: 'adventure', hint: 'An exciting experience' },
            { word: 'mysterious', hint: 'Full of mystery' },
            { word: 'wonderful', hint: 'Amazing and great' },
            { word: 'celebrate', hint: 'To mark a special occasion' }
        ],
        5: [
            { word: 'encyclopedia', hint: 'Book of knowledge' },
            { word: 'magnificent', hint: 'Extremely beautiful' },
            { word: 'extraordinary', hint: 'Beyond ordinary' },
            { word: 'mathematics', hint: 'Study of numbers' },
            { word: 'imagination', hint: 'Ability to create ideas' }
        ]
    },
    irish: {
        1: [
            { word: 'cat', hint: 'Ainmhí tí (house animal)' },
            { word: 'madra', hint: 'Dog in English' },
            { word: 'teach', hint: 'House in English' },
            { word: 'bord', hint: 'Table in English' },
            { word: 'leabhar', hint: 'Book in English' }
        ],
        2: [
            { word: 'scoil', hint: 'School in English' },
            { word: 'uisce', hint: 'Water in English' },
            { word: 'grian', hint: 'Sun in English' },
            { word: 'crann', hint: 'Tree in English' },
            { word: 'cara', hint: 'Friend in English' }
        ],
        3: [
            { word: 'féileacán', hint: 'Butterfly in English' },
            { word: 'teilifís', hint: 'Television in English' },
            { word: 'leabharlann', hint: 'Library in English' },
            { word: 'aimsir', hint: 'Weather in English' },
            { word: 'ceolchoirm', hint: 'Concert in English' }
        ],
        4: [
            { word: 'taithneamhach', hint: 'Pleasant in English' },
            { word: 'eagarthóir', hint: 'Editor in English' },
            { word: 'meaisín', hint: 'Machine in English' },
            { word: 'ranganna', hint: 'Classes in English' },
            { word: 'ealaíontóir', hint: 'Artist in English' }
        ],
        5: [
            { word: 'réalteolaíocht', hint: 'Astronomy in English' },
            { word: 'stair-sheandálaíocht', hint: 'Archaeology in English' },
            { word: 'comhshaol', hint: 'Environment in English' },
            { word: 'teicneolaíocht', hint: 'Technology in English' },
            { word: 'ríomhaireacht', hint: 'Computing in English' }
        ]
    }
};

// Emoji rewards based on performance
const emojiRewards = {
    perfect: ['🌟', '🏆', '👑', '💎', '⭐', '🎯', '🔥', '💯'],
    excellent: ['😊', '🎉', '👏', '🌈', '✨', '🎊', '🎈'],
    good: ['👍', '😀', '🙂', '💚', '💙', '🌸', '🌺'],
    okay: ['😌', '🙃', '😊', '🌼', '🌻']
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const spellingInput = document.getElementById('spelling-input');
    if (spellingInput) {
        spellingInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkSpelling();
            }
        });
    }
}

// Language selection
function selectLanguage(language) {
    currentLanguage = language;
    localStorage.setItem('spellcraft_language', language);
    generateLevelButtons();
    showScreen('level-screen');
}

// Generate level buttons
function generateLevelButtons() {
    const levelButtonsContainer = document.getElementById('level-buttons');
    levelButtonsContainer.innerHTML = '';
    
    const levels = Object.keys(wordLists[currentLanguage]);
    levels.forEach(level => {
        const button = document.createElement('button');
        button.className = 'level-btn';
        
        const isCompleted = completedLevels.has(`${currentLanguage}-${level}`);
        const isLocked = level > 1 && !completedLevels.has(`${currentLanguage}-${parseInt(level) - 1}`);
        
        if (isCompleted) {
            button.classList.add('completed');
        }
        if (isLocked) {
            button.classList.add('locked');
            button.disabled = true;
        }
        
        button.innerHTML = `Level ${level}`;
        button.onclick = () => {
            if (!isLocked) {
                startLevel(parseInt(level));
            }
        };
        
        levelButtonsContainer.appendChild(button);
    });
}

// Start a level
function startLevel(level) {
    currentLevel = level;
    currentWordIndex = 0;
    score = 0;
    words = [...wordLists[currentLanguage][level]];
    
    document.getElementById('current-level-name').textContent = `Level ${level}`;
    document.getElementById('current-score').textContent = '0';
    document.getElementById('total-words').textContent = words.length;
    
    updateProgressBar();
    showScreen('game-screen');
    loadWord();
}

// Load current word
function loadWord() {
    if (currentWordIndex < words.length) {
        const currentWord = words[currentWordIndex];
        document.getElementById('word-hint').textContent = currentWord.hint;
        document.getElementById('spelling-input').value = '';
        document.getElementById('feedback-area').innerHTML = '';
        document.getElementById('spelling-input').focus();
    } else {
        showResults();
    }
}

// Play word audio (text-to-speech)
function playWord() {
    if (currentWordIndex < words.length) {
        const currentWord = words[currentWordIndex].word;
        
        // Check if speech synthesis is available
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(currentWord);
            
            // Set language based on current selection
            if (currentLanguage === 'irish') {
                utterance.lang = 'ga-IE';
            } else {
                utterance.lang = 'en-US';
            }
            
            utterance.rate = 0.8; // Slower for clarity
            speechSynthesis.speak(utterance);
            
            // Visual feedback
            const playBtn = document.getElementById('play-word-btn');
            playBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                playBtn.style.transform = 'scale(1)';
            }, 300);
        } else {
            alert('Text-to-speech is not supported in your browser. The word will be shown instead.');
            document.getElementById('word-hint').textContent = `Spell: ${currentWord}`;
        }
    }
}

// Check spelling
function checkSpelling() {
    const userInput = document.getElementById('spelling-input').value.trim().toLowerCase();
    const currentWord = words[currentWordIndex].word.toLowerCase();
    const feedbackArea = document.getElementById('feedback-area');
    
    if (!userInput) {
        return;
    }
    
    if (userInput === currentWord) {
        // Correct answer
        score++;
        document.getElementById('current-score').textContent = score;
        
        feedbackArea.innerHTML = `
            <div class="feedback correct">
                <i class="fas fa-check-circle"></i> Excellent! ${getRandomEmoji('excellent')}
            </div>
        `;
        
        // Move to next word after delay
        setTimeout(() => {
            currentWordIndex++;
            updateProgressBar();
            loadWord();
        }, 1500);
    } else {
        // Incorrect answer
        feedbackArea.innerHTML = `
            <div class="feedback incorrect">
                <i class="fas fa-times-circle"></i> Not quite right
                <span class="correct-word">The correct spelling is: <strong>${words[currentWordIndex].word}</strong></span>
            </div>
        `;
        
        // Move to next word after delay
        setTimeout(() => {
            currentWordIndex++;
            updateProgressBar();
            loadWord();
        }, 2500);
    }
}

// Update progress bar
function updateProgressBar() {
    const progress = (currentWordIndex / words.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

// Show results
function showResults() {
    const accuracy = Math.round((score / words.length) * 100);
    const isPerfect = score === words.length;
    const isExcellent = accuracy >= 80;
    const isGood = accuracy >= 60;
    
    // Update stats
    document.getElementById('final-score').textContent = `${score}/${words.length}`;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    
    // Show rewards
    const rewardsDisplay = document.getElementById('rewards-display');
    let rewardEmojis = '';
    
    if (isPerfect) {
        rewardEmojis = emojiRewards.perfect.join(' ');
        deviceTimeEarned += 15;
    } else if (isExcellent) {
        rewardEmojis = emojiRewards.excellent.join(' ');
        deviceTimeEarned += 10;
    } else if (isGood) {
        rewardEmojis = emojiRewards.good.join(' ');
        deviceTimeEarned += 5;
    } else {
        rewardEmojis = emojiRewards.okay.join(' ');
        deviceTimeEarned += 2;
    }
    
    rewardsDisplay.innerHTML = rewardEmojis;
    
    // Show device time reward
    const deviceTimeReward = document.getElementById('device-time-reward');
    let timeMessage = '';
    if (isPerfect) {
        timeMessage = '🎮 Perfect score! Earned 15 minutes of device time!';
    } else if (isExcellent) {
        timeMessage = '🎮 Great job! Earned 10 minutes of device time!';
    } else if (isGood) {
        timeMessage = '🎮 Good work! Earned 5 minutes of device time!';
    } else {
        timeMessage = '🎮 Keep practicing! Earned 2 minutes of device time!';
    }
    deviceTimeReward.textContent = timeMessage;
    
    // Mark level as completed if passed (60% or higher)
    if (accuracy >= 60) {
        completedLevels.add(`${currentLanguage}-${currentLevel}`);
        saveProgress();
    }
    
    // Add confetti effect for excellent performance
    if (isExcellent) {
        createConfetti();
    }
    
    // Log activity
    logActivity(`Completed Level ${currentLevel} - ${accuracy}% accuracy`);
    
    showScreen('results-screen');
}

// Get random emoji from category
function getRandomEmoji(category) {
    const emojis = emojiRewards[category];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// Create confetti effect
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 30);
    }
}

// Next level
function nextLevel() {
    const nextLevelNum = currentLevel + 1;
    const maxLevel = Object.keys(wordLists[currentLanguage]).length;
    
    if (nextLevelNum <= maxLevel) {
        startLevel(nextLevelNum);
    } else {
        alert('Congratulations! You\'ve completed all levels! 🎉');
        showScreen('level-screen');
    }
}

// Retry level
function retryLevel() {
    startLevel(currentLevel);
}

// Exit game
function exitGame() {
    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
        showScreen('level-screen');
    }
}

// Recording functionality
async function toggleRecording() {
    const recordBtn = document.getElementById('record-btn');
    const recordingStatus = document.getElementById('recording-status');
    
    if (!audioRecorder) {
        // Start recording
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioRecorder = new MediaRecorder(audioStream);
            audioChunks = [];
            
            audioRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            audioRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                recordedAudioUrl = URL.createObjectURL(audioBlob);
                document.getElementById('play-recording-btn').disabled = false;
                recordingStatus.textContent = '✓ Recording saved! Click "Play Recording" to listen.';
            };
            
            audioRecorder.start();
            recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
            recordBtn.classList.add('recording');
            recordingStatus.textContent = '🎤 Recording...';
        } catch (error) {
            recordingStatus.textContent = '❌ Microphone access denied or not available.';
            console.error('Error accessing microphone:', error);
        }
    } else {
        // Stop recording
        audioRecorder.stop();
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
            audioStream = null;
        }
        audioRecorder = null;
        recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
        recordBtn.classList.remove('recording');
    }
}

// Play recorded audio
function playRecording() {
    if (recordedAudioUrl) {
        const audio = new Audio(recordedAudioUrl);
        audio.play();
    }
}

// Parent Dashboard
function toggleParentDashboard() {
    const dashboard = document.getElementById('parent-dashboard');
    dashboard.classList.toggle('active');
    
    if (dashboard.classList.contains('active')) {
        updateDashboard();
    }
}

// Update dashboard with stats
function updateDashboard() {
    const totalLevels = Object.keys(wordLists[currentLanguage] || wordLists.english).length;
    const completedCount = Array.from(completedLevels).filter(l => l.startsWith(currentLanguage)).length;
    const progressPercent = Math.round((completedCount / totalLevels) * 100);
    
    document.getElementById('total-progress').textContent = `${progressPercent}%`;
    document.getElementById('levels-completed').textContent = `${completedCount}/${totalLevels}`;
    document.getElementById('total-device-time').textContent = `${deviceTimeEarned} mins`;
    
    // Update recent activity
    const activityList = document.getElementById('recent-activity');
    const activities = JSON.parse(localStorage.getItem('spellcraft_activities') || '[]');
    
    if (activities.length === 0) {
        activityList.innerHTML = 'No activity yet';
    } else {
        activityList.innerHTML = activities.slice(-5).reverse().map(activity => 
            `<div class="activity-item">${activity}</div>`
        ).join('');
    }
}

// Log activity
function logActivity(activity) {
    const activities = JSON.parse(localStorage.getItem('spellcraft_activities') || '[]');
    const timestamp = new Date().toLocaleString();
    activities.push(`${timestamp}: ${activity}`);
    
    // Keep only last 20 activities
    if (activities.length > 20) {
        activities.shift();
    }
    
    localStorage.setItem('spellcraft_activities', JSON.stringify(activities));
}

// Save progress
function saveProgress() {
    localStorage.setItem('spellcraft_completed', JSON.stringify(Array.from(completedLevels)));
    localStorage.setItem('spellcraft_device_time', deviceTimeEarned);
}

// Load progress
function loadProgress() {
    const saved = localStorage.getItem('spellcraft_completed');
    if (saved) {
        completedLevels = new Set(JSON.parse(saved));
    }
    
    const savedTime = localStorage.getItem('spellcraft_device_time');
    if (savedTime) {
        deviceTimeEarned = parseInt(savedTime);
    }
    
    const savedLanguage = localStorage.getItem('spellcraft_language');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
    }
}

// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Generate level buttons when showing level screen
    if (screenId === 'level-screen' && currentLanguage) {
        generateLevelButtons();
    }
}

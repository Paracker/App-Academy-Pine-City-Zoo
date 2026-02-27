import { auth, db, storage } from '../firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Canvas and turtle state
let canvas, ctx;
let turtle = {
    x: 0,
    y: 0,
    angle: 0,
    color: '#667eea',
    penDown: true
};

// Program state
let program = [];
let currentChallenge = 'free';
let isRunning = false;

// Available colors
const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#30cfd0', '#330867',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731',
    '#5f27cd', '#00d2d3', '#ff9ff3', '#feca57'
];

// Challenge definitions
const challenges = {
    free: {
        title: 'Free Draw Mode',
        description: 'Create anything you want! Drag commands to your program.',
        solution: null
    },
    line: {
        title: 'Draw a Line',
        description: 'Use "Move Forward" 3 times to draw a straight line.',
        solution: ['forward', 'forward', 'forward']
    },
    square: {
        title: 'Draw a Square',
        description: 'Draw a square! Hint: Forward, Turn Right, repeat 4 times.',
        solution: ['forward', 'right', 'forward', 'right', 'forward', 'right', 'forward', 'right']
    },
    triangle: {
        title: 'Draw a Triangle',
        description: 'Draw a triangle! Move forward and turn right 3 times.',
        solution: ['forward', 'right', 'forward', 'right', 'forward', 'right']
    },
    star: {
        title: 'Draw a Star',
        description: 'Draw a 5-pointed star! This is a challenge!',
        solution: null // Complex pattern, free form
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initColorPicker();
    initDragAndDrop();
    initButtons();
    initChallengeSelector();
    resetTurtle();
});

function initCanvas() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 500;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    resetTurtle();
}

function initColorPicker() {
    const colorPicker = document.getElementById('colorPicker');
    colors.forEach((color, index) => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option' + (index === 0 ? ' selected' : '');
        colorOption.style.backgroundColor = color;
        colorOption.dataset.color = color;
        colorOption.addEventListener('click', () => selectColor(color, colorOption));
        colorPicker.appendChild(colorOption);
    });
}

function selectColor(color, element) {
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    turtle.color = color;
}

function initDragAndDrop() {
    const commandBlocks = document.querySelectorAll('.command-block');
    const programBlocks = document.getElementById('programBlocks');
    
    commandBlocks.forEach(block => {
        block.addEventListener('dragstart', handleDragStart);
    });
    
    programBlocks.addEventListener('dragover', handleDragOver);
    programBlocks.addEventListener('drop', handleDrop);
}

function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', e.target.dataset.command);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function handleDrop(e) {
    e.preventDefault();
    const command = e.dataTransfer.getData('text/plain');
    addCommandToProgram(command);
}

function addCommandToProgram(command) {
    program.push({
        type: command,
        color: command === 'color' ? turtle.color : null
    });
    updateProgramDisplay();
}

function updateProgramDisplay() {
    const programBlocks = document.getElementById('programBlocks');
    programBlocks.innerHTML = '';
    
    program.forEach((cmd, index) => {
        const block = document.createElement('div');
        block.className = 'program-block';
        
        let icon = '';
        let text = '';
        switch(cmd.type) {
            case 'forward':
                icon = '🔼';
                text = 'Forward';
                break;
            case 'left':
                icon = '↩️';
                text = 'Turn Left';
                break;
            case 'right':
                icon = '↪️';
                text = 'Turn Right';
                break;
            case 'color':
                icon = '🎨';
                text = 'Color';
                block.style.borderColor = cmd.color;
                block.style.borderWidth = '3px';
                break;
        }
        
        block.innerHTML = `
            ${icon} ${text}
            <button class="remove-btn" onclick="removeCommand(${index})">×</button>
        `;
        
        programBlocks.appendChild(block);
    });
}

window.removeCommand = function(index) {
    program.splice(index, 1);
    updateProgramDisplay();
};

function initButtons() {
    document.getElementById('runBtn').addEventListener('click', runProgram);
    document.getElementById('clearBtn').addEventListener('click', clearProgram);
    document.getElementById('resetBtn').addEventListener('click', resetCanvas);
    document.getElementById('saveBtn').addEventListener('click', saveProgress);
    document.getElementById('submitBtn').addEventListener('click', submitToTeacher);
}

function initChallengeSelector() {
    const challengeButtons = document.querySelectorAll('.challenge-btn');
    challengeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            challengeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentChallenge = btn.dataset.challenge;
            loadChallenge(currentChallenge);
        });
    });
}

function loadChallenge(challengeId) {
    const challenge = challenges[challengeId];
    document.getElementById('challengeTitle').textContent = challenge.title;
    document.getElementById('challengeDescription').textContent = challenge.description;
    
    // Reset for new challenge
    clearProgram();
    resetCanvas();
}

async function runProgram() {
    if (isRunning || program.length === 0) return;
    
    isRunning = true;
    document.getElementById('runBtn').disabled = true;
    
    // Reset turtle position but keep canvas
    resetTurtle();
    
    // Execute each command with animation
    for (let i = 0; i < program.length; i++) {
        const cmd = program[i];
        await executeCommand(cmd);
        await sleep(300); // Delay between commands
    }
    
    // Check if challenge is completed
    checkChallengeCompletion();
    
    isRunning = false;
    document.getElementById('runBtn').disabled = false;
}

async function executeCommand(cmd) {
    const turtleElement = document.getElementById('turtle');
    
    switch(cmd.type) {
        case 'forward':
            await moveForward(50);
            break;
        case 'left':
            turtle.angle -= 90;
            turtleElement.style.transform = `translate(-50%, -50%) rotate(${turtle.angle}deg)`;
            break;
        case 'right':
            turtle.angle += 90;
            turtleElement.style.transform = `translate(-50%, -50%) rotate(${turtle.angle}deg)`;
            break;
        case 'color':
            turtle.color = cmd.color;
            turtleElement.style.backgroundColor = cmd.color;
            break;
    }
}

async function moveForward(distance) {
    const turtleElement = document.getElementById('turtle');
    const startX = turtle.x;
    const startY = turtle.y;
    
    const radians = (turtle.angle - 90) * Math.PI / 180;
    const endX = turtle.x + Math.cos(radians) * distance;
    const endY = turtle.y + Math.sin(radians) * distance;
    
    // Draw line
    if (turtle.penDown) {
        ctx.strokeStyle = turtle.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    
    // Update turtle position
    turtle.x = endX;
    turtle.y = endY;
    
    // Update turtle visual position
    turtleElement.style.left = turtle.x + 'px';
    turtleElement.style.top = turtle.y + 'px';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resetTurtle() {
    turtle.x = canvas.width / 2;
    turtle.y = canvas.height / 2;
    turtle.angle = 0;
    turtle.color = '#667eea';
    turtle.penDown = true;
    
    const turtleElement = document.getElementById('turtle');
    turtleElement.style.left = turtle.x + 'px';
    turtleElement.style.top = turtle.y + 'px';
    turtleElement.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    turtleElement.style.backgroundColor = turtle.color;
}

function clearProgram() {
    program = [];
    updateProgramDisplay();
}

function resetCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    resetTurtle();
}

function checkChallengeCompletion() {
    const challenge = challenges[currentChallenge];
    
    if (!challenge.solution) return; // Free draw or complex challenge
    
    // Check if program matches solution
    if (program.length === challenge.solution.length) {
        const matches = program.every((cmd, i) => cmd.type === challenge.solution[i]);
        if (matches) {
            showSuccessMessage('🎉 Challenge Complete! Great job!');
        }
    }
}

function showSuccessMessage(message) {
    const successMsg = document.getElementById('successMessage');
    successMsg.textContent = message;
    successMsg.classList.add('show');
    
    setTimeout(() => {
        successMsg.classList.remove('show');
    }, 3000);
}

async function saveProgress() {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Please log in to save your progress.');
            return;
        }
        
        // Save canvas as image
        const dataURL = canvas.toDataURL('image/png');
        
        // Save to localStorage for quick access
        localStorage.setItem('codeArtProgress', JSON.stringify({
            program: program,
            challenge: currentChallenge,
            image: dataURL,
            timestamp: new Date().toISOString()
        }));
        
        showSuccessMessage('💾 Progress saved!');
    } catch (error) {
        console.error('Error saving progress:', error);
        alert('Error saving progress. Please try again.');
    }
}

async function submitToTeacher() {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Please log in to submit your work.');
            return;
        }
        
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('submitBtn').textContent = '📤 Submitting...';
        
        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        // Upload to Firebase Storage
        const timestamp = Date.now();
        const filename = `code-art/${user.uid}/${timestamp}.png`;
        const storageRef = ref(storage, filename);
        
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        
        // Create submission in Firestore
        await addDoc(collection(db, 'submissions'), {
            studentId: user.uid,
            activityType: 'code-art',
            challenge: currentChallenge,
            program: program,
            imageUrl: downloadURL,
            submittedAt: serverTimestamp(),
            status: 'pending'
        });
        
        showSuccessMessage('✅ Submitted to teacher successfully!');
        
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('submitBtn').textContent = '📤 Submit to Teacher';
        
        // Clear program after successful submission
        setTimeout(() => {
            clearProgram();
            resetCanvas();
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting:', error);
        alert('Error submitting your work. Please try again.');
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('submitBtn').textContent = '📤 Submit to Teacher';
    }
}

// Load saved progress on page load
window.addEventListener('load', () => {
    const saved = localStorage.getItem('codeArtProgress');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // Optionally restore program
            // program = data.program;
            // updateProgramDisplay();
        } catch (error) {
            console.error('Error loading saved progress:', error);
        }
    }
});


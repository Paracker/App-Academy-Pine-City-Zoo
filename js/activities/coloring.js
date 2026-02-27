// Coloring Activity JavaScript

let currentUser = null;
let canvas, ctx;
let isDrawing = false;
let currentColor = '#FF6B6B';
let currentTool = 'brush';
let brushSize = 15;
let startTime = Date.now();
let activityId = 'coloring-activity-1'; // In production, this would be dynamic

// Color palette
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
    '#1ABC9C', '#E67E22', '#34495E', '#95A5A6', '#FFFFFF',
    '#000000', '#8B4513', '#FFB6C1', '#DDA0DD', '#87CEEB'
];

// Initialize
async function initColoring() {
    try {
        // Protect page - only students can access
        currentUser = await protectPage('student');
        
        // Setup canvas
        canvas = document.getElementById('coloringCanvas');
        ctx = canvas.getContext('2d');
        
        // Setup color palette
        setupColorPalette();
        
        // Setup canvas events
        setupCanvasEvents();
        
        // Load simple coloring template
        loadTemplate();
        
        // Track activity start
        trackActivityStart();
        
        // Load saved progress if exists
        loadSavedProgress();
        
    } catch (error) {
        console.error('Coloring initialization error:', error);
    }
}

// Setup color palette
function setupColorPalette() {
    const palette = document.getElementById('colorPalette');
    
    colors.forEach((color, index) => {
        const btn = document.createElement('button');
        btn.className = 'color-btn';
        btn.style.backgroundColor = color;
        btn.onclick = () => selectColor(color, btn);
        
        if (index === 0) {
            btn.classList.add('active');
        }
        
        palette.appendChild(btn);
    });
}

// Select color
function selectColor(color, btn) {
    currentColor = color;
    currentTool = 'brush';
    
    // Update active state
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    playSound('click');
}

// Select tool
function selectTool(tool) {
    currentTool = tool;
    playSound('click');
    
    if (tool === 'eraser') {
        currentColor = '#FFFFFF';
    }
}

// Update brush size
function updateBrushSize(size) {
    brushSize = parseInt(size);
    document.getElementById('brushSizeValue').textContent = size;
}

// Setup canvas events
function setupCanvasEvents() {
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for tablets
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(e);
    
    if (currentTool === 'fill') {
        floodFill(pos.x, pos.y);
        isDrawing = false;
    } else {
        draw(e);
    }
}

function draw(e) {
    if (!isDrawing || currentTool === 'fill') return;
    
    const pos = getMousePos(e);
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

// Touch event handlers
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// Load simple coloring template
function loadTemplate() {
    // Draw a simple template (in production, load from storage)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple shapes for coloring
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    
    // Sun
    ctx.beginPath();
    ctx.arc(150, 100, 50, 0, Math.PI * 2);
    ctx.stroke();
    
    // House
    ctx.strokeRect(300, 300, 200, 200);
    
    // Roof
    ctx.beginPath();
    ctx.moveTo(280, 300);
    ctx.lineTo(400, 200);
    ctx.lineTo(520, 300);
    ctx.closePath();
    ctx.stroke();
    
    // Door
    ctx.strokeRect(370, 400, 60, 100);
    
    // Windows
    ctx.strokeRect(320, 340, 50, 50);
    ctx.strokeRect(430, 340, 50, 50);
    
    // Tree
    ctx.strokeRect(580, 400, 40, 100);
    ctx.beginPath();
    ctx.arc(600, 380, 60, 0, Math.PI * 2);
    ctx.stroke();
    
    // Ground
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(800, 500);
    ctx.stroke();
    
    // Clouds
    drawCloud(500, 80);
    drawCloud(650, 120);
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
    ctx.stroke();
}

// Flood fill algorithm (simplified)
function floodFill(startX, startY) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixelColor(imageData, startX, startY);
    const fillColor = hexToRgb(currentColor);
    
    if (colorsMatch(targetColor, fillColor)) return;
    
    const pixelsToCheck = [[startX, startY]];
    const checkedPixels = new Set();
    
    while (pixelsToCheck.length > 0) {
        const [x, y] = pixelsToCheck.pop();
        const key = `${x},${y}`;
        
        if (checkedPixels.has(key)) continue;
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
        
        const currentColor = getPixelColor(imageData, x, y);
        
        if (!colorsMatch(currentColor, targetColor)) continue;
        
        setPixelColor(imageData, x, y, fillColor);
        checkedPixels.add(key);
        
        pixelsToCheck.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function getPixelColor(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

function setPixelColor(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
    imageData.data[index + 3] = 255;
}

function colorsMatch(c1, c2) {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Clear canvas
function clearCanvas() {
    showConfirm('Are you sure you want to clear everything?', () => {
        loadTemplate();
        playSound('success');
        showToast('Canvas cleared!', 'info');
    });
}

// Save progress
async function saveProgress() {
    try {
        showLoading('Saving your work...');
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            // Upload to Firebase Storage
            const storageRef = storage.ref();
            const fileName = `coloring_${currentUser.uid}_${Date.now()}.png`;
            const fileRef = storageRef.child(`submissions/${currentUser.uid}/${fileName}`);
            
            await fileRef.put(blob);
            const downloadURL = await fileRef.getDownloadURL();
            
            // Save progress to Firestore
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            
            await db.collection('studentProgress').doc(`${currentUser.uid}_${activityId}`).set({
                studentId: currentUser.uid,
                activityId: activityId,
                status: 'in_progress',
                startedAt: firebase.firestore.Timestamp.fromDate(new Date(startTime)),
                lastAttemptAt: firebase.firestore.FieldValue.serverTimestamp(),
                timeSpent: timeSpent,
                progressData: {
                    savedImageUrl: downloadURL,
                    percentageColored: 50 // Simplified - in production, calculate actual percentage
                }
            }, { merge: true });
            
            hideLoading();
            playSound('success');
            showToast('Progress saved successfully!', 'success');
            
        }, 'image/png');
        
    } catch (error) {
        console.error('Error saving progress:', error);
        hideLoading();
        showToast('Failed to save progress', 'error');
    }
}

// Submit coloring
async function submitColoring() {
    showConfirm('Submit your coloring to your teacher?', async () => {
        try {
            showLoading('Submitting your work...');
            
            // Convert canvas to blob
            canvas.toBlob(async (blob) => {
                // Upload to Firebase Storage
                const storageRef = storage.ref();
                const fileName = `coloring_submission_${currentUser.uid}_${Date.now()}.png`;
                const fileRef = storageRef.child(`submissions/${currentUser.uid}/${fileName}`);
                
                await fileRef.put(blob);
                const downloadURL = await fileRef.getDownloadURL();
                
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                
                // Create submission
                await db.collection('submissions').add({
                    studentId: currentUser.uid,
                    studentName: currentUser.displayName,
                    activityId: activityId,
                    submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    submissionType: 'file',
                    fileUrls: [downloadURL],
                    isGraded: false,
                    isLate: false
                });
                
                // Update progress to completed
                await db.collection('studentProgress').doc(`${currentUser.uid}_${activityId}`).set({
                    studentId: currentUser.uid,
                    activityId: activityId,
                    status: 'completed',
                    completedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    timeSpent: timeSpent,
                    progressData: {
                        savedImageUrl: downloadURL,
                        percentageColored: 100
                    }
                }, { merge: true });
                
                hideLoading();
                playSound('success');
                showToast('Submitted successfully! Great job! 🎉', 'success', 5000);
                
                // Redirect back to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = '../student-dashboard.html';
                }, 2000);
                
            }, 'image/png');
            
        } catch (error) {
            console.error('Error submitting:', error);
            hideLoading();
            showToast('Failed to submit. Please try again.', 'error');
        }
    });
}

// Track activity start
async function trackActivityStart() {
    try {
        await db.collection('studentProgress').doc(`${currentUser.uid}_${activityId}`).set({
            studentId: currentUser.uid,
            activityId: activityId,
            status: 'in_progress',
            startedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastAttemptAt: firebase.firestore.FieldValue.serverTimestamp(),
            attempts: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });
    } catch (error) {
        console.error('Error tracking activity start:', error);
    }
}

// Load saved progress
async function loadSavedProgress() {
    try {
        const progressDoc = await db.collection('studentProgress')
            .doc(`${currentUser.uid}_${activityId}`)
            .get();
        
        if (progressDoc.exists) {
            const data = progressDoc.data();
            if (data.progressData && data.progressData.savedImageUrl) {
                // Load saved image
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                };
                img.src = data.progressData.savedImageUrl;
            }
        }
    } catch (error) {
        console.error('Error loading saved progress:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initColoring);


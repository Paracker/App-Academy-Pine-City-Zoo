// Student Dashboard JavaScript

let currentUser = null;

// Initialize dashboard
async function initDashboard() {
    try {
        // Protect page - only students can access
        currentUser = await protectPage('student');
        
        // Update UI with student name
        document.getElementById('studentName').textContent = currentUser.displayName || 'Student';
        document.getElementById('welcomeName').textContent = currentUser.displayName?.split(' ')[0] || 'Student';
        
        // Load student progress
        await loadProgress();
        
        // Load recent activities
        await loadRecentActivities();
        
        // Listen for new assignments
        listenForAssignments();
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
}

// Load student progress for all activities
async function loadProgress() {
    try {
        const progressSnapshot = await db.collection('studentProgress')
            .where('studentId', '==', currentUser.uid)
            .get();
        
        // Calculate progress for each activity type
        const progressByType = {
            puzzle: { completed: 0, total: 0 },
            coloring: { completed: 0, total: 0 },
            math: { completed: 0, total: 0 },
            science: { completed: 0, total: 0 },
            assignment: { completed: 0, total: 0 },
            test: { completed: 0, total: 0 }
        };
        
        progressSnapshot.forEach(doc => {
            const data = doc.data();
            const type = getActivityTypeFromId(data.activityId);
            
            if (progressByType[type]) {
                progressByType[type].total++;
                if (data.status === 'completed') {
                    progressByType[type].completed++;
                }
            }
        });
        
        // Update progress bars
        updateProgressBar('puzzleProgress', progressByType.puzzle);
        updateProgressBar('coloringProgress', progressByType.coloring);
        updateProgressBar('mathProgress', progressByType.math);
        updateProgressBar('scienceProgress', progressByType.science);
        updateProgressBar('assignmentProgress', progressByType.assignment);
        updateProgressBar('testProgress', progressByType.test);
        
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Update progress bar
function updateProgressBar(elementId, progress) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const percentage = progress.total > 0 
        ? Math.round((progress.completed / progress.total) * 100) 
        : 0;
    
    element.style.width = percentage + '%';
}

// Get activity type from activity ID (simplified - in real app, query Firestore)
function getActivityTypeFromId(activityId) {
    // This is a placeholder - in production, you'd query the activities collection
    // For now, we'll extract from the ID if it follows a pattern
    if (activityId.includes('puzzle')) return 'puzzle';
    if (activityId.includes('coloring')) return 'coloring';
    if (activityId.includes('math')) return 'math';
    if (activityId.includes('science')) return 'science';
    if (activityId.includes('assignment')) return 'assignment';
    if (activityId.includes('test')) return 'test';
    return 'puzzle'; // default
}

// Load recent activities
async function loadRecentActivities() {
    try {
        const recentSnapshot = await db.collection('studentProgress')
            .where('studentId', '==', currentUser.uid)
            .orderBy('lastAttemptAt', 'desc')
            .limit(5)
            .get();
        
        const recentContainer = document.getElementById('recentActivities');
        
        if (recentSnapshot.empty) {
            recentContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-title">No recent activities</div>
                    <div class="empty-state-description">Start learning by clicking on an activity above!</div>
                </div>
            `;
            return;
        }
        
        let html = '<div class="recent-activities-list">';
        
        for (const doc of recentSnapshot.docs) {
            const data = doc.data();
            const activityType = getActivityTypeFromId(data.activityId);
            const icon = getActivityIcon(activityType);
            const color = getActivityColor(activityType);
            
            html += `
                <div class="recent-activity-item">
                    <div class="recent-activity-icon" style="background: ${color}20; color: ${color};">
                        ${icon}
                    </div>
                    <div class="recent-activity-info">
                        <div class="recent-activity-title">${capitalizeFirst(activityType)}</div>
                        <div class="recent-activity-time">${timeAgo(data.lastAttemptAt)}</div>
                    </div>
                    ${data.score !== undefined ? `
                        <div class="recent-activity-score">
                            ${data.score}/${data.maxScore}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        html += '</div>';
        recentContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading recent activities:', error);
    }
}

// Listen for new assignments
function listenForAssignments() {
    db.collection('assignments')
        .where('assignedTo', '==', currentUser.uid)
        .where('status', '==', 'assigned')
        .onSnapshot(snapshot => {
            const newAssignments = snapshot.docs.filter(doc => {
                const data = doc.data();
                const assignedAt = data.assignedAt.toDate();
                const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
                return assignedAt > hourAgo;
            });
            
            if (newAssignments.length > 0) {
                const badge = document.getElementById('assignmentBadge');
                if (badge) {
                    badge.style.display = 'inline-block';
                    badge.textContent = newAssignments.length + ' New';
                }
            }
        });
}

// Navigate to activity
function goToActivity(activityType) {
    // Play click sound
    playSound('click');
    
    // Navigate to activity page
    window.location.href = `activities/${activityType}.html`;
}

// Helper function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initDashboard);


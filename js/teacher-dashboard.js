// Teacher Dashboard JavaScript

let currentUser = null;
let currentTab = 'overview';

// Initialize dashboard
async function initDashboard() {
    try {
        // Protect page - only teachers can access
        currentUser = await protectPage('teacher');
        
        // Update UI with teacher name
        document.getElementById('teacherName').textContent = currentUser.displayName || 'Teacher';
        
        // Load statistics
        await loadStatistics();
        
        // Load overview tab by default
        switchTab('overview');
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
}

// Load statistics
async function loadStatistics() {
    try {
        // Get teacher's classes
        const classesSnapshot = await db.collection('classes')
            .where('teacherId', '==', currentUser.uid)
            .get();
        
        let totalStudents = 0;
        const studentIds = [];
        
        classesSnapshot.forEach(doc => {
            const classData = doc.data();
            if (classData.studentIds) {
                totalStudents += classData.studentIds.length;
                studentIds.push(...classData.studentIds);
            }
        });
        
        // Get active assignments
        const assignmentsSnapshot = await db.collection('assignments')
            .where('assignedBy', '==', currentUser.uid)
            .where('status', '!=', 'completed')
            .get();
        
        // Get pending grading
        const submissionsSnapshot = await db.collection('submissions')
            .where('isGraded', '==', false)
            .get();
        
        const pendingGrading = submissionsSnapshot.docs.filter(doc => {
            return studentIds.includes(doc.data().studentId);
        }).length;
        
        // Calculate average completion
        let avgCompletion = 0;
        if (studentIds.length > 0) {
            const progressSnapshot = await db.collection('studentProgress')
                .where('studentId', 'in', studentIds.slice(0, 10)) // Firestore 'in' limit
                .get();
            
            const completed = progressSnapshot.docs.filter(doc => 
                doc.data().status === 'completed'
            ).length;
            
            avgCompletion = progressSnapshot.size > 0 
                ? Math.round((completed / progressSnapshot.size) * 100) 
                : 0;
        }
        
        // Update UI
        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('activeAssignments').textContent = assignmentsSnapshot.size;
        document.getElementById('pendingGrading').textContent = pendingGrading;
        document.getElementById('avgCompletion').textContent = avgCompletion + '%';
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Switch tabs
async function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event?.target?.classList.add('active');
    
    // Load tab content
    const tabContent = document.getElementById('tabContent');
    
    switch (tabName) {
        case 'overview':
            await loadOverviewTab(tabContent);
            break;
        case 'students':
            await loadStudentsTab(tabContent);
            break;
        case 'activities':
            await loadActivitiesTab(tabContent);
            break;
        case 'grading':
            await loadGradingTab(tabContent);
            break;
    }
}

// Load Overview Tab
async function loadOverviewTab(container) {
    container.innerHTML = `
        <h2>Recent Activity</h2>
        <div id="recentActivity">
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
        </div>
    `;
    
    try {
        // Get recent submissions
        const submissionsSnapshot = await db.collection('submissions')
            .orderBy('submittedAt', 'desc')
            .limit(10)
            .get();
        
        const recentDiv = document.getElementById('recentActivity');
        
        if (submissionsSnapshot.empty) {
            recentDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-title">No recent submissions</div>
                    <div class="empty-state-description">Student submissions will appear here</div>
                </div>
            `;
            return;
        }
        
        let html = '<div class="table-container"><table class="table"><thead><tr>';
        html += '<th>Student</th><th>Activity</th><th>Submitted</th><th>Status</th><th>Actions</th>';
        html += '</tr></thead><tbody>';
        
        submissionsSnapshot.forEach(doc => {
            const data = doc.data();
            html += `
                <tr>
                    <td>${data.studentName}</td>
                    <td>Coloring Activity</td>
                    <td>${formatDateTime(data.submittedAt)}</td>
                    <td>
                        ${data.isGraded 
                            ? '<span class="badge badge-completed">Graded</span>' 
                            : '<span class="badge badge-pending">Pending</span>'}
                    </td>
                    <td>
                        ${!data.isGraded 
                            ? `<button class="btn btn-sm btn-primary" onclick="gradeSubmission('${doc.id}')">Grade</button>`
                            : `<button class="btn btn-sm btn-outline" onclick="viewSubmission('${doc.id}')">View</button>`}
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        recentDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading overview:', error);
        document.getElementById('recentActivity').innerHTML = `
            <div class="alert alert-error">Error loading recent activity</div>
        `;
    }
}

// Load Students Tab
async function loadStudentsTab(container) {
    container.innerHTML = `
        <div class="flex-between mb-lg">
            <h2>My Students</h2>
            <button class="btn btn-primary" onclick="showAddStudentModal()">
                ➕ Add Student
            </button>
        </div>
        <div id="studentsList">
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
        </div>
    `;
    
    try {
        // Get teacher's classes
        const classesSnapshot = await db.collection('classes')
            .where('teacherId', '==', currentUser.uid)
            .get();
        
        const studentIds = [];
        classesSnapshot.forEach(doc => {
            const classData = doc.data();
            if (classData.studentIds) {
                studentIds.push(...classData.studentIds);
            }
        });
        
        const studentsDiv = document.getElementById('studentsList');
        
        if (studentIds.length === 0) {
            studentsDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-title">No students yet</div>
                    <div class="empty-state-description">Click "Add Student" to get started</div>
                </div>
            `;
            return;
        }
        
        // Get student details (batch in groups of 10 due to Firestore 'in' limit)
        const students = [];
        for (let i = 0; i < studentIds.length; i += 10) {
            const batch = studentIds.slice(i, i + 10);
            const usersSnapshot = await db.collection('users')
                .where(firebase.firestore.FieldPath.documentId(), 'in', batch)
                .get();
            
            usersSnapshot.forEach(doc => {
                students.push({ id: doc.id, ...doc.data() });
            });
        }
        
        let html = '<div class="grid grid-3">';
        
        for (const student of students) {
            // Get student progress
            const progressSnapshot = await db.collection('studentProgress')
                .where('studentId', '==', student.id)
                .get();
            
            const completed = progressSnapshot.docs.filter(doc => 
                doc.data().status === 'completed'
            ).length;
            
            const completionRate = progressSnapshot.size > 0 
                ? Math.round((completed / progressSnapshot.size) * 100) 
                : 0;
            
            html += `
                <div class="card">
                    <div class="flex-between mb-md">
                        <div class="avatar">${getInitials(student.displayName)}</div>
                        <span class="badge badge-in-progress">${completionRate}% Complete</span>
                    </div>
                    <h3>${student.displayName}</h3>
                    <p class="text-light">${student.email}</p>
                    <div class="mt-md">
                        <button class="btn btn-sm btn-primary" onclick="viewStudentProgress('${student.id}')">
                            View Progress
                        </button>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        studentsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading students:', error);
        document.getElementById('studentsList').innerHTML = `
            <div class="alert alert-error">Error loading students</div>
        `;
    }
}

// Load Activities Tab
async function loadActivitiesTab(container) {
    container.innerHTML = `
        <div class="flex-between mb-lg">
            <h2>Activities</h2>
            <button class="btn btn-primary" onclick="showAssignActivityModal()">
                📚 Assign Activity
            </button>
        </div>
        <div id="activitiesList">
            <div class="grid grid-3">
                <div class="activity-card" style="--activity-color: #f687b3;">
                    <span class="activity-icon">🎨</span>
                    <h3 class="activity-title">Coloring</h3>
                    <p class="activity-description">Creative coloring activities</p>
                    <button class="btn btn-primary mt-md" onclick="assignActivity('coloring')">
                        Assign to Students
                    </button>
                </div>
                
                <div class="activity-card" style="--activity-color: #ed8936; opacity: 0.6;">
                    <span class="activity-icon">🧩</span>
                    <h3 class="activity-title">Puzzles</h3>
                    <p class="activity-description">Coming soon...</p>
                </div>
                
                <div class="activity-card" style="--activity-color: #4299e1; opacity: 0.6;">
                    <span class="activity-icon">➕</span>
                    <h3 class="activity-title">Mathematics</h3>
                    <p class="activity-description">Coming soon...</p>
                </div>
            </div>
        </div>
    `;
}

// Load Grading Tab
async function loadGradingTab(container) {
    container.innerHTML = `
        <h2>Pending Grading</h2>
        <div id="gradingList">
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
        </div>
    `;
    
    try {
        const submissionsSnapshot = await db.collection('submissions')
            .where('isGraded', '==', false)
            .orderBy('submittedAt', 'desc')
            .get();
        
        const gradingDiv = document.getElementById('gradingList');
        
        if (submissionsSnapshot.empty) {
            gradingDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✅</div>
                    <div class="empty-state-title">All caught up!</div>
                    <div class="empty-state-description">No submissions pending grading</div>
                </div>
            `;
            return;
        }
        
        let html = '<div class="grid grid-2">';
        
        submissionsSnapshot.forEach(doc => {
            const data = doc.data();
            html += `
                <div class="card">
                    <div class="flex-between mb-md">
                        <h3>${data.studentName}</h3>
                        <span class="badge badge-pending">Pending</span>
                    </div>
                    <p class="text-light mb-md">Coloring Activity</p>
                    <p class="text-light mb-md">Submitted: ${formatDateTime(data.submittedAt)}</p>
                    ${data.fileUrls && data.fileUrls[0] ? `
                        <img src="${data.fileUrls[0]}" alt="Student work" style="width: 100%; border-radius: 8px; margin-bottom: 16px;">
                    ` : ''}
                    <button class="btn btn-primary" onclick="gradeSubmission('${doc.id}')">
                        Grade Now
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        gradingDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading grading:', error);
        document.getElementById('gradingList').innerHTML = `
            <div class="alert alert-error">Error loading submissions</div>
        `;
    }
}

// Grade submission
async function gradeSubmission(submissionId) {
    try {
        const submissionDoc = await db.collection('submissions').doc(submissionId).get();
        const submission = submissionDoc.data();
        
        // Show grading modal
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay show';
        overlay.innerHTML = `
            <div class="modal" style="max-width: 700px;">
                <div class="modal-header">Grade Submission</div>
                <div class="modal-body">
                    <p><strong>Student:</strong> ${submission.studentName}</p>
                    <p><strong>Activity:</strong> Coloring</p>
                    <p><strong>Submitted:</strong> ${formatDateTime(submission.submittedAt)}</p>
                    
                    ${submission.fileUrls && submission.fileUrls[0] ? `
                        <img src="${submission.fileUrls[0]}" alt="Student work" style="width: 100%; border-radius: 8px; margin: 16px 0;">
                    ` : ''}
                    
                    <div class="form-group">
                        <label class="form-label">Grade (out of 100)</label>
                        <input type="number" id="gradeValue" class="form-control" min="0" max="100" value="85">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Feedback</label>
                        <textarea id="gradeFeedback" class="form-control" rows="4" placeholder="Great job! Keep up the good work!"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn btn-success" onclick="submitGrade('${submissionId}')">Submit Grade</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
    } catch (error) {
        console.error('Error loading submission:', error);
        showToast('Error loading submission', 'error');
    }
}

// Submit grade
async function submitGrade(submissionId) {
    try {
        const gradeValue = parseInt(document.getElementById('gradeValue').value);
        const feedback = document.getElementById('gradeFeedback').value;
        
        if (gradeValue < 0 || gradeValue > 100) {
            showToast('Grade must be between 0 and 100', 'error');
            return;
        }
        
        showLoading('Submitting grade...');
        
        const submissionDoc = await db.collection('submissions').doc(submissionId).get();
        const submission = submissionDoc.data();
        
        // Update submission
        await db.collection('submissions').doc(submissionId).update({
            isGraded: true,
            grade: gradeValue,
            maxGrade: 100,
            feedback: feedback,
            gradedBy: currentUser.uid,
            gradedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Create grade record
        await db.collection('grades').add({
            studentId: submission.studentId,
            activityId: submission.activityId,
            submissionId: submissionId,
            gradeValue: gradeValue,
            maxGrade: 100,
            percentage: gradeValue,
            feedback: feedback,
            teacherId: currentUser.uid,
            teacherName: currentUser.displayName,
            gradedAt: firebase.firestore.FieldValue.serverTimestamp(),
            isPublished: true
        });
        
        hideLoading();
        document.querySelector('.modal-overlay').remove();
        showToast('Grade submitted successfully!', 'success');
        
        // Reload current tab
        switchTab(currentTab);
        
    } catch (error) {
        console.error('Error submitting grade:', error);
        hideLoading();
        showToast('Error submitting grade', 'error');
    }
}

// Assign activity
function assignActivity(activityType) {
    showToast('Activity assignment feature coming soon!', 'info');
}

// View student progress
function viewStudentProgress(studentId) {
    showToast('Student progress view coming soon!', 'info');
}

// Show add student modal
function showAddStudentModal() {
    showToast('Add student feature coming soon! Use Firebase Console to create student accounts.', 'info');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initDashboard);


# Grade R Learning Platform - Database Schema

## Overview
This document describes the Firestore database structure for the Grade R Learning Platform.

## Collections Structure

### 1. users
Stores all user accounts (students, parents, teachers)

```javascript
{
  uid: string,              // Firebase Auth UID (document ID)
  email: string,            // User email
  displayName: string,      // Full name
  role: string,             // "student" | "parent" | "teacher"
  createdAt: timestamp,     // Account creation date
  lastLogin: timestamp,     // Last login timestamp
  
  // Student-specific fields
  grade: string,            // "Grade R"
  classId: string,          // Reference to class document
  parentIds: array,         // Array of parent UIDs
  
  // Parent-specific fields
  childrenIds: array,       // Array of student UIDs
  
  // Teacher-specific fields
  classIds: array           // Array of class IDs teacher manages
}
```

**Indexes:**
- `role` (for querying by user type)
- `classId` (for student queries)

---

### 2. classes
Stores class/group information managed by teachers

```javascript
{
  classId: string,          // Auto-generated ID (document ID)
  className: string,        // e.g., "Grade R - Class A"
  teacherId: string,        // UID of teacher managing this class
  teacherName: string,      // Teacher display name
  studentIds: array,        // Array of student UIDs in this class
  createdAt: timestamp,     // Class creation date
  academicYear: string      // e.g., "2024"
}
```

**Indexes:**
- `teacherId` (for teacher's class queries)

---

### 3. activities
Stores activity templates and content

```javascript
{
  activityId: string,       // Auto-generated ID (document ID)
  type: string,             // "puzzle" | "coloring" | "math" | "science" | "assignment" | "test"
  title: string,            // Activity title
  description: string,      // Activity description
  instructions: string,     // Instructions for students
  difficulty: string,       // "easy" | "medium" | "hard"
  estimatedTime: number,    // Estimated completion time in minutes
  
  // Activity-specific content
  content: object,          // Varies by activity type
  
  // Metadata
  createdBy: string,        // Teacher UID who created it
  createdAt: timestamp,
  isActive: boolean,        // Whether activity is available
  tags: array               // Array of tags for categorization
}
```

**Content structure by type:**

**Puzzle:**
```javascript
content: {
  imageUrl: string,         // URL to puzzle image
  pieces: number            // Number of puzzle pieces (4, 6, or 9)
}
```

**Coloring:**
```javascript
content: {
  templateUrl: string       // URL to coloring template SVG
}
```

**Math:**
```javascript
content: {
  questions: [
    {
      questionText: string,
      questionType: string, // "counting" | "addition" | "subtraction"
      imageUrl: string,     // Visual representation
      correctAnswer: number,
      options: array        // Multiple choice options
    }
  ]
}
```

**Science:**
```javascript
content: {
  activityType: string,     // "classification" | "matching" | "observation"
  items: array,             // Items to classify/match
  categories: array         // Categories for classification
}
```

**Assignment:**
```javascript
content: {
  instructions: string,
  attachments: array,       // URLs to attached files
  submissionType: string,   // "text" | "file" | "both"
  dueDate: timestamp
}
```

**Test:**
```javascript
content: {
  questions: [
    {
      questionText: string,
      questionType: string, // "multiple_choice" | "true_false" | "matching"
      options: array,
      correctAnswer: string,
      points: number
    }
  ],
  totalPoints: number,
  timeLimit: number         // Time limit in minutes
}
```

---

### 4. assignments
Tracks activity assignments to students

```javascript
{
  assignmentId: string,     // Auto-generated ID (document ID)
  activityId: string,       // Reference to activity
  activityType: string,     // Type of activity
  activityTitle: string,    // Activity title (denormalized)
  
  assignedTo: string,       // Student UID or "class:{classId}"
  assignedBy: string,       // Teacher UID
  assignedAt: timestamp,    // Assignment date
  dueDate: timestamp,       // Due date (optional)
  
  status: string,           // "assigned" | "in_progress" | "completed"
  isRequired: boolean       // Whether assignment is mandatory
}
```

**Indexes:**
- `assignedTo` (for student queries)
- `activityId` (for activity-based queries)
- Composite: `assignedTo` + `status`

---

### 5. studentProgress
Tracks student progress on activities

```javascript
{
  progressId: string,       // Auto-generated ID (document ID)
  studentId: string,        // Student UID
  activityId: string,       // Activity ID
  assignmentId: string,     // Assignment ID (if assigned)
  
  status: string,           // "not_started" | "in_progress" | "completed"
  startedAt: timestamp,     // When student started
  completedAt: timestamp,   // When student completed
  timeSpent: number,        // Total time in seconds
  
  attempts: number,         // Number of attempts
  lastAttemptAt: timestamp, // Last attempt timestamp
  
  // Progress data (varies by activity type)
  progressData: object,
  
  // Scoring
  score: number,            // Score achieved (if applicable)
  maxScore: number,         // Maximum possible score
  percentage: number        // Percentage score
}
```

**Progress data by type:**

**Puzzle:**
```javascript
progressData: {
  piecesPlaced: number,
  totalPieces: number,
  completionTime: number
}
```

**Coloring:**
```javascript
progressData: {
  percentageColored: number,
  colorsUsed: array,
  savedImageUrl: string
}
```

**Math:**
```javascript
progressData: {
  questionsAnswered: number,
  totalQuestions: number,
  correctAnswers: number,
  incorrectAnswers: number,
  questionResults: array    // Detailed per-question results
}
```

**Indexes:**
- `studentId` (for student queries)
- `activityId` (for activity-based queries)
- Composite: `studentId` + `status`

---

### 6. submissions
Stores student work submissions

```javascript
{
  submissionId: string,     // Auto-generated ID (document ID)
  studentId: string,        // Student UID
  studentName: string,      // Student name (denormalized)
  activityId: string,       // Activity ID
  assignmentId: string,     // Assignment ID
  
  submittedAt: timestamp,   // Submission timestamp
  isLate: boolean,          // Whether submitted after due date
  
  // Submission content
  submissionType: string,   // "text" | "file" | "auto_graded"
  textContent: string,      // Text submission
  fileUrls: array,          // URLs to uploaded files
  
  // Grading
  isGraded: boolean,
  grade: number,            // Grade/score
  maxGrade: number,         // Maximum possible grade
  feedback: string,         // Teacher feedback
  gradedBy: string,         // Teacher UID
  gradedAt: timestamp
}
```

**Indexes:**
- `studentId` (for student queries)
- `activityId` (for activity-based queries)
- Composite: `isGraded` + `submittedAt`

---

### 7. grades
Stores final grades and assessments

```javascript
{
  gradeId: string,          // Auto-generated ID (document ID)
  studentId: string,        // Student UID
  activityId: string,       // Activity ID
  submissionId: string,     // Submission ID (if applicable)
  
  gradeValue: number,       // Numeric grade
  maxGrade: number,         // Maximum possible grade
  percentage: number,       // Percentage score
  letterGrade: string,      // Optional letter grade
  
  feedback: string,         // Teacher feedback
  teacherId: string,        // Teacher who graded
  teacherName: string,      // Teacher name (denormalized)
  
  gradedAt: timestamp,
  isPublished: boolean      // Whether visible to student/parent
}
```

**Indexes:**
- `studentId` (for student queries)
- Composite: `studentId` + `isPublished`

---

### 8. notifications
Stores notifications for users

```javascript
{
  notificationId: string,   // Auto-generated ID (document ID)
  userId: string,           // Recipient UID
  type: string,             // "assignment" | "grade" | "feedback" | "announcement"
  title: string,            // Notification title
  message: string,          // Notification message
  
  relatedId: string,        // ID of related entity (assignment, grade, etc.)
  relatedType: string,      // Type of related entity
  
  isRead: boolean,
  createdAt: timestamp,
  readAt: timestamp
}
```

**Indexes:**
- `userId` (for user queries)
- Composite: `userId` + `isRead`

---

## Security Considerations

### Role-Based Access Control

**Students:**
- Read: Own user document, assigned activities, own progress, own submissions
- Write: Own progress, own submissions (before grading)
- Cannot: Modify grades, access other students' data

**Parents:**
- Read: Own user document, linked children's data (progress, grades, submissions)
- Write: Own user document (profile updates only)
- Cannot: Modify any child data, access other families' data

**Teachers:**
- Read: All students in their classes, all activities, all progress/submissions for their students
- Write: Activities, assignments, grades, feedback for their students
- Cannot: Access students from other teachers' classes (unless shared)

### Data Validation Rules

1. User role cannot be modified by the user themselves
2. Grades can only be written by teachers
3. Student progress can only be modified by the student or system
4. Parent-child relationships must be validated
5. All timestamps must be server timestamps
6. Required fields must be present

---

## Query Patterns

### Common Queries

**Get student's assigned activities:**
```javascript
db.collection('assignments')
  .where('assignedTo', '==', studentId)
  .where('status', '!=', 'completed')
  .orderBy('dueDate', 'asc')
```

**Get student's progress:**
```javascript
db.collection('studentProgress')
  .where('studentId', '==', studentId)
  .orderBy('lastAttemptAt', 'desc')
```

**Get ungraded submissions for teacher:**
```javascript
db.collection('submissions')
  .where('isGraded', '==', false)
  .where('studentId', 'in', teacherStudentIds)
  .orderBy('submittedAt', 'asc')
```

**Get child's grades for parent:**
```javascript
db.collection('grades')
  .where('studentId', '==', childId)
  .where('isPublished', '==', true)
  .orderBy('gradedAt', 'desc')
```

---

## Data Flow

### Activity Assignment Flow
1. Teacher creates activity → `activities` collection
2. Teacher assigns to student/class → `assignments` collection
3. Student views assignment → reads from `assignments` + `activities`
4. Student starts activity → creates document in `studentProgress`
5. Student completes activity → updates `studentProgress`, creates `submission`
6. Teacher grades submission → updates `submission`, creates `grade`
7. Parent views grade → reads from `grades` collection

### Real-time Updates
- Use Firestore listeners for real-time dashboard updates
- Student progress updates trigger parent dashboard updates
- New assignments trigger student notifications
- Grading triggers parent notifications

---

## Backup and Data Retention

- Daily automated backups of Firestore database
- Student data retained for current academic year + 2 years
- Deleted accounts: data anonymized after 30 days
- Audit logs for all grade modifications

---

## Performance Optimization

1. **Denormalization**: Store frequently accessed data (names, titles) in documents
2. **Composite Indexes**: Create for common query patterns
3. **Pagination**: Limit query results to 20-50 documents
4. **Caching**: Use Firestore offline persistence
5. **Batch Operations**: Use batch writes for bulk operations

---

## Future Enhancements

- Add `achievements` collection for gamification
- Add `messages` collection for teacher-parent communication
- Add `attendance` collection for tracking
- Add `reports` collection for generated reports
- Add `settings` collection for user preferences


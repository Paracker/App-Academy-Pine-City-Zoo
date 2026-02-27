# Grade R Learning Platform 🎓

A comprehensive educational platform for Grade R (kindergarten) students with interactive activities, progress tracking, and dual admin dashboards for parents and teachers.

## 🌟 Features

### For Students
- 🧩 **Puzzles** - Interactive drag-and-drop puzzle games
- 🎨 **Coloring** - Digital coloring activities with various templates
- ➕ **Mathematics** - Counting, number recognition, and basic operations
- 🔬 **Science** - Observation and categorization activities
- 📝 **Assignments** - Teacher-created custom tasks
- ✅ **Tests** - Assessments with automatic grading

### For Teachers
- 👥 Class management (add/remove students)
- 📚 Create and assign activities
- 📊 Monitor student progress in real-time
- ✏️ Grade assignments and provide feedback
- 📈 View class-wide analytics and reports

### For Parents
- 👀 View child's progress across all activities
- 📊 See grades and completion rates
- 📝 Read teacher feedback
- 📥 Download progress reports

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase (BaaS)
  - Authentication
  - Firestore Database
  - Cloud Storage
  - Hosting
- **Design**: Responsive, mobile-friendly, child-appropriate UI

## 📋 Prerequisites

- Node.js (v14 or higher)
- Firebase CLI
- A Firebase project

## 🚀 Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `grade-r-learning` (or your preferred name)
4. Follow the setup wizard

### 2. Enable Firebase Services

#### Enable Authentication:
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method

#### Enable Firestore Database:
1. Go to **Firestore Database**
2. Click "Create Database"
3. Start in **Production mode**
4. Choose your preferred location

#### Enable Cloud Storage:
1. Go to **Storage**
2. Click "Get Started"
3. Use default security rules (we'll update them later)

### 3. Configure Firebase in Your Project

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname
5. Copy the Firebase configuration object

6. Open `firebase-config.js` in your project
7. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

8. Update `.firebaserc` with your project ID:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 4. Deploy Security Rules

Install Firebase CLI if you haven't:
```bash
npm install -g firebase-tools
```

Login to Firebase:
```bash
firebase login
```

Deploy Firestore and Storage rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 5. Create Initial Users

You'll need to create initial user accounts. You can do this in two ways:

#### Option A: Firebase Console (Recommended for first teacher account)
1. Go to **Authentication** in Firebase Console
2. Click "Add User"
3. Enter email and password
4. After creating the user, go to **Firestore Database**
5. Create a document in the `users` collection with the user's UID:

```javascript
{
  uid: "user-uid-from-auth",
  email: "teacher@school.com",
  displayName: "Teacher Name",
  role: "teacher",
  createdAt: [current timestamp],
  classIds: []
}
```

#### Option B: Use the Teacher Dashboard (After first teacher is created)
Teachers can create student accounts from their dashboard.

### 6. Run Locally

You can test the application locally using any web server. Here are a few options:

**Using Python:**
```bash
python3 -m http.server 3000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 3000
```

**Using VS Code Live Server:**
- Install "Live Server" extension
- Right-click `login.html` and select "Open with Live Server"

Visit `http://localhost:3000/login.html` in your browser.

### 7. Deploy to Firebase Hosting (Optional)

```bash
firebase deploy --only hosting
```

Your app will be available at: `https://your-project-id.web.app`

## 📁 Project Structure

```
grade-r-learning-platform/
├── activities/              # Activity pages
│   ├── coloring.html
│   ├── puzzles.html
│   ├── mathematics.html
│   ├── science.html
│   ├── assignments.html
│   └── tests.html
├── assets/                  # Static assets
│   ├── images/
│   ├── sounds/
│   ├── coloring-templates/
│   ├── puzzles/
│   ├── math/
│   ├── science/
│   └── icons/
├── css/                     # Stylesheets
│   ├── main.css
│   ├── components.css
│   ├── student-dashboard.css
│   └── activities.css
├── js/                      # JavaScript files
│   ├── activities/         # Activity-specific JS
│   ├── teacher/            # Teacher dashboard JS
│   ├── parent/             # Parent dashboard JS
│   ├── auth.js
│   ├── auth-guard.js
│   └── utils.js
├── docs/                    # Documentation
│   ├── database-schema.md
│   └── security-rules.md
├── firebase-config.js       # Firebase configuration
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
├── firebase.json           # Firebase project config
├── .firebaserc             # Firebase project aliases
├── login.html              # Login page
├── student-dashboard.html  # Student dashboard
├── parent-dashboard.html   # Parent dashboard
├── teacher-dashboard.html  # Teacher dashboard
└── README.md               # This file
```

## 🔐 User Roles

### Student
- Access to all learning activities
- View own progress and grades
- Submit assignments

### Parent
- Read-only access to child's data
- View progress, grades, and feedback
- Cannot modify any data

### Teacher
- Full administrative access
- Create and manage activities
- Assign tasks to students
- Grade submissions
- View class analytics

## 📊 Database Schema

See [docs/database-schema.md](docs/database-schema.md) for detailed information about:
- Collection structures
- Field types and relationships
- Security rules
- Query patterns
- Data flow

## 🔒 Security

- Role-based access control enforced at database level
- Firestore security rules prevent unauthorized access
- Students can only access their own data
- Parents can only view their children's data
- Teachers can only access their assigned students
- All sensitive operations require authentication

## 🎨 Customization

### Adding New Activities
1. Create activity HTML file in `activities/` folder
2. Create corresponding JavaScript file in `js/activities/`
3. Add activity metadata to Firestore `activities` collection
4. Update student dashboard to include new activity card

### Changing Colors
Edit CSS variables in `css/main.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  /* ... other colors */
}
```

### Adding Sounds
1. Add MP3 files to `assets/sounds/`
2. Use `playSound('filename')` function in JavaScript

## 🐛 Troubleshooting

### "Permission Denied" Errors
- Ensure Firestore security rules are deployed
- Check that user has correct role in Firestore
- Verify user is authenticated

### Activities Not Loading
- Check Firebase configuration in `firebase-config.js`
- Ensure Firestore database is created
- Check browser console for errors

### Login Issues
- Verify Email/Password authentication is enabled
- Check that user exists in Firebase Authentication
- Ensure user document exists in Firestore `users` collection

## 📝 Development Roadmap

### Phase 1: Foundation ✅
- [x] Firebase setup
- [x] Authentication system
- [x] Database schema
- [x] Base UI components

### Phase 2: MVP (In Progress)
- [ ] Coloring activity
- [ ] Teacher dashboard core features
- [ ] Student progress tracking

### Phase 3: Expand Activities
- [ ] Puzzles
- [ ] Mathematics
- [ ] Science
- [ ] Assignments
- [ ] Tests

### Phase 4: Complete Platform
- [ ] Parent dashboard
- [ ] Advanced analytics
- [ ] Notifications system
- [ ] Report generation

## 🤝 Contributing

This is a school project. For questions or issues, please contact the development team.

## 📄 License

This project is for educational purposes.

## 👥 Support

For setup assistance or questions:
1. Check the troubleshooting section above
2. Review Firebase documentation
3. Check browser console for error messages

## 🎉 Getting Started

1. Complete the setup instructions above
2. Create your first teacher account
3. Login at `/login.html`
4. Create student accounts from teacher dashboard
5. Start assigning activities!

---

**Built with ❤️ for Grade R students**


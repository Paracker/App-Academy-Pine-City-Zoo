# Grade R Learning Platform - Complete Setup Guide

This guide will walk you through setting up the Grade R Learning Platform from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Local Development Setup](#local-development-setup)
4. [Creating Initial Users](#creating-initial-users)
5. [Testing the Application](#testing-the-application)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ A Google account (for Firebase)
- ✅ A modern web browser (Chrome, Firefox, Safari, or Edge)
- ✅ Basic knowledge of HTML/CSS/JavaScript
- ✅ Node.js installed (v14 or higher) - [Download here](https://nodejs.org/)
- ✅ A code editor (VS Code recommended)

---

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `grade-r-learning-platform` (or your preferred name)
4. Click **Continue**
5. (Optional) Enable Google Analytics
6. Click **Create project**
7. Wait for project creation to complete
8. Click **Continue** to go to your project dashboard

### Step 2: Register Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `Grade R Learning Web App`
3. **Check** "Also set up Firebase Hosting"
4. Click **Register app**
5. **IMPORTANT**: Copy the Firebase configuration object - you'll need this!

It should look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

6. Click **Continue to console**

### Step 3: Enable Authentication

1. In the left sidebar, click **Authentication**
2. Click **Get started**
3. Click on **Email/Password** in the Sign-in providers list
4. Toggle **Enable** to ON
5. Click **Save**

### Step 4: Create Firestore Database

1. In the left sidebar, click **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we'll add security rules next)
4. Choose your database location (select closest to your users)
5. Click **Enable**
6. Wait for database creation to complete

### Step 5: Enable Cloud Storage

1. In the left sidebar, click **Storage**
2. Click **Get started**
3. Click **Next** (we'll update rules later)
4. Choose same location as your Firestore database
5. Click **Done**

---

## Local Development Setup

### Step 1: Install Firebase CLI

Open your terminal and run:

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

### Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window. Login with your Google account.

### Step 3: Configure Your Project

1. Open `firebase-config.js` in your code editor

2. Replace the placeholder configuration with your actual Firebase config (from Step 2 of Firebase setup):

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

3. Open `.firebaserc` and update the project ID:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### Step 4: Deploy Security Rules

Deploy Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

Deploy Storage security rules:
```bash
firebase deploy --only storage:rules
```

You should see success messages for both deployments.

---

## Creating Initial Users

### Create First Teacher Account

You need at least one teacher account to manage the platform.

#### Method 1: Firebase Console (Recommended)

1. Go to Firebase Console → **Authentication**
2. Click **Add user**
3. Enter:
   - **Email**: `teacher@school.com` (or your preferred email)
   - **Password**: Create a strong password (min 6 characters)
4. Click **Add user**
5. **Copy the User UID** (you'll need this next)

6. Go to **Firestore Database**
7. Click **Start collection**
8. Collection ID: `users`
9. Click **Next**
10. Document ID: Paste the **User UID** you copied
11. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| uid | string | (same as document ID) |
| email | string | teacher@school.com |
| displayName | string | Teacher Name |
| role | string | teacher |
| createdAt | timestamp | (click "Set to current time") |
| classIds | array | (leave empty for now) |

12. Click **Save**

#### Method 2: Using Firebase CLI (Advanced)

Create a script `create-teacher.js`:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

async function createTeacher() {
  const email = 'teacher@school.com';
  const password = 'YourSecurePassword123';
  const displayName = 'Teacher Name';
  
  try {
    // Create auth user
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName
    });
    
    // Create Firestore document
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      displayName: displayName,
      role: 'teacher',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      classIds: []
    });
    
    console.log('Teacher created successfully!');
    console.log('UID:', userRecord.uid);
  } catch (error) {
    console.error('Error:', error);
  }
}

createTeacher();
```

Run: `node create-teacher.js`

### Create Test Student Account

Follow the same process as creating a teacher, but use these field values:

| Field | Type | Value |
|-------|------|-------|
| uid | string | (user UID from Auth) |
| email | string | student@school.com |
| displayName | string | Test Student |
| role | string | student |
| grade | string | Grade R |
| classId | string | (leave empty for now) |
| parentIds | array | (leave empty for now) |
| createdAt | timestamp | (current time) |

### Create Test Parent Account

| Field | Type | Value |
|-------|------|-------|
| uid | string | (user UID from Auth) |
| email | string | parent@school.com |
| displayName | string | Test Parent |
| role | string | parent |
| childrenIds | array | [student-uid] |
| createdAt | timestamp | (current time) |

**Note**: For `childrenIds`, add the UID of the student account you created.

---

## Testing the Application

### Step 1: Start Local Server

Choose one of these methods:

**Option A: Python**
```bash
python3 -m http.server 3000
```

**Option B: Node.js http-server**
```bash
npx http-server -p 3000
```

**Option C: VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click `login.html`
3. Select "Open with Live Server"

### Step 2: Test Login

1. Open browser and go to: `http://localhost:3000/login.html`

2. **Test Teacher Login**:
   - Email: `teacher@school.com`
   - Password: (the password you set)
   - Should redirect to Teacher Dashboard

3. **Test Student Login**:
   - Email: `student@school.com`
   - Password: (the password you set)
   - Should redirect to Student Dashboard

4. **Test Parent Login**:
   - Email: `parent@school.com`
   - Password: (the password you set)
   - Should redirect to Parent Dashboard

### Step 3: Verify Role-Based Access

Try accessing dashboards directly:

- Student accessing teacher dashboard: Should redirect to student dashboard
- Parent accessing student dashboard: Should redirect to parent dashboard
- Etc.

This confirms security rules are working!

---

## Deployment

### Deploy to Firebase Hosting

1. Build/prepare your files (if needed)

2. Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

3. After deployment completes, you'll see:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id/overview
Hosting URL: https://your-project-id.web.app
```

4. Visit your Hosting URL to see your live application!

### Custom Domain (Optional)

1. Go to Firebase Console → **Hosting**
2. Click **Add custom domain**
3. Follow the instructions to verify domain ownership
4. Update DNS records as instructed
5. Wait for SSL certificate provisioning (can take up to 24 hours)

---

## Troubleshooting

### Issue: "Permission Denied" when accessing Firestore

**Solution**:
1. Verify security rules are deployed: `firebase deploy --only firestore:rules`
2. Check user has correct `role` field in Firestore
3. Ensure user is authenticated (check browser console)

### Issue: "Firebase config not found"

**Solution**:
1. Verify `firebase-config.js` has correct configuration
2. Check that Firebase SDK scripts are loading (check Network tab)
3. Ensure `.firebaserc` has correct project ID

### Issue: Login redirects to wrong dashboard

**Solution**:
1. Check user's `role` field in Firestore `users` collection
2. Verify it's exactly: `student`, `parent`, or `teacher` (lowercase)
3. Clear browser cache and try again

### Issue: Activities not loading

**Solution**:
1. Check browser console for errors
2. Verify Firebase is initialized correctly
3. Ensure Firestore database is created and accessible

### Issue: "Cannot read property 'toDate' of undefined"

**Solution**:
- This usually means a timestamp field is missing
- Check that all required fields exist in Firestore documents
- Ensure `createdAt` fields use server timestamps

### Issue: Offline persistence errors

**Solution**:
- Close all other tabs with the application open
- Clear browser cache
- Disable offline persistence in `firebase-config.js` if needed

---

## Next Steps

After successful setup:

1. ✅ Create more teacher accounts
2. ✅ Teachers create classes in their dashboard
3. ✅ Teachers create student accounts
4. ✅ Teachers create and assign activities
5. ✅ Students complete activities
6. ✅ Teachers grade submissions
7. ✅ Parents view progress

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## Support

If you encounter issues not covered in this guide:

1. Check the main [README.md](../README.md)
2. Review [database-schema.md](database-schema.md)
3. Check Firebase Console for error messages
4. Review browser console for JavaScript errors

---

**🎉 Congratulations! Your Grade R Learning Platform is now set up and ready to use!**


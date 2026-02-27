// Authentication Module

// Check if user is already logged in
auth.onAuthStateChanged(async (user) => {
  if (user && window.location.pathname.includes('login.html')) {
    // User is logged in, redirect to appropriate dashboard
    await redirectToDashboard(user);
  } else if (!user && !window.location.pathname.includes('login.html')) {
    // User is not logged in, redirect to login
    window.location.href = 'login.html';
  }
});

// Login form handler
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const loginBtn = document.getElementById('loginBtn');
    
    // Clear previous errors
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
    
    // Show loading
    loading.classList.add('show');
    loginBtn.disabled = true;
    
    try {
      // Sign in with Firebase Auth
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update last login timestamp
      await db.collection('users').doc(user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Redirect to appropriate dashboard
      await redirectToDashboard(user);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Hide loading
      loading.classList.remove('show');
      loginBtn.disabled = false;
      
      // Show error message
      let errorText = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorText = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorText = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorText = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorText = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorText = 'Too many failed attempts. Please try again later.';
          break;
      }
      
      errorMessage.textContent = errorText;
      errorMessage.classList.add('show');
    }
  });
}

// Redirect user to appropriate dashboard based on role
async function redirectToDashboard(user) {
  try {
    // Get user document from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('User profile not found');
    }
    
    const userData = userDoc.data();
    const role = userData.role;
    
    // Redirect based on role
    switch (role) {
      case 'student':
        window.location.href = 'student-dashboard.html';
        break;
      case 'parent':
        window.location.href = 'parent-dashboard.html';
        break;
      case 'teacher':
        window.location.href = 'teacher-dashboard.html';
        break;
      default:
        throw new Error('Invalid user role');
    }
  } catch (error) {
    console.error('Redirect error:', error);
    alert('Error loading dashboard. Please contact support.');
    await auth.signOut();
  }
}

// Logout function
async function logout() {
  try {
    await auth.signOut();
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Error logging out. Please try again.');
  }
}

// Get current user data
async function getCurrentUser() {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) return null;
    
    return {
      uid: user.uid,
      email: user.email,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Check if user has specific role
async function hasRole(requiredRole) {
  const userData = await getCurrentUser();
  return userData && userData.role === requiredRole;
}


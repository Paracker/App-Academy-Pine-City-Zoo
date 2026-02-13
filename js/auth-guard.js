// Auth Guard - Protects routes based on user roles

// Protect page with required role
async function protectPage(requiredRole) {
  return new Promise((resolve, reject) => {
    // Wait for auth state to be determined
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe(); // Unsubscribe after first call
      
      if (!user) {
        // No user logged in, redirect to login
        window.location.href = 'login.html';
        reject('Not authenticated');
        return;
      }
      
      try {
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
          console.error('User document not found');
          await auth.signOut();
          window.location.href = 'login.html';
          reject('User profile not found');
          return;
        }
        
        const userData = userDoc.data();
        
        // Check if user has required role
        if (userData.role !== requiredRole) {
          console.error('Unauthorized access attempt');
          // Redirect to correct dashboard
          redirectToCorrectDashboard(userData.role);
          reject('Unauthorized');
          return;
        }
        
        // User is authorized
        resolve({
          uid: user.uid,
          email: user.email,
          ...userData
        });
        
      } catch (error) {
        console.error('Error checking authorization:', error);
        window.location.href = 'login.html';
        reject(error);
      }
    });
  });
}

// Redirect to correct dashboard based on role
function redirectToCorrectDashboard(role) {
  switch (role) {
    case 'student':
      if (!window.location.pathname.includes('student-dashboard.html')) {
        window.location.href = 'student-dashboard.html';
      }
      break;
    case 'parent':
      if (!window.location.pathname.includes('parent-dashboard.html')) {
        window.location.href = 'parent-dashboard.html';
      }
      break;
    case 'teacher':
      if (!window.location.pathname.includes('teacher-dashboard.html')) {
        window.location.href = 'teacher-dashboard.html';
      }
      break;
    default:
      window.location.href = 'login.html';
  }
}

// Show loading screen while checking auth
function showAuthLoading() {
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: Arial, sans-serif;
    ">
      <div style="text-align: center; color: white;">
        <div style="
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        "></div>
        <p style="font-size: 18px;">Loading...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}


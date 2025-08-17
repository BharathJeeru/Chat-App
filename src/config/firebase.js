import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyAbvjrbNrHg6ylM2ByceeEeK36gOGPNK7c",
  authDomain: "chit-chat-3f16f.firebaseapp.com",
  projectId: "chit-chat-3f16f",
  storageBucket: "chit-chat-3f16f.firebasestorage.app",
  messagingSenderId: "411383692875",
  appId: "1:411383692875:web:ca583b627b58687db517ce",
  measurementId: "G-FSVXM1LD2G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

console.log("🔥 Firebase initialized successfully:", {
  app: !!app,
  auth: !!auth,
  db: !!db,
  analytics: !!analytics
});

const signup = async (username, email, password) => {
  try {
    console.log("🔄 Starting signup process...");
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("✅ User created successfully:", user.uid);
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email: email,
      name: "",
      avatar: "",
      bio: "Hey! I am using Chat app",
      lastSeen: Date.now()
    });
    
    console.log("✅ User document created in Firestore");
    
    // Create chat document for user
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    });
    
    console.log("✅ Chat document created in Firestore");
    toast.success("Account created successfully!");
    
  } catch (error) {
    console.error("❌ Signup error:", error);
    
    // Handle specific Firebase Auth errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        toast.error("This email is already registered. Please use a different email.");
        break;
      case 'auth/weak-password':
        toast.error("Password is too weak. Please use at least 6 characters.");
        break;
      case 'auth/invalid-email':
        toast.error("Invalid email address. Please check your email format.");
        break;
      case 'auth/operation-not-allowed':
        toast.error("Email/password authentication is not enabled. Please contact support.");
        break;
      case 'auth/network-request-failed':
        toast.error("Network error. Please check your internet connection.");
        break;
      default:
        toast.error(`Signup failed: ${error.message}`);
    }
  }
};

const login = async (email, password) => {
  try {
    console.log("🔄 Starting login process...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("✅ User logged in successfully:", user.uid);
    toast.success("Logged in successfully! 🎉");
    return user;
  } catch (error) {
    console.error("❌ Login error:", error);
    
    switch (error.code) {
      case 'auth/user-not-found':
        toast.error("No account found with this email.");
        break;
      case 'auth/wrong-password':
        toast.error("Incorrect password.");
        break;
      case 'auth/invalid-email':
        toast.error("Invalid email address.");
        break;
      case 'auth/too-many-requests':
        toast.error("Too many failed attempts. Please try again later.");
        break;
      default:
        toast.error(`Login failed: ${error.message}`);
    }
  }
};

const logout = async () => {
  try {
    console.log("🔄 Starting logout process...");
    await signOut(auth);
    console.log("✅ User logged out successfully");
    toast.success("Logged out successfully! 👋");
  } catch (error) {
    console.error("❌ Logout error:", error);
    toast.error(`Logout failed: ${error.message}`);
  }
};

// Test function to verify Firebase is working
const testFirebase = () => {
  console.log("🧪 Testing Firebase connection...");
  console.log("App:", app);
  console.log("Auth:", auth);
  console.log("DB:", db);
  console.log("Analytics:", analytics);
  
  if (auth && db) {
    console.log("✅ Firebase is ready!");
    return true;
  } else {
    console.log("❌ Firebase is not ready!");
    return false;
  }
};

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enetr your email");
    return null;
  }
  try {
      const userRef = collection(db,'users');
      const q = query(userRef,where("email","==",email));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
          await sendPasswordResetEmail(auth,email);
          toast.success("Reset Email Sent")
      }
      else{
        toast.error("Email doesn't exists")
      }
  } catch (error) {
      console.error(error);
      toast.error(error.message)
  }
}

export { signup, login, logout, auth, db, testFirebase, resetPass };
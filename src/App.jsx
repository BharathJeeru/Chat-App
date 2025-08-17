import React, { useEffect, useContext } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/login/login'
import Chat from './pages/chat/chat'
import ProfileUpdate from './pages/profile_update/profile_update'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import { AppContext } from './context/AppContext'


const App = () => {

  const navigate = useNavigate();
  const { loadUserData, userData } = useContext(AppContext)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('onAuthStateChanged: User', user);
      if (user) {
        console.log('Authenticated user detected, UID:', user.uid);
        loadUserData(user.uid);
        // If authenticated and currently on /login, push to /chat
        if (location.pathname === '/login' || location.pathname === '/') {
          console.log('Redirecting to /chat from', location.pathname);
          navigate('/chat', { replace: true })
        }
      } else {
        console.log('No authenticated user. Current path:', location.pathname);
        // If not authenticated, always go to login
        if (location.pathname !== '/login') {
          console.log('Redirecting to /login from', location.pathname);
          navigate('/login', { replace: true })
        }
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    // This useEffect will run when userData or location.pathname changes
    // and will handle navigation based on loaded user data
    if (userData) {
      if (userData.avatar && userData.name) {
        if (location.pathname === '/login' || location.pathname === '/profile' || location.pathname === '/') {
          console.log('App useEffect: User profile complete, navigating to /chat');
          navigate('/chat', { replace: true });
        }
      }
    } else if (userData === null) { // Only redirect to profile if userData is explicitly null (new user)
      if (location.pathname !== '/profile' && location.pathname !== '/login') {
        console.log('App useEffect: User data is null, navigating to /profile.');
        navigate('/profile', { replace: true });
      }
    }
  }, [userData, location.pathname])
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Navigate to="/login" replace />} />
        <Route path='/login' element={<Login />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/profile' element={<ProfileUpdate />} />
      </Routes>
    </>


  )
}

export default App

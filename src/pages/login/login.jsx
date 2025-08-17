import React, { useState } from 'react'
import './login.css'
import assets from '../../assets/assets'
import { signup, login, resetPass } from '../../config/firebase'

const Login = () => {

  const [currState, setCurrState] = useState("Sign Up")
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (currState === "Sign Up") {
      if (!username || !email || !password) {
        alert("Please fill in all fields");
        return;
      }
      await signup(username, email, password);
    } else {
      if (!email || !password) {
        alert("Please fill in all fields");
        return;
      }
      await login(email, password);
    }
  }
  const toggleState = () => {
    setCurrState(currState === "Sign Up" ? "Login" : "Sign Up")
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} alt='' className='logo' />
      <form onSubmit={onSubmitHandler} className='login-form'>
        <h2>{currState}</h2>

        {currState === "Sign Up" && (
          <input onChange={(e) => setUserName(e.target.value)} value={username} type='text' placeholder='Username' className='form-input' required />
        )}

        <input onChange={(e) => setEmail(e.target.value)} value={email} type='email' placeholder='Email address' className='form-input' required />
        <input onChange={(e) => setPassword(e.target.value)} value={password} type='password' placeholder='Password' className='form-input' required />

        <button type='submit'>
          {currState === "Sign Up" ? "Create Account" : "Login"}
        </button>

        <div className='login-term'>
          <input type='checkbox' />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className='login-forgot'>
          <p className='login-toggle'>
            {currState === "Sign Up" ? "Already have an account?" : "Don't have an account?"}{" "}
            <span onClick={toggleState} style={{ cursor: 'pointer', color: 'blue' }}>
              Click here 🫵
            </span>
          </p>
          {currState === "Login" ? <p className='login-toggle'>Forgot Password ? <span onClick={() => resetPass(email)}>reset here </span></p> : null}
        </div>
      </form>
    </div>
  )
}

export default Login

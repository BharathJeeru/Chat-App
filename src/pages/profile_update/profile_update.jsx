import React, { useState, useContext, useEffect } from 'react'
import './profile_update.css'
import assets from '../../assets/assets'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../config/firebase'
import { updateDoc, doc, getDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import upload from '../../lib/upload'
import { useNavigate } from 'react-router'
import { AppContext } from '../../context/AppContext'

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext)

  const profileUpdate = async (event) => {
    event.preventDefault();
    try {
      console.log('Profile Update: Initiating profile update.');
      let updatedAvatar = prevImage; // Start with the existing image

      if (profileImage) {
        // Only upload if a new image is selected
        toast.info("Uploading image...");
        console.log('Profile Update: Starting image upload...', profileImage.name);
        updatedAvatar = await upload(profileImage);
        console.log('Profile Update: Image uploaded. URL:', updatedAvatar);
        setPrevImage(updatedAvatar); // Update prevImage with the new URL
      } else if (!prevImage) {
        // If no new image and no previous image, show error
        toast.error("Please upload a profile picture.");
        console.log('Profile Update: No profile picture provided.');
        return;
      }

      const docRef = doc(db, 'users', uid);
      console.log('Profile Update: Updating user document in Firestore for UID:', uid);
      await updateDoc(docRef, {
        avatar: updatedAvatar,
        bio: bio,
        name: name
      });
      console.log('Profile Update: User document updated in Firestore.');

      const snap = await getDoc(docRef);
      setUserData(snap.data());
      toast.success("Profile updated successfully!");
      console.log('Profile Update: User data updated in context and navigating to /chat.');
      navigate('/chat');

    } catch (error) {
      console.error('Profile Update Error:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid)
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userDataFromDb = docSnap.data();
          if (userDataFromDb.name) {
            setName(userDataFromDb.name);
          }
          if (userDataFromDb.bio) {
            setBio(userDataFromDb.bio);
          }
          if (userDataFromDb.avatar) {
            setPrevImage(userDataFromDb.avatar);
            setImagePreview(userDataFromDb.avatar); // Set preview to saved image
          }
        }
      } else {
        navigate('/')
      }
    })
    return () => unsubscribe(); // Cleanup subscription
  }, [])

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3> Profile Details</h3>
          <label htmlFor="avatar">
            <input
              type='file'
              id='avatar'
              accept='.png,.jpg, .jpeg'
              hidden
              onChange={handleImageUpload}
            />
            {imagePreview ? (
              <img src={imagePreview} alt="Profile Preview" className="profile-preview-icon" />
            ) : prevImage ? (
              <img src={prevImage} alt="Previous Profile" className="profile-preview-icon" />
            ) : (
              <img src={assets.avatar_icon} alt='' className="profile-preview-icon" />
            )}
            Upload Profile Image
          </label>
          <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder="Your Name" required />
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder="Write Profile Bio" required></textarea>
          <button type='submit'> Save</button>
        </form>

        {/* This block is redundant now as image display is handled in the label */}
        {/* {imagePreview ? (
          <img
            src={imagePreview}
            alt="Profile Preview"
            className="profile-preview"
          />
        ) : (
          <img src={assets.logo_icon} alt='' className="chat-icon" />
        )} */}
      </div>
    </div>
  )
}

export default ProfileUpdate

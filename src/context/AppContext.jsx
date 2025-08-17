import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { db, auth } from "../config/firebase";

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVisible,setChatVisible] = useState(false);

    const loadUserData = async (uid) => {
        try {
            console.log('loadUserData: Loading data for UID:', uid);
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                setUserData(userData);
                console.log('loadUserData: User Data loaded:', userData);

                // Check if userData itself is valid before accessing its properties
                if (!userData || !userData.avatar || !userData.name) {
                    console.log('loadUserData: User data is incomplete or empty. Navigating to /profile to complete it.');
                    setUserData(null); // Ensure userData is null if incomplete
                    // App.jsx will handle navigation to /profile
                }

            } else {
                console.log('loadUserData: User document does not exist for UID:', uid, '. Setting userData to null.');
                setUserData(null); // Ensure userData is null if document doesn't exist
                // App.jsx will handle navigation to /profile
            }
            await updateDoc(userRef, {
                lastSeen: Date.now()
            })
            setInterval(async () => {
                if (auth.currentUser) {
                    await updateDoc(userRef, {
                        lastSeen: Date.now()
                    })
                }
            }, 60000);
        } catch (error) {
            console.error('loadUserData Error:', error);

        }
    }

    useEffect(() => {
        console.log('AppContext useEffect: userData changed:', userData);
        if (userData) {
            const chatRef = doc(db, 'chats', userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                console.log('onSnapshot: Chat data received:', res.data());
                const chatItems = res.data().chatsData;
                const tempData = [];
                for (const item of chatItems) {
                    const userRef = doc(db, 'users', item.rId);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data();
                    tempData.push({ ...item, userData })
                }
                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt))
                console.log('onSnapshot: Processed chat data:', tempData);
            })
            return () => {
                unSub();
            }
        }
    }, [userData])

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messagesId, setMessagesId,
        chatUser, setChatUser,
        messages, setMessages,
        chatVisible,setChatVisible,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider
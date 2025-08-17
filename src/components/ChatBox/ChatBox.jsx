import React, { useContext, useState, useEffect } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { arrayUnion, getDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { AppContext } from '../../context/AppContext';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';

const ChatBox = () => {

  const { userData, chatUser, messagesId, messages, setMessages,chatVisible, setChatVisible } = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createAt: new Date()
          })
        })

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updateAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;

            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData
            })

          }
        })

      }
    } catch (error) {
      toast.error(error.message)
    }
    setInput("")
  }

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createAt: new Date()
          })
        })

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
            userChatData.chatsData[chatIndex].lastMessage = "image";
            userChatData.chatsData[chatIndex].updateAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;

            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData
            })

          }
        })

      }


    } catch (error) {
      toast.error(error.message)
    }
  }


  const convertTimeStamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + minute + "PM";
    }
    else {
      return hour + ":" + minute + "AM";
    }
  }

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        setMessages(res.data().messages.reverse())
      })
      return () => {
        unSub();
      }

    }
  }, [messagesId])

  return chatUser ? (
    <div className={`chat-box ${chatVisible? "" : ""}`}>
      <div className='chat-user'>
        <img src={chatUser.userData.avatar} alt="profile" />
        <p>{chatUser.userData.name} {Date.now() - chatUser.userData.lastSeen <= 70000 ? <img className='dot' src={assets.green_dot} alt="dot" /> : null}</p>
        <img src={assets.help_icon} className='help' alt="help" />
        <img  onClick={()=>setChatVisible(false)}src={assets.arrow_icon} className='arrow' alt="" />
      </div>

      <div className="chat-msg">

        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg["image"]
              ? <img className='msg-img' src={msg.image} alt="" />
              : <p className="msg"> {msg.text}</p>
            }
            <div>
              <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
              <p>{convertTimeStamp(msg.createAt)}</p>
            </div>
          </div>
        ))}

      </div>

      <div className="chat-input">
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Type a message' />
        <input onChange={sendImage} type='file' id='image' accept='image/png, image/jpeg, image/jpg' hidden />
        <label htmlFor='image'>
          <img src={assets.gallery_icon} alt="gallery" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="send" />
      </div>
    </div>
  )
    : <div className={`chat-welcome ${chatVisible? "" : ""}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat Anytime Anywhere</p>
    </div>
}

export default ChatBox
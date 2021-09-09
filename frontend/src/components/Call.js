import React, {useRef, useEffect} from 'react'
import { io } from "socket.io-client"

// now we are inside a call

const Call = (props) => { 
    const userVideo = useRef()
    const userStream = useRef()
    const peerRef = useRef()
    const socketRef = useRef()
    const otherUser = useRef()
    const partnerVideo = useRef()

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({audio:true, video:true}).then(stream => {
            userVideo.current.srcObject = stream
            userStream.current = stream

            // pass the uuid from the url to our signaling server using react router dom
            socketRef.current = io.connect("/")
            socketRef.current.emit("join room", props)

        }).catch(e => console.log(e));


        
        
    }, [])


    return (
        <div>
            <video autoPlay ref={userVideo}></video>
            <video autoPlay ref={partnerVideo}></video>
          
            
        </div>
    )
}



export default Call

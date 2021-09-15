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
        navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(stream => {
            userVideo.current.srcObject = stream;
            userStream.current = stream;

            socketRef.current = io("http://localhost:12001")
            socketRef.current.emit("join room", props.match.params.conference_id);

            socketRef.current.on("other", userID => {
                callUser(userID);
                otherUser.current = userID;
            });

            socketRef.current.on("user joined", userID => {
                otherUser.current = userID;
            });

            socketRef.current.on("offer", handleRecieveCall);

            socketRef.current.on("answer", handleAnswer);

            socketRef.current.on("ice-candidate", handleNewIceCandidate);
        });

    }, []);


    const callUser = (user_id) => {
        // set the peer ref to pper ref object
        peerRef.current = createPeer(user_id)

        // add each user track to each peer tracks
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));

    }

    const createPeer = (user_id) => {
        // create a peer connection object to represent connect between local device and remote peer
        const peer = new RTCPeerConnection({
            iceServers : [
                {
                    urls: "stun:stun.stunprotocol.org"
                },
            ]
        });

        peer.onicecandidate = handleIceCandidate;
        
        // handles whenever we recieve the remote peer stream 
        // handle trackEvent will grab the remote peers stream and display it on our screen
        peer.ontrack = handleTrackEvent
        
        // defining the begining of the negotation process
        // create offer -> send to user -> other user creates offer -> sends back
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(user_id)

        return peer
    }

    // recieving offer -> set as remote description
    // creating offer -> set as local description

    const handleNegotiationNeededEvent = (user_id) => {
        peerRef.current.createOffer().then(offer => {
            return peerRef.current.setLocalDescription(offer)
        }).then(()=> {
            const payload = {
                name : socketRef.current.id,
                target : user_id,
                sdp : peerRef.current.setLocalDescription,
            }

            // send new offer to the signalling server
            socketRef.current.emit("offer", payload)
        }).catch(e => console.log(e))
    }

    const handleRecieveCall = (payload) => {
        // create new peer object with no user id since we are not recieving the call
        peerRef.current = createPeer()

        // create session description with the incoming payload
        const description = new RTCSessionDescription(payload.sdp)

        // set remote description
        peerRef.current.setRemoteDescription(description).then(() => {
            userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current))
        }).then(() => {
            return peerRef.current.createAnswer()
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer)
        }).then(() => {
            const p = {
                name : socketRef.current.id, 
                target : payload.sdp,
                sdp : peerRef.current.localDescription
            }

            socketRef.current.emit("answer", p)
        })
    }

    const handleAnswer = (payload) => {
        // accepts the answer payload and ccreates a session description object and sets it as the remote description
        // this completes the handshake
        const description = new RTCSessionDescription(payload.sdp);
        peerRef.current.setRemoteDescription(description).catch(e => console.log(e))
    }

    const handleIceCandidate = (e) => {
        if(e.candidate){
            const payload = { 
                target : otherUser.current, 
                candidate : e.candidate
            }

            socketRef.current.emit("ice-candidate", payload)
        }
    }

    // handling neew ice candidate message
    const handleNewIceCandidate = (payload) => {
        // create new Ice candidate object
        const candidate  = new RTCIceCandidate(payload)

        // add ice candidate to the peer and 
        peerRef.current.addIceCandidate(candidate).catch(e => console.log(e)) 
    }
    
    // once we have made a peer to peer connection this add the other users video to the screen
    const handleTrackEvent = (e) => {
        partnerVideo.current.srcObject = e.streams[0]
    }


    return (
        <div>
            <video autoPlay ref={userVideo}></video>
            <video autoPlay ref={partnerVideo}></video>
        </div>
    )
}



export default Call

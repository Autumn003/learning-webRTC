// import { useEffect, useState } from "react";

// export const Sender = () => {

//   const [socket, setSocket] = useState<WebSocket | null>(null)

//   useEffect(()=> {
//     const socket = new WebSocket("ws://localhost:8080");
//     socket.onopen = () => {
//       socket.send(JSON.stringify({type: "sender"}));
//     }
//     setSocket(socket);
//   }, [])

//   const initiateConn = async() => {
//     if(!socket) return;
//     const pc = new RTCPeerConnection();

//     pc.onnegotiationneeded = async () => {
//       const offer = await pc.createOffer(); //sdp
//       await pc.setLocalDescription(offer);
//       socket?.send(JSON.stringify({type: "createOffer", sdp: pc.localDescription}));
//     }

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket?.send(JSON.stringify({type: "iceCandidate", candidate: event.candidate}));
//       }
//     }

//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === "createAnswer") {
//         pc.setRemoteDescription(data.sdp);
//       }
//       else if(data.type === "iceCandidate"){
//         // pc.addIceCandidate(new RTCIceCandidate(data.candidate));
//         pc.addIceCandidate(data.iceCandidate);
//       }
//     }

//     const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
//     // const stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: false});
//     pc.addTrack(stream.getVideoTracks()[0]);
//     const video = document.createElement("video");
//     document.body.appendChild(video);
//     video.srcObject = stream;
//     video.play();

//   }

  
//   return (
//     <>
//     Sender
//     <button
//     onClick={initiateConn}
//     >Send data</button>
//     </>
//   )
// }








import { useEffect, useState } from "react"

export const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPC] = useState<RTCPeerConnection | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'sender'
            }));
        }
    }, []);

    const initiateConn = async () => {

        if (!socket) {
            alert("Socket not found");
            return;
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createAnswer') {
                await pc.setRemoteDescription(message.sdp);
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        }

        const pc = new RTCPeerConnection();
        setPC(pc);
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(JSON.stringify({
                    type: 'iceCandidate',
                    candidate: event.candidate
                }));
            }
        }

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({
                type: 'createOffer',
                sdp: pc.localDescription
            }));
        }
            
        getCameraStreamAndSend(pc);
    }

    const getCameraStreamAndSend = async(pc: RTCPeerConnection) => {
           const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
          // const stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: false});
          pc.addTrack(stream.getVideoTracks()[0]);
          const video = document.createElement("video");
          document.body.appendChild(video);
          video.srcObject = stream;
          video.play();
    }



    return <div>
        Sender
        <button onClick={initiateConn}> Send data </button>
    </div>
}

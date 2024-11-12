import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port: 8080});

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("connection", function connection(ws){
    ws.on("error", console.error)

    ws.on("message", function message(data:any){
        const message = JSON.parse(data);
        if(message.type === "sender"){
            senderSocket = ws;
            console.log("Sender connected");
        }
        else if(message.type === "receiver"){
            receiverSocket = ws;
            console.log("Receiver connected");
        }
        else if(message.type === "createOffer"){
            if(ws !== senderSocket) return;
            receiverSocket?.send(JSON.stringify({type: "createOffer", sdp:message.sdp}));
            console.log("Offer Received");
        }
        else if(message.type === "createAnswer"){
            if(ws !== receiverSocket) return;
            senderSocket?.send(JSON.stringify({type: "createAnswer", sdp:message.sdp}));
            console.log("Answer Received");
        }
        else if(message.type === "iceCandidate"){
            if( ws === senderSocket){
                receiverSocket?.send(JSON.stringify({type: "iceCandidate", candidate:message.candidate}));
            }
            else if(ws === receiverSocket){
                senderSocket?.send(JSON.stringify({type: "iceCandidate", candidate:message.candidate}));
            }
        }
    })
})
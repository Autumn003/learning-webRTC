import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port: 8080});

let senderSocket: null | WebSocket = null;
let reciverSocket: null | WebSocket = null;

wss.on("connection", function connection(ws){
    ws.on("error", console.error)

    ws.on("message", function message(data:any){
        const message = JSON.parse(data);
        if(message.type === "sender"){
            senderSocket = ws;
        }
        else if(message.type === "receiver"){
            reciverSocket = ws;
        }
        else if(message.type === "createOffer"){
            if(ws !== senderSocket) return;
            reciverSocket?.send(JSON.stringify({type: "createOffer", sdp:message.sdp}));
        }
        else if(message.type === "createAnswer"){
            if(ws !== reciverSocket) return;
            senderSocket?.send(JSON.stringify({type: "createAnswer", sdp:message.sdp}));
        }
        else if(message.type === "iceCandidate"){
            if( ws === senderSocket){
                reciverSocket?.send(JSON.stringify({type: "iceCandidate", candidate:message.candidate}));
            }
            else if(ws === reciverSocket){
                senderSocket?.send(JSON.stringify({type: "iceCandidate", candidate:message.candidate}));
            }
        }
    })
})
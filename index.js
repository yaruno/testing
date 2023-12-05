const express = require('express');
const http = require('http');
const { nonstandard, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('@roamhq/wrtc');
const cors = require('cors');
const {WhipEndpoint} = require('@eyevinn/whip-endpoint')

const { RTCVideoSink, RTCAudioSink } = nonstandard

const app = express();
app.use(cors())
//app.use(express.json())
//app.use(express.urlencoded({ extended: true, type: 'application/sdp'  }))
//app.use(express.raw({ type: 'application/sdp' }))
app.use(express.text({ type: 'application/sdp' }))

const server = http.createServer(app);
const port = 3004;

async function beforeAnswer() { }


// Set up WebSocket for signaling
/*const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle WebRTC signaling messages
    socket.on('message', (message) => {
        // Broadcast the message to all connected clients (including sender)
        io.emit('message', message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});*/

// Serve HTML page with WebRTC setup
app.get('/rtc/v1/whip', (req, res) => {
    res.status(200).send('OK');
    //res.sendFile(__dirname + '/index.html');
});

app.post('/', (req,res) => {
    res.status(200).send('OK');
})

app.get('/resource/0', (req, res) => {
    res.status(200).send('OK');
    //res.sendFile(__dirname + '/index.html');
});

app.post('/rtc/v1/whip', async (req, res) => {

    let answer
    
    try {
        const receivedOffer = req.body // validate offer
        const offerDescription = new RTCSessionDescription({
            type:'offer',
            sdp: receivedOffer
        })
        const peerConnection = new RTCPeerConnection({
            sdpSemantics: "unified-plan",
            iceServers:[{"urls":"stun:stun.l.google.com:19302"}]
        })
        //peerConnection.addTrack(new RTCVideoSink)
        //peerConnection.addTrack(new RTCAudioSink)

        await beforeAnswer()

        const description = await peerConnection.setRemoteDescription(offerDescription)
        answer = await peerConnection.createAnswer()
        //missing codec support ?
        await peerConnection.setLocalDescription(answer);
        //const sdpAnswer = peerConnection.localDescription.sdp;

        peerConnection.ondatachannel = (event) => {
            const dataChannel = event.channel;
    
            // Event handler for receiving data from the remote peer
            dataChannel.onmessage = (event) => {
                console.log('Received data from the remote peer:', event.data);
            };
    
            // Event handler for the data channel's open state
            dataChannel.onopen = () => {
                console.log('Data channel opened!');
                // Now you can start exchanging data with the remote peer
            };
    
            // Event handler for errors
            dataChannel.onerror = (error) => {
                console.error('Data channel error:', error);
            };
        };
    }
    catch(error) {
        console.log(error)
    }
 
    console.log('received: ', answer.sdp)
    res.status(201)
        .set('Content-Type', 'application/sdp')
        .set('Location', 'http://localhost:3004')
        .set('ETag', "foobar")
        .send(answer.sdp) // find out what we should be sending back as a response to sdp request
        // need legit sdp response for creating a peer connection
        // open a peer connection, get a description in text ?
    //res.json({ message: 'POST request received successfully' });
    //res.status(201).send('OK');
    //res.sendFile(__dirname + '/index.html');
});

// Start the server
server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});

// Initialize NodeWebRTC
// const webrtc = new NodeWebRTC({ enableVideo: true });

/*io.on('connection', (socket) => {
    const pc = RTCPeerConnection();

    // Handle ICE candidate events
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            // Send ICE candidate to the other peer
            socket.emit('message', { type: 'candidate', candidate: event.candidate });
        }
    };

    // Handle data channel events (optional)
    pc.ondatachannel = (event) => {
        const dataChannel = event.channel;
        // Handle data channel events
    };

    // Handle offer and answer messages
    socket.on('message', (message) => {
        if (message.type === 'offer' || message.type === 'answer') {
            pc.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'candidate') {
            pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
    });

    // Create and send offer to the other peer
    pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
            socket.emit('message', { type: 'offer', offer: pc.localDescription });
        })
        .catch((error) => {
            console.error('Error creating offer:', error);
        });
});*/

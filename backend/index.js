const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors: {origin : "*"}});

const rooms = {}

io.on('connection', socket => {
    console.log("on connection")
    socket.on("join room", roomID => {
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if (otherUser) {
            socket.emit("other", otherUser);
            socket.to(otherUser).emit("user joined", socket.id);
        }
    });

    socket.on("offer", payload => {
        for(let key of Object.keys(payload)){
            console.log("key : " + key  + " : " + payload[key])
        }
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
        console.log("Answer : " + payload)
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        console.log("Incoming : " + incoming)
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });


});


server.listen(12001, () => {
  console.log("server listening on port 12001")
});
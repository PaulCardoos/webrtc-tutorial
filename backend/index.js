const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const socket = require("socket.io")
const io = socket(server)

const conference_room = {};

io.on("connection", socket => {
    socket.on("join room", conference_room_id => {
        if(conference_room[conference_room_id]){
            conference_room[conference_room_id].push(socket.id)
        } else {
            conference_room[conference_room_id] = [socket.id]
        }

        const other = conference_room[conference_room_id].find(id => id !== socket.id)
        if(other){
            socket.emit("other", other)
            socket.to(other).emit("user joined", socket.id)
        }
    });

    //payload includes who am i and the sdp

    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload)
    });

    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload)
    });

    socket.on("ice-candidate", incoming => {
        io.to(payload.target).emit("ice-candidate", incoming.candidate)
    });

});

app.listen(6799, () => {
    console.log("Server listening on port 6799")
})
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = {}; // To keep track of rooms and their clients

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', (roomCode) => {
        if (roomCode.length === 8) {
            if (!rooms[roomCode]) {
                rooms[roomCode] = [];
            }
            if (rooms[roomCode].length < 8) {
                rooms[roomCode].push(socket.id);
                socket.join(roomCode);
                socket.emit('roomJoined', roomCode);
                console.log(`User ${socket.id} joined room ${roomCode}`);
            } else {
                socket.emit('roomFull', roomCode);
            }
        } else {
            socket.emit('invalidCode');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove the socket from any room it was in
        for (const roomCode in rooms) {
            rooms[roomCode] = rooms[roomCode].filter(id => id !== socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

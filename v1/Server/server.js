
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);



io.on('connection', function(socket){
    console.log("a user connected");
    const users = io.clients();
    socket.on()
    console.log(users)
    
    socket.emit('Test event', 'here is AND AGAIN');
});

server.listen(3000, () => {
    console.log("socket.io server is listening on port 3000");
})

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const clients = [];
const clientsNickname = [];


io.on('connection', function(socket){
    console.log("a user connected");
    //adding clients socket to clients array
    clients.push(socket);
    //allClients Id
    var allConnectedClients = Object.keys(io.sockets.connected);
    ///////////////


    //set nickname to user that just connected
    socket.on('nickname', function(nickname) {
        socket.nickname = nickname;
        clientsNickname.push(socket.nickname);
        console.log(clientsNickname);
    })









    
});

io.emit('Test', 'hi')



server.listen(3000, () => {
    console.log("socket.io server is listening on port 3000");
})


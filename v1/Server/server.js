
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const clients = [];


io.on('connect', function(socket){
    console.log("a user connected");
    var newUserObject = {
        id: socket.id,
        nickname: null
    }
    //adding clients socket to clients array

    //allClients Id
    var allConnectedClients = Object.keys(io.sockets.connected);
    ///////////////
    console.log(socket.id)

    //set nickname to user that just connected
    socket.on('nickname', function(nickname) {
        socket.nickname = nickname;
        newUserObject.nickname = nickname
        clients.push(newUserObject);
    });

    socket.on('disconnect', function(){
        removeClientThatDisconnected(socket.id)
    }).emit('userslist', clients)

    io.emit('userslist', clients)
    

    var removeClientThatDisconnected = function(id){
        clients.forEach(function(client){
            if(client.id === id){
                clients.splice(client, 1)
                console.log(clients.length)
            }
        })
    }


     

    
});








server.listen(3000, () => {
    console.log("socket.io server is listening on port 3000");
})


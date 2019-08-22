
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3000, () => {
    console.log("socket.io server is listening on port 3000");
})


const clients = [];


io.on('connect', function (socket) {
    var newUserObject = {
        id: socket.id,
        nickname: null
    }
    var allConnectedClients = Object.keys(io.sockets.connected);
    console.log("new user has connected, their Id is: " + socket.id + " #Currently there are " + allConnectedClients.length + " users connected.")

    socket.on('nickname', function (nickname) {
        socket.nickname = nickname;
        newUserObject.nickname = nickname
        clients.push(newUserObject);
        io.emit('userslistonConnection', clients)
    });

    socket.on('disconnect', function () {
        removeClientThatDisconnected(socket.id)
        io.emit('userslistonDisconnection', clients)
    });


 





});


//TOOLS         

var removeClientThatDisconnected = function (id) {
    clients.forEach(function (client) {
        if (client.id === id) {
            clients.splice(client, 1)
        }
    });
}











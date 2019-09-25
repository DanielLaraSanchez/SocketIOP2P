const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(3000, () => {
  console.log("socket.io server is listening on port 3000");
});
let Peermoderator = require('./moderator.js');
let Moderator = new Peermoderator();
let BattleConnection = require('./battleconnection.js');
let Peer = require('./peer.js');
let broadcaster;
const clients = [];
const clientsReadyToBattle = [];

io.sockets.on('connection', function (socket) {
    let peer = new Peer();
    peer.socketid = socket.id;
    clients.push(peer);
    console.log('Currently there are ' + clients.length + ' connected', clients);
  
    socket.on('readyToBattle', function (socketid) {
    Moderator.objectModifier(clients,socketid, )    
      socket.emit('responsability', responsability)
    })
  
    socket.on('clientIsWaiting', function (socketid){
      console.log("funciona clientis waiting linea 77", socketid)
    })
  
    socket.on('broadcaster', function () {
      broadcaster = socket.id;
      socket.broadcast.emit('broadcaster');
    });
  
    socket.on('watcher', function () {
      socket.to(broadcaster).emit('watcher', socket.id);
    });
    socket.on('offer', function (id /* of the watcher */, message) {
      if(id != socket.id){
        socket.to(id).emit('offer', socket.id /* of the broadcaster */, message);
  
      }
    });
    socket.on('answer', function (id /* of the broadcaster */, message) {
      socket.to(id).emit('answer', socket.id /* of the watcher */, message);
  
    });
    socket.on('candidate', function (id, message) {
      if(id != socket.id){
        socket.to(id).emit('candidate', socket.id, message);
  
      }
    });
    socket.on('disconnect', function (message) {
      broadcaster && socket.to(broadcaster).emit('bye', socket.id);
      clients.forEach(function (client) {
        if (client === socket.id) {
          clients.splice(clients.indexOf(socket.id), 1)
        }
      })
      clientsReadyToBattle.forEach(function(pairOfPeers){
        if(pairOfPeers.peer1 === socket.id){
          pairOfPeers.peer1 = null
        }
        if(pairOfPeers.peer2 === socket.id){
          pairOfPeers.peer2 = null
        }
        if(pairOfPeers.peer1 === null && pairOfPeers.peer2 === null){
          clientsReadyToBattle.splice(clientsReadyToBattle.indexOf(pairOfPeers))
        }
      })
      console.log("client" + socket.id, "has disconnected, currently there are", clients.length, "connected")
    });
  
    socket.on('bye', function (id) {
      broadcaster && socket.to(broadcaster).emit('bye', id)
    })
  });
  
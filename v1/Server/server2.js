const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
let Peermoderator = require('./moderator.js');
let BattleConnection = require('./battleconnection.js');
let Peer = require('./peer.js');




let Moderator = new Peermoderator();
let broadcaster;
const clients = [];
const activeConnections = [];

io.sockets.on('connection', function (socket) {
    let peer = new Peer();
    peer.socketid = socket.id;
    clients.push(peer);
    console.log('Currently there are ' + clients.length + ' connected', clients);
  
    socket.on('readyToBattle', function (socketid) {
    if(activeConnections.length === 0){
      let conn = new BattleConnection();
      conn.reciever = socketid;
      activeConnections.push(conn)
    }else{
      let isPeerAlreadyInConnection = Moderator.checkIfClientIsAlreadyInConnection(activeConnections, socketid);
      let connWaiting = Moderator.getConnectionWaitingAndInsertPeer(activeConnections, socketid)
      if(!isPeerAlreadyInConnection && !connWaiting){
      let conn = new BattleConnection();
      conn.reciever = socketid;
      activeConnections.push(conn)
      }else if(!isPeerAlreadyInConnection && connWaiting){
        Moderator.insertPeerInConnection(activeConnections, connWaiting, socketid)
      }
    }
      socket.emit('responsability', peer) 
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
      Moderator.deletePeerOnDisconnection(clients, socket.id);
      Moderator.deletePeerFromConnection(activeConnections, socket.id);
      Moderator.deleteConnectionWhenEmpty(activeConnections);
      console.log(activeConnections, "81")
      console.log("client" + socket.id, "has disconnected, currently there are", clients.length, "connected")
    });
  
    socket.on('bye', function (id) {
      broadcaster && socket.to(broadcaster).emit('bye', id)
    })
  });
  


  server.listen(3000, () => {
    console.log("socket.io server is listening on port 3000");
  });
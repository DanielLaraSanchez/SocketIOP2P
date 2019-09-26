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
let connectionsPairedUp = [];



io.sockets.on('connection', function (socket) {

    let peer = new Peer();
    peer.socketid = socket.id;
    clients.push(peer);
    console.log(activeConnections, connectionsPairedUp, "24 on connection")
    // console.log('Currently there are ' + clients.length + ' connected', clients);
  
    socket.on('readyToBattle', function (socketid) {
      createConnections(socket.id);

      let thisconnectionsPairedUp = Moderator.getConnectionsPairedUp(activeConnections); 
      let peerHasAPair = Moderator.checkIfPeerIsInSpecificConnection(thisconnectionsPairedUp, socketid)
      console.log(thisconnectionsPairedUp, connectionsPairedUp, "before")

      if(thisconnectionsPairedUp.length > 0 && peerHasAPair){
        thisconnectionsPairedUp.forEach((conn)=> {
          if(conn.reciever === socketid || conn.sender === socketid){
            socket.to(conn.reciever).emit('onOffer', conn.sender);
          socket.emit('onSendOffer', conn.reciever);
          connectionsPairedUp = thisconnectionsPairedUp;

          thisconnectionsPairedUp.splice(thisconnectionsPairedUp.indexOf(conn), 1);
          connectionsPairedUp = Moderator.getConnectionsPairedUp(activeConnections);

          connectionsPairedUp = Moderator.getConnectionsPairedUp(activeConnections);
          }
        });
        console.log(connectionsPairedUp, "after")

      }
    
    });
  
    socket.on('clientIsWaiting', function (socketid){
    });
  
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
      let partnerId = Moderator.findPartner(connectionsPairedUp, socket.id);
      broadcaster && socket.to(partnerId).emit('bye', socket.id);
      Moderator.deletePeerOnDisconnection(clients, socket.id);
      Moderator.deletePeerFromConnection(activeConnections, socket.id);
      Moderator.deleteConnectionWhenEmpty(activeConnections);
      Moderator.pairUpAfterDisconnection(activeConnections);
      console.log(connectionsPairedUp,"connections pairedup on disconnect")
      // console.log("client" + socket.id, "has disconnected, currently there are", clients.length, "connected")
    });
  
    socket.on('bye', function (id) {
      broadcaster && socket.to(broadcaster).emit('bye', id)
    })



  });







///tools
  function createConnections(socketid){
    let connectionId;
    if(activeConnections.length === 0){
      let conn = new BattleConnection();
      conn.reciever = socketid;
      activeConnections.push(conn)
      connectionId = conn.id;
    }else{
      let isPeerAlreadyInConnection = Moderator.checkIfClientIsAlreadyInConnection(activeConnections, socketid);
      let connWaiting = Moderator.getConnectionWaiting(activeConnections)
      if(!isPeerAlreadyInConnection && !connWaiting){
      let conn = new BattleConnection();
      conn.reciever = socketid;
      activeConnections.push(conn);
      connectionId = conn.id;
      }else if(!isPeerAlreadyInConnection && connWaiting){
        Moderator.insertPeerInConnection(activeConnections, connWaiting, socketid)
        connectionId = connWaiting;
      }
    }
    return connectionId;
  }
  


  server.listen(3000, () => {
    console.log("socket.io server is listening on port 3000");
  });
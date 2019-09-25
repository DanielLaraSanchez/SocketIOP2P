const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(3000, () => {
  console.log("socket.io server is listening on port 3000");
});

let broadcaster;
const clients = [];
const clientsReadyToBattle = [];


(function() {
  function createRooms(socketid) {
    if (clients.length <= 1) {
      clientsReadyToBattle.push({ peer1: socketid, peer2: null, peerWaiting: false })
    } else {
      createPairsObject(socketid)
    }
  }
  
  function createPairsObject(newSocketId) {
    const peerWaiting = clientsReadyToBattle.filter(function (pairOfClients) {
      return pairOfClients.peer2 === null || pairOfClients.peer1 === null;
    });
    if (peerWaiting.length === 0) {
      clientsReadyToBattle.push({ peer1: newSocketId, peer2: null, peerWaiting: false })
    } else {
      peerWaiting[0].peer2 = newSocketId;  //why is this working? peerWaiting is a new array. but it is modifying clientsReadyToBattle.
    }
  }
  
  function findClientWaitingFromDifferentPair(){
  let lonelyWaitingPeer = clientsReadyToBattle.filter(function(pairOfPeers){
    return pairOfPeers.peerWaiting === true;
  });
  return lonelyWaitingPeer;
  }
  
  function getResponsability(socketid) {
    let responsability;
    let waitingPeer = findClientWaitingFromDifferentPair()
    clientsReadyToBattle.forEach(function (pairOfPeers) {
      let resp;
      if((pairOfPeers.peer1 === socketid || pairOfPeers.peer2 === socketid) && (pairOfPeers.peerWaiting === false)){
        
      }
        if ((pairOfPeers.peerWaiting === false) && (pairOfPeers.peer1 === socketid || pairOfPeers.peer2 === socketid)) {
        resp = 'activateOnOffer';
      }
      else if ((pairOfPeers.peer2 === socketid || pairOfPeers.peer1 === socketid ) && (pairOfPeers.peerWaiting === true)) {//why does this not work with just and if statement. why do i have to go else if. what is the real difference between them two
        resp = 'activateSendOffer';
      }  else if ((pairOfPeers.peer2 === socketid || pairOfPeers.peer1 === socketid) && (pairOfPeers.peer1 === null || pairOfPeers.peer2 === null ) && pairOfPeers.peerWaiting === false){
        resp = 'activateOnOffer';
      }else{
        resp = false;
        console.log("why? linea47", pairOfPeers)
  
        }
        console.log("funciona linea49", clientsReadyToBattle)
      responsability = resp
    });
    return responsability
  }
  
  function setPeerWaitingTrue(socketid){
    clientsReadyToBattle.forEach(function(pairObject){
      if(pairObject.peer1 === socketid || pairObject.peer2 === socketid){
        pairObject.peerWaiting = true;
      }
    })
    console.log(clientsReadyToBattle, "from setpeerwiatingtrue linea61")
  }
  
  io.sockets.on('connection', function (socket) {
    clients.push(socket.id)
    createRooms(socket.id)
    console.log(clientsReadyToBattle, "clientsReadyToBattle array linea67")
    console.log('Currently there are ' + clients.length + ' connected', clients);
  
    socket.on('readyToBattle', function (socketid) {
      const responsability = getResponsability(socket.id)
      socket.emit('responsability', responsability)
      // console.log(responsability, "clientsReadyToBattle",clientsReadyToBattle[0].peer2, socket.id, clientsReadyToBattle)
    })
  
    socket.on('clientIsWaiting', function (socketid){
      console.log("funciona clientis waiting linea 77", socketid)
      setPeerWaitingTrue(socketid)
    })
  
    socket.on('broadcaster', function () {
      broadcaster = socket.id;
      socket.broadcast.emit('broadcaster');
    });
  
    socket.on('watcher', function () {
      // broadcaster && socket.to(broadcaster).emit('watcher', socket.id);
      socket.to(broadcaster).emit('watcher', socket.id);
    });
    socket.on('offer', function (id /* of the watcher */, message) {
      // console.log(id, "id offer")
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
      console.log(clientsReadyToBattle, "clientsReadyToBattle on disconnect")
      console.log("client" + socket.id, "has disconnected, currently there are", clients.length, "connected")
    });
  
    socket.on('bye', function (id) {
      broadcaster && socket.to(broadcaster).emit('bye', id)
    })
  });
  
})();




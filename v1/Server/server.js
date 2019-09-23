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


function createRooms(socketid) {
  if (clients.length <= 1) {
    clientsReadyToBattle.push({ peer1: socketid, peer2: null, peerWaiting: false })
  } else {
    createPairsObject(socketid)
  }
}

function createPairsObject(newSocketId) {
  const peerWaiting = clientsReadyToBattle.filter(function (client) {
    return client.peer2 === null || client.peer1 === null;
  });
  if (peerWaiting.length === 0) {
    clientsReadyToBattle.push({ peer1: newSocketId, peer2: null, peerWaiting: false })
  } else {
    peerWaiting[0].peer2 = newSocketId;  //why is this working? peerWaiting is a new array. but it is modifying clientsReadyToBattle.
  }
}

function getResponsability(socketid) {
  let responsability;
  clientsReadyToBattle.forEach(function (pairOfPeers) {
    let resp;
    // if (pairOfPeers.peer1 === socketid && pairOfPeers.peer2 != null) {
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

// io.on('connect', function (socket) {
//     var newUserObject = {
//         id: socket.id,
//         nickname: null
//     }
//     addNewUsersToClientsArray(newUserObject)
//     var allConnectedClients = Object.keys(io.sockets.connected);
//     console.log("new user has connected, their Id is: " + socket.id + " #Currently there are " + clients.length + " users connected.")
//     socket.on('nickname', function (nickname) {
//         socket.nickname = nickname;
//         newUserObject.nickname = nickname
//         io.emit('userslistonConnection', clients)
//     });
//     socket.on('disconnect', function () {
//         removeClientThatDisconnected(socket.id)
//         console.log("new user has disconnected, their Id is: " + socket.id + " #Currently there are " + clients.length + " users connected.", 36)
//         io.emit('userslistonDisconnection', clients)
//     });

//     socket.on('offer', function(id, socket){
//         let remoteSocket = allClientsButYou(socket);
//         console.log(id, socket)
//         io.to(remoteSocket.id).emit('offer', id/* of the broadcaster */, socket);
//     })

//     socket.on('answer', function(id, socket, localSocketId){
//         console.log(id, socket, "id socket")
//         io.to(id).emit('answer', id/* of the broadcaster */, socket, localSocketId);

//     })

//     socket.on('candidate', function(id, candidates){
//         console.log(socket.id, "oncandidate ", id)
//         io.to(id).emit('candidate',socket.id, candidates)
//     })

//  });


////////////////////////////////////////////////////







var allClientsButYou = function (socket) {
  let otherClients = clients.filter((client) => {
    return client.id != socket
  })

  return otherClients[0];
}


//TOOLS         

var removeClientThatDisconnected = function (id) {
  if (clients.length === 1) {
    clients.pop();
  } else {
    clients.forEach(function (client) {
      console.log(client.id, id)
      if (client.id === id) {
        clients.splice(client, 1)
      }
    });
  }
}

var addNewUsersToClientsArray = function (newClient) {
  if (clients.length === 0) {
    clients.push(newClient)
  } else {
    var counter = 0;
    clients.forEach(function (client) {
      if (client.id === newClient.id) {
        counter++
      }
    })
  } if (counter === 0) {
    clients.push(newClient)

  }
}










////////////////////////////////////////////////////////////////////////////////////
/////copy
// const express = require('express');
// const app = express();
// const server = require('http').Server(app);
// const io = require('socket.io')(server);
// server.listen(3000, () => {
//   console.log("socket.io server is listening on port 3000");
// });

// let broadcaster;
// const clients = [];
// const clientsReadyToBattle = [];


// function createRooms(socketid){
//   if(clientsReadyToBattle.length === 0){
//     clientsReadyToBattle.push({ peer1 :  socketid, peer2: null})
//   }else{
//      findClientWaiting(socketid)
//   }
// }

// function findClientWaiting(newSocketId){
//   const peerWaiting = clientsReadyToBattle.filter(function(client){
//     return client.peer2 === null;
//   });
//   if(peerWaiting.length === 0){
//     clientsReadyToBattle.push({peer1:newSocketId, peer2:null})
//   }else{
//     peerWaiting[0].peer2 = newSocketId;
//   }
// }


// io.sockets.on('connection', function (socket) {
//   clients.push(socket.id)
//   // createRooms(socket.id)
//   console.log('Currently there are ' + clients.length + ' connected', clients);

//   socket.on('readyToBattle', function(socketid){
//     createRooms(socketid)
//     console.log(clientsReadyToBattle, "clientsReadyToBattle")
//   })

//   socket.on('broadcaster', function () {
//     broadcaster = socket.id;
//     socket.broadcast.emit('broadcaster');
//   });

//   socket.on('watcher', function () {
//     // broadcaster && socket.to(broadcaster).emit('watcher', socket.id);
//     socket.to(broadcaster).emit('watcher', socket.id);
//   });
//   socket.on('offer', function (id /* of the watcher */, message) {
//     socket.to(id).emit('offer', socket.id /* of the broadcaster */, message);
//   });
//   socket.on('answer', function (id /* of the broadcaster */, message) {
//     socket.to(id).emit('answer', socket.id /* of the watcher */, message);

//   });
//   socket.on('candidate', function (id, message) {
//     socket.to(id).emit('candidate', socket.id, message);
//   });






//   socket.on('disconnect', function (message) {
//     broadcaster && socket.to(broadcaster).emit('bye', socket.id);
//     clients.forEach(function (client) {
//       if (client === socket.id) {
//         clients.splice(clients.indexOf(socket.id), 1)
//       }
//     })
//     console.log("client" + socket.id, "has disconnected, currently there are", clients.length, "connected")
//   });

//   socket.on('bye', function (id) {
//     console.log("inside bye ", id)
//     broadcaster && socket.to(broadcaster).emit('bye', id)
//   })
// });

// io.on('connect', function (socket) {
//     var newUserObject = {
//         id: socket.id,
//         nickname: null
//     }
//     addNewUsersToClientsArray(newUserObject)
//     var allConnectedClients = Object.keys(io.sockets.connected);
//     console.log("new user has connected, their Id is: " + socket.id + " #Currently there are " + clients.length + " users connected.")
//     socket.on('nickname', function (nickname) {
//         socket.nickname = nickname;
//         newUserObject.nickname = nickname
//         io.emit('userslistonConnection', clients)
//     });
//     socket.on('disconnect', function () {
//         removeClientThatDisconnected(socket.id)
//         console.log("new user has disconnected, their Id is: " + socket.id + " #Currently there are " + clients.length + " users connected.", 36)
//         io.emit('userslistonDisconnection', clients)
//     });

//     socket.on('offer', function(id, socket){
//         let remoteSocket = allClientsButYou(socket);
//         console.log(id, socket)
//         io.to(remoteSocket.id).emit('offer', id/* of the broadcaster */, socket);
//     })

//     socket.on('answer', function(id, socket, localSocketId){
//         console.log(id, socket, "id socket")
//         io.to(id).emit('answer', id/* of the broadcaster */, socket, localSocketId);

//     })

//     socket.on('candidate', function(id, candidates){
//         console.log(socket.id, "oncandidate ", id)
//         io.to(id).emit('candidate',socket.id, candidates)
//     })

//  });


////////////////////////////////////////////////////







// var allClientsButYou = function (socket) {
//   let otherClients = clients.filter((client) => {
//     return client.id != socket
//   })

//   return otherClients[0];
// }


// //TOOLS         

// var removeClientThatDisconnected = function (id) {
//   if (clients.length === 1) {
//     clients.pop();
//   } else {
//     clients.forEach(function (client) {
//       console.log(client.id, id)
//       if (client.id === id) {
//         clients.splice(client, 1)
//       }
//     });
//   }
// }

// var addNewUsersToClientsArray = function (newClient) {
//   if (clients.length === 0) {
//     clients.push(newClient)
//   } else {
//     var counter = 0;
//     clients.forEach(function (client) {
//       if (client.id === newClient.id) {
//         counter++
//       }
//     })
//   } if (counter === 0) {
//     clients.push(newClient)

//   }
// }











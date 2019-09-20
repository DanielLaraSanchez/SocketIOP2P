
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(3000, () => {
  console.log("socket.io server is listening on port 3000");
})

let broadcaster;
let numberOfConnections = 0;
const clients = [];
console.log(clients)

function createRooms(socketid){
  if(clients.length === 0){
    this.numberOfConnections = 1;
    clients.push({[socketid] :  null})
  }else{
     findClientWaiting(socketid)
    
    this.numberOfConnections++;
  }
  console.log(this.numberOfConnections, "26", clients)

  return this.numberOfConnections
}

function findClientWaiting(newSocketId){
  clients.forEach(function(client){
    console.log(clients[Object.keys(client)[0]], "insidefindclient")

    if(clients[Object.keys(client)[0]] === null){
      Object.keys(client)[0] = newSocketId
      console.log(Object.keys(client)[0], "insidefindclient")
    }
  })
}


io.sockets.on('connection', function (socket) {
  this.numberOfConnections = createRooms(socket.id)
  console.log(this.numberOfConnections, "35")
  // clients.push({[socket.id]: "hola" })
  console.log('Currently there are ' + clients.length + ' connected', clients);



  socket.on('broadcaster', function () {
    broadcaster = socket.id;
    socket.broadcast.emit('broadcaster');
  });

  socket.on('watcher', function () {
    // broadcaster && socket.to(broadcaster).emit('watcher', socket.id);
    socket.to(broadcaster).emit('watcher', socket.id);
  });
  socket.on('offer', function (id /* of the watcher */, message) {
    socket.to(id).emit('offer', socket.id /* of the broadcaster */, message);
  });
  socket.on('answer', function (id /* of the broadcaster */, message) {
    socket.to(id).emit('answer', socket.id /* of the watcher */, message);

  });
  socket.on('candidate', function (id, message) {
    socket.to(id).emit('candidate', socket.id, message);
  });






  socket.on('disconnect', function (message) {
    broadcaster && socket.to(broadcaster).emit('bye', socket.id);
    clients.forEach(function (client) {
      if (client === socket.id) {
        clients.splice(clients.indexOf(socket.id), 1)
      }
    })
    console.log("client" + socket.id, "has disconnected, currently there are", clients.length, "connected")
  });

  socket.on('bye', function (id) {
    console.log("inside bye ", id)
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











import { Component, OnInit } from '@angular/core';
import { WebsocketService } from 'src/app/Services/websocket.service';
import * as io from 'socket.io-client';
import * as SimplePeer from 'simple-peer';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  client = {};
  remoteSocketId;
  peerConnection;
  socket;
  pairedPeerWaiting = false;

  constructor(public _webSocketService: WebsocketService) {
    this.socket = this._webSocketService.socket;
  }

  ngOnInit() {

    // this.connect();
    // this.onOffer();
    this.onOfferNuevo(this.onOffer, this.sendOffer);
  
// this.readyToBattle();

}






    onOffer(socket) {
      const peerConnections = {};
      let peerConnection = new RTCPeerConnection();
      let video = document.createElement('video');
      let div = document.getElementById('video1Div');
      video.height = 200;
      video.width = 200;
      video.style.backgroundColor = "black"
      div.appendChild(video);
      //////////////////////////////////////////////////
      let videoOtherPeer = document.createElement('video');
      videoOtherPeer.height = 200;
      videoOtherPeer.width = 200;
      let videoOtherPeerDiv = document.getElementById('video2Div');
      videoOtherPeerDiv.appendChild(videoOtherPeer);
      var constraints = { audio: false, video: { width: 1280, height: 720 } };
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
          video.srcObject = stream;
          video.play();
          socket.emit('broadcaster');
        }).catch(error => console.error(error));

      ///////////////////////////////////////////////////    var constraints = { audio: false, video: { width: 1280, height: 720 } };
      socket.on('offer', function (id, description) {
        peerConnection.setRemoteDescription(description)
          .then(() => peerConnection.createAnswer())
          .then(sdp => peerConnection.setLocalDescription(sdp))
          .then(function () {
            
            socket.emit('answer', id, peerConnection.localDescription);
          });
          let stream = video.srcObject;

          (<MediaStream>stream).getTracks().forEach(track => {
            peerConnection.addTrack(track, <MediaStream>stream)
          });
         
        peerConnection.ontrack = function (event) {
          console.log(event.streams)
          videoOtherPeer.srcObject = event.streams[0];
          videoOtherPeer.play()
        };
        peerConnection.onicecandidate = function (event) {
          if (event.candidate) {
            console.log(event.candidate, "event")
            socket.emit('candidate', id, event.candidate);
          }
        };
      })
  
      socket.on('candidate', function (id, candidate) {
        console.log(candidate, peerConnection, "insidecandidate")
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(e => console.error(e));
      });
      socket.on('broadcaster', function () {
        socket.emit('watcher');
      });
  
      socket.on('bye', function () {
        peerConnection.close();
        console.log("dentro de bye")
      });
  
  
    }
    sendOffer(socket) {
      const peerConnections = {};

      let video = document.createElement('video');
      let div = document.getElementById('video1Div');
      video.height = 200;
      video.width = 200;
      video.style.backgroundColor = "black"
      div.appendChild(video);
      ///////////////////////////////////////
      let videoOtherPeer = document.createElement('video');
      videoOtherPeer.height = 200;
      videoOtherPeer.width = 200;
      let videoOtherPeerDiv = document.getElementById('video2Div');
      videoOtherPeerDiv.appendChild(videoOtherPeer);
      if(Object.keys(peerConnections).length < 2){
      var constraints = { audio: false, video: { width: 1280, height: 720 } };
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
          video.srcObject = stream;
          video.play();
          socket.emit('broadcaster');
        }).catch(error => console.error(error));
  
      socket.on('answer', function (id, description) {
        peerConnections[id].setRemoteDescription(description);
      });
  
  
      socket.on('watcher', function (id) {
        const peerConnection = new RTCPeerConnection();
        console.log(peerConnections, "peerconnections")
        peerConnections[id] = peerConnection;
        let stream = video.srcObject;
        (<MediaStream>stream).getTracks().forEach(track => {
          peerConnection.addTrack(track, <MediaStream>stream)
        });
        peerConnection.createOffer().then(sdp => peerConnection.setLocalDescription(sdp)).then(function () {
            socket.emit('offer', id, peerConnection.localDescription);
          });
        peerConnection.onicecandidate = function (event) {
          console.log(event.candidate, "candidate inside sender onicecanddate")
          if (event.candidate) {
            socket.emit('candidate', id, event.candidate);
          }
        };
  
        peerConnection.ontrack = function (event) {
          console.log(event.streams)
          videoOtherPeer.srcObject = event.streams[0];
          videoOtherPeer.play()
        };
      });
  
  
      socket.on('candidate', function (id, candidate) {
        console.log(candidate, "insidecandidate sender")
        peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
      });
  
      socket.on('bye', function (id) {
        console.log("inside bye onoffer")
        peerConnections[id] && peerConnections[id].close();
        delete peerConnections[id];
        video.hidden = true;
      });
    }

    
    }

  

  




   onOfferNuevo(onOfferCallback, sendOfferCallback){

    let socket = this.socket;
    socket.on('responsability', function(responsability){
      console.log(responsability, "funciona from client")
      if(responsability === 'activateOnOffer'){
        onOfferCallback(socket);
        socket.emit('clientIsWaiting', socket.id)
      }else if(responsability === 'activateSendOffer'){
        sendOfferCallback(socket)
      }else{
        console.log('esperando que se conecte peer')

      }
     
    });
    
  }

 readyToBattle(){
  
   this.socket.emit('readyToBattle', this._webSocketService.socket.id)
  
 }


  // sendOffer() {
  //   const socket = this._webSocketService.socket;
  //   const peerConnection = this._webSocketService.peerConnection;
  //   var constraints = { audio: true, video: { width: 1280, height: 720 } };
  //   navigator.mediaDevices.getUserMedia(constraints)
  //     .then(function (mediaStream) {
  //       var video = document.querySelector('video');
  //       video.src
  //       video.srcObject = mediaStream;
  //       video.play();
  //       mediaStream.getTracks().forEach(track => {
  //         peerConnection.addTrack(track, mediaStream);
  //       })
  //     }).catch(function (err:Error) { console.log(err.name + ": " + err.message, err.stack); });
  //       peerConnection.createOffer()
  //         .then(sdp => peerConnection.setLocalDescription(sdp))
  //           .then(function () {

  //             socket.emit('offer', peerConnection.localDescription, socket.id)
  //           })

  //       socket.on('answer', function (message, sockett, remoteSocket) {
  //         peerConnection.setRemoteDescription(sockett)

  //       })

  //       peerConnection.onicecandidate = function(event) {
  //         console.log(event, "event onicecandidate")
  //         if (event.candidate) {
  //           socket.emit('candidate',remoteSocket,   event.candidate)
  //         }
  //       };

  //       socket.on('candidate', function(id, candidate) {
  //         console.log(candidate, "on candidate candidate")
  //         peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
  //       });



  // }

  // onOffer() {
  //   let peerConnection = this._webSocketService.peerConnection;
  //   let socket = this._webSocketService.socket;
  //   let video = document.querySelector('video');
  //   socket.on('offer', function (remotesdp, remoteSocketId) {
  //     this.remoteSocketId = remoteSocketId;
  //     peerConnection.setRemoteDescription(remotesdp)
  //       .then(() => peerConnection.createAnswer())
  //       .then(sdp => peerConnection.setLocalDescription(sdp))
  //       .then(function () {
  //         socket.emit('answer',  remoteSocketId, peerConnection.localDescription, socket.id);
  //       });
  //     peerConnection.ontrack = function (event) {
  //       video.srcObject = event.streams[0];
  //     };

  //     peerConnection.onicecandidate = function(event) {
  //       if (event.candidate) {
  //         socket.emit('candidate', remoteSocketId, event.candidate);
  //       }
  //     };



  //     socket.on('candidate', function(id, candidate) {
  //       console.log(candidate, "candidate remote")
  //       peerConnection.addIceCandidate(new RTCIceCandidate(candidate));


  //     });
  //   });

  // }





  connect() {
    this.connectWithServer();
    this.listenForDisconnections();
    this.getUserListOnConnection();
    this.getUserListOnDisconnection();
  }


  connectWithServer() {
    //here we want to connect to the socket.io server
    this._webSocketService.listen('connect').subscribe(data => {
      this._webSocketService.setNickName("carapan");
    })
  }



  getUserListOnConnection() {
    this._webSocketService.listen('userslistonConnection').subscribe(data => {
      console.log(data, "userlist")
    })
  }
  getUserListOnDisconnection() {
    this._webSocketService.listen('userslistonDisconnection').subscribe(data => {
      console.log(data, "userlist")
    })
  }

  listenForDisconnections() {
    this._webSocketService.listen('disconnection').subscribe(data => {
      console.log(data, "disconnection")
    })
  }

}





















// test(){
//   let socket = this._webSocketService.socket;
//   let peerConnection = new RTCPeerConnection();
//   let video = document.createElement('video');
//   socket.on('offer', function(id, description) {
//     console.log(description)
//     peerConnection = new RTCPeerConnection();
//     peerConnection.setRemoteDescription(description)
//     .then(() => peerConnection.createAnswer())
//     .then(sdp => peerConnection.setLocalDescription(sdp))
//     .then(function () {
//       socket.emit('answer', id, peerConnection.localDescription);
//     });
//     peerConnection.ontrack = function(event) {
//       video.srcObject = event.streams[0];
//     };
//     peerConnection.onicecandidate = function(event) {
//       if (event.candidate) {
//         socket.emit('candidate', id, event.candidate);
//       }
//     };
//   });

//   socket.on('candidate', function(id, candidate) {
//     peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
//     .catch(e => console.error(e));
//   });

//   socket.on('connect', function() {
//     socket.emit('watcher');
//   });

//   socket.on('broadcaster', function() {
//     socket.emit('watcher');
//   });

//   socket.on('bye', function() {
//     peerConnection.close();
//   });
// }
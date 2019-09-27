import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../Services/websocket.service';

@Component({
  selector: 'app-home2',
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.css']
})
export class Home2Component implements OnInit {

  client = {};
  remoteSocketId;
  peerConnection;
  socket;
  pairedPeerWaiting = false;
  sender;

  constructor(public _webSocketService: WebsocketService) {
    this.socket = this._webSocketService.socket;

  }

  ngOnInit() {
    this.waitForInstructions();
  }

  waitForInstructions() {
    this.socket.on('onOffer', (senderId) => {
      console.log('funciona on offer', senderId)
      this.onOffer(this.socket);
    })

    this.socket.on('onSendOffer', (recieverId) => {
      console.log('funciona sendOffer', recieverId)

      this.sendOffer(this.socket, recieverId);
    })
  }

  onOffer(socket) {
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
       this.sender = peerConnection.addTrack(track, <MediaStream>stream)
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
      peerConnection.removeTrack(this.sender);
      peerConnection.close();
      peerConnection = new RTCPeerConnection();
      // peerConnection = undefined;
      console.log("dentro de bye")
      video.hidden = true;
      videoOtherPeer.hidden = true;
             let stream = video.srcObject;
        (<MediaStream>stream).getTracks().forEach(track => {
          track.stop();
        });
       let otherPeerStream = videoOtherPeer.srcObject;
       (<MediaStream>otherPeerStream).getTracks().forEach(track => {
        track.stop();
       });
       

       socket.emit('imfree', socket.id)

    });


  }
  sendOffer(socket, recieverId) {
    let peerConnections = {};
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
    if (Object.keys(peerConnections).length < 2) {
      var constraints = { audio: false, video: { width: 1280, height: 720 } };
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.play();
        socket.emit('broadcaster');
      }).catch(error => console.error(error));

      socket.on('answer', function (id, description) {
        peerConnections[id].setRemoteDescription(description);
      });


      socket.on('watcher', function () {
        let peerConnection = new RTCPeerConnection();
        console.log(peerConnections, "peerconnections")
        peerConnections[recieverId] = peerConnection;
        let stream = video.srcObject;
        (<MediaStream>stream).getTracks().forEach(track => {
         this.sender =  peerConnection.addTrack(track, <MediaStream>stream)
        });
        peerConnection.createOffer().then(sdp => peerConnection.setLocalDescription(sdp)).then(function () {
          socket.emit('offer', recieverId, peerConnection.localDescription);
        });
        peerConnection.onicecandidate = function (event) {
          console.log(event.candidate, "candidate inside sender onicecanddate")
          if (event.candidate) {
            socket.emit('candidate', recieverId, event.candidate);
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
        console.log("inside bye onoffer", id, peerConnections[recieverId], recieverId)
        peerConnections[id].removeTrack(this.sender)

        peerConnections[id] && peerConnections[id].close();
        // peerConnections = {}
        delete peerConnections[id];
        video.hidden = true;
        let stream = video.srcObject;
        (<MediaStream>stream).getTracks().forEach(track => {
          track.stop();
        });
       let otherPeerStream = videoOtherPeer.srcObject;
       (<MediaStream>otherPeerStream).getTracks().forEach(track => {
        track.stop();
       });


       socket.emit('imfree', socket.id)

      });

    

   }

  
   }


  readyToBattle() {

    this.socket.emit('readyToBattle', this._webSocketService.socket.id)

  }





}

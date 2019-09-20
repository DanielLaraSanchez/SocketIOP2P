import { Component, OnInit } from '@angular/core';
import { WebsocketService } from 'src/app/Services/websocket.service';
import { Peer } from 'simple-peer';
import * as io from 'socket.io-client';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  client = {};

  constructor(public _webSocketService: WebsocketService) { }

  ngOnInit() {

    // this.connect();

  }


  public async getWebCam(camSwitch) {
    var constraints = { audio: false, video: { width: 1280, height: 720 } };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function (mediaStream) {
          var video = document.querySelector('video');
          video.srcObject = mediaStream;
          console.log(mediaStream)
          video.onloadedmetadata = function (e) {
            video.play();


            function initPeer(type){
              let peer = new Peer({initiator: (type == 'init') ? true : false, stream: mediaStream})
            }

          };
        
      })
      .catch(function (err) { console.log(err.name + ": " + err.message); });
  }

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
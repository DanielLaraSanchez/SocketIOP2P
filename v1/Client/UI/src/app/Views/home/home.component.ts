import { Component, OnInit } from '@angular/core';
import { WebsocketService } from 'src/app/Services/websocket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public _webSocketService: WebsocketService) { }

  ngOnInit() {

    this.connect();



  }

  connect() {
    this.connectWithServer();
    this.getUserListOnConnection();
    this.getUserListOnDisconnection();
    this.listenForDisconnections();

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
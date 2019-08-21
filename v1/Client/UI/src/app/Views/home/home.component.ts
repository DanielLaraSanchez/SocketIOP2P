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

this.listenforTest();

this.getUserList();
 
this.listenForDisconnections();
 
}



connect(){
  //here we want to connect to the socket.io server
  this._webSocketService.listen('connect').subscribe(data => {

    console.log(data)
  
  this._webSocketService.setNickName("carapan");
  })
  }

  listenforTest(){
    this._webSocketService.listen('Test').subscribe(data => {
      console.log(data)
    })
  }

  getUserList(){
    this._webSocketService.listen('userslist').subscribe(data => {
      console.log(data, "userlist")
    })
  }

  listenForDisconnections(){
    this._webSocketService.listen('disconnection').subscribe(data => {
      console.log(data, "disconnection")
    })
  }

}
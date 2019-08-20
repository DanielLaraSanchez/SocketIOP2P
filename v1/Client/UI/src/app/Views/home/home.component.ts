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
//here we want to connect to the socket.io server
this._webSocketService.listen('Test event').subscribe(data => {
  console.log(data)
})


  }

    public getAllUsers(){
      this._webSocketService.listen('userlist').subscribe(data => {
        console.log(data)
      })
    }
 

 
}

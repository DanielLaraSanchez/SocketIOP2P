import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  socket: any;
  readonly URL: string = "ws://localhost:3000";
  peerConnection1: RTCPeerConnection;
  peerConnection2: RTCPeerConnection;


  constructor() { 
    this.socket = io(this.URL)
    console.log(this.socket);
    this.peerConnection1 = new RTCPeerConnection();
    this.peerConnection2 = new RTCPeerConnection();


    
  }


 
  listen(eventName: string){
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      })
    })
  }

  emit(eventName: string, data: any){
    this.socket.emit(eventName, data);
  }

  setNickName(nickname: string){
    this.socket.emit('nickname', nickname);
  }





  
}

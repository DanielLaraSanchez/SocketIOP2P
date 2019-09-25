import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './Views/home/home.component';
import { WebsocketService } from './Services/websocket.service';
import { Home2Component } from './home2/home2.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    Home2Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [WebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }

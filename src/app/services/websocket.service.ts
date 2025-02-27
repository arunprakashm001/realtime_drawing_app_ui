import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable,BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  private messagesSubject = new BehaviorSubject<any>(null); // Store received messages
  public messages$ = this.messagesSubject.asObservable(); // Observable for components

  constructor() {
    this.connect();
  }

  /** Establish WebSocket Connection */
  private connect() {
    this.socket = new WebSocket('ws://localhost:3000'); // Connect to WebSocket server

    this.socket.onopen = () => {
      console.log('WebSocket Connected ✅');
    };

    this.socket.onmessage = (event) => {
      this.handleIncomingMessage(event);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error ❌:', error);
    };

    this.socket.onclose = () => {
      console.warn('WebSocket Disconnected ⚠️ Reconnecting...');
      setTimeout(() => this.connect(), 3000); // Auto-reconnect in 3 seconds
    };
  }

  /** Process Incoming WebSocket Messages */
  private handleIncomingMessage(event: MessageEvent) {
    let parsedData;
    if (event.data instanceof Blob) {
      // Convert Blob to text before parsing JSON
      event.data.text().then((text) => {
        try {
          parsedData = JSON.parse(text);
          this.messagesSubject.next(parsedData); // Emit message to subscribers
        } catch (error) {
          console.error('JSON Parsing Error ❌:', error);
        }
      });
    } else {
      try {
        parsedData = JSON.parse(event.data);
        this.messagesSubject.next(parsedData); // Emit message to subscribers
      } catch (error) {
        console.error('JSON Parsing Error ❌:', error);
      }
    }
  }

  /** Send JSON Message */
  sendMessage(msg: any) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    } else {
      console.warn('WebSocket is not open. Message not sent.');
    }
  }

  /** ✅ Add getMessages() to allow components to subscribe */
  getMessages(): Observable<any> {
    return this.messages$;
  }
}

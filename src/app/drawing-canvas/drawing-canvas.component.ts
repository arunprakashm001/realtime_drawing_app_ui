import { Component, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
  styleUrls: ['./drawing-canvas.component.scss']
})
export class DrawingCanvasComponent implements AfterViewInit {

  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private drawing = false;
  private color = 'black';
  private size = 5;

  constructor(private wsService: WebsocketService) {}

  // ngAfterViewInit(): void {
  //   this.ctx = this.canvas.nativeElement.getContext('2d');
  //   this.wsService.getMessages().subscribe((msg) => {
  //     if (msg.type === 'draw') {
  //       this.drawOnCanvas(msg.x, msg.y, msg.color, msg.size);
  //     } else if (msg.type === 'reset') {
  //       this.ctx?.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  //     }
  //   });
  // }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
  
    this.wsService.getMessages().subscribe((msg) => {
      if (msg) { // Ensure message is not null
        if (msg.type === 'draw') {
          this.drawOnCanvas(msg.x, msg.y, msg.color, msg.size);
        } else if (msg.type === 'reset') {
          this.ctx?.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        }
      }
    });
  }
  

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.drawing = true;
    this.draw(event);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.drawing) this.draw(event);
  }

  @HostListener('mouseup')
  onMouseUp() {
    this.drawing = false;
  }

  draw(event: MouseEvent) {
    if (!this.ctx) return;
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.drawOnCanvas(x, y, this.color, this.size);
    this.wsService.sendMessage({ type: 'draw', x, y, color: this.color, size: this.size });
  }

  /** Fix: Define the missing method */
  drawOnCanvas(x: number, y: number, color: string, size: number) {
    if (!this.ctx) return;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  resetCanvas() {
    this.ctx?.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.wsService.sendMessage({ type: 'reset' });
  }

  changeColor(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.color = target.value;
    }
  }
  

  changeSize(event: Event) {
    const target = event.target as HTMLInputElement;
    this.size = Number(target.value);
  }
  

}

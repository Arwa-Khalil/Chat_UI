// AppComponent: view shell and navigation only. Hosts ChatComponent and FileUploadComponent.
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { FileUploadComponent } from './components/FileUpload/file-upload/file-upload.component';
import { ChatComponent } from './components/Chat/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent, ChatComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('fadeSwitch', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px) scale(.995)' }),
        animate('260ms cubic-bezier(.2,.9,.3,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('220ms ease-in', style({ opacity: 0, transform: 'translateY(-6px) scale(.995)' }))
      ])
    ])
  ]
})
export class AppComponent {
  // view chooser for the dashboard
  view: 'chat' | 'upload' = 'chat';
  setView(v: 'chat' | 'upload') { this.view = v; }

  // Animation state - use this in template
  get animationState() {
    return this.view;
  }
}

import { Component } from '@angular/core';
import { FileUploadComponent } from '../../FileUpload/file-upload/file-upload.component';
import { ChatComponent } from '../../Chat/chat/chat.component';

@Component({
  selector: 'app-dashboard',
  imports: [FileUploadComponent, ChatComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}

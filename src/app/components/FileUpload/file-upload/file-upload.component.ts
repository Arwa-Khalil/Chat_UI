import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { HttpEventType } from '@angular/common/http';
import { UploadedFile } from '../../../services/file.service';

interface UploadItem {
  file: File;
  name: string;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error';
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  isDragging = false;
  uploadedFiles: UploadItem[] = [];
  private apiEndpoint = 'Files/upload';

  constructor(private api: ApiService) {}

  onDragOver(ev: DragEvent) {
    ev.preventDefault();
    this.isDragging = true;
  }

  @HostListener('document:dragend', [])
  onDragEnd() { this.isDragging = false; }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    this.isDragging = false;
    const files = ev.dataTransfer?.files;
    if (files && files.length) this.addFiles(files);
  }

  onFileSelected(ev: Event) {
    const inp = ev.target as HTMLInputElement;
    if (!inp.files) return;
    this.addFiles(inp.files);
    inp.value = '';
  }

  addFiles(list: FileList) {
    Array.from(list).forEach(f => {
      const item: UploadItem = { file: f, name: f.name, progress: 0, status: 'queued' };
      this.uploadedFiles.unshift(item);
      // small UI delay for animation
      setTimeout(() => this.upload(item), 120);
    });
  }

  upload(item: UploadItem) {
    const fd = new FormData();
    fd.append('file', item.file, item.name);

    item.status = 'uploading';
this.api.postFormData<UploadedFile>(this.apiEndpoint, fd, true).subscribe({
  next: (ev) => {
    // Narrow the type first
    if ('type' in ev) { // ev is HttpEvent<UploadedFile>
      if (ev.type === HttpEventType.UploadProgress && ev.total) {
        item.progress = Math.round((ev.loaded / ev.total) * 100);
      } else if (ev.type === HttpEventType.Response) {
        item.progress = 100;
        item.status = 'done';
      }
    } else {
      // ev is just UploadedFile (when reportProgress=false)
      item.progress = 100;
      item.status = 'done';
    }
  },
  error: () => {
    item.status = 'error';
  }
    });
  }
}

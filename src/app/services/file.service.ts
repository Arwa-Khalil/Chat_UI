import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UploadedFile {
  fileId: string;
  chunkCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private api: ApiService) {}

  uploadFile(file: File, reportProgress = false): Observable<UploadedFile | any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData<UploadedFile>('Files/upload', formData, reportProgress);
  }
}

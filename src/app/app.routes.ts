import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'file-upload',
        loadComponent: () => import('./components/FileUpload/file-upload/file-upload.component').then(m => m.FileUploadComponent)
    },
    {
        path: 'chat',
        loadComponent: () => import('./components/Chat/chat/chat.component').then(m => m.ChatComponent)
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }

];

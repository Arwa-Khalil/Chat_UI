// ChatService: sends question payload to backend via ApiService and returns typed response
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BehaviorSubject, tap } from 'rxjs';
import { ChatMessage } from '../interfaces/ChatMessage';

export interface ChatResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
   private readonly messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  constructor(private api: ApiService) {}

  getMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  // askQuestion -> POST to backend endpoint. Adjust endpoint path if backend differs.
  // askQuestion(question: string): Observable<ChatResponse> {
  //   return this.api.post<ChatResponse>('rag/chat', { question });
  // }
    askQuestion(question: string): Observable<ChatResponse> {
    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    this.appendMessage(userMessage);

    return this.api
      .post<ChatResponse>('rag/chat', {
        question,
        history: this.getMessages()
      })
      .pipe(
        tap(response => {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response.answer,
            timestamp: new Date()
          };

          this.appendMessage(assistantMessage);
        })
      );
  }
  
 private appendMessage(message: ChatMessage): void {
    this.messagesSubject.next([
      ...this.messagesSubject.value,
      message
    ]);
  }

  clearConversation(): void {
    this.messagesSubject.next([]);
  }
}

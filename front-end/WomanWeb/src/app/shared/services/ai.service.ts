import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AIMessage {
  message: string;
  timestamp: Date;
}

export interface ChatHistory {
  sender: 'user' | 'lisa';
  text: string;
}

export interface QuickQuestion {
  id: number;
  text: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'https://ladyweb-production.up.railway.app/api/ai';

  constructor(private http: HttpClient) { }

  /**
   * Chat với Lisa AI
   */
  chat(message: string, history: ChatHistory[] = []): Observable<string> {
    return this.http.post<{ success: boolean; data: AIMessage }>
      (`${this.apiUrl}/chat`, { message, history })
      .pipe(
        map(response => response.data.message)
      );
  }

  /**
   * Lấy câu hỏi gợi ý
   */
  getQuickQuestions(): Observable<QuickQuestion[]> {
    return this.http.get<{ success: boolean; data: QuickQuestion[] }>
      (`${this.apiUrl}/quick-questions`)
      .pipe(
        map(response => response.data)
      );
  }
}

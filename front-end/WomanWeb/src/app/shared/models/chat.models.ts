// src/app/shared/models/chat.models.ts

// Đại diện cho một người dùng hoặc chuyên gia
export interface User {
  id: number;
  full_name: string;
  avatar_url?: string;
  email?: string;
  role?: 'user' | 'expert';
  isOnline?: boolean; // Thêm trạng thái online
}

// Đại diện cho một tin nhắn
export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: string; // Dạng chuỗi ISO date
  sender: User;
}

// Đại diện cho một cuộc trò chuyện
export interface Conversation {
  id: number;
  user_id: number;
  expert_id: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  expert: User;
}

// Dùng cho việc lấy danh sách chuyên gia
export interface Expert {
  id: number;
  full_name: string;
  avatar_url?: string;
  isOnline: boolean;
}

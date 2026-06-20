export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface DocumentListItem {
  id: string;
  original_filename: string;
  document_type: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface DocumentDetail {
  id: string;
  original_filename: string;
  document_type: string | null;
  summary: string | null;
  was_truncated: boolean;
  word_count: number | null;
  created_at: string;
  messages: Message[];
}

export interface DocumentUploadResponse {
  document_id: string;
  original_filename: string;
  document_type: string;
  summary: string;
  was_truncated: boolean;
  word_count: number;
}

export interface ChatResponse {
  answer: string;
  message_id: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
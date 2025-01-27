export interface Message {
  userId?: string;
  channelId?: string;
  userName: string;
  userAvatar?: string;
  userMessage: string;
  timestamp: number;
  answers: [];
  docId?: string;
}

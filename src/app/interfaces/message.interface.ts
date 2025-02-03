export interface Message {
  userId?: string;
  channelId?: string;
  userName: string;
  userAvatar?: string;
  userMessage: string;
  timestamp: number;
  answers: [];
  emojiReactions: [{emoji: string, counter: number, users: string[]}];
  docId?: string;
}

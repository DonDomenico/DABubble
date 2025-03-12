export interface DirectMessage {
  initiatedBy: string;
  senderAvatar: string;
  recipientAvatar: string;
  recipientId: string;
  senderMessage: string;
  timestamp: number;
  emojiReactions?: [{emoji: string, counter: number, users: string[]}];
  docId?: string
  edited: boolean;
  read?: boolean;
}

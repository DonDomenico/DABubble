export interface Message {
  userId?: string;
  channelId?: string;
  userName: string;
  userAvatar?: string;
  userMessage: string;
  userTime: string;
  messageDate: string;
  answer?: string;
  lastAnswerTime?: string;
  isRowReverse?: boolean;
}

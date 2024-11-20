export interface Message {
  userId?: string;
  userName: string;
  userAvatar?: string;
  userMessage: string;
  userTime: string;
  answer?: string;
  lastAnswerTime?: string;
  isRowReverse?: boolean;
}

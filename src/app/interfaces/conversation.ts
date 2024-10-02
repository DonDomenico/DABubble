
export interface Conversation {
    docId: string;
    initiatedAt: string;
    initiatedBy: string;
    lastMessage: [
        {
            message: string;
            messageType: string;
            recipientId: string;
            senderId: string;
            status: string;
            timestamp: string;
        }
    ],
    // subcollection of conversations
    messages: []
}

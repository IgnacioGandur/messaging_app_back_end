import { Prisma } from "@prisma/client";

type ConversationWithMessagesAndParticipants = Prisma.ConversationGetPayload<{
    include: {
        messages: true;
        participants: true;
    };
}>;

declare global {
    namespace Express {
        interface Request {
            foundUser?: User;
            foundConversation?: ConversationWithMessagesAndParticipants;
            errorStatusCode?: number;
        }
    }
}

export {};

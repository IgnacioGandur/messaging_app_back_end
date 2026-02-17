import { Conversation, User, Prisma, Participant } from "../generated/prisma/client.js";

type ConversationWithMessagesAndParticipants = Prisma.ConversationGetPayload<{
    include: {
        messages: true,
        participants: true,
    }
}>

declare global {
    namespace Express {
        interface Request {
            foundUser?: User;
            foundConversation?: ConversationWithMessagesAndParticipants;
            errorStatusCode?: number;
        }
    }
}

export { };

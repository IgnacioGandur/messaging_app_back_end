import test_client from "../../db/test_client.js";

export default async function createTestPrivateConversation(
    userAId: number,
    userBId: number,
    message: string
) {
    const conversation = await test_client.conversation.create({
        data: {
            isGroup: false,
            participants: {
                create: [
                    {
                        userId: Number(userAId)
                    },
                    {
                        userId: Number(userBId)
                    },
                ]
            },
            messages: {
                create: {
                    senderId: Number(userAId),
                    content: message
                }
            }
        },
        include: {
            participants: {
                include: {
                    user: {
                        omit: {
                            password: true
                        }
                    }
                }
            },
            messages: true
        }
    });

    return conversation;
};

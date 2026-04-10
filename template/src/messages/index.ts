import { MessageProcessor } from "../core/MessageProcessor";
import { Logger } from "../utils/logger/Logger";

const logger = new Logger("MessageHandlers");

export function setupMessageHandlers(processor: MessageProcessor): void {
    // Register message handlers by type
    // The message body must contain a "type" field to dispatch to the correct handler
    //
    // Example:
    // processor.register<{ type: string; userId: string }>("USER_CREATED", async (body) => {
    //     logger.info("Processing USER_CREATED", { userId: body.userId });
    // });

    // Catch-all handler for unregistered message types

    processor.register("*", async (body, record) => {
        logger.warn("Unhandled message received", { messageId: record.messageId, body });
    });
}

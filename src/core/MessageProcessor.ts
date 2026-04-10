import { SQSRecord } from "aws-lambda";
import { Logger } from "../utils/logger/Logger";

export type MessageHandler<T = unknown> = (body: T, record: SQSRecord) => Promise<void>;

export class MessageProcessor {
    private handlers = new Map<string, MessageHandler>();
    private logger = new Logger("MessageProcessor");

    register<T>(messageType: string, handler: MessageHandler<T>): void {
        this.handlers.set(messageType, handler as MessageHandler);
    }

    async process(record: SQSRecord): Promise<void> {
        let body: unknown;

        try {
            body = JSON.parse(record.body);
        } catch {
            this.logger.error("Failed to parse message body", { messageId: record.messageId });
            throw new Error(`Invalid JSON in message ${record.messageId}`);
        }

        const messageType = (body as Record<string, unknown>)?.type as string | undefined;

        const handler = messageType
            ? (this.handlers.get(messageType) ?? this.handlers.get("*"))
            : this.handlers.get("*");

        if (!handler) {
            this.logger.warn("No handler registered for message type", {
                messageType,
                messageId: record.messageId,
            });
            return;
        }

        this.logger.info("Processing message", { messageType, messageId: record.messageId });
        await handler(body, record);
    }
}

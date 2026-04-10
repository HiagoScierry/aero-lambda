import { SQSEvent, SQSBatchResponse, SQSBatchItemFailure } from "aws-lambda";
import { MessageProcessor } from "./core/MessageProcessor";
import { Logger } from "./utils/logger/Logger";
import { setupMessageHandlers } from "./messages/index";

const logger = new Logger("SQSHandler");
let processor: MessageProcessor | null = null;

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    if (!processor) {
        processor = new MessageProcessor();
        setupMessageHandlers(processor);
    }

    const batchItemFailures: SQSBatchItemFailure[] = [];

    await Promise.allSettled(
        event.Records.map(async (record) => {
            try {
                await processor!.process(record);
            } catch (error) {
                logger.error("Failed to process SQS message", {
                    messageId: record.messageId,
                    error,
                });
                batchItemFailures.push({ itemIdentifier: record.messageId });
            }
        })
    );

    logger.info("Batch processed", {
        total: event.Records.length,
        failures: batchItemFailures.length,
    });

    return { batchItemFailures };
};

import { MessageProcessor } from "../../../src/core/MessageProcessor";
import { SQSRecord } from "aws-lambda";

const makeSQSRecord = (body: unknown, messageId = "msg-1"): SQSRecord =>
    ({
        messageId,
        body: JSON.stringify(body),
        receiptHandle: "handle",
        attributes: {} as never,
        messageAttributes: {},
        md5OfBody: "",
        eventSource: "aws:sqs",
        eventSourceARN: "arn:aws:sqs:us-east-1:123456789:test-queue",
        awsRegion: "us-east-1",
    }) as SQSRecord;

describe("MessageProcessor", () => {
    let processor: MessageProcessor;

    beforeEach(() => {
        processor = new MessageProcessor();
    });

    it("should dispatch to the registered handler by message type", async () => {
        const handler = jest.fn().mockResolvedValue(undefined);
        processor.register("USER_CREATED", handler);

        await processor.process(makeSQSRecord({ type: "USER_CREATED", userId: "42" }));

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(
            { type: "USER_CREATED", userId: "42" },
            expect.objectContaining({ messageId: "msg-1" })
        );
    });

    it("should fall back to catch-all handler when type has no specific handler", async () => {
        const catchAll = jest.fn().mockResolvedValue(undefined);
        processor.register("*", catchAll);

        await processor.process(makeSQSRecord({ type: "UNKNOWN_TYPE" }));

        expect(catchAll).toHaveBeenCalledTimes(1);
    });

    it("should use catch-all when message has no type field", async () => {
        const catchAll = jest.fn().mockResolvedValue(undefined);
        processor.register("*", catchAll);

        await processor.process(makeSQSRecord({ data: "something" }));

        expect(catchAll).toHaveBeenCalledTimes(1);
    });

    it("should throw when message body is not valid JSON", async () => {
        const record = {
            ...makeSQSRecord({}),
            body: "not-json",
        } as SQSRecord;

        await expect(processor.process(record)).rejects.toThrow("Invalid JSON in message msg-1");
    });

    it("should not throw when no handler and no catch-all is registered", async () => {
        await expect(
            processor.process(makeSQSRecord({ type: "UNREGISTERED" }))
        ).resolves.toBeUndefined();
    });

    it("should prefer specific handler over catch-all", async () => {
        const specific = jest.fn().mockResolvedValue(undefined);
        const catchAll = jest.fn().mockResolvedValue(undefined);
        processor.register("ORDER_PLACED", specific);
        processor.register("*", catchAll);

        await processor.process(makeSQSRecord({ type: "ORDER_PLACED" }));

        expect(specific).toHaveBeenCalledTimes(1);
        expect(catchAll).not.toHaveBeenCalled();
    });
});

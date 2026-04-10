import { SQSEvent } from "aws-lambda";

jest.mock("../../src/messages/index", () => ({
    setupMessageHandlers: jest.fn(),
}));

jest.mock("../../src/core/MessageProcessor", () => {
    const process = jest.fn();
    return {
        MessageProcessor: jest.fn().mockImplementation(() => ({ process })),
        __mockProcess: process,
    };
});

const getProcessMock = () =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require("../../src/core/MessageProcessor") as { __mockProcess: jest.Mock }).__mockProcess;

const makeSQSEvent = (records: { messageId: string; body: string }[]): SQSEvent => ({
    Records: records.map((r) => ({
        messageId: r.messageId,
        body: r.body,
        receiptHandle: "handle",
        attributes: {} as never,
        messageAttributes: {},
        md5OfBody: "",
        eventSource: "aws:sqs",
        eventSourceARN: "arn:aws:sqs:us-east-1:123456789:test-queue",
        awsRegion: "us-east-1",
    })),
});

describe("sqsHandler", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it("should return empty failures when all messages succeed", async () => {
        jest.mock("../../src/messages/index", () => ({ setupMessageHandlers: jest.fn() }));
        jest.mock("../../src/core/MessageProcessor", () => {
            const process = jest.fn().mockResolvedValue(undefined);
            return { MessageProcessor: jest.fn().mockImplementation(() => ({ process })) };
        });

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { handler } = require("../../src/sqsHandler");
        const event = makeSQSEvent([
            { messageId: "msg-1", body: '{"type":"A"}' },
            { messageId: "msg-2", body: '{"type":"B"}' },
        ]);

        const result = await handler(event);
        expect(result.batchItemFailures).toHaveLength(0);
    });

    it("should report failed messages without throwing", async () => {
        jest.mock("../../src/messages/index", () => ({ setupMessageHandlers: jest.fn() }));
        jest.mock("../../src/core/MessageProcessor", () => {
            const process = jest
                .fn()
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error("processing error"));
            return { MessageProcessor: jest.fn().mockImplementation(() => ({ process })) };
        });

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { handler } = require("../../src/sqsHandler");
        const event = makeSQSEvent([
            { messageId: "msg-ok", body: '{"type":"A"}' },
            { messageId: "msg-fail", body: '{"type":"B"}' },
        ]);

        const result = await handler(event);
        expect(result.batchItemFailures).toHaveLength(1);
        expect(result.batchItemFailures[0].itemIdentifier).toBe("msg-fail");
    });
});

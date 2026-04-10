/**
 * Example: testing an SQS message handler via MessageProcessor
 *
 * This file shows two recommended patterns for testing SQS handlers:
 *   1. Testing the MessageProcessor dispatch logic directly
 *   2. Testing an individual handler function in isolation
 *
 * To create your own handler tests:
 *   1. Run: npm run generate handler <MESSAGE_TYPE>
 *   2. Duplicate the "individual handler" section below
 *   3. Import your generated handler and assert its side effects
 */

import { MessageProcessor } from "../../../src/core/MessageProcessor";
import { SQSRecord } from "aws-lambda";

// Helper to build a minimal SQSRecord for tests
const makeSQSRecord = (body: unknown, messageId = "msg-test"): SQSRecord =>
    ({
        messageId,
        body: JSON.stringify(body),
        receiptHandle: "handle",
        attributes: {} as never,
        messageAttributes: {},
        md5OfBody: "",
        eventSource: "aws:sqs",
        eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:example-queue",
        awsRegion: "us-east-1",
    }) as SQSRecord;

// ─── Pattern 1: testing the dispatcher ───────────────────────────────────────

describe("MessageProcessor (example)", () => {
    let processor: MessageProcessor;

    beforeEach(() => {
        processor = new MessageProcessor();
    });

    it("calls the registered handler for a known message type", async () => {
        const handler = jest.fn().mockResolvedValue(undefined);

        processor.register("ORDER_PLACED", handler);

        await processor.process(makeSQSRecord({ type: "ORDER_PLACED", orderId: "42" }));

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(
            { type: "ORDER_PLACED", orderId: "42" },
            expect.objectContaining({ messageId: "msg-test" })
        );
    });

    it("falls back to the catch-all handler for unknown types", async () => {
        const catchAll = jest.fn().mockResolvedValue(undefined);

        processor.register("*", catchAll);

        await processor.process(makeSQSRecord({ type: "UNKNOWN" }));

        expect(catchAll).toHaveBeenCalledTimes(1);
    });

    it("throws when the message body is not valid JSON", async () => {
        const invalidRecord = { ...makeSQSRecord({}), body: "not-json" } as SQSRecord;

        await expect(processor.process(invalidRecord)).rejects.toThrow("Invalid JSON");
    });
});

// ─── Pattern 2: testing an individual handler function ───────────────────────
//
// After running: npm run generate handler ORDER_PLACED
// you can test the generated handler like this:
//
// import { orderPlacedHandler } from "../../../src/messages/handlers/order-placed.handler";
//
// describe("orderPlacedHandler (example)", () => {
//     it("processes ORDER_PLACED without throwing", async () => {
//         const body = { type: "ORDER_PLACED" as const, orderId: "42" };
//         await expect(orderPlacedHandler(body, makeSQSRecord(body))).resolves.toBeUndefined();
//     });
// });

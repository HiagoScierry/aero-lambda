import { orderPlacedHandler } from "../../../src/messages/handlers/order-placed.handler";
import { SQSRecord } from "aws-lambda";

const makeSQSRecord = (body: unknown): SQSRecord =>
    ({
        messageId: "msg-test",
        body: JSON.stringify(body),
        receiptHandle: "handle",
        attributes: {} as never,
        messageAttributes: {},
        md5OfBody: "",
        eventSource: "aws:sqs",
        eventSourceARN: "arn:aws:sqs:us-east-1:123456789:test-queue",
        awsRegion: "us-east-1",
    }) as SQSRecord;

describe("orderPlacedHandler", () => {
    it("should process ORDER_PLACED without throwing", async () => {
        const body = { type: "ORDER_PLACED" as const };
        await expect(orderPlacedHandler(body, makeSQSRecord(body))).resolves.toBeUndefined();
    });
});

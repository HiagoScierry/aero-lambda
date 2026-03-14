import { Router } from "../../../src/core/Router";
import { healthRoutes } from "../../../src/routes/healthRoutes";
import { APIGatewayProxyEvent } from "aws-lambda";

describe("HealthRoutes", () => {
    let router: Router;

    beforeEach(() => {
        router = new Router();
        healthRoutes(router);
    });

    it("should respond to GET /health", async () => {
        const event: Partial<APIGatewayProxyEvent> = {
            httpMethod: "GET",
            path: "/health",
        };

        const result = await router.handle(event as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body);
        expect(body.status).toBe("OK");
        expect(body).toHaveProperty("timestamp");
    });
});

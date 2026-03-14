import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Router } from "./core/Router";
import { setupRoutes } from "./routes/index";

let router: Router | null = null;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	if (!router) {
		router = new Router();
		setupRoutes(router);
	}

	return await router.handle(event);
};

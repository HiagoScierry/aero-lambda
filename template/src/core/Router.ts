import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResponseBuilder } from "../utils/ResponseBuilder";
import { Logger } from "../utils/logger/Logger";

type Middleware = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult | null>;

type RouteHandler = (
    event: APIGatewayProxyEvent,
    params: Record<string, string>
) => Promise<APIGatewayProxyResult>;

interface Route {
    method: string;
    path: string;
    handler: RouteHandler;
    middlewares?: Middleware[];
}

export class Router {
    private routes: Route[] = [];
    private logger = new Logger("Router");

    get(path: string, handler: RouteHandler, middlewares?: Middleware[]): void {
        this.routes.push({ method: "GET", path, handler, middlewares });
    }

    post(path: string, handler: RouteHandler, middlewares?: Middleware[]): void {
        this.routes.push({ method: "POST", path, handler, middlewares });
    }

    put(path: string, handler: RouteHandler, middlewares?: Middleware[]): void {
        this.routes.push({ method: "PUT", path, handler, middlewares });
    }

    delete(path: string, handler: RouteHandler, middlewares?: Middleware[]): void {
        this.routes.push({ method: "DELETE", path, handler, middlewares });
    }

    patch(path: string, handler: RouteHandler, middlewares?: Middleware[]): void {
        this.routes.push({ method: "PATCH", path, handler, middlewares });
    }

    async handle(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        try {
            const v2Event = event as unknown as {
                rawPath?: string;
                requestContext?: {
                    http?: {
                        path?: string;
                        method?: string;
                    };
                };
            };
            const path = event.path || v2Event.rawPath || v2Event.requestContext?.http?.path || "/";
            const method = event.httpMethod || v2Event.requestContext?.http?.method || "GET";

            this.logger.info("Routing request", { method, path });

            for (const route of this.routes) {
                const params = this.matchRoute(route.path, path);

                if (params !== null && route.method === method) {
                    this.logger.info("Route found", { route: route.path, params });

                    event.pathParameters = { ...event.pathParameters, ...params };

                    if (route.middlewares && route.middlewares.length > 0) {
                        for (const middleware of route.middlewares) {
                            const middlewareResult = await middleware(event);

                            if (middlewareResult !== null) {
                                return middlewareResult;
                            }
                        }
                    }

                    return await route.handler(event, params);
                }
            }

            this.logger.warn("Route not found", { method, path });
            return ResponseBuilder.notFound(`Route ${method} ${path} not found`);
        } catch (error) {
            this.logger.error("Error processing route", error);
            return ResponseBuilder.error(error);
        }
    }

    private matchRoute(routePath: string, requestPath: string): Record<string, string> | null {
        if (!routePath || !requestPath) {
            return null;
        }

        const routeParts = routePath.split("/").filter((p) => p);
        const requestParts = requestPath.split("/").filter((p) => p);

        if (routeParts.length !== requestParts.length) {
            return null;
        }

        const params: Record<string, string> = {};

        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const requestPart = requestParts[i];

            if (routePart.startsWith(":")) {
                const paramName = routePart.substring(1);
                params[paramName] = requestPart;
            } else if (routePart !== requestPart) {
                return null;
            }
        }

        return params;
    }

    getRoutes(): Route[] {
        return this.routes;
    }
}

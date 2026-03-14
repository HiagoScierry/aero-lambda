import { APIGatewayProxyResult } from "aws-lambda";

export class ResponseBuilder {
    private static buildResponse(
        statusCode: number,
        body: any,
        isJson: boolean = true
    ): APIGatewayProxyResult {
        return {
            statusCode,
            headers: {
                "Content-Type": isJson ? "application/json" : "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: isJson ? JSON.stringify(body) : body,
        };
    }

    static success(data: any, isJson: boolean = true): APIGatewayProxyResult {
        return this.buildResponse(200, data, isJson);
    }

    static created(data: any): APIGatewayProxyResult {
        return this.buildResponse(201, data);
    }

    static badRequest(message: string): APIGatewayProxyResult {
        return this.buildResponse(400, {
            error: "Bad Request",
            message,
        });
    }

    static unauthorized(message: string = "Não autorizado"): APIGatewayProxyResult {
        return this.buildResponse(401, {
            error: "Unauthorized",
            message,
        });
    }

    static notFound(message: string = "Recurso não encontrado"): APIGatewayProxyResult {
        return this.buildResponse(404, {
            error: "Not Found",
            message,
        });
    }

    static methodNotAllowed(): APIGatewayProxyResult {
        return this.buildResponse(405, {
            error: "Method Not Allowed",
            message: "Método HTTP não permitido",
        });
    }

    static error(error: any): APIGatewayProxyResult {
        const message = error instanceof Error ? error.message : "Erro interno do servidor";

        return this.buildResponse(500, {
            error: "Internal Server Error",
            message,
        });
    }
}

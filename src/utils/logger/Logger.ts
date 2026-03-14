export class Logger {
    constructor(private context: string) {}

    info(message: string, data?: unknown): void {
        console.log(
            JSON.stringify({
                level: "INFO",
                context: this.context,
                message,
                data,
                timestamp: new Date().toISOString(),
            })
        );
    }

    warn(message: string, data?: unknown): void {
        console.warn(
            JSON.stringify({
                level: "WARN",
                context: this.context,
                message,
                data,
                timestamp: new Date().toISOString(),
            })
        );
    }

    error(message: string, error?: unknown): void {
        let errorData = error;
        if (error instanceof Error) {
            errorData = {
                message: error.message,
                stack: error.stack,
            };
        }

        console.error(
            JSON.stringify({
                level: "ERROR",
                context: this.context,
                message,
                error: errorData,
                timestamp: new Date().toISOString(),
            })
        );
    }

    debug(message: string, data?: unknown): void {
        if (process.env.NODE_ENV !== "production") {
            console.debug(
                JSON.stringify({
                    level: "DEBUG",
                    context: this.context,
                    message,
                    data,
                    timestamp: new Date().toISOString(),
                })
            );
        }
    }
}

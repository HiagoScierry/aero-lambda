import { Router } from "../core/Router";
import { ResponseBuilder } from "../utils/ResponseBuilder";

export function healthRoutes(router: Router): void {
    router.get("/health", async () => {
        return ResponseBuilder.success({
            status: "OK",
            timestamp: new Date().toISOString(),
        });
    });
}

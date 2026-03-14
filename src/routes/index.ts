import { Router } from "../core/Router";
import { healthRoutes } from "./healthRoutes";
import { userRoutes } from "./userRoutes";

export function setupRoutes(router: Router): void {
	healthRoutes(router);
	userRoutes(router);
}

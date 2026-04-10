import { Router } from "../core/Router";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repositories/UserRepository";
import { ResponseBuilder } from "../utils/ResponseBuilder";

export function userRoutes(router: Router): void {
    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);

    router.get("/users", async () => {
        const users = await userService.getAllUsers();
        return ResponseBuilder.success(users);
    });

    router.get("/users/:id", async (event) => {
        const id = event.pathParameters?.id;
        if (!id) return ResponseBuilder.badRequest("Missing user ID");

        const user = await userService.getUserById(id);
        if (!user) return ResponseBuilder.notFound("User not found");

        return ResponseBuilder.success(user);
    });

    router.post("/users", async (event) => {
        try {
            const body = event.body ? JSON.parse(event.body) : null;
            if (!body || !body.name || !body.email) {
                return ResponseBuilder.badRequest("Name and email are required");
            }

            const newUser = await userService.createUser(body);
            return ResponseBuilder.created(newUser);
        } catch (error) {
            return ResponseBuilder.badRequest("Invalid JSON body");
        }
    });

    router.put("/users/:id", async (event) => {
        try {
            const id = event.pathParameters?.id;
            if (!id) return ResponseBuilder.badRequest("Missing user ID");

            const body = event.body ? JSON.parse(event.body) : null;
            if (!body) return ResponseBuilder.badRequest("Missing update data");

            const updatedUser = await userService.updateUser(id, body);
            if (!updatedUser) return ResponseBuilder.notFound("User not found");

            return ResponseBuilder.success(updatedUser);
        } catch (error) {
            return ResponseBuilder.badRequest("Invalid JSON body");
        }
    });

    router.delete("/users/:id", async (event) => {
        const id = event.pathParameters?.id;
        if (!id) return ResponseBuilder.badRequest("Missing user ID");

        const success = await userService.deleteUser(id);
        if (!success) return ResponseBuilder.notFound("User not found");

        return ResponseBuilder.success({ message: "User deleted successfully" });
    });
}

import { UserRepository } from "../../../src/repositories/UserRepository";
import { CreateUserDto } from "../../../src/core/models/User";

describe("UserRepository", () => {
    let repository: UserRepository;

    beforeEach(() => {
        repository = new UserRepository();
    });

    it("should create a new user", async () => {
        const userData: CreateUserDto = {
            name: "Test User",
            email: "test@example.com",
        };

        const user = await repository.create(userData);

        expect(user).toHaveProperty("id");
        expect(user.name).toBe(userData.name);
        expect(user.email).toBe(userData.email);
        expect(user).toHaveProperty("createdAt");
        expect(user).toHaveProperty("updatedAt");
    });

    it("should find a user by id", async () => {
        const user = await repository.create({ name: "User 1", email: "user1@example.com" });
        const foundUser = await repository.findById(user.id);

        expect(foundUser).toEqual(user);
    });

    it("should return all users", async () => {
        await repository.create({ name: "User 1", email: "user1@example.com" });
        await repository.create({ name: "User 2", email: "user2@example.com" });

        const users = await repository.findAll();
        expect(users.length).toBe(2);
    });

    it("should update a user", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2023-01-01T00:00:00Z"));
		
        const user = await repository.create({ name: "Old Name", email: "old@example.com" });
		
        jest.setSystemTime(new Date("2023-01-01T00:00:01Z"));
		
        const updatedUser = await repository.update(user.id, { name: "New Name" });

        expect(updatedUser?.name).toBe("New Name");
        expect(updatedUser?.updatedAt).not.toBe(user.updatedAt);
        expect(updatedUser?.updatedAt).toBe("2023-01-01T00:00:01.000Z");
		
        jest.useRealTimers();
    });

    it("should delete a user", async () => {
        const user = await repository.create({ name: "To Delete", email: "delete@example.com" });
        const deleted = await repository.delete(user.id);

        expect(deleted).toBe(true);
        const found = await repository.findById(user.id);
        expect(found).toBeNull();
    });
});

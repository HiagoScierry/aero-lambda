/**
 * Example: testing a Service with a mocked Repository
 *
 * This file shows the recommended pattern for unit testing Services.
 * The Repository is mocked so the test focuses only on the Service logic,
 * without hitting any database or external dependency.
 *
 * To create your own tests:
 *   1. Run: npm run generate route <Name>
 *   2. Duplicate this file replacing User with your entity name
 *   3. Add the specific assertions your business logic requires
 */

import { UserService } from "../../../src/services/UserService";
import { UserRepository } from "../../../src/repositories/UserRepository";
import { User } from "../../../src/core/models/User";

describe("UserService (example)", () => {
    let service: UserService;
    let repository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        // Create a mocked version of the repository — no real data is touched
        repository = new UserRepository() as jest.Mocked<UserRepository>;
        repository.findAll = jest.fn();
        repository.findById = jest.fn();
        repository.create = jest.fn();
        repository.update = jest.fn();
        repository.delete = jest.fn();

        service = new UserService(repository);
    });

    it("returns all users from the repository", async () => {
        const mockUsers: User[] = [
            { id: "1", name: "Ada Lovelace", email: "ada@example.com", createdAt: "", updatedAt: "" },
        ];

        repository.findAll.mockResolvedValue(mockUsers);

        const result = await service.getAllUsers();

        expect(result).toEqual(mockUsers);
        expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it("returns null when user is not found", async () => {
        repository.findById.mockResolvedValue(null);

        const result = await service.getUserById("non-existent-id");

        expect(result).toBeNull();
    });

    it("creates a user and returns it with generated fields", async () => {
        const input = { name: "Alan Turing", email: "alan@example.com" };
        const created: User = { ...input, id: "2", createdAt: "2024-01-01", updatedAt: "2024-01-01" };

        repository.create.mockResolvedValue(created);

        const result = await service.createUser(input);

        expect(result).toEqual(created);
        expect(repository.create).toHaveBeenCalledWith(input);
    });
});

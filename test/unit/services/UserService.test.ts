import { UserService } from "../../../src/services/UserService";
import { UserRepository } from "../../../src/repositories/UserRepository";

describe("UserService", () => {
	let service: UserService;
	let repository: jest.Mocked<UserRepository>;

	beforeEach(() => {
		repository = new UserRepository() as jest.Mocked<UserRepository>;
		repository.findAll = jest.fn();
		repository.findById = jest.fn();
		repository.create = jest.fn();
		repository.update = jest.fn();
		repository.delete = jest.fn();
		
		service = new UserService(repository);
	});

	it("should get all users", async () => {
		const mockUsers = [{ id: "1", name: "User", email: "user@test.com", createdAt: "", updatedAt: "" }];
		repository.findAll.mockResolvedValue(mockUsers);

		const users = await service.getAllUsers();
		expect(users).toEqual(mockUsers);
		expect(repository.findAll).toHaveBeenCalledTimes(1);
	});

	it("should create a user", async () => {
		const userData = { name: "New User", email: "new@test.com" };
		const createdUser = { ...userData, id: "1", createdAt: "", updatedAt: "" };
		repository.create.mockResolvedValue(createdUser);

		const user = await service.createUser(userData);
		expect(user).toEqual(createdUser);
		expect(repository.create).toHaveBeenCalledWith(userData);
	});
});

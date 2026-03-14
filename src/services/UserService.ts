import { UserRepository } from "../repositories/UserRepository";
import { User, CreateUserDto, UpdateUserDto } from "../core/models/User";

export class UserService {
	constructor(private userRepository: UserRepository) {}

	async getAllUsers(): Promise<User[]> {
		return await this.userRepository.findAll();
	}

	async getUserById(id: string): Promise<User | null> {
		return await this.userRepository.findById(id);
	}

	async createUser(data: CreateUserDto): Promise<User> {
		return await this.userRepository.create(data);
	}

	async updateUser(id: string, data: UpdateUserDto): Promise<User | null> {
		return await this.userRepository.update(id, data);
	}

	async deleteUser(id: string): Promise<boolean> {
		return await this.userRepository.delete(id);
	}
}

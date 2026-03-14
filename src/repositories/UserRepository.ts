import { User, CreateUserDto, UpdateUserDto } from "../core/models/User";

export class UserRepository {
    private users: User[] = [];

    async findAll(): Promise<User[]> {
        return [...this.users];
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find((u) => u.id === id) || null;
    }

    async create(data: CreateUserDto): Promise<User> {
        const newUser: User = {
            ...data,
            id: (this.users.length + 1).toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.users.push(newUser);
        return newUser;
    }

    async update(id: string, data: UpdateUserDto): Promise<User | null> {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1) return null;

        const updatedUser = {
            ...this.users[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        this.users[index] = updatedUser;
        return updatedUser;
    }

    async delete(id: string): Promise<boolean> {
        const initialLength = this.users.length;
        this.users = this.users.filter((u) => u.id !== id);
        return this.users.length < initialLength;
    }
}

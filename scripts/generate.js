#!/usr/bin/env node

/**
 * Code generator for boilerplate-api-lambda
 *
 * Usage:
 *   node scripts/generate.js route <Name>      # generates a full CRUD route
 *   node scripts/generate.js handler <TYPE>    # generates an SQS message handler
 *
 * Examples:
 *   node scripts/generate.js route Product
 *   node scripts/generate.js handler ORDER_PLACED
 */

const fs = require("fs");
const path = require("path");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const root = path.resolve(__dirname, "..");

function write(filePath, content) {
    const abs = path.join(root, filePath);
    const dir = path.dirname(abs);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(abs)) {
        console.error(`  ✗ already exists — skipped: ${filePath}`);
        return;
    }
    fs.writeFileSync(abs, content, "utf8");
    console.log(`  ✔ created: ${filePath}`);
}

function inject(filePath, marker, line) {
    const abs = path.join(root, filePath);
    const src = fs.readFileSync(abs, "utf8");
    if (src.includes(line.trim())) {
        console.log(`  ~ already registered: ${filePath}`);
        return;
    }
    const updated = src.replace(marker, `${marker}\n${line}`);
    fs.writeFileSync(abs, updated, "utf8");
    console.log(`  ✔ updated: ${filePath}`);
}

function pascal(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function camel(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

// ─── Route generator ──────────────────────────────────────────────────────────

function generateRoute(name) {
    const Name = pascal(name);       // Product
    const nameLower = camel(name);   // product
    const namePlural = `${nameLower}s`; // products

    // src/core/models/<Name>.ts
    write(`src/core/models/${Name}.ts`, `export interface ${Name} {
    id: string;
    // TODO: add your fields here
    createdAt: string;
    updatedAt: string;
}

export type Create${Name}Dto = Omit<${Name}, "id" | "createdAt" | "updatedAt">;
export type Update${Name}Dto = Partial<Create${Name}Dto>;
`);

    // src/repositories/<Name>Repository.ts
    write(`src/repositories/${Name}Repository.ts`, `import { ${Name}, Create${Name}Dto, Update${Name}Dto } from "../core/models/${Name}";

export class ${Name}Repository {
    private items: ${Name}[] = [];

    async findAll(): Promise<${Name}[]> {
        return [...this.items];
    }

    async findById(id: string): Promise<${Name} | null> {
        return this.items.find((i) => i.id === id) || null;
    }

    async create(data: Create${Name}Dto): Promise<${Name}> {
        const item: ${Name} = {
            ...data,
            id: (this.items.length + 1).toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.items.push(item);
        return item;
    }

    async update(id: string, data: Update${Name}Dto): Promise<${Name} | null> {
        const index = this.items.findIndex((i) => i.id === id);
        if (index === -1) return null;

        const updated = { ...this.items[index], ...data, updatedAt: new Date().toISOString() };
        this.items[index] = updated;
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        const before = this.items.length;
        this.items = this.items.filter((i) => i.id !== id);
        return this.items.length < before;
    }
}
`);

    // src/services/<Name>Service.ts
    write(`src/services/${Name}Service.ts`, `import { ${Name}Repository } from "../repositories/${Name}Repository";
import { ${Name}, Create${Name}Dto, Update${Name}Dto } from "../core/models/${Name}";

export class ${Name}Service {
    constructor(private repository: ${Name}Repository) {}

    async getAll(): Promise<${Name}[]> {
        return this.repository.findAll();
    }

    async getById(id: string): Promise<${Name} | null> {
        return this.repository.findById(id);
    }

    async create(data: Create${Name}Dto): Promise<${Name}> {
        return this.repository.create(data);
    }

    async update(id: string, data: Update${Name}Dto): Promise<${Name} | null> {
        return this.repository.update(id, data);
    }

    async delete(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }
}
`);

    // src/routes/<name>Routes.ts
    write(`src/routes/${nameLower}Routes.ts`, `import { Router } from "../core/Router";
import { ${Name}Service } from "../services/${Name}Service";
import { ${Name}Repository } from "../repositories/${Name}Repository";
import { ResponseBuilder } from "../utils/ResponseBuilder";

export function ${nameLower}Routes(router: Router): void {
    const service = new ${Name}Service(new ${Name}Repository());

    router.get("/${namePlural}", async () => {
        const items = await service.getAll();
        return ResponseBuilder.success(items);
    });

    router.get("/${namePlural}/:id", async (event) => {
        const id = event.pathParameters?.id;
        if (!id) return ResponseBuilder.badRequest("Missing id");

        const item = await service.getById(id);
        if (!item) return ResponseBuilder.notFound("${Name} not found");

        return ResponseBuilder.success(item);
    });

    router.post("/${namePlural}", async (event) => {
        try {
            const body = event.body ? JSON.parse(event.body) : null;
            if (!body) return ResponseBuilder.badRequest("Missing body");

            const item = await service.create(body);
            return ResponseBuilder.created(item);
        } catch {
            return ResponseBuilder.badRequest("Invalid JSON body");
        }
    });

    router.put("/${namePlural}/:id", async (event) => {
        try {
            const id = event.pathParameters?.id;
            if (!id) return ResponseBuilder.badRequest("Missing id");

            const body = event.body ? JSON.parse(event.body) : null;
            if (!body) return ResponseBuilder.badRequest("Missing body");

            const item = await service.update(id, body);
            if (!item) return ResponseBuilder.notFound("${Name} not found");

            return ResponseBuilder.success(item);
        } catch {
            return ResponseBuilder.badRequest("Invalid JSON body");
        }
    });

    router.delete("/${namePlural}/:id", async (event) => {
        const id = event.pathParameters?.id;
        if (!id) return ResponseBuilder.badRequest("Missing id");

        const deleted = await service.delete(id);
        if (!deleted) return ResponseBuilder.notFound("${Name} not found");

        return ResponseBuilder.success({ message: "${Name} deleted successfully" });
    });
}
`);

    // test/unit/services/<Name>Service.test.ts
    write(`test/unit/services/${Name}Service.test.ts`, `import { ${Name}Service } from "../../../src/services/${Name}Service";
import { ${Name}Repository } from "../../../src/repositories/${Name}Repository";
import { ${Name}, Create${Name}Dto } from "../../../src/core/models/${Name}";

describe("${Name}Service", () => {
    let service: ${Name}Service;
    let repository: jest.Mocked<${Name}Repository>;

    beforeEach(() => {
        repository = new ${Name}Repository() as jest.Mocked<${Name}Repository>;
        repository.findAll = jest.fn();
        repository.findById = jest.fn();
        repository.create = jest.fn();
        repository.update = jest.fn();
        repository.delete = jest.fn();

        service = new ${Name}Service(repository);
    });

    it("should get all items", async () => {
        repository.findAll.mockResolvedValue([]);
        const result = await service.getAll();
        expect(result).toEqual([]);
        expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should create an item", async () => {
        const data = {} as Create${Name}Dto; // TODO: replace with real fields
        const created = { id: "1", createdAt: "", updatedAt: "" } as ${Name};
        repository.create.mockResolvedValue(created);

        const result = await service.create(data);
        expect(result).toEqual(created);
        expect(repository.create).toHaveBeenCalledWith(data);
    });
});
`);

    // test/unit/repositories/<Name>Repository.test.ts
    write(`test/unit/repositories/${Name}Repository.test.ts`, `import { ${Name}Repository } from "../../../src/repositories/${Name}Repository";

describe("${Name}Repository", () => {
    let repository: ${Name}Repository;

    beforeEach(() => {
        repository = new ${Name}Repository();
    });

    it("should create an item", async () => {
        const data = {} as never; // TODO: replace with real Create${Name}Dto fields
        const item = await repository.create(data);

        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("createdAt");
        expect(item).toHaveProperty("updatedAt");
    });

    it("should find an item by id", async () => {
        const item = await repository.create({} as never);
        const found = await repository.findById(item.id);
        expect(found).toEqual(item);
    });

    it("should return null for unknown id", async () => {
        const found = await repository.findById("non-existent");
        expect(found).toBeNull();
    });

    it("should delete an item", async () => {
        const item = await repository.create({} as never);
        const deleted = await repository.delete(item.id);
        expect(deleted).toBe(true);

        const found = await repository.findById(item.id);
        expect(found).toBeNull();
    });
});
`);

    // Register route in src/routes/index.ts
    const importLine = `import { ${nameLower}Routes } from "./${nameLower}Routes";`;
    const callLine = `    ${nameLower}Routes(router);`;

    const indexAbs = path.join(root, "src/routes/index.ts");
    let indexSrc = fs.readFileSync(indexAbs, "utf8");

    if (!indexSrc.includes(importLine)) {
        // Insert import before the first existing import block ends (after last import line)
        indexSrc = indexSrc.replace(
            /^(import .+\n)+/m,
            (match) => `${match}${importLine}\n`
        );
    }

    if (!indexSrc.includes(callLine.trim())) {
        indexSrc = indexSrc.replace(
            /(\s+\w+Routes\(router\);)\n}/,
            (_, last) => `${last}\n${callLine}\n}`
        );
    }

    fs.writeFileSync(indexAbs, indexSrc, "utf8");
    console.log(`  ✔ registered in src/routes/index.ts`);
}

// ─── Handler generator ────────────────────────────────────────────────────────

function generateHandler(messageType) {
    const TYPE = messageType.toUpperCase();

    // Convert SNAKE_CASE to camelCase for the function name
    const handlerName =
        TYPE.toLowerCase()
            .split("_")
            .map((part, i) => (i === 0 ? part : pascal(part)))
            .join("") + "Handler";

    const fileName = TYPE.toLowerCase().replace(/_/g, "-") + ".handler";

    // src/messages/handlers/<type>.handler.ts
    write(`src/messages/handlers/${fileName}.ts`, `import { SQSRecord } from "aws-lambda";
import { Logger } from "../../utils/logger/Logger";

const logger = new Logger("${TYPE}");

interface ${pascal(handlerName.replace("Handler", ""))}Message {
    type: "${TYPE}";
    // TODO: add your message fields here
}

export async function ${handlerName}(
    body: ${pascal(handlerName.replace("Handler", ""))}Message,
    record: SQSRecord
): Promise<void> {
    logger.info("Processing ${TYPE}", { messageId: record.messageId, body });

    // TODO: implement handler logic
}
`);

    // test/unit/messages/<type>.handler.test.ts
    write(`test/unit/messages/${fileName}.test.ts`, `import { ${handlerName} } from "../../../src/messages/handlers/${fileName}";
import { SQSRecord } from "aws-lambda";

const makeSQSRecord = (body: unknown): SQSRecord =>
    ({
        messageId: "msg-test",
        body: JSON.stringify(body),
        receiptHandle: "handle",
        attributes: {} as never,
        messageAttributes: {},
        md5OfBody: "",
        eventSource: "aws:sqs",
        eventSourceARN: "arn:aws:sqs:us-east-1:123456789:test-queue",
        awsRegion: "us-east-1",
    }) as SQSRecord;

describe("${handlerName}", () => {
    it("should process ${TYPE} without throwing", async () => {
        const body = { type: "${TYPE}" as const };
        await expect(${handlerName}(body, makeSQSRecord(body))).resolves.toBeUndefined();
    });
});
`);

    // Register in src/messages/index.ts
    const importLine = `import { ${handlerName} } from "./handlers/${fileName}";`;
    const callLine = `    processor.register<Parameters<typeof ${handlerName}>[0]>("${TYPE}", ${handlerName});`;

    const indexAbs = path.join(root, "src/messages/index.ts");
    let indexSrc = fs.readFileSync(indexAbs, "utf8");

    if (!indexSrc.includes(importLine)) {
        indexSrc = importLine + "\n" + indexSrc;
    }

    if (!indexSrc.includes(callLine.trim())) {
        indexSrc = indexSrc.replace(
            "    processor.register(\"*\"",
            `    ${callLine.trim()}\n\n    processor.register("*"`
        );
    }

    fs.writeFileSync(indexAbs, indexSrc, "utf8");
    console.log(`  ✔ registered in src/messages/index.ts`);
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const [, , type, name] = process.argv;

if (!type || !name) {
    console.error(`
Usage:
  node scripts/generate.js route <Name>      # full CRUD route
  node scripts/generate.js handler <TYPE>    # SQS message handler

Examples:
  node scripts/generate.js route Product
  node scripts/generate.js handler ORDER_PLACED
`);
    process.exit(1);
}

console.log(`\nGenerating ${type}: ${name}\n`);

if (type === "route") {
    generateRoute(name);
} else if (type === "handler") {
    generateHandler(name);
} else {
    console.error(`Unknown type: "${type}". Use "route" or "handler".`);
    process.exit(1);
}

console.log("\nDone.\n");

#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ─── Colors ───────────────────────────────────────────────────────────────────

const c = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    green: "\x1b[32m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    gray: "\x1b[90m",
};

const log = {
    info: (msg) => console.log(`  ${c.cyan}→${c.reset} ${msg}`),
    success: (msg) => console.log(`  ${c.green}✔${c.reset} ${msg}`),
    warn: (msg) => console.log(`  ${c.yellow}!${c.reset} ${msg}`),
    error: (msg) => console.error(`  ${c.red}✗${c.reset} ${msg}`),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function replacePlaceholders(filePath, projectName) {
    const content = fs.readFileSync(filePath, "utf8");
    const replaced = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
    fs.writeFileSync(filePath, replaced, "utf8");
}

function isValidName(name) {
    return /^[a-z0-9][a-z0-9\-_]*$/.test(name);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const projectName = process.argv[2];

console.log();
console.log(`${c.bold}  Aerolambda${c.reset} ${c.gray}— AWS Lambda Boilerplate${c.reset}`);
console.log();

if (!projectName) {
    log.error("Missing project name.");
    console.log();
    console.log(`  Usage: ${c.cyan}npx create-aerolambda${c.reset} ${c.yellow}<project-name>${c.reset}`);
    console.log();
    process.exit(1);
}

if (!isValidName(projectName)) {
    log.error(`Invalid project name "${projectName}".`);
    console.log(`  ${c.gray}Use only lowercase letters, numbers, hyphens and underscores.${c.reset}`);
    console.log();
    process.exit(1);
}

const dest = path.resolve(process.cwd(), projectName);

if (fs.existsSync(dest)) {
    log.error(`Directory "${projectName}" already exists.`);
    console.log();
    process.exit(1);
}

const templateDir = path.resolve(__dirname, "../template");

// ─── Copy template ────────────────────────────────────────────────────────────

log.info(`Creating project ${c.bold}${projectName}${c.reset}...`);
copyDir(templateDir, dest);
log.success("Template copied.");

// ─── Replace placeholders ─────────────────────────────────────────────────────

const filesToProcess = [
    path.join(dest, "package.json"),
    path.join(dest, "serverless.yml"),
];

for (const file of filesToProcess) {
    if (fs.existsSync(file)) {
        replacePlaceholders(file, projectName);
    }
}

log.success("Project name applied.");

// ─── Install dependencies ─────────────────────────────────────────────────────

log.info("Installing dependencies...");

try {
    execSync("npm install", { cwd: dest, stdio: "inherit" });
    log.success("Dependencies installed.");
} catch {
    log.warn("npm install failed. Run it manually inside the project folder.");
}

// ─── Done ─────────────────────────────────────────────────────────────────────

console.log();
console.log(`  ${c.green}${c.bold}Project created successfully!${c.reset}`);
console.log();
console.log(`  ${c.gray}Next steps:${c.reset}`);
console.log();
console.log(`    ${c.cyan}cd ${projectName}${c.reset}`);
console.log(`    ${c.cyan}npm run offline${c.reset}          ${c.gray}# start local HTTP server${c.reset}`);
console.log(`    ${c.cyan}npm run offline:sqs${c.reset}      ${c.gray}# start with SQS (requires Docker)${c.reset}`);
console.log(`    ${c.cyan}npm run generate route${c.reset}   ${c.gray}# generate a new CRUD route${c.reset}`);
console.log(`    ${c.cyan}npm run generate handler${c.reset} ${c.gray}# generate a new SQS handler${c.reset}`);
console.log(`    ${c.cyan}npm run deploy${c.reset}           ${c.gray}# deploy to AWS${c.reset}`);
console.log();

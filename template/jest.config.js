module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src", "<rootDir>/test"],
	testMatch: ["**/*.test.ts"],
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
	moduleFileExtensions: ["ts", "js", "json", "node"],
	collectCoverage: true,
	coverageDirectory: "coverage",
	coveragePathIgnorePatterns: ["/node_modules/", "/test/"],
};

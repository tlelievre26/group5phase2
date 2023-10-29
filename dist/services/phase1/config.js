"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GITHUB_TOKEN = void 0;
if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN environment variable is required");
}
exports.GITHUB_TOKEN = process.env.GITHUB_TOKEN;
//# sourceMappingURL=config.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//Some of our imports need the environment variables to be already defined
const express_1 = __importDefault(require("express"));
const api_routes_1 = __importDefault(require("./routes/api_routes"));
const token_auth_1 = __importDefault(require("./middleware/token_auth"));
const logger_1 = __importDefault(require("./utils/logger")); //Get logger in this main file
//MAIN FILE
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json({ limit: '5mb' }));
app.use(token_auth_1.default); //Tells it to check the token auth function before passing the request to the endpoint
app.use(api_routes_1.default); //Tells it to use the routes defined in the router in our api_routes.ts file
app.listen(PORT, () => {
    logger_1.default.info(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const api_routes_1 = __importDefault(require("./routes/api_routes"));
const token_auth_1 = __importDefault(require("./middleware/token_auth"));
//MAIN FILE
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(token_auth_1.default); //Tells it to check the token auth function before passing the request to the endpoint
app.use(api_routes_1.default); //Tells it to use the routes defined in the router in our api_routes.ts file
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map
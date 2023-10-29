"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pkg_ctrl = __importStar(require("../controllers/pkg_controller"));
const utils_ctrl = __importStar(require("../controllers/util_controller"));
//This file contains definitions for all of our API endpoints
//They call functions organized by controllers
//Built using chatGPT
const api_router = express_1.default.Router();
// Endpoint to get a list of packages
api_router.post('/packages', pkg_ctrl.getPackageQuery);
// Endpoint to reset the registry
api_router.delete('/reset', utils_ctrl.hardReset);
// Endpoint to retrieve a specific package by ID
api_router.get('/package/:id', pkg_ctrl.getPkgById);
// Endpoint to update a package by ID
api_router.put('/package/:id', pkg_ctrl.updatePkgById);
// Endpoint to delete a package by ID
api_router.delete('/package/:id', pkg_ctrl.deletePkgById);
// Endpoint to create a new package
api_router.post('/package', pkg_ctrl.createPkg);
// Endpoint to get the rating of a package by ID
api_router.get('/package/:id/rate', pkg_ctrl.createPkg);
// Endpoint to authenticate and obtain an access token
api_router.put('/authenticate', utils_ctrl.getAuthToken);
// Endpoint to get the history of a package by name
api_router.get('/package/byName/:name', pkg_ctrl.getPkgHistoryByName);
// Endpoint to delete all versions of a package by name
api_router.delete('/package/byName/:name', pkg_ctrl.deletePkgByName);
// Endpoint to get packages based on a regular expression
api_router.post('/package/byRegEx', pkg_ctrl.getPkgByRegex);
exports.default = api_router;
//# sourceMappingURL=api_routes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pkg_controller_1 = require("../controllers/pkg_controller");
const data_controller_1 = require("../controllers/data_controller");
const util_controller_1 = require("../controllers/util_controller");
//This file contains definitions for all of our API endpoints
//They call functions organized by controllers
//Built using chatGPT
const api_router = express_1.default.Router();
const pkgUploader = new pkg_controller_1.PackageUploader();
const pkgDataManager = new data_controller_1.PkgDataManager();
const utilsCtrl = new util_controller_1.UtilsController();
// Endpoint to get a list of packages
api_router.post('/packages', pkgDataManager.getPackageQuery);
// Endpoint to reset the registry
api_router.delete('/reset', utilsCtrl.hardReset);
// Endpoint to retrieve a specific package by ID
api_router.get('/package/:id', pkgDataManager.getPkgById);
// Endpoint to update a package by ID
api_router.put('/package/:id', pkgUploader.updatePkgById);
// Endpoint to delete a package by ID
api_router.delete('/package/:id', pkgUploader.deletePkgByID);
// Endpoint to create a new package
api_router.post('/package', pkgUploader.createPkg);
// Endpoint to get the rating of a package by ID
api_router.get('/package/:id/rate', pkgDataManager.ratePkgById);
// Endpoint to authenticate and obtain an access token
api_router.put('/authenticate', utilsCtrl.getAuthToken);
// Endpoint to get the history of a package by name
api_router.get('/package/byName/:name', pkgDataManager.getPkgHistoryByName);
// Endpoint to delete all versions of a package by name
api_router.delete('/package/byName/:name', pkgUploader.deletePkgByName);
// Endpoint to get packages based on a regular expression
api_router.post('/package/byRegEx', pkgDataManager.getPkgByRegex);
exports.default = api_router;
//# sourceMappingURL=api_routes.js.map
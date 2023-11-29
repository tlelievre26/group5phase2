import express from 'express';
import { PackageUploader } from '../controllers/pkg_controller';
import { PkgDataManager } from '../controllers/data_controller';
import { UtilsController } from '../controllers/util_controller';

//This file contains definitions for all of our API endpoints
//They call functions organized by controllers

//Built using chatGPT

const api_router = express.Router();
const pkgUploader = new PackageUploader();
const pkgDataManager = new PkgDataManager();
const utilsCtrl = new UtilsController();

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




export default api_router;
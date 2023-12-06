import express from 'express';
import { PackageUploader } from '../controllers/pkg_controller';
import { PkgDataManager } from '../controllers/data_controller';
import { UtilsController } from '../controllers/util_controller';
import checkForAuthToken from '../middleware/token_auth';

//This file contains definitions for all of our API endpoints
//They call functions organized by controllers

//Built using chatGPT

const api_router = express.Router();
const pkgUploader = new PackageUploader();
const pkgDataManager = new PkgDataManager();
const utilsCtrl = new UtilsController();

// Endpoint to get a list of packages
api_router.post('/packages', checkForAuthToken, pkgDataManager.getPackageQuery);
//Search bar

// Endpoint to reset the registry
api_router.delete('/reset', checkForAuthToken, utilsCtrl.hardReset);
//Button labelled reset

// Endpoint to retrieve a specific package by ID
api_router.get('/package/:id', checkForAuthToken, pkgDataManager.getPkgById);
//Download button (on each package)

// Endpoint to update a package by ID
api_router.put('/package/:id', checkForAuthToken, pkgUploader.updatePkgById);
//Update button that overwrites old content (on each package)

// Endpoint to delete a package by ID
api_router.delete('/package/:id', checkForAuthToken, pkgUploader.deletePkgByID);
//Delete button (on each package)

// Endpoint to create a new package
api_router.post('/package', checkForAuthToken, pkgUploader.createPkg);
//Uploading a package

// Endpoint to get the rating of a package by ID
api_router.get('/package/:id/rate', checkForAuthToken, pkgDataManager.ratePkgById);
//Show package rating (on each package)

// Endpoint to authenticate and obtain an access token
api_router.put('/authenticate', utilsCtrl.getAuthToken);
//ONLY ROUTE THAT DOESNT USE MIDDLEWARE
//Not baseline

// Endpoint to get packages based on a regular expression
api_router.post('/package/byRegEx', checkForAuthToken, pkgDataManager.getPkgByRegex);
//Search bar option

//Endpoint to create a new user in our system
api_router.post('/user', checkForAuthToken, utilsCtrl.registerUser)
//Not baseline

//Endpoint to delete an existing user in our system
api_router.delete('/user/:username', checkForAuthToken, utilsCtrl.deleteUser)
//Not baseline



export default api_router;
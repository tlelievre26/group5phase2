import express from 'express';
import * as pkg_ctrl from '../controllers/pkg_controller';
import * as utils_ctrl from '../controllers/util_controller';

//This file contains definitions for all of our API endpoints
//They call functions organized by controllers

//Built using chatGPT

const api_router = express.Router();

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


export default api_router;
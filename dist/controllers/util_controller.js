"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthToken = exports.hardReset = void 0;
//This is our controller for all of our non-package related endpoints
const hardReset = (req, res) => {
    //Reset the registry to a system default state.
    const auth_token = req.params.auth_token;
    var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    if (response_code == 200) {
        res.status(200).send("Successfully reset registry to default state");
    }
    else if (response_code == 400) {
        res.status(400).send("Invalid auth token");
    }
    else if (response_code == 401) {
        res.status(401).send("You do not have permission to reset the registry");
    }
};
exports.hardReset = hardReset;
const getAuthToken = (req, res) => {
    //Create an access token.
    const req_body = req.body;
    var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    if (response_code == 200) {
        res.status(200).send("Successfully created new auth token");
    }
    else if (response_code == 400) {
        res.status(400).send("Invalid or malformed AuthenticationRequest in request body");
    }
    else if (response_code == 401) {
        res.status(401).send("Invalid username/password");
    }
    else if (response_code == 501) {
        res.status(501).send("This system does not support authentication");
    }
    res.send('Access token is obtained');
};
exports.getAuthToken = getAuthToken;
//# sourceMappingURL=util_controller.js.map
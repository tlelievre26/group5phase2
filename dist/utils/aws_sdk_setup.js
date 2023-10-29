"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
//Automatically loads in credentials from local environment variables, or from the IAM role
aws_sdk_1.default.config.getCredentials(function (err) {
    if (err) {
        console.log("Error, failed to load AWS credentials properly");
        console.log("Please ensure credentials are either in the .env file or you have the /.aws/credentials file set up properly");
        console.log(err.stack);
    }
    else if (aws_sdk_1.default.config.credentials !== null && aws_sdk_1.default.config.credentials !== undefined) {
        console.log("Access key:", aws_sdk_1.default.config.credentials.accessKeyId);
    }
});
aws_sdk_1.default.config.update({ region: 'us-east-2' });
const aws_s3 = new aws_sdk_1.default.S3({ apiVersion: '2006-03-01' });
// aws_s3.listBuckets(function(err, data) {
//     if (err) {
//       console.log("Error", err);
//     } else {
//       console.log("Success", data.Buckets);
//     }
//   });
// Call S3 to list the buckets
exports.default = aws_s3;
//# sourceMappingURL=aws_sdk_setup.js.map
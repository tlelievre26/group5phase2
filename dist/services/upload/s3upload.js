"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_setup_1 = __importDefault(require("../../utils/aws_sdk_setup"));
function uploadToS3(bucketName, key, uploadBody) {
    return __awaiter(this, void 0, void 0, function* () {
        const uploadParams = {
            Bucket: bucketName,
            Key: key,
            Body: uploadBody
        };
        aws_sdk_setup_1.default.upload(uploadParams, function (err, data) {
            if (err) {
                console.error('Error uploading file to S3:', err);
            }
            else {
                console.log('File uploaded successfully. S3 Location:', data.Location);
            }
        });
    });
}
exports.default = uploadToS3;
// // Example usage
// const bucketName = 'my-bucket';
// const key = 'path/to/my/file.zip';
// const base64Zip = 'UEsDBAoAAAAA...'; // base64-encoded zip folder
// await saveToS3(bucketName, key, base64Zip);
//# sourceMappingURL=s3upload.js.map
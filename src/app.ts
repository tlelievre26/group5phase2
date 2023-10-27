import express from 'express';
import api_router from './routes/api_routes';
import verifyAuthToken from './middleware/token_auth';
import dotenv from "dotenv";
import logger from "./utils/logger"; //Get logger in this main file

dotenv.config(); //Load in environment variables from .env file

import aws_s3 from "./utils/aws_sdk_setup"


//MAIN FILE

aws_s3.listBuckets(function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.Buckets);
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(verifyAuthToken); //Tells it to check the token auth function before passing the request to the endpoint
app.use(api_router); //Tells it to use the routes defined in the router in our api_routes.ts file

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

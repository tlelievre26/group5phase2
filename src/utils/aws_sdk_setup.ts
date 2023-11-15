import AWS from "aws-sdk"
import logger from  "./logger"

//Automatically loads in credentials from local environment variables, or from the IAM role

AWS.config.getCredentials(function(err) { //Checks AWS 
    if (err) {
      logger.error("Error, failed to load AWS credentials properly")
      logger.error("Please ensure credentials are either in the .env file or you have the /.aws/credentials file set up properly")
      logger.error(err.stack) 
    }
  
    else if ( AWS.config.credentials !== null &&  AWS.config.credentials !== undefined ){
      logger.debug("Access key:", AWS.config.credentials.accessKeyId);
    }
  });


AWS.config.update({region: 'us-east-2'});

const aws_s3 = new AWS.S3({apiVersion: '2006-03-01'});


// Call S3 to list the buckets


export default aws_s3;
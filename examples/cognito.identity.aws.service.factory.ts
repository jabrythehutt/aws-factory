import {AwsServiceFactory} from "../src";
import {CognitoIdentityCredentials} from "aws-sdk/lib/credentials/cognito_identity_credentials";

export class CognitoIdentityAwsServiceFactory extends AwsServiceFactory<CognitoIdentityCredentials> {
}

import {AwsServiceFactory} from "./aws.service.factory";
import {CognitoIdentityCredentials} from "aws-sdk/lib/credentials/cognito_identity_credentials";
import {AuthenticatedProfileRequest} from "./authenticated.profile.request";
import {GetIdInput} from "aws-sdk/clients/cognitoidentity";

export class CognitoIdentityServiceFactory extends AwsServiceFactory<CognitoIdentityCredentials> {

    switchToAuthenticatedProfile(request: AuthenticatedProfileRequest): Promise<void> {
        const params = this.credentials.params as GetIdInput;
        const newLoginParams = {[request.providerName]: request.token};
        params.Logins = {
            ...params.Logins,
            ...newLoginParams
        };
        this.credentials.expired = true;
        this.clearServicesCache();
        return this.authenticate();
    }

    signOut() {
        this.credentials.clearCachedId();
        this.clearServicesCache();
    }
}

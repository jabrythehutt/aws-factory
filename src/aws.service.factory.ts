import {Service, ServiceConfigurationOptions} from "aws-sdk/lib/service";
import {ClassType} from "./class.type";
import {Credentials} from "aws-sdk/lib/credentials";
import {awsServiceIdentifierKey} from "./aws.service.identifier.key";
import {Defer} from "./defer";

export class AwsServiceFactory<C extends Credentials> {

    servicesCache: {[serviceIdentifier: string]: Service};
    _credentials: C;
    credentialsDefer: Defer<void>;
    constructor(credentials?: C) {
        this.credentialsDefer = new Defer<void>();
        this.credentials = credentials;
    }

    get credentials(): C {
        return this._credentials;
    }

    set credentials(credentials: C) {
        this.clearServicesCache();
        this._credentials = credentials;
        if (credentials) {
            this.credentialsDefer.resolve();
        } else {
            this.credentialsDefer = new Defer<void>();
        }
    }

    async authenticate(): Promise<void> {
        await this.credentialsDefer.promise;
        return this.credentials.getPromise();
    }

    createService<S extends Service, O extends ServiceConfigurationOptions>(type: ClassType<S>, config?: O): S {
        config = config || {} as O;
        config.credentials = this.credentials;
        return new type(config);
    }

    clearServicesCache() {
        this.servicesCache = {};
    }

    getServiceIdentifier<S extends Service>(serviceType: ClassType<S>): string {
        return serviceType[awsServiceIdentifierKey];
    }

    async getService<O extends ServiceConfigurationOptions, S extends Service>(type: ClassType<S>,
                                                                               config?: O): Promise<S> {
        const serviceName = this.getServiceIdentifier(type);
        const defaultServiceGenerator = () => {
            return this.createService(type, config);
        };
        return this.findOrCreateServiceInstance(serviceName, defaultServiceGenerator);
    }

    async findOrCreateServiceInstance<O extends ServiceConfigurationOptions, S extends Service>(
        serviceName: string, serviceGenerator: () => S): Promise<S> {
        await this.authenticate();
        let instance = this.servicesCache[serviceName] as S;
        if (!instance) {
            instance = serviceGenerator();
            this.servicesCache[serviceName] = instance;
        }
        return instance;
    }

}

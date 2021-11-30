import {should} from "chai";
import {Credentials} from "aws-sdk";
import {AwsServiceFactory} from "./aws.service.factory";
import {Service} from "aws-sdk/lib/service";
import S3 from "aws-sdk/clients/s3";
import DynamoDB from "aws-sdk/clients/dynamodb";
import SES from "aws-sdk/clients/ses";
import Lambda from "aws-sdk/clients/lambda";
import {ClassType} from "./class.type";
import SNS from "aws-sdk/clients/sns";
import STS from "aws-sdk/clients/sts";
import Kinesis from "aws-sdk/clients/kinesis";
import EC2 from "aws-sdk/clients/ec2";
import APIGateway from "aws-sdk/clients/apigateway";
import {awsServiceIdentifierKey} from "./aws.service.identifier.key";

let awsServiceFactory: AwsServiceFactory<Credentials>;
const serviceClasses = [S3, DynamoDB, EC2, APIGateway, Kinesis, SES, Lambda, SNS, STS] as ClassType<Service>[];

async function sleep(period: number) {
    return new Promise(resolve => {
        setTimeout(resolve, period);
    });
}

interface FactoryGenerator {
    name: string;
    factory: () => Promise<AwsServiceFactory<Credentials>>;
}

const credentialScenarios: FactoryGenerator[] = [
    // Credentials available immediately
    {
        name: "immediate",
        factory: async () => {
            return new AwsServiceFactory(new Credentials({accessKeyId: "foo", secretAccessKey: "bar"}));
        },
    },
    // Credentials available after a fixed period of time
    {
        name: "delayed",
        factory: async () => {
                const awsFactory = new AwsServiceFactory();
                const insertCredentials = async () => {
                    await sleep(500);
                    awsFactory.credentials = new Credentials({accessKeyId: "foo", secretAccessKey: "bar"});
                };
                insertCredentials();
                return awsFactory;
            }

    }

];

describe("AWS factory", () => {

    before("Initialise chai", () => {
        should();
    });

    for (const scenario of credentialScenarios) {
        describe(`Factory with ${scenario.name} credentials`, () => {

            beforeEach("Initialise an AWS service factory",  async () => {
                awsServiceFactory = await scenario.factory();
            });

            for (const serviceClass of serviceClasses) {
                const serviceIdentifier = serviceClass[awsServiceIdentifierKey];
                it(`Should find a non-empty service identifier`, () => {
                    serviceIdentifier.should.be.a("string", "Service identifier should be a string");
                    serviceIdentifier.should.have.length.greaterThan(0, "Service identifier should not be empty");
                });

                it(`Should create a new ${serviceIdentifier} service instance`, () => {
                    const serviceInstance = awsServiceFactory.createService(serviceClass);
                    serviceInstance.should.be.an.instanceOf(serviceClass,
                        `Should have created a new ${serviceIdentifier} instance`);
                });
            }

            it(`Should only instantiate a service once`, async () => {
                let instanceCount = 0;
                const countingServiceGenerator = () => {
                    instanceCount ++;
                    return new S3();
                };
                const identifier = "foo";
                await awsServiceFactory.findOrCreateServiceInstance(identifier,
                    countingServiceGenerator);
                await awsServiceFactory.findOrCreateServiceInstance(identifier,
                    countingServiceGenerator);
                instanceCount.should.equal(1, "Should have cached the first instance");
            });

            it("Should instantiate a new service when the cache is cleared", async () => {
                let instanceCount = 0;
                const countingServiceGenerator = () => {
                    instanceCount++;
                    return new S3();
                };
                const identifier = "foo";
                await awsServiceFactory.findOrCreateServiceInstance(identifier,
                    countingServiceGenerator);
                awsServiceFactory.clearServicesCache();
                await awsServiceFactory.findOrCreateServiceInstance(identifier,
                    countingServiceGenerator);
                instanceCount.should.equal(2, "Should have generated another instance after the cache was cleared");

            });

            it(`Should get a service instance after resolving credentials`, async () => {
                const serviceInstance = await awsServiceFactory.getService(S3);
                serviceInstance.should.be.an.instanceOf(S3,
                    `Should have created an S3 instance after resolving credentials`);
            });

        });

    }

});

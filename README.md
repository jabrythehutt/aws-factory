[![CircleCI](https://circleci.com/gh/djabry/aws-factory.svg?style=svg&circle-token=c8b8f01bb58ebe95adb9cfdba94671a2b6469d66)](https://circleci.com/gh/djabry/aws-factory)
# AWS factory
A library for simplifying your authentication and class instantiation logic when working with the [AWS Javascript SDK](https://aws.amazon.com/sdk-for-node-js/).

## Why?
Many of the projects I've worked on involved a step requiring a user to authenticate prior to accessing AWS resources. I found that writing a centralised utility for instantiating the various AWS classes after loading the required credentials simplified other dependent parts of my applications by separating concerns.

## How?
1. Install the library:
   ```bash
   npm i @djabry/aws-factory
    ``` 

2. Initialise your factory:
    ```typescript
    import {AwsServiceFactory} from "@djabry/aws-factory";
    const awsFactory = new AwsServiceFactory();
    ```

3. In some part of your application that doesn't care about credentials:
    ```typescript
    import * as S3 from "aws-sdk/clients/s3";

    async function loadThing() {
       const s3 = await awsFactory.getService(S3);
       const data = await s3.getObject({Bucket: "foo", Key: "bar"}).promise();
       return data.Body.toString();
    }

    loadThing().then(thing => console.log("Thing loaded:", thing));
    ```

4. Authenticate later on in some other part of your application:
    ```typescript
    import {Credentials} from "aws-sdk/lib/credentials";
    awsFactory.credentials = new Credentials("foo", "bar");
    ```
    In your console:
    ```bash
    Thing loaded: baz
    ```


## What?
This projects contains some utilities for instantiating AWS classes in a Node/browser environment after a user has successfully authenticated. Service instances are cached so that each dependent part of your application is given the same instance when using the `getService` method.

### Configuration
You can configure the service using the optional second argument of the `getService` method e.g.

```typescript
const s3 = await awsFactory.getService(S3, {apiVersion: '2006-03-01'});
```



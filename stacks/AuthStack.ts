import * as iam from 'aws-cdk-lib/aws-iam';
import { ApiStack } from './ApiStack';
import { StorageStack } from './StorageStack';
import { Cognito, StackContext, use } from 'sst/constructs';

export function AuthStack({ stack, app }: StackContext) {
  const { api } = use(ApiStack);
  const { bucket } = use(StorageStack);

  // Create a Cognito User Pool and Identity Pool
  const auth = new Cognito(stack, 'Auth', {
    login: ['email'],
  });

  auth.attachPermissionsForAuthUsers(stack, [
    // Allow access to the API
    api,
    // Policy granting access to a specific folder in the bucket
    // ${cognito-identity.amazonaws.com:sub} is the authenticated user’s federated identity id (their user id). So a user has access to only their folder within the bucket. This allows us to separate access to our user’s file uploads within the same S3 bucket.
    new iam.PolicyStatement({
      actions: ['s3:*'],
      effect: iam.Effect.ALLOW,
      resources: [
        bucket.bucketArn + '/private/${cognito-identity.amazonaws.com:sub}/*',
      ],
    }),
  ]);

  // Show the auth resources in the output
  stack.addOutputs({
    Region: app.region,
    UserPoolId: auth.userPoolId,
    UserPoolClientId: auth.userPoolClientId,
    IdentityPoolId: auth.cognitoIdentityPoolId,
  });

  return {
    auth,
  };
}

import { SSMClient } from "@aws-sdk/client-ssm";

export const ssm = new SSMClient({
    region: process.env.AWS_REGION || "us-east-1",
});

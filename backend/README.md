# Mass Sc Scanner - Backend

## Deploy AWS lambda

Create user with policies:

- AWSLambdaFullAccess
- AmazonAPIGatewayAdministrator
- AmazonS3FullAccess
- CloudWatchLogsFullAccess
- AWSCloudFormationFullAccess
- IAMFullAccess

## Deploy to Clever Cloud

Set the environment variables.

```env
APP_FOLDER=backend
APP_FOLDER="backend"
CC_RUN_COMMAND="cd backend && npm run start:prod"
DB_URI="mongodb+srv://"
NEW_RELIC_LICENSE_KEY=
PORT="8080"
SC_ADDRESS_SCANNER_BUILDNET="AS12UfKvNapQkEm6AhBvtPo9aWM33f1hjGSsGnfv525xoioBAUj9p"
SC_ADDRESS_SCANNER_MAINNET="AS121YPZJSZAFy4kss95jez1WRF16o4PRq8GE8HyvpHaQYt2spDE2"
SC_ADDRESS_VERIFIER_BUILDNET="AS17FjVRDKqCJpA5KogtjoYJLNw8fE5p1ezFcginNS9sfzEPXpZ6"
SC_ADDRESS_VERIFIER_MAINNET="AS126zKYJS3bH5bkoVSvR6y534iDiZYuUB2R1ZBmB1q2yi8u5GsLC"
```

Select size XS: 1CPU, 1 GB RAM.

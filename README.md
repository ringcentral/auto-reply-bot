
# Auto Reply Bot for RingCentral App [experimental]

A Auto Reply bot for RingCentral app, created with [https://github.com/ringcentral/ringcentral-add-in-framework-js](https://github.com/ringcentral/ringcentral-add-in-framework-js)

When some one talk with you with some keywords you pre-defined with Auto Reply bot, your account will auto reply with your pre-defined reply.

## Screenshots

![ ](imgs/ss2.png)
![ ](imgs/ss3.png)

## Videos

[https://youtu.be/ibs_Fb5OUrk](https://youtu.be/ibs_Fb5OUrk)

## DEV Prerequisites

- Nodejs 8.10+/npm, recommend using [nvm](https://github.com/creationix/nvm) to install nodejs/npm.
- A RingCentral developer account: you need [sign up](https://developers.ringcentral.com/) and apply for the permission to create RingCentral add-in.
- Create an `Bot Add-in` app in RingCentral developer portal,
- Create a AWS account, we will use free AWS dynamodb, and put your aws credentials in `~/.aws/credentials`, check [https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

## Quick start

Let's start it.

```bash

# install dependecies
npm i

# start proxy server, this will make your local bot server can be accessed by RingCentral service
npm run ngrok

# will show
Forwarding                    https://xxxx.ap.ngrok.io -> localhost:6066
# Remember the https://xxxx.ap.ngrok.io, we will use it later
```

then start the test server

```bash
# create env file
cp .env.sample .env
# then edit .env,
# set https://xxxx.ap.ngrok.io as RINGCENTRAL_APP_SERVER
# set glip webhook url copied as STATIC_WEBHOOK

# run local dynamo db, optional
npm run dynamo

# run local dev server
npm start

# run client
npm run c

# then visit https://xxxx.ap.ngrok.io
```

Now login to [https://developers.ringcentral.com](https://developers.ringcentral.com), and create an `Bot add-in` type app with permissions: `ReadAccounts,Team Messaging,Webhoook Subscriptions`, and set `OAuth Redirect URI` to `https://xxxx.ap.ngrok.io/bot/oauth`， and goto Bot menu, add bot, then login to [https://app.devtest.ringcentral.com](https://app.devtest.ringcentral.com), and chat with `Auto Reply bot`.

## Deploy to AWS Lambda

```bash
cp deploy/env.sample.yml deploy/env.yml
cp deploy/serverless.sample.yml deploy/serverless.yml

# then edit deploy/env.yml and deploy/serverless.yml

# deploy
npm run deploy
```

## Bot commands

[doc/command.md](doc/command.md)

## License

MIT

## RingCentral Labs

RingCentral Labs is a program that lets RingCentral engineers, platform product managers and other employees share RingCentral apps they've created with the customer community. RingCentral Labs apps are free to use, but are not official products, and should be considered community projects - these apps are not officially tested or documented. For help on any RingCentral Labs app please consult each project's GitHub Issues message boards - RingCentral support is not available for these applications.

# Streetlives Web

Streetlives is a community-built platform for enabling people who are homeless or in poverty to easily find, rate and recommend social services across New York City.

This repository contains the Streetlives web application, which provides an interface for accessing and interacting with the Streetlives data.

The app consists of several parts (some may be split into their own apps/repos in the future):

* GoGetta - the first, experimental version of the main user-facing app. Can be used to find services, but not yet to rate them nor provide extensive feedback

* The Streetlives Street Team Tool (SSTT), which allows trusted users to update and create data about services

* A comment-gathering tool, used in a pilot with a few service providers in NY looking to gather feedback from their users


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You will find more information on how to perform tasks in the most recent version of their guide [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md).


## Installing

1. Clone the repo:

```bash
$ git clone git@github.com:streetlives/streetlives-web.git
```

2. Install [nvm]([url](https://github.com/nvm-sh/nvm))

3. Install node version 12

```bash
nvm install 12
nvm use 12
```

5. Install the dependencies:

```bash
$ cd streetlives-web
$ nvm install v16.20.2
$ nvm use v16.20.2
$ npm install -g yarn@1.22.19
$ yarn
```

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `npm run deploy`

Deploys the app to the S3 bucket currently used for production.

Should only be done after first running `REACT_APP_API_URL="<API URL>" npm run build`, with "API URL" as the API Gateway URL exposing the Streetlives API in production.

Also, the [AWS CLI](https://aws.amazon.com/cli/) must be set up for this script to run successfully.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

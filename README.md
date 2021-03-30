# Todo Application
> ## Organizing Easier, Improve Your Productivity
[![Github Issues](https://img.shields.io/github/issues/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/issues)
[![Github Forks](https://img.shields.io/github/forks/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/network/members)
[![Github Stars](https://img.shields.io/github/stars/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/stargazers)
[![MIT License](https://img.shields.io/github/license/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/blob/master/LICENSE)

[![Netlify Status](https://api.netlify.com/api/v1/badges/56772f5c-0c69-41e8-a788-69ca591e70ef/deploy-status)](https://app.netlify.com/sites/todoapp-task/deploys)

## Login Freely with OAuth
![Login with OAuth](https://user-images.githubusercontent.com/69080584/112946431-b3d60380-915f-11eb-9bd3-b138fe13cf86.png)

## User Interface
![Todo Application](https://user-images.githubusercontent.com/69080584/112157665-0708fd00-8c1a-11eb-99fb-0f6a5f5cf29f.png)

Todo Application is an **open source** project, completed with highest standard security, which is easy to use and easy to organize!

## Table of Contents
- [Getting Started](#getting-started)
- [Built With](#built-with)
- [Contributing Guidelines](#contributing-guidelines)
- [Code of Conducts](CODE_OF_CONDUCT.md)
- [Project Roadmaps](https://github.com/stanleyowen/todo-application/projects)
- [Stargazers and Contributors](#stargazers-and-contributors)
- [License](#license)

## Getting Started
1. Download this code<br/>
  There are some several quick start options available:
    - [Fork this repository](https://github.com/stanleyowen/todo-application/fork)
    - Clone this repository, type `https://github.com/stanleyowen/todo-application.git` in command line
    - [Download the latest release](https://github.com/stanleyowen/todo-application/archive/v0.4.3.zip)
2. Install All the Dependencies
    - Open your terminal
    - Change directory `cd` to both `client` and `server` folder
    - Type `npm install` in commmand line
3. Create `.env` file
    - Inside `client` directory, create a new file named `.env` which stores about sensitive information, which is `REACT_APP_SERVER_URL` and `REACT_APP_VERSION`
      - `REACT_APP_SERVER_URL` stores the server side URL
      - `REACT_APP_VERSION` stores the Todo Application's current version<br /><br />
          ```
          REACT_APP_SERVER_URL    = http://localhost:5000
          REACT_APP_VERSION       = $npm_package_version
          ```

    - Inside `server` directory, create a new file named `.env` which stores about sensitive information, which is `ATLAS_URI`, `SECRET_KEY`, and `TOKEN_KEY`
      - `ATLAS_URI` stores the Database URI provided by [MongoDB](https://www.mongodb.com/2)
      - `JWT_SECRET` stores JWT secret (Make it secret and hard to guess)
      - `SECRET_KEY` stores secret key for encyption method (Approximately 32 chars)
      - `CLIENT_URL` stores the whitelisted domain for `CORS` Policy
      - `NODE_ENV` stores the status of an application, whether it is in `development` or `production` status.
      - `GITHUB_ID` stores the client id for GitHub OAuth provided by [GitHub OAuth](https://github.com/settings/applications/new)
      - `GITHUB_SECRET` stores the secret key for GitHub OAuth provided by [GitHub OAuth](https://github.com/settings/applications/new)
      - `GITHUB_CALLBACK` stores the callback URL for GitHub OAuth provided by [GitHub OAuth](https://github.com/settings/applications/new)
      - `GOOGLE_ID` stores the client id fot Google OAuth provided by [Google OAuth](https://console.cloud.google.com/)
      - `GOOGLE_SECRET` stores the client secret for Google OAuth provided by [Google OAuth](https://console.cloud.google.com/)
      - `GOOGLE_CALLBACK` stores the callback URL for Google OAuth provided by [Google OAuth](https://console.cloud.google.com/)
      - `MAIL_SERVICE`, `MAIL_EMAIL`, and `MAIL_PASSWORD` are configured for sending email to users<br /><br />
          ```
          ATLAS_URI       = mongodb+srv://<username>:<password>@<port>/<dbname>?retryWrites=true&w=majority
          JWT_SECRET      = YHUIEHN$HOIDFU2^8374C897C4%T843973)X4843C57N8934D29#87N839*4NC07489BC3
          SECRET_KEY      = SpFcG29lKzfx9SxjLRjujaYxzSswhihd
          NODE_ENV        = development
          CLIENT_URL      = http://localhost:3000

          GITHUB_ID       = /* Your GitHub Client ID */
          GITHUB_SECRET   = /* Your GitHub Client Secret */
          GITHUB_CALLBACK = http://localhost:3000/oauth/github
          GOOGLE_ID       = /* Your Google Client ID */
          GOOGLE_SECRET   = /* Your Google Client Secret */
          GOOGLE_CALLBACK = http://localhost:3000/auth/google

          MAIL_SERVICE    = /* Your Email Service Provider */
          MAIL_EMAIL      = /* Your Email Address */
          MAIL_PASSWORD   = /* Your Email Password */
          ```
  4. Run and Compile it
      - In the `client` directory, type `npm start` in command line
      - In the `server` diireactory, type `nodemon` in command line

## Built With
  1. MongoDB Atlas Database
  2. Express JS
  3. React JS
  4. Node JS

## Contributing Guidelines
  Before that, we would like to say thank you for your willing to contribute to Todo Application! Please take a minute to read [contributing guide](CONTRIBUTING.md#contributing)<br/>
  Have an idea, found a bug or an issues? Please [visit here](https://github.com/stanleyowen/todo-application/issues/new/choose)

## Stargazers and Contributors
   [![Stargazers for @stanleyowen/todo-application](https://reporoster.com/stars/stanleyowen/todo-application)](https://github.com/stanleyowen/todo-application/stargazers)
   [![Forkers for @stanleyowen/todo-application](https://reporoster.com/forks/stanleyowen/todo-application)](https://github.com/stanleyowen/todo-application/network/members)

## License [![MIT](https://img.shields.io/github/license/stanleyowen/todo-application?style=flat-square)](LICENSE)

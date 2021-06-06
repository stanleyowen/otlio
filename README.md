# Otlio

<div align="center">
  <img height=200 src="https://user-images.githubusercontent.com/69080584/119517399-c6f10280-bda1-11eb-9af9-4bdc197dcd65.png" alt="Otlio" />

  [![Github Forks](https://img.shields.io/github/forks/stanleyowen/otlio)](https://github.com/stanleyowen/otlio/network/members)
  [![Github Stars](https://img.shields.io/github/stars/stanleyowen/otlio)](https://github.com/stanleyowen/otlio/stargazers)
  [![MIT License](https://img.shields.io/github/license/stanleyowen/otlio)](https://github.com/stanleyowen/otlio/blob/master/LICENSE)

  [![CodeQL](https://github.com/stanleyowen/otlio/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/stanleyowen/otlio/actions/workflows/codeql-analysis.yml)
  [![Semgrep](https://github.com/stanleyowen/otlio/actions/workflows/semgrep.yml/badge.svg)](https://github.com/stanleyowen/otlio/actions/workflows/semgrep.yml)
  [![Netlify Status](https://api.netlify.com/api/v1/badges/593f0dc0-7cdb-40b2-8223-f4dd2acd0841/deploy-status)](https://app.netlify.com/sites/otlio/deploys)
</div>

Otlio is an **open source** project, completed with **highest standard security**, which is easy to use and organize!

## Feature
1. Support for Google and GitHub **OAuth** Login
2. Support for **2FA (Two Factor Authentication)**
3. Heavy focus on **security**
4. **Customer Support**

## Getting Started
1. Download this code<br/>
  There are some several quick start options available:
    - [Fork this repository](https://github.com/stanleyowen/otlio/fork)
    - Clone this repository, type `https://github.com/stanleyowen/otlio.git` in command line
    - [Download the latest release](https://github.com/stanleyowen/otlio/archive/v0.5.5.zip)
2. Install All the Dependencies
    - Open your terminal
    - Change directory `cd` to both `client` and `server` folder
    - Type `npm install` in command line
3. Create `.env` file in `server` directory:<br />
    `.env` is used to store keys, secrets, and other sensitive informations which is not pushed to GitHub. 
    - `ATLAS_URI` stores the Database URI provided by [MongoDB](https://www.mongodb.com/2)
    - `JWT_SECRET` stores JWT Secret for verifying users' session
    - `SECRET_KEY_1`, `SECRET_KEY_2`, `SECRET_KEY_3`, `SECRET_KEY_4`, `SECRET_KEY_5` stores secret key for encyption method (32 chars) (Make it secret, hard to guess, and different from others secret key)
    - `CLIENT_URL` stores the whitelisted domain for `CORS` Policy
    - `NODE_ENV` stores the status of an application, whether it is in `development` or `production` status.
    - `GITHUB_ID` stores the Client ID for GitHub OAuth provided by [GitHub OAuth](https://github.com/settings/applications/new)
    - `GITHUB_SECRET` stores the Client Secret for GitHub OAuth provided by [GitHub](https://github.com/settings/applications/new)
    - `GITHUB_CALLBACK` stores the Callback URL for GitHub OAuth provided by [GitHub](https://github.com/settings/applications/new)
    - `GOOGLE_ID` stores the Client ID fot Google OAuth provided by [Google](https://console.cloud.google.com/)
    - `GOOGLE_SECRET` stores the Client Secret for Google OAuth provided by [Google](https://console.cloud.google.com/)
    - `GOOGLE_CALLBACK` stores the Callback URL for Google OAuth provided by [Google](https://console.cloud.google.com/)
    - `MAIL_SERVICE`, `MAIL_EMAIL`, `MAIL_PASSWORD`, and `MAIL_SUPPORT` are configured for sending email to users<br /><br />
        ```
        ATLAS_URI       = mongodb+srv://<username>:<password>@<port>/<dbname>?retryWrites=true&w=majority
        JWT_SECRET      = YHUIEHN$HOIDFU2^8374C897C4%T843973)X4843C57N8934D29#87N839*4NC07489BC3
        SECRET_KEY_1    = SpFcG29lKzfx9SxjLRjujaYxzSswhihd
        SECRET_KEY_2    = fAgW6nV97IVloZB1C2j2ABYDUoCmUEJa
        SECRET_KEY_3    = 68Lqcfi2MD1RuqT5v1GNKNYzacmoezdR
        SECRET_KEY_4    = 98yNuI8bxpUWIJIodl9ltchPEuscraNz
        SECRET_KEY_5    = DOC7uNZ3etiHw9OLDMFLuIJbwWdGOKbF
        NODE_ENV        = development
        CLIENT_URL      = http://localhost:3000

        GITHUB_ID       = /* Your GitHub Client ID */
        GITHUB_SECRET   = /* Your GitHub Client Secret */
        GITHUB_CALLBACK = http://localhost:3000/oauth/github
        GOOGLE_ID       = /* Your Google Client ID */
        GOOGLE_SECRET   = /* Your Google Client Secret */
        GOOGLE_CALLBACK = http://localhost:3000/auth/google

        MAIL_SUPPORT    = /* Email for Customer Support */
        MAIL_SERVICE    = /* Email Service Provider */
        MAIL_EMAIL      = /* Email Address */
        MAIL_PASSWORD   = /* Email Password */
        ```
  4. Run and Compile it
      - In the `client` directory, type `npm start` in command line
      - In the `server` diireactory, type `nodemon` in command line

## Contributing Guidelines
  Before that, we would like to say thank you for your willing to contribute to Otlio! Please take a minute to read [contributing guide](CONTRIBUTING.md#contributing). Have an idea, found a bug or an issues? Please [visit here](https://github.com/stanleyowen/otlio/issues/new/choose).

## License
[MIT](/LICENSE)

## Stargazers and Contributors
   [![Stargazers for @stanleyowen/otlio](https://reporoster.com/stars/stanleyowen/otlio)](https://github.com/stanleyowen/otlio/stargazers)
   [![Forkers for @stanleyowen/otlio](https://reporoster.com/forks/stanleyowen/otlio)](https://github.com/stanleyowen/otlio/network/members)
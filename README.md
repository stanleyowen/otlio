# Todo Application
> ## Organizing Easier, Improve Your Productivity
[![Github Issues](https://img.shields.io/github/issues/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/issues)
[![Github Forks](https://img.shields.io/github/forks/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/network/members)
[![Github Stars](https://img.shields.io/github/stars/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/stargazers)
[![MIT License](https://img.shields.io/github/license/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/blob/master/LICENSE)

[![Netlify Status](https://api.netlify.com/api/v1/badges/56772f5c-0c69-41e8-a788-69ca591e70ef/deploy-status)](https://app.netlify.com/sites/todoapp-task/deploys)

![Todo Application](https://user-images.githubusercontent.com/69080584/105711593-5b11a100-5f4b-11eb-89c5-50554ebca80b.jpg)

Todo Application is an **open source** project which is easy to use and easy to organize!

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
    - [Download the latest release](https://github.com/stanleyowen/todo-application/archive/v0.1.4-alpha.zip)
2. Install All the Dependencies
    - Open your terminal
    - Change directory `cd` to both `client` and `server` folder
    - Type `npm install` in commmand line
3. Create `.env` file
    - Inside `client` directory, create a new file named `.env` which stores about sensitive information, which is `REACT_APP_CLIENT_URL`, `REACT_APP_SERVER_URL`, and `REACT_APP_GITHUB_API`
      - `REACT_APP_CLIENT_URL` stores the client side URL
      - `REACT_APP_SERVER_URL` stores the server side URL
      - `REACT_APP_GITHUB_API` stores the GitHub current Stars and Forks<br /><br />
          ```
          REACT_APP_CLIENT_URL = http://localhost:3000
          REACT_APP_SERVER_URL = http://localhost:5000
          REACT_APP_GITHUB_API = https://api.github.com/repos/stanleyowen/todo-application
          ```

    - Inside `server` directory, create a new file named `.env` which stores about sensitive information, which is `ATLAS_URI`, `SECRET_KEY`, and `TOKEN_KEY`
      - `ATLAS_URI` stores the Database URI provided by [MongoDB](https://www.mongodb.com/2)
      - `SECRET_SESSION` stores JWT secret (Make it secret and hard to guess)<br /><br />
          ```
          ATLAS_URI = mongodb+srv://<username>:<password>@<port>/<dbname>?retryWrites=true&w=majority
          SECRET_SESSION = YHUIEHN$HOIDFU2^8374C897C4%T843973)X4843C57N8934D29#87N839*4NC07489BC3
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

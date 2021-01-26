# Todo Application
> ## Organizing Easier, Improve Your Productivity
[![Github Issues](https://img.shields.io/github/issues/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/issues)
[![Github Forks](https://img.shields.io/github/forks/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/network/members)
[![Github stars](https://img.shields.io/github/stars/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/stargazers)
[![MIT](https://img.shields.io/github/license/stanleyowen/todo-application?style=flat-square)](https://github.com/stanleyowen/todo-application/blob/master/LICENSE)

![Todo Application](https://user-images.githubusercontent.com/69080584/105711593-5b11a100-5f4b-11eb-89c5-50554ebca80b.jpg)

Todo Application is an **open source** project which is easy to use, organize, and no credit card is needed!

> **Even though this project covers basic security, it is not recommended to use in production though it is NOT secure enough.**

## Table of Contents
- [Getting Started](#getting-started)
- [Built With](#built-with)
- [Contributing Guidelines](#contributing-guidelines)
- [Code of Conducts](CODE_OF_CONDUCT.md)
- [Stargazers and Contributors](#stargazers-and-contributors)
- [License](#license)

## Getting Started
1. Download this code<br/>
  There are some several quick start options available:
    - [Fork this repository](https://github.com/stanleyowen/todo-application/fork)
    - Clone this repository, type `https://github.com/stanleyowen/todo-application.git` in command line
    - [Download the latest release](https://github.com/stanleyowen/todo-application/archive/master.zip)
2. Install All the Dependencies
    - Open your terminal
    - Change diretory `cd` to both client and server folder
    - Type `npm install`
3. Create `.env` file
    - Inside `client` directory, create a new file named `.env` which stores about sensitive data, which is `REACT_APP_CLIENT_URL`, `REACT_APP_SERVER_URL`, `REACT_APP_GITHUB_API`, and `REACT_APP_SECRET_KEY`
      - `REACT_APP_CLIENT_URL` stores the client side URL
      - `REACT_APP_SERVER_URL` stores the server side URL
      - `REACT_APP_GITHUB_API` stores the GitHub current Stars and Forks
      - `REACT_APP_SECRET_KEY` stores security key in client side (Make it secret, hard to guess, and change it regularly)<br /><br />
        > __Note__: Make sure you have the same value of `REACT_APP_SECRET_KEY` in `client` and `REACT_APP_SECRET_KEY` in `server` side is __SAME__. Otherwise, it will cause an error.
          ```
          REACT_APP_CLIENT_URL = http://localhost:3000
          REACT_APP_SERVER_URL = http://localhost:5000
          REACT_APP_GITHUB_API = https://api.github.com/repos/stanleyowen/todo-application
          REACT_APP_SECRET_KEY = YHUIEHNHOIDFU28374C897C4T843973X4843C57N8934D2987N8394NC07489BC3
          ```

    - Inside `server` directory, create a new file named `.env` which stores about sensitive data, which is `ATLAS_URI`, `SECRET_KEY`, and `TOKEN_KEY`
      - `ATLAS_URI` stores the Database URI provided by [MongoDB](https://www.mongodb.com/2)
      - `TOKEN_KEY` is the value where `TOKEN` is created with
      - `SECRET_KEY` stores security key (Make it secret, hard to guess, and change it regularly)<br /><br />
        > __Note__: Make sure you have the same value of `REACT_APP_SECRET_KEY` in `client` and `REACT_APP_SECRET_KEY` in `server` side is __SAME__. Otherwise, it will cause an error.
          ```
          ATLAS_URI = mongodb+srv://<username>:<password>@cluster0.5k44j.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority
          SECRET_KEY = YHUIEHNHOIDFU28374C897C4T843973X4843C57N8934D2987N8394NC07489BC3
          TOKEN_KEY = HGB778C34595@54290cv#$^&^#c$%C3NN2C83P9P9D54^#4CF34
          ```
  4. Run and Compile it
      - In the `client` directory, type `npm start`
      - In the `server` diireactory, type `nodemon`

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
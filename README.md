# Todo Application
> ## Organizing Easier, Improve Your Productivity
[![Github Issues](https://img.shields.io/github/issues/stanleyowen/TodoApp?style=flat-square)](https://github.com/stanleyowen/TodoApp/issues)
[![Github Forks](https://img.shields.io/github/forks/stanleyowen/TodoApp?style=flat-square)](https://github.com/stanleyowen/TodoApp/network/members)
[![Github stars](https://img.shields.io/github/stars/stanleyowen/TodoApp?style=flat-square)](https://github.com/stanleyowen/TodoApp/stargazers)
[![MIT](https://img.shields.io/github/license/stanleyowen/TodoApp?style=flat-square)](https://github.com/stanleyowen/TodoApp/blob/master/LICENSE)

![Todo Application](https://user-images.githubusercontent.com/69080584/105711593-5b11a100-5f4b-11eb-89c5-50554ebca80b.jpg)

# Built Using:
1. MongoDB
2. Express JS
3. React JS
4. Node JS

# Getting Started
1. Download this code<br/>
  There are some several quick start options available:
    - [Fork this repository](https://github.com/stanleyowen/TodoApp/fork)
    - Clone this repository, type `https://github.com/stanleyowen/TodoApp.git` in command line
    - [Download the latest release](https://github.com/stanleyowen/TodoApp/archive/master.zip)
2. Install All the Dependencies
    1. Open your terminal
    2. Change diretory `cd` to both client and server folder
    3. Type `npm install`
3. Create `.env` file
    - Inside `client` directory, create a new file named `.env` which stores about sensitive data, which is `REACT_APP_CLIENT_URL`, `REACT_APP_SERVER_URL`, `REACT_APP_GITHUB_API`, and `REACT_APP_SECRET_KEY`
      1. `REACT_APP_CLIENT_URL` stores the client side URL
      2. `REACT_APP_SERVER_URL` stores the server side URL
      3. `REACT_APP_GITHUB_API` stores the GitHub current Stars and Forks
      4. `REACT_APP_SECRET_KEY` stores security key in client side (Make it secret, hard to guess, and change it regularly)
```
REACT_APP_CLIENT_URL = http://localhost:3000
REACT_APP_SERVER_URL = http://localhost:5000
REACT_APP_GITHUB_API = https://api.github.com/repos/stanleyowen/TodoApp
REACT_APP_SECRET_KEY = YHUIEHNHOIDFU28374C897C4T843973X4843C57N8934D2987N8394NC07489BC3
```

    - Inside `server` directory, create a new file named `.env` which stores about sensitive data, which is `ATLAS_URI`, `SECRET_KEY`, and `TOKEN_KEY`
      1. `ATLAS_URI` stores the Database URI provided by [MongoDB](https://www.mongodb.com/2)
      2. `TOKEN_KEY` is the value where `TOKEN` is created with
      3. `SECRET_KEY` stores security key (Make it secret, hard to guess, and change it regularly)
      4. __Note__: Make sure you have the same value of `REACT_APP_SECRET_KEY` in `client` and `REACT_APP_SECRET_KEY` in `server` side is __SAME__. Otherwise, it will cause an error.
```
ATLAS_URI = mongodb+srv://<username>:<password>@cluster0.5k44j.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority
SECRET_KEY = YHUIEHNHOIDFU28374C897C4T843973X4843C57N8934D2987N8394NC07489BC3
TOKEN_KEY = HGB778C34595@54290cv#$^&^#c$%C3NN2C83P9P9D54^#4CF34
```
  4. Run and Compile it
      - In the `client` directory, type `npm start`
      - In the `server` diireactory, type `nodemon`

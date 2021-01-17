const axios = require('axios');
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

const getUserToken = async token => {
    if(token){
        let _userInfo = null;
        const userInfo = { SECRET_KEY, token }
        await axios.post(`${SERVER_URL}/data/accounts/getUserByToken`, userInfo)
        .then(res => {_userInfo = res.data; console.log(res.data)})
        .catch(err => _userInfo = err.response);
        return _userInfo;
    }else return undefined;
}

module.exports = getUserToken;
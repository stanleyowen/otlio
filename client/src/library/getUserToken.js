const axios = require('axios');

const getUserToken = async token => {
    if(token){
        let _userInfo = null;
        const userInfo = { token }
        await axios.post(`https://localhost:5000/accounts/login/`, userInfo)
        .then(res => _userInfo = res.data)
        .catch(err => _userInfo = err.response);
        return _userInfo;
    }else return undefined;
}

module.exports = getUserToken;
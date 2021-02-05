const axios = require('axios');
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const getUserToken = async (token, userId) => {
    if(token){
        let _userInfo = null;
        await axios.get(`${SERVER_URL}/data/accounts/getUserByToken`, {params: {id: userId}, headers: { Authorization: `JWT ${token}` }})
        .then(res => _userInfo = res.data)
        .catch(err => console.log(err.response));
        return _userInfo;
    }else return undefined;
}

export default getUserToken;
const axios = require('axios').create({ withCredentials: true });
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const getUserToken = async token => {
    if(token){
        let _userInfo = null;
        await axios.get(`${SERVER_URL}/account/user`, {headers: { Authorization: `JWT ${token}` }})
        .then(res => _userInfo = res.data)
        .catch(() => _userInfo = null)
        return _userInfo;
    }else return undefined;
}

export default getUserToken;
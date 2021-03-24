const axios = require("axios").create({ withCredentials: true });
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const labels = ["Priority", "Secondary", "Important", "Do Later"];

const validateLabel = (e) => {
    for (let a=0; labels.length; a++){
        if(((a === labels.length-1) && (e === labels[a].toLowerCase())) || e === labels[a].toLowerCase()) return false;
        else if((a === labels.length-1) && (e !== labels[a].toLowerCase())) return true;
    }
}

const OAuthGitHub = (e) => {
    e.preventDefault();
    window.location = `${SERVER_URL}/oauth/github/auth`;
}

const OAuthGoogle = (e) => {
    e.preventDefault();
    window.location = `${SERVER_URL}/oauth/google/auth`;
}

const ConnectOAuthGoogle = (e) => {
    e.preventDefault();
    window.location = `${SERVER_URL}/oauth/google/auth/connect`;
}

const createRequest = (e) => {
    axios.get(`${SERVER_URL}/status`)
    .then(res => {
        localStorage.setItem('X-XSRF-TOKEN', res.data.X_XSRF_TOKEN)
        localStorage.setItem('X-CSRF-TOKEN', res.data.X_CSRF_TOKEN)
    })
    .catch(err => console.log(err));
}

const getCSRFToken = (e) => {
    const token = [];
    const a = localStorage.getItem('X-XSRF-TOKEN');
    const b = localStorage.getItem('X-CSRF-TOKEN');
    token.push(a);token.push(b);
    return token;
}

module.exports = {labels, validateLabel, OAuthGitHub, OAuthGoogle, ConnectOAuthGoogle, createRequest, getCSRFToken};
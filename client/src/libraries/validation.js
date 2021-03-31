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

const ConnectOAuthGitHub = (e) => {
    e.preventDefault();
    window.location = `${SERVER_URL}/oauth/github/auth/connect`;
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

const formatDate = (e) => {
    var a = new Date((e.substring(10, 0)) * 1000);
    var date = parseInt(a.getDate());
    var month = parseInt(a.getMonth() + 1);
    var year = a.getFullYear();
    if(date < 10) date = '0'+date;
    if(month < 10) month = '0'+month;
    return year+'-'+month+'-'+date;
}

const openModal = (a, b) => {
    const background = document.getElementById(a);
    const modal = document.getElementById(b);
    modal.classList.add('showModal');
    modal.classList.remove('closeModal', 'hiddenModal');
    background.classList.add('showBackground');
    background.classList.remove('hideBackground', 'hiddenModal');
    return false;
}

const closeModal = (a, b) => {
    const background = document.getElementById(a);
    const modal = document.getElementById(b);
    modal.classList.remove('showModal');
    modal.classList.add('closeModal');
    background.classList.remove('showBackground');
    background.classList.add('hideBackground');
    return false;
}

module.exports = {labels, validateLabel, OAuthGitHub, ConnectOAuthGitHub, OAuthGoogle, ConnectOAuthGoogle, createRequest, getCSRFToken, formatDate, openModal, closeModal};
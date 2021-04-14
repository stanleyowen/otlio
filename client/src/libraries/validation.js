const axios = require("axios");
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const labels = ["Priority", "Secondary", "Important", "Do Later"];

export const validateLabel = (e) => {
    for (let a=0; labels.length; a++){
        if(e === labels[a].toLowerCase()) return false;
        else if(a === labels.length-1 && e !== labels[a].toLowerCase()) return true;
    }
}

export const OAuthGitHub = (e) => {
    e.preventDefault();
    window.location = `${SERVER_URL}/oauth/github/auth`;
}

export const ConnectOAuthGitHub = (e) => {
    e.preventDefault();
    window.location = `${SERVER_URL}/oauth/github/auth/connect`;
}

export const OAuthGoogle = (e) => {
    e.preventDefault();
    window.location = `${SERVER_URL}/oauth/google/auth`;
}

export const ConnectOAuthGoogle = (e) => {
    e.preventDefault();
    window.location = `${SERVER_URL}/oauth/google/auth/connect`;
}

export const getCSRFToken = () => {
    return localStorage.getItem('XSRF-TOKEN')
}

export const openModal = (a, b, c) => {
    const background = document.getElementById(a);
    const modal = document.getElementById(b);
    modal.classList.add('showModal');
    modal.classList.remove('closeModal', 'hiddenModal');
    background.classList.add('showBackground');
    background.classList.remove('hideBackground', 'hiddenModal');
    if(c) setTimeout(() => document.getElementById(c).focus(), 300)
}

export const closeModal = (a, b) => {
    const background = document.getElementById(a);
    const modal = document.getElementById(b);
    modal.classList.remove('showModal');
    modal.classList.add('closeModal');
    background.classList.remove('showBackground');
    background.classList.add('hideBackground');
    return false;
}

export const Logout = async (id, email) => {
    await axios.post(`${SERVER_URL}/account/logout`, { id, email }, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true})
    .then(() => {
        localStorage.setItem('info', JSON.stringify({ statusCode: 200, message: 'You have been logged out successfully.' }))
        window.location = '/login'
    })
    .catch(err => {
        localStorage.setItem('info', JSON.stringify(err.response.data))
        window.location = '/welcome'
    })
}
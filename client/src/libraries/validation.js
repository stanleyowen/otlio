const axios = require("axios");
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const labels = ["Priority", "Secondary", "Important", "Do Later"];

export const validateLabel = (e) => {
    for (let a=0; labels.length; a++){
        if(((a === labels.length-1) && (e === labels[a].toLowerCase())) || e === labels[a].toLowerCase()) return false;
        else if((a === labels.length-1) && (e !== labels[a].toLowerCase())) return true;
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

export const createRequest = async (e) => {
    await axios.get(`${SERVER_URL}/status`, { withCredentials: true })
    .then(res => {
        localStorage.setItem('X-XSRF-TOKEN', res.data.X_XSRF_TOKEN)
        localStorage.setItem('X-CSRF-TOKEN', res.data.X_CSRF_TOKEN)
    })
    .catch(err => console.log(err));
}

export const getCSRFToken = (e) => {
    const token = [];
    const a = localStorage.getItem('X-XSRF-TOKEN');
    const b = localStorage.getItem('X-CSRF-TOKEN');
    token.push(a);token.push(b);
    return token;
}

export const formatDate = e => {
    var a = new Date((e.substring(10, 0)) * 1000);
    var date = parseInt(a.getDate());
    var month = parseInt(a.getMonth() + 1);
    var year = a.getFullYear();
    if(date < 10) date = '0'+date;
    if(month < 10) month = '0'+month;
    return year+'-'+month+'-'+date;
}

export const openModal = (a, b) => {
    const background = document.getElementById(a);
    const modal = document.getElementById(b);
    modal.classList.add('showModal');
    modal.classList.remove('closeModal', 'hiddenModal');
    background.classList.add('showBackground');
    background.classList.remove('hideBackground', 'hiddenModal');
    return false;
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
    await axios.post(`${SERVER_URL}/account/logout`, { id, email }, { headers: { 'X-CSRF-TOKEN': getCSRFToken()[0], 'X-XSRF-TOKEN': getCSRFToken()[1] }, withCredentials: true})
    .then(() => window.location = '/login')
}
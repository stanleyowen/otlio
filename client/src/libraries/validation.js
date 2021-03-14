const axios = require("axios");
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
    window.location = 'https://github.com/login/oauth/authorize?scope=user:email&client_id=f16f43122ef61cc75963';
}

const createRequest = (e) => {
    setInterval(function(){
        axios.get(`${SERVER_URL}/status`)
        .then().catch(err => console.log(err.response.data));
    }, 5000);
}

module.exports = {labels, validateLabel, OAuthGitHub, createRequest};
const axios = require("axios");
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const labels = ["Priority", "Secondary", "Important", "Do Later"];

const validateLabel = (e) => {
    for (let a=0; labels.length; a++){
        if(((a === labels.length-1) && (e === labels[a].toLowerCase())) || e === labels[a].toLowerCase()) return false;
        else if((a === labels.length-1) && (e !== labels[a].toLowerCase())) return true;
    }
}

const createRequest = async (e) => {
    await axios.get(`${SERVER_URL}/status`)
    .then().catch(err => console.log(err.response.data));
}

module.exports = {labels, validateLabel, createRequest};
const labels = ["Priority", "Secondary", "Important", "Do Later"];

const validateLabel = (e) => {
    for (let a=0; labels.length; a++){
        if(((a === labels.length-1) && (e === labels[a].toLowerCase())) || e === labels[a].toLowerCase()) return false;
        else if((a === labels.length-1) && (e !== labels[a].toLowerCase())) return true;
    }
}

module.exports = {labels, validateLabel};
const listLabel = ["Priority","Secondary","Important","Do Later"];

const validateLabel = (e) => {
    for (let a=0; listLabel.length; a++){
        if((a === listLabel.length-1) && (e === listLabel[a].toLowerCase())) return false;;
        if((a === listLabel.length-1) && (e !== listLabel[a].toLowerCase())) return true;
        else if(e === listLabel[a].toLowerCase()) return false;
    }
}

module.exports = {listLabel, validateLabel};
export const labels = ["Priority", "Secondary", "Important", "Do Later"]

export const validateLabel = (e) => {
    for (let a=0; a<labels.length; a++){
        if(e === labels[a].toLowerCase()) return false
        else if(a === labels.length-1 && e !== labels[a].toLowerCase()) return true
    }
}

export const getCSRFToken = () => { return localStorage.getItem('XSRF-TOKEN') }

export const openModal = (a, b, c) => {
    const background = document.getElementById(a)
    const modal = document.getElementById(b)
    modal.classList.add('showModal')
    modal.classList.remove('closeModal', 'hiddenModal')
    background.classList.add('showBackground')
    background.classList.remove('hideBackground', 'hiddenModal')
    if(c) setTimeout(() => document.getElementById(c).focus(), 300)
}

export const closeModal = (a, b) => {
    const modal = document.getElementById(b)
    const background = document.getElementById(a)
    modal.classList.remove('showModal')
    modal.classList.add('closeModal')
    background.classList.remove('showBackground')
    background.classList.add('hideBackground')
}
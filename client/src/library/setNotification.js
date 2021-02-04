const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    WARNING: 'warning',
    DANGER: 'danger'
}

const setNotification = (type, text) => {
    const notifications = document.getElementById('notifications');
    const newNotification = document.createElement('div');
    newNotification.classList.add('notification', `notification-${type}`);
    newNotification.innerHTML = `${text}`;
    notifications.appendChild(newNotification);
    setTimeout(() => {
        newNotification.classList.add('hide');
        setTimeout(() => { notifications.removeChild(newNotification) }, 1000);
    }, 5000);
    return newNotification;
}

const setWarning = async => {
    console.log("%c%s","color: red; background: yellow; font-size: 24px;","WARNING!");
    console.log("%c%s","font-size: 18px;","Using this console may allow attackers to impersonate you and steal your information using an attack called Self-XSS.\nDo not enter or paste code that you do not understand.")
}

module.exports = {setNotification, NOTIFICATION_TYPES, setWarning};
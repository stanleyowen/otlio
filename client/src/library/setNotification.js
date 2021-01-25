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

module.exports = {setNotification, NOTIFICATION_TYPES};
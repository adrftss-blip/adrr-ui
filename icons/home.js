// Home Icon Component with Notification Badge
export const HomeIcon = () => {
    const icon = document.createElement('i');
    icon.className = 'fas fa-home';
    return icon;
};

export const BadgeNotification = () => {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = '99+';
    return badge;
};

export const HomeLabel = () => {
    const span = document.createElement('span');
    span.textContent = 'الصفحة الرئيسية';
    return span;
};

export const createHomeNavItem = () => {
    const item = document.createElement('div');
    item.className = 'nav-item notification';
    item.appendChild(HomeIcon());
    item.appendChild(BadgeNotification());
    item.appendChild(HomeLabel());
    return item;
};
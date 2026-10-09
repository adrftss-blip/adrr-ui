// Futures Icon Component
export const FuturesIcon = () => {
    const icon = document.createElement('i');
    icon.className = 'fas fa-chart-line';
    return icon;
};

export const FuturesLabel = () => {
    const span = document.createElement('span');
    span.textContent = 'العقود الآجلة';
    return span;
};

export const createFuturesNavItem = () => {
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.appendChild(FuturesIcon());
    item.appendChild(FuturesLabel());
    return item;
};

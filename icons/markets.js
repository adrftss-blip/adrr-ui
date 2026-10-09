// Markets Icon Component
export const MarketsIcon = () => {
    const icon = document.createElement('i');
    icon.className = 'fas fa-chart-bar';
    return icon;
};

export const MarketsLabel = () => {
    const span = document.createElement('span');
    span.textContent = 'الأسواق';
    return span;
};

export const createMarketsNavItem = () => {
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.appendChild(MarketsIcon());
    item.appendChild(MarketsLabel());
    return item;
};
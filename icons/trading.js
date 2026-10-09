// Trading Icon Component (Active)
export const TradingIcon = () => {
    const icon = document.createElement('i');
    icon.className = 'fas fa-exchange-alt';
    return icon;
};

export const TradingLabel = () => {
    const span = document.createElement('span');
    span.textContent = 'التداول';
    return span;
};

export const createTradingNavItem = () => {
    const item = document.createElement('div');
    item.className = 'nav-item active';
    item.appendChild(TradingIcon());
    item.appendChild(TradingLabel());
    return item;
};
// Wallet Icon Component
export const WalletIcon = () => {
    const icon = document.createElement('i');
    icon.className = 'fas fa-wallet';
    return icon;
};

export const WalletLabel = () => {
    const span = document.createElement('span');
    span.textContent = 'الرصيد';
    return span;
};

export const createWalletNavItem = () => {
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.appendChild(WalletIcon());
    item.appendChild(WalletLabel());
    return item;
};
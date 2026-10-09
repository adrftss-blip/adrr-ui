// Wallet Icon Component
export const WalletIcon = () => {
  const i = document.createElement('i');
  i.className = 'fa-solid fa-wallet';
  return i;
};

export const WalletLabel = () => {
  const span = document.createElement('span');
  span.textContent = 'الرصيد';
  return span;
};

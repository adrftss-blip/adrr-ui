// Trading Icon Component
export const TradingIcon = () => {
  const i = document.createElement('i');
  i.className = 'fa-solid fa-arrows-rotate';
  return i;
};

export const TradingLabel = () => {
  const span = document.createElement('span');
  span.textContent = 'التداول';
  return span;
};

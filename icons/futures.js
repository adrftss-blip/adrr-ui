// Futures Icon Component
export const FuturesIcon = () => {
  const i = document.createElement('i');
  i.className = 'fa-solid fa-chart-line';
  return i;
};

export const FuturesLabel = () => {
  const span = document.createElement('span');
  span.textContent = 'العقود';
  return span;
};

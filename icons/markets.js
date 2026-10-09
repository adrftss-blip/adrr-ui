// Markets Icon Component
export const MarketsIcon = () => {
  const i = document.createElement('i');
  i.className = 'fa-solid fa-chart-column';
  return i;
};

export const MarketsLabel = () => {
  const span = document.createElement('span');
  span.textContent = 'الأسواق';
  return span;
};

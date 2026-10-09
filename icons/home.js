// Home Icon Component
export const HomeIcon = () => {
  const i = document.createElement('i');
  i.className = 'fa-solid fa-house';
  return i;
};

export const HomeLabel = () => {
  const span = document.createElement('span');
  span.textContent = 'الرئيسية';
  return span;
};

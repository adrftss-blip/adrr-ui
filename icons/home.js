// Home Icon Component
export const HomeIcon = () => {
    const icon = document.createElement('i');
    icon.className = 'fas fa-home';
    return icon;
};

export const HomeLabel = () => {
    const span = document.createElement('span');
    span.textContent = 'Home';
    return span;
};
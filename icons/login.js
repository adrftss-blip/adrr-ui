// Login Icon Component
export const LoginIcon = () => {
    const icon = document.createElement('i');
    icon.className = 'fas fa-right-to-bracket';
    return icon;
};

export const LoginLabel = () => {
    const span = document.createElement('span');
    span.textContent = 'login';
    return span;
};
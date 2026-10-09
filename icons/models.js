// Models Icon Component
export const ModelsIcon = () => {
    const icon = document.createElement('i');
    icon.className = 'fas fa-user-astronaut';
    return icon;
};

export const ModelsLabel = () => {
    const span = document.createElement('span');
    span.textContent = 'Models';
    return span;
};
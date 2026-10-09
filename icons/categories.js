// Categories Icon Component
export const CategoriesIcon = () => {
    const icon = document.createElement('i');
    icon.className = 'fas fa-folder';
    return icon;
};

export const CategoriesLabel = () => {
    const span = document.createElement('span');
    span.textContent = 'Categories';
    return span;
};
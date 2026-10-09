// Channels Icon Component
export const ChannelsIcon = () => {
    const icon = document.createElement('i');
    icon.className = 'fas fa-video';
    return icon;
};

export const ChannelsLabel = () => {
    const span = document.createElement('span');
    span.textContent = 'Channels';
    return span;
};
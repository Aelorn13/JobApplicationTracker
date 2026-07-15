// Форматирует "PhoneScreen" → "Phone Screen"
export const formatStatus = (status) =>
    status.replace(/([A-Z])/g, ' $1').trim();

// Заявка считается "зависшей" если Pending/PhoneScreen дольше 30 дней
export const isStale = (app) => {
    if (!['Pending', 'PhoneScreen'].includes(app.status)) return false;
    const days = (Date.now() - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24);
    return days > 30;
};

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}

export function isWeekend(dateString) {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; 
}

export function addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

export function calculateCourseEndDate(startDate, totalWeeks) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (totalWeeks * 7));
    return formatDate(date.toISOString());
}

export function getDayOfWeek(dateString) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
}

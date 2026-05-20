import Speaker from '../engine/Speaker';

export function tellTime(): void {
  const now = new Date();
  let hour = now.getHours();
  const minute = now.getMinutes();
  const period = hour >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  hour = hour % 12 || 12;

  // Make minutes sound natural
  // 7:00 → "seven o'clock"
  // 7:05 → "seven oh five"
  // 7:30 → "seven thirty"
  const minuteStr =
    minute === 0 ? "o'clock" :
    minute < 10 ? `oh ${minute}` :
    `${minute}`;

  Speaker.speak(`It is ${hour} ${minuteStr} ${period}`);
}

export function tellDate(): void {
  const now = new Date();
  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ];
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const date = now.getDate();

  Speaker.speak(`Today is ${dayName}, ${monthName} ${date}`);
}
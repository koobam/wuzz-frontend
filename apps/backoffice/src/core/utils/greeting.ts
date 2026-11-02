/** The key of the greeting that fits this hour, e.g. 'home.morning'. */
export function greetingKey(date = new Date()): 'home.morning' | 'home.afternoon' | 'home.evening' | 'home.night' {
  const hour = date.getHours();
  if (hour < 11) return 'home.morning';
  if (hour < 15) return 'home.afternoon';
  if (hour < 19) return 'home.evening';
  return 'home.night';
}

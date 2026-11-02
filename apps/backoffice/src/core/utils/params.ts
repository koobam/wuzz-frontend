/** The id in a path (`/services/12`) as a number; 0 when it is not a whole number of 1 or more, so a bad address reads as "not found". */
export const toId = (raw: string | undefined): number => {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 0;
};

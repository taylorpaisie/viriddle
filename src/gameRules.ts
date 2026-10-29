export const CASE_TIME_MS = 5 * 60 * 1000;
export const remainingMs = (deadlineAt:number, now:number) => Math.max(0, deadlineAt-now);
export const elapsedSeconds = (deadlineAt:number, now:number) => Math.max(0, Math.min(CASE_TIME_MS/1000, Math.ceil((now-(deadlineAt-CASE_TIME_MS))/1000)));
export const clockText = (ms:number) => {
  const seconds=Math.max(0,Math.ceil(ms/1000));
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
};

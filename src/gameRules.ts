export const CASE_TIME_MS = 150 * 1000;
export const remainingMs = (deadlineAt:number, now:number) => Math.max(0, deadlineAt-now);
export const elapsedSeconds = (deadlineAt:number, now:number) => Math.max(0, Math.min(CASE_TIME_MS/1000, Math.ceil((now-(deadlineAt-CASE_TIME_MS))/1000)));
export const clockText = (ms:number) => {
  const seconds=Math.max(0,Math.ceil(ms/1000));
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
};

export const BASE_POINTS = 50;
export const MAX_SPEED_BONUS = 50;
export type ScoreBreakdown = {score:number;basePoints:number;speedBonus:number;evidenceCost:number;scoringVersion:2};
export const calculateScore = ({correct,evidenceCost,deadlineAt,now,relaxed=false}:{correct:boolean;evidenceCost:number;deadlineAt?:number;now:number;relaxed?:boolean}):ScoreBreakdown => {
  const cost=Math.max(0,Math.min(100,Math.round(evidenceCost)));
  const eligible=correct&&(relaxed||(deadlineAt!==undefined&&now<deadlineAt));
  if(!eligible)return {score:0,basePoints:0,speedBonus:0,evidenceCost:cost,scoringVersion:2};
  const basePoints=relaxed?100:BASE_POINTS;
  // Integer three-second intervals avoid floating-point rounding at boundaries.
  const speedBonus=relaxed?0:Math.ceil(Math.min(CASE_TIME_MS,remainingMs(deadlineAt!,now))/(CASE_TIME_MS/MAX_SPEED_BONUS));
  return {score:Math.max(0,basePoints+speedBonus-cost),basePoints,speedBonus,evidenceCost:cost,scoringVersion:2};
};

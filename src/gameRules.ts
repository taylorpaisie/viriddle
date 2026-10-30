export const CASE_TIME_MS = 300 * 1000;
export const remainingMs = (deadlineAt:number, now:number) => Math.max(0, deadlineAt-now);
export const elapsedSeconds = (deadlineAt:number, now:number, durationMs=CASE_TIME_MS) => Math.max(0, Math.min(durationMs/1000, Math.ceil((now-(deadlineAt-durationMs))/1000)));
export const clockText = (ms:number) => {
  const seconds=Math.max(0,Math.ceil(ms/1000));
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
};

export const BASE_POINTS = 50;
export const MAX_SPEED_BONUS = 50;
export type ScoreBreakdown = {score:number;basePoints:number;speedBonus:number;evidenceCost:number;scoringVersion:2};
export const calculateScore = ({correct,evidenceCost,deadlineAt,now,relaxed=false,durationMs=CASE_TIME_MS}:{correct:boolean;evidenceCost:number;deadlineAt?:number;now:number;relaxed?:boolean;durationMs?:number}):ScoreBreakdown => {
  const cost=Math.max(0,Math.min(100,Math.round(evidenceCost)));
  const eligible=correct&&(relaxed||(deadlineAt!==undefined&&now<deadlineAt));
  if(!eligible)return {score:0,basePoints:0,speedBonus:0,evidenceCost:cost,scoringVersion:2};
  const basePoints=relaxed?100:BASE_POINTS;
  // The same 50 speed points are spread across this attempt’s response window.
  const speedBonus=relaxed?0:Math.ceil(Math.min(durationMs,remainingMs(deadlineAt!,now))*MAX_SPEED_BONUS/durationMs);
  return {score:Math.max(0,basePoints+speedBonus-cost),basePoints,speedBonus,evidenceCost:cost,scoringVersion:2};
};

// Extend an unfinished shorter local run once, from its original start; never revive an expired run.
export const upgradeDeadline=(deadlineAt:number,durationMs=150000,now:number)=>now<deadlineAt&&durationMs<CASE_TIME_MS?{deadlineAt:deadlineAt+CASE_TIME_MS-durationMs,durationMs:CASE_TIME_MS}:{deadlineAt,durationMs};

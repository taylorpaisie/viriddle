// Calendar labels for fictional case evidence, including windows crossing a month boundary.
export const storyMonths=['January','February','March','April','May','June','July','August','September','October','November','December'];
export function storyMonthDays(month){const i=storyMonths.indexOf(month);if(i<0)throw Error('Valid story month required');return new Date(Date.UTC(2026,i+1,0)).getUTCDate();}
export function storyDay(month,day){const i=storyMonths.indexOf(month);if(i<0||!Number.isInteger(day))throw Error('Valid story date required');return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(2026,i,day)));}
export function incubationWindow(c,p){const [min,max]=c.incubationDays??[1,4];return `${storyDay(c.month,p.onset-max)}–${storyDay(c.month,p.onset-min)}`;}

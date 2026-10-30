import type {Case,EvidenceReport} from './model';
// Fictional character comedy only: no dates, encounters, exposures or answers are added.
const stories:Record<string,[string,string]>={
 october:['Darren has convened an emergency tribunal to decide whether Mothman can legally win his own raffle. His only witness is an inflatable moth.','“The moth has requested legal representation. I am not at liberty to discuss the raffle.”'],
 rehearsal:['Darren is campaigning to replace the lead actor with a fog machine. He has submitted a twelve-page argument titled Mist Opportunity.','“The fog has range. The actor has a bicycle. I stand by my casting decision.”'],
 market:['Darren has nominated a decorative squid for night-market mayor. The squid’s entire platform is “more tentacles, less paperwork.”','“The squid has never missed a council meeting. Technically, it has never attended one either.”'],
 lodge:['Darren has declared a velvet cushion the acting lodge manager and is demanding that complaints be addressed to it in writing.','“The cushion has excellent listening skills. It is the rest of management I have concerns about.”'],
 museum:['Darren is trying to return a souvenir rock to the museum as a “fugitive artifact.” He has made it a tiny wanted poster.','“The rock knows what it did. Its silence should not be mistaken for innocence.”'],
 signal:['Darren has drafted a formal cease-and-desist letter to the moon for interfering with radio reception. The moon has not responded.','“If the moon wants to settle out of court, it has my frequency.”'],
 riverside:['Darren has entered a stapler in the workshop’s invention contest as a “paper crocodile.” He is appealing the originality ruling.','“It bites paper. It has a hinge. I fail to see the scientific objection.”'],
 'before-you-arrived':['Darren has filed a complaint about the waiting-room clock for “aggressive ticking” and proposed replacing it with a sundial indoors.','“The sundial’s current performance is disappointing, but I refuse to abandon a promising pilot study.”']
};
export function darrenStory(c:Case){return stories[c.id]??['Darren has appointed a rubber duck as his spokesperson. The duck’s first statement is a demand for a much smaller microphone.','“All further questions must go through the duck. It has advised me to remain mysterious.”'];}
const append=(text:string,extra:string)=>text.includes(extra)?text:text+' '+extra;
export function withDarrenStory(c:Case):Case{
 if(!c.patients.some(p=>p.name==='Darren'))return c;
 const [setup,quote]=darrenStory(c);
 return {...c,brief:append(c.brief,setup),patients:c.patients.map(p=>p.name==='Darren'&&p.interview?{...p,interview:append(p.interview,'Personal aside (not exposure evidence): '+quote)}:p)};
}
export function darrenReports<T extends EvidenceReport>(c:Case,reports:Record<string,T>):Record<string,T>{
 if(!c.patients.some(p=>p.name==='Darren')||!reports.interviews)return reports;
 const extra='Personal aside (not exposure evidence): '+darrenStory(c)[1],interviews=reports.interviews as T&{interviews?:string[]};
 return {...reports,interviews:{...interviews,rows:interviews.rows.map(row=>row.label==='Darren'?{...row,text:append(row.text,extra)}:row),...(interviews.interviews?{interviews:interviews.interviews.map((text,i)=>c.patients[i]?.name==='Darren'?append(text,extra):text)}:{})}};
}

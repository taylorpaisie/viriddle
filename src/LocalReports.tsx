import React from 'react';
import type {Case} from './model';
import {evidenceReports} from './evidenceReports';
export function LocalReports({c,unlocked}:{c:Case;unlocked:string[]}){return <div className="evidence-reports">{Object.entries(evidenceReports(c)).filter(([id])=>unlocked.includes(id)).map(([id,r])=><section key={id} id={'evidence-'+id} className="panel report"><div className="eyebrow">{r.title}</div>{r.rows.map((row:{label:string;text:string},i:number)=><p key={i}><strong>{row.label}</strong><span>{row.text}</span></p>)}{r.note&&<div className="note">{r.note}</div>}</section>)}</div>}

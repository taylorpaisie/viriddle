import React from 'react';
import {Coffee,ArrowUpRight} from 'lucide-react';
import './support-lab.css';

const supportUrl='https://buymeacoffee.com/tpaisie91w';

export function SupportLab(){
 return <section className="panel support-lab" aria-label="Support Viriddle">
  <Coffee className="support-lab-icon" size={28} aria-hidden="true"/>
  <div className="support-lab-copy">
   <div className="eyebrow">KEEP THE LAB BREWING</div>
   <h2>Enjoyed your “aha!” moment?</h2>
   <p>I’m building Viriddle one mystery at a time. Buying the lab a coffee helps cover hosting and supports new cases and improvements.</p>
   <a className="support-lab-link" href={supportUrl} target="_blank" rel="noopener noreferrer">Buy the lab a coffee <ArrowUpRight size={18} aria-hidden="true"/></a>
   <small>Optional support · opens Buy Me a Coffee in a new tab. The daily mystery stays free.</small>
   <details className="support-lab-qr">
    <summary>Prefer to scan? Show QR code</summary>
    <figure>
     <img src={import.meta.env.BASE_URL+'brand/buy-me-a-coffee-qr.png'} alt="QR code for Taylor’s Buy Me a Coffee page" width={700} height={700} loading="lazy"/>
     <figcaption>Scan with another device to buy the lab a coffee.</figcaption>
    </figure>
   </details>
  </div>
 </section>;
}

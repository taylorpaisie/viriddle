import React from 'react';
import {ArrowRight,ArrowUpRight} from 'lucide-react';

export function About({local=false,onPlay}:{local?:boolean;onPlay?:()=>void}){
 return <div className="about-page">
  <section className="about panel">
   <div className="eyebrow">A PERSONAL PROJECT, WITH SYMPTOMS</div>
   <h1>Hi, I’m Taylor.<br/><span className="teal">I made this.</span></h1>
   <div className="creator-card"><div className="creator-monogram" aria-hidden="true">TP</div><div><h2>Taylor Paisie</h2><p>Data analyst, bioinformatics researcher, person responsible for Darren’s dialogue.</p></div></div>
   <p>I work with data, genomes, and infectious diseases. My graduate studies have taken me to the University of Florida, and I previously worked at the CDC. I’m now finishing my PhD in bioinformatics at the University of Cape Town, studying how cholera evolves.</p>
   <p>Viriddle is where those interests meet my love of a good daily puzzle. I wanted to turn symptom dates, awkward encounters, and genomic clues into a mystery you could solve on your phone in a few minutes.</p>
   <p>My favorite part is the “wait, that doesn’t add up” moment. Someone’s story sounds convincing, then you check a date and the whole theory falls apart. That’s the feeling I’m trying to build here.</p>
   <h2>Yes, those are my friends’ names.</h2>
   <p>The cast borrows first names from my friends and science circle. Darren appears in every practice case, usually with a very confident plan that should have stayed in the drafts folder. The characters, illnesses, and encounters are fictional; nobody’s actual health history is part of the game.</p>
   <p>Outside the data and PhD work, I love Star Wars, horror, and Judge Judy. I also have a soft spot for Colombian hippos and manatees, and I’m supervised by my cat, Hamilton.</p>
   <p>I’m building Viriddle as I go. If a clue feels confusing, a button is hard to find, or something doesn’t hold up scientifically, I want to hear about it. I want this to be a game you look forward to playing and sending to your friends.</p>
   <p className="muted">— Taylor</p>
   <a className="creator-link" href="https://github.com/taylorpaisie/viriddle" target="_blank" rel="noopener noreferrer">Follow the project or leave feedback on GitHub <ArrowUpRight size={17}/></a>
  </section>
  <section className="about panel">
   <div className="eyebrow">REAL SCIENCE. INVENTED CHAOS.</div>
   <h2>A small note from the scientist in me.</h2>
   <p>I simplify the biology so each case works as a short puzzle. The briefing tells you the rules for its fictional pathogen. Some mysteries ask you to trace a source; others ask which explanation fits the evidence.</p>
   <div className="note">Similar genomes don’t prove direct transmission, and a reported contact isn’t a confirmed infection. The reconstructed arrows show the intended fictional simulation. Real outbreaks can have several plausible histories.</div>
   <details><summary className="creator-link">How I’m building it</summary><p>The interface uses React, TypeScript, and Vite, with interactive patient cards, timelines, and an SVG contact board. {local?'This local version stores progress in your browser and includes the sample case library.':'Supabase handles guest sessions, optional Google sign-in, private leagues, and server-validated daily scores.'} The daily mystery resets at midnight UTC.</p></details>
   {onPlay&&<button className="primary" onClick={onPlay}>Play today’s mystery <ArrowRight size={18}/></button>}
  </section>
 </div>;
}

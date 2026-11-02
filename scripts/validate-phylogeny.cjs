// Compile TSX in-process so these report checks do not need a browser or native bundler.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
for(const extension of ['.ts','.tsx'])require.extensions[extension]=(module,filename)=>{
 const result=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,esModuleInterop:true}});
 module._compile(result.outputText,filename);
};
require.extensions['.css']=()=>{};
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {lineageEvidence}=require('../src/phylogeny.ts');
const {InvestigationReports}=require('../src/InvestigationDesk.tsx');
const {evidenceReports}=require('../src/evidenceReports.ts');
const {practiceFixtures}=require('../src/practiceFixtures.ts');
const {evidence}=require('../src/catalog.ts');
const {resultLink,readResultLink,sharedScore}=require('../src/shareLink.ts');
const rows=text=>[{label:'Laboratory',text}];
assert.equal(evidence.find(item=>item.id==='phylogeny').cost,16);
for(const c of practiceFixtures){
 const reports=evidenceReports(c),names=c.patients.map(patient=>patient.name);
 const groups=lineageEvidence(reports.phylogeny.rows,names);
 assert.deepEqual(groups.flatMap(group=>group.samples).sort(),[...names].sort(),c.id+' has each sample exactly once');
 assert.notEqual(reports.phylogeny,reports.genomics);
 const notebook={data:{pinned:[],marks:{},note:''},pin(){}};
 const render=unlocked=>renderToStaticMarkup(React.createElement(InvestigationReports,{reports,unlocked,patients:names,notebook}));
 assert.ok(!render([]).includes('<svg'),'locked reports stay sealed');
 assert.ok(!render(['genomics']).includes('Sample phylogenetic tree'),'sequencing does not include the paid tree');
 const tree=render(['phylogeny']);
 assert.ok(tree.includes('<svg')&&tree.includes('Sample phylogenetic tree'),'tree works without buying sequencing');
 assert.ok(!tree.includes('Sequence comparison · SNP distance'),'sequencing report stays separate');
}
assert.deepEqual(lineageEvidence(rows('Ann: distinct lineage B; the other five: lineage A.'),['Ann','Anna','Nídia','B','C','D']).map(group=>group.samples),[['Ann'],['Anna','Nídia','B','C','D']]);
assert.deepEqual(lineageEvidence(rows('Sequence relatedness is unresolved.'),['Ann']),[]);
const run={started:true,unlocked:['phylogeny'],selected:0,result:{correct:true,score:84,date:'2026-11-02',evidenceTotal:7}};
const score=sharedScore(run,'032',1,'daily');
const link=resultLink('https://example.test/',score);
assert.equal(readResultLink(new URL(link).hash).total,7);
console.log('PASS: all 13 sample trees, exact sample membership, locked-report isolation, independent tree unlock, sequencing separation, Unicode names and seven-clue result links.');

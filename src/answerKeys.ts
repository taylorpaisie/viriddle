// PROTOTYPE ONLY. Production: move this module and validation to a server endpoint.
// Public evidence stays in cases.ts; the browser necessarily contains these demo keys.
export const answerKeys:Record<string,{source:number;tree:[number,number][];explanation:string}>={
october:{source:1,tree:[[1,2],[2,3],[2,4],[3,5]],explanation:'Rowan’s outside exposure precedes October 8 onset. The October 9 contact fits Blair’s October 11 onset; Blair’s October 12 contacts fit Casey and Devon; Casey’s October 14 contact fits Ellis. Finley’s genetically distinct infection is a separate introduction.'},
harbor:{source:0,tree:[[0,1],[1,2],[1,3],[2,4]],explanation:'Mira’s outside exposure and October 3 onset precede the October 4 contact with Theo. Theo’s October 7 contacts account for Sage and Luca; Sage’s October 10 contact accounts for Quinn. Jules has a distinct lineage.'},
glasshouse:{source:2,tree:[[2,0],[0,1],[0,3],[1,4]],explanation:'Niko’s October 15 onset precedes contact with Arden on October 16. Arden’s October 19 contacts account for Remy and Wren, and Remy’s October 22 contact accounts for Kit. Avery is genetically distinct.'}};

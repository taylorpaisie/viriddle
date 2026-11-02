export const nameHelp='Use 3–20 letters, numbers, spaces, underscores or hyphens.';
export function nameError(value:string):string {
 const name=value.trim();
 if(!/^[A-Za-z0-9_ -]{3,20}$/.test(name)||!/[A-Za-z0-9]/.test(name))return nameHelp;
 const compact=name.toLowerCase().replace(/[^a-z0-9]/g,'');
 if(/^(admin|administrator|moderator|support|staff|system|official|viriddle)$/.test(compact)||/^investigator[0-9a-f]{8}$/.test(compact))return 'Please choose a different name; that name is reserved.';
 if(/fuck|shit|nigger|nigga|cunt/.test(compact))return 'Please choose a name suitable for a public leaderboard.';
 return '';
}

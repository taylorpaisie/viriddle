import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();const q=async(sql,args=[])=>(await db.query(sql,args)).rows;
await db.exec(`create role anon;create role authenticated;create schema auth;
create table auth.users(id uuid primary key,is_anonymous boolean default false,email text,raw_user_meta_data jsonb default '{}');
create table auth.identities(user_id uuid references auth.users(id),provider text,unique(user_id,provider));
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
for(const name of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).sort())await db.exec(await fs.readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
const ids=Array.from({length:6},(_,i)=>'11111111-1111-4111-8111-'+String(i+1).padStart(12,'0'));
const [owner,member,outsider,guest,emailOnly,second]=ids;
for(const [i,id] of ids.entries()){
 await q('insert into auth.users(id,is_anonymous,email,raw_user_meta_data) values($1,$2,$3,$4)',[id,(id===guest||id===member),'SECRET_EMAIL_'+i+'@example.com',JSON.stringify({provider:'google',full_name:'SECRET_GOOGLE_NAME_'+i})]);
 if(id!==guest&&id!==member&&id!==emailOnly)await q("insert into auth.identities values($1,'google')",[id]);
}
const admin=()=>db.exec('reset role');
const user=async(id)=>{await admin();await q("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated');};
const api=async(name,args=[])=>{const params=args.map((_,i)=>'$'+(i+1)).join(',');return (await q(`select public.${name}(${params}) as r`,args))[0].r;};
// Both an anonymous browser identity and an email-only identity can use leagues without Google.
for(const id of [guest,emailOnly]){await user(id);assert.deepEqual(await api('outbreak_leagues'),[]);const g=(await api('outbreak_league_manage',['create',null,'Guest crew'])).id;assert.ok(g);assert.equal((await api('outbreak_leagues'))[0].is_owner,true);await api('outbreak_league_manage',['delete',g]);}
// An authenticated role without a real player session still has no access.
await user('');await assert.rejects(()=>api('outbreak_leagues'),/Sign in|guest/);

await user(owner);const group=(await api('outbreak_league_manage',['create',null,'Genome Gnomes'])).id;
assert.ok(group);const list=await api('outbreak_leagues');assert.equal(list.length,1);assert.equal(list[0].is_owner,true);assert.equal(list[0].members,1);
await assert.rejects(()=>api('outbreak_league_manage',['leave',group]),/Owners must delete/);
await assert.rejects(()=>api('outbreak_league_manage',['create',null,'x']));
await assert.rejects(()=>api('outbreak_league_manage',['create',null,'Bad\nName']));
let invitation=await api('outbreak_league_invite',[group]);assert.match(invitation.token,/^[a-f0-9]{64}$/);
await admin();let stored=(await q('select invite_hash from private.friend_groups where id=$1',[group]))[0].invite_hash;assert.notEqual(stored,invitation.token);assert.equal(stored.length,64);
await db.exec('set role anon');let preview=await api('outbreak_league_preview',[invitation.token]);assert.deepEqual(Object.keys(preview).sort(),['name','status']);assert.equal(preview.name,'Genome Gnomes');
await assert.rejects(()=>api('outbreak_league_join',[invitation.token]));await assert.rejects(()=>api('outbreak_leagues'));assert.equal((await api('outbreak_league_preview',['invalid'])).status,'unavailable');
await user(outsider);await assert.rejects(()=>api('outbreak_league_standings',[group]),/unavailable/);await assert.rejects(()=>api('outbreak_league_invite',[group]));await assert.rejects(()=>api('outbreak_league_manage',['delete',group]));
for(const table of ['friend_groups','friend_members','league_request_limits'])for(const verb of [`select * from private.${table}`,`delete from private.${table}`])await assert.rejects(()=>q(verb));
await assert.rejects(()=>q("insert into private.friend_members(group_id,player_id) values($1,$2)",[group,outsider]));
await user(member);let joined=await api('outbreak_league_join',[invitation.token]);assert.equal(joined.ok,true);joined=await api('outbreak_league_join',[invitation.token]);assert.equal(joined.already_member,true);
assert.equal((await api('outbreak_leagues'))[0].members,2);
await api('outbreak_save_profile',['Guest Sleuth']);assert.equal((await api('outbreak_profile')).player.username,'Guest Sleuth');await assert.rejects(()=>api('outbreak_save_profile',['x']));await assert.rejects(()=>api('outbreak_save_profile',['<script>']));
await admin();assert.equal((await q('select is_anonymous from auth.users where id=$1',[member]))[0].is_anonymous,true);await user(member);
await assert.rejects(()=>api('outbreak_league_manage',['remove',group,null,owner]));await assert.rejects(()=>api('outbreak_league_manage',['delete',group]));await assert.rejects(()=>api('outbreak_league_invite',[group,'revoke']));
await user(owner);const old=invitation.token;invitation=await api('outbreak_league_invite',[group]);assert.notEqual(old,invitation.token);assert.equal((await api('outbreak_league_preview',[old])).status,'unavailable');
await user(outsider);assert.equal((await api('outbreak_league_join',[old])).ok,false);
await admin();await q("update private.friend_groups set invite_expires_at=clock_timestamp()-interval '1 second' where id=$1",[group]);
await user(outsider);assert.equal((await api('outbreak_league_preview',[invitation.token])).status,'expired');assert.equal((await api('outbreak_league_join',[invitation.token])).ok,false);
await user(owner);invitation=await api('outbreak_league_invite',[group]);await api('outbreak_league_invite',[group,'revoke']);assert.equal((await api('outbreak_league_preview',[invitation.token])).status,'unavailable');invitation=await api('outbreak_league_invite',[group]);
// Memberships never grant another official attempt; only the existing unique daily-attempt API can begin.
await admin();for(const [i,id] of ids.entries())await q('insert into public.players(id,username) values($1,$2) on conflict(id) do update set username=excluded.username',[id,['Alpha','Beta','Other','Guest','EmailOnly','Second'][i]]);
const {today,monday}= (await q("select (clock_timestamp() at time zone 'UTC')::date::text as today,date_trunc('week',clock_timestamp() at time zone 'UTC')::date::text as monday"))[0];
const day=(s,n)=>new Date(Date.parse(s+'T12:00Z')+n*86400000).toISOString().slice(0,10);
const dates=[day(monday,-1),monday,day(today,-1),today,day(today,1)];const caseIds={};
for(const date of new Set(dates)){const c=(await q("insert into public.daily_cases(case_date,published_at,public_data) values($1,clock_timestamp()-interval '1 day','{}') returning id",[date]))[0].id;caseIds[date]=c;await q("insert into private.case_secrets values($1,'{\"source\":1,\"tree\":[],\"explanation\":\"SEALED_SOLUTION\"}','{}')",[c]);}
async function result(id,date,score,correct=true){await q(`insert into public.daily_attempts(player_id,case_id,status,completed_at,elapsed_seconds,score,correct_solution,selected_patient,evidence_used)
values($1,$2,'completed',clock_timestamp(),10,$3,$4,1,'{interviews}') on conflict(player_id,case_id) do update set status='completed',completed_at=clock_timestamp(),elapsed_seconds=10,score=excluded.score,correct_solution=excluded.correct_solution`,[id,caseIds[date],score,correct]);}
await q("update private.friend_members set joined_at=$1::date::timestamp at time zone 'UTC' where player_id=$2",[monday,owner]);
await result(owner,day(monday,-1),99);await result(owner,today,70);await result(outsider,today,100);
const earlier=day(today,-1);if(earlier>=monday){await result(owner,earlier,25);await result(member,earlier,90);}
await user(member);let board=await api('outbreak_league_standings',[group]);assert.equal(board.today_unlocked,false);assert.equal(board.rows.find(r=>r.player_id===owner).status,'finished');assert.ok(board.rows.every(r=>r.points===null&&r.solved===null&&r.rank===null));assert.equal(board.rows.length,2);
const json=JSON.stringify(board);for(const secret of ['SECRET_EMAIL','SECRET_GOOGLE_NAME','selected_patient','evidence_used','SEALED_SOLUTION','solution','reports'])assert.ok(!json.includes(secret));
let weekly=await api('outbreak_league_standings',[group,'week']);assert.equal(weekly.counted_through,earlier);assert.equal(weekly.rows.find(r=>r.player_id===owner).points,earlier>=monday?25:0);assert.equal(weekly.rows.find(r=>r.player_id===member).points,0,'Pre-join daily dates excluded');assert.equal(weekly.rows.find(r=>r.player_id===member).solved,0);
// Change today's hidden result; neither today's ordering/status nor weekly totals may disclose it.
await admin();await q('update public.daily_attempts set score=99,correct_solution=false where player_id=$1 and case_id=$2',[owner,caseIds[today]]);
await user(member);assert.deepEqual((await api('outbreak_league_standings',[group])).rows,board.rows);assert.deepEqual((await api('outbreak_league_standings',[group,'week'])).rows,weekly.rows);
await api('outbreak_action',['begin',caseIds[today]]);const firstAttempt=(await api('outbreak_daily')).attempt.id;
await api('outbreak_action',['begin',caseIds[today]]);assert.equal((await api('outbreak_daily')).attempt.id,firstAttempt);
await admin();await result(owner,today,70);await result(member,today,70);
await user(member);board=await api('outbreak_league_standings',[group]);assert.equal(board.today_unlocked,true);assert.deepEqual(board.rows.map(r=>r.points),[70,70]);assert.deepEqual(board.rows.map(r=>r.rank),[1,1]);assert.equal(board.rows.filter(r=>r.is_me).length,1);
weekly=await api('outbreak_league_standings',[group,'week']);assert.equal(weekly.rows.find(r=>r.player_id===owner).points,(earlier>=monday?25:0)+70);assert.equal(weekly.rows.find(r=>r.player_id===member).points,70);
await api('outbreak_action',['begin',caseIds[today]]);assert.equal((await api('outbreak_daily')).attempt.id,firstAttempt);assert.equal((await api('outbreak_daily')).attempt.score,70);
// Linking this same anonymous identity preserves memberships and its existing official result.
await admin();await q('update auth.users set is_anonymous=false where id=$1',[member]);await q("insert into auth.identities values($1,'google')",[member]);await user(member);assert.equal((await api('outbreak_leagues'))[0].members,2);assert.equal((await api('outbreak_daily')).attempt.id,firstAttempt);assert.equal((await api('outbreak_daily')).attempt.score,70);
// One official record contributes independently to multiple private leagues, even with public opt-in false.
await user(second);const group2=(await api('outbreak_league_manage',['create',null,'Second league'])).id;const inv2=await api('outbreak_league_invite',[group2]);
await user(member);await api('outbreak_league_join',[inv2.token]);const multi=await api('outbreak_league_standings',[group2]);assert.equal(multi.rows.find(r=>r.is_me).points,70);assert.equal((await api('outbreak_profile')).player.public_profile_enabled,false);
// Curated examples and arbitrary shared result values cannot enter the official-attempt join.
await admin();await q(`insert into private.practice_cases(slug,number,public_data,solution,reports) values('league-test-practice','TEST','{"id":"league-test-practice","practice_available":true,"patients":[]}','{"source":0,"score":9999}','{}')`);
await user(member);const beforePractice=await api('outbreak_league_standings',[group,'week']);await api('outbreak_practice',['league-test-practice']);assert.deepEqual((await api('outbreak_league_standings',[group,'week'])).rows,beforePractice.rows);
// An expired viewer attempt unlocks as a server-finalized timeout, without a new attempt.
await user(outsider);await api('outbreak_league_join',[invitation.token]);
await admin();await q("update public.daily_attempts set status='active',completed_at=null,elapsed_seconds=null,score=null,correct_solution=null,started_at=clock_timestamp()-interval '301 seconds' where player_id=$1 and case_id=$2",[outsider,caseIds[today]]);
await user(outsider);const expiredView=await api('outbreak_league_standings',[group]);assert.equal(expiredView.today_unlocked,true);assert.equal(expiredView.rows.find(r=>r.is_me).points,0);assert.equal((await api('outbreak_daily')).attempt.status,'timed_out');
await user(owner);await api('outbreak_league_manage',['remove',group,null,outsider]);
// Database timezone cannot move UTC week/day/join boundaries.
await admin();assert.deepEqual((await q("select * from private.league_period('week','2026-11-01'::date)"))[0],{start_date:new Date('2026-10-26T00:00Z'),end_date:new Date('2026-11-01T00:00Z')});
assert.deepEqual((await q("select start_date::text as s,end_date::text as e from private.league_period('week','2026-11-02'::date)"))[0],{s:'2026-11-02',e:'2026-11-08'});
await db.exec("set timezone='Pacific/Honolulu'");await user(member);board=await api('outbreak_league_standings',[group]);assert.equal(board.today,today);assert.equal(board.start_date,today);
await admin();await q("update private.friend_members set joined_at=($1::date::timestamp at time zone 'UTC')+interval '1 day'-interval '1 millisecond' where group_id=$2 and player_id=$3",[today,group,member]);await user(member);assert.equal((await api('outbreak_league_standings',[group])).rows.find(r=>r.is_me).points,70);
await admin();await q("update private.friend_members set joined_at=($1::date::timestamp at time zone 'UTC')+interval '1 day' where group_id=$2 and player_id=$3",[today,group,member]);await user(member);assert.equal((await api('outbreak_league_standings',[group])).rows.find(r=>r.is_me).points,null);
// Leaving, rejoining, removal and deletion revoke reads, without touching official history.
await api('outbreak_league_manage',['leave',group]);await assert.rejects(()=>api('outbreak_league_standings',[group]));await api('outbreak_league_join',[invitation.token]);
await user(owner);await api('outbreak_league_manage',['remove',group,null,member]);await user(member);await assert.rejects(()=>api('outbreak_league_standings',[group]));assert.equal((await api('outbreak_daily')).attempt.id,firstAttempt);
await user(owner);await api('outbreak_league_manage',['delete',group]);assert.equal((await api('outbreak_league_preview',[invitation.token])).status,'unavailable');await user(member);assert.equal((await api('outbreak_league_join',[invitation.token])).ok,false);assert.equal((await api('outbreak_daily')).attempt.score,70);
// Invalid redemption attempts persist in the action-specific rate limit.
await user(outsider);let blocked;for(let i=0;i<21;i++)blocked=await api('outbreak_league_join',['f'.repeat(64)]);assert.equal(blocked.ok,false);assert.match(blocked.error,/Too many/);
await user(owner);let creationLimited=false;for(let i=0;i<6;i++){const r=await api('outbreak_league_manage',['create',null,'Temporary '+i]);if(r.ok)await api('outbreak_league_manage',['delete',r.id]);else {assert.match(r.error,/limit/);creationLimited=true;break;}}
assert.equal(creationLimited,true);
// Privileged wrappers have empty safe search paths; no anon access except minimal preview.
await admin();const fns=await q("select proname,proconfig from pg_proc join pg_namespace on pg_namespace.oid=pronamespace where nspname='public' and proname like 'outbreak_league%' order by proname");assert.equal(fns.length,6);assert.ok(fns.every(f=>f.proconfig.includes('search_path=\"\"')));
assert.ok((await q("select relrowsecurity from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='private' and relname in ('friend_groups','friend_members','league_request_limits')")).every(r=>r.relrowsecurity));
console.log('PASS: isolated PostgreSQL league migration, anonymous/email/Google player identities, optional Google linking, owner/member/nonmember ACLs, minimal previews, secure token hashing, expiry/revocation, idempotent joins, rate limits, join-date eligibility, UTC weeks, tied ranks, server-side spoiler gates, multiple leagues, leaving/removal/deletion, preserved unique daily attempts and no score copies.');
await db.close();


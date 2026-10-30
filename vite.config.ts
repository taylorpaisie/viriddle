import {defineConfig,loadEnv} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {publicServices} from './config/public-services';
export default defineConfig(({mode})=>{
 const env={...loadEnv(mode,process.cwd(),'VITE_'),...process.env};
 if(!!env.VITE_SUPABASE_URL!==!!env.VITE_SUPABASE_PUBLISHABLE_KEY)throw new Error('Set both public Supabase variables, or leave both empty for local play.');
 const local=env.VITE_PLAY_MODE==='local';
 const url=local?'':env.VITE_SUPABASE_URL||publicServices.supabaseUrl;
 const key=local?'':env.VITE_SUPABASE_PUBLISHABLE_KEY||publicServices.supabasePublishableKey;
 if(!publicServices.supabasePublishableKey.startsWith('sb_publishable_'))throw new Error('The committed browser configuration must use a publishable key.');
 const online=!!(url&&key);
 return {base:env.VITE_BASE_PATH||'/',define:{'import.meta.env.VITE_SUPABASE_URL':JSON.stringify(url),'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY':JSON.stringify(key)},resolve:{alias:{'@game-app':new URL(online?'./src/connectedApp.tsx':'./src/main.tsx',import.meta.url).pathname}},plugins:[tailwindcss()],server:{allowedHosts:['terminal.local']},build:{rollupOptions:{output:{manualChunks:online?((id:string)=>id.includes('/node_modules/@supabase/')?'account-service':undefined):undefined}}}};
});

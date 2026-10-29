import {defineConfig,loadEnv} from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(({mode})=>{
 const env={...loadEnv(mode,process.cwd(),'VITE_'),...process.env};
 const online=!!(env.VITE_SUPABASE_URL&&env.VITE_SUPABASE_PUBLISHABLE_KEY);
 if(!!env.VITE_SUPABASE_URL!==!!env.VITE_SUPABASE_PUBLISHABLE_KEY)throw new Error('Set both public Supabase variables, or leave both empty for local play.');
 return {base:env.VITE_BASE_PATH||'/',resolve:{alias:{'@game-app':new URL(online?'./src/connectedApp.tsx':'./src/main.tsx',import.meta.url).pathname}},plugins:[tailwindcss()],server:{allowedHosts:['terminal.local']},build:{rollupOptions:{output:{manualChunks:online?((id:string)=>id.includes('/node_modules/@supabase/')?'account-service':undefined):undefined}}}};
});

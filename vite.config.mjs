import { defineConfig, loadEnv } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [viteSingleFile()],
    define: {
      __SUPABASE_URL__: JSON.stringify(
        env.VITE_SUPABASE_URL || 'https://rtxwfvnfansnaqxfgrgw.supabase.co'
      ),
      __SUPABASE_ANON_KEY__: JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2jzdnJASo9_WoPbdg2bIBQ_uVGfTfYQ'
      ),
    },
  };
});

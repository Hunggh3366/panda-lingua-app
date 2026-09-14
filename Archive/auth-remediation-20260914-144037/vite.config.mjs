import { defineConfig, loadEnv } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [viteSingleFile()],
    define: {
      __OR_KEY__: JSON.stringify(env.VITE_OPENROUTER_API_KEY || ''),
    },
  };
});

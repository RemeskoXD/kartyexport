import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Umožní přístup zvenčí (např. v Dockeru nebo na serveru)
    port: 3000,
    proxy: {
      // Proxy pro obrázky karet - směruje na produkční server
      '/karty': {
        target: 'https://web9.itnahodinu.cz',
        changeOrigin: true,
        secure: false
      },
      // Proxy pro API volání
      '/api.php': {
        target: 'https://web9.itnahodinu.cz',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
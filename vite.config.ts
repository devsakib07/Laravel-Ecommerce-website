import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

const fetchSetterPlugin: Plugin = {
  name: 'fetch-setter-patch',
  enforce: 'pre',
  transformIndexHtml() {
    return [
      {
        tag: 'script',
        children: `(function(){try{var _raw=window.fetch;var _h=function(){return _raw.apply(window,arguments);};Object.defineProperty(window,'fetch',{get:function(){return _h;},set:function(v){_h=v;},configurable:true,enumerable:true});}catch(e){}})();`,
        injectTo: 'head-prepend',
      },
    ];
  },
};

export default defineConfig(() => {
  return {
    plugins: [fetchSetterPlugin, react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


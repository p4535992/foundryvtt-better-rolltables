// vite.config.mjs
import { svelte } from "file:///D:/GITFOUNDRYVTT/foundryvtt-better-rolltables/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import resolve from "file:///D:/GITFOUNDRYVTT/foundryvtt-better-rolltables/node_modules/@rollup/plugin-node-resolve/dist/es/index.js";
import preprocess from "file:///D:/GITFOUNDRYVTT/foundryvtt-better-rolltables/node_modules/svelte-preprocess/dist/index.js";
import {
  postcssConfig,
  terserConfig,
  typhonjsRuntime
} from "file:///D:/GITFOUNDRYVTT/foundryvtt-better-rolltables/node_modules/@typhonjs-fvtt/runtime/.rollup/remote/index.js";
import { viteStaticCopy } from "file:///D:/GITFOUNDRYVTT/foundryvtt-better-rolltables/node_modules/vite-plugin-static-copy/dist/index.js";
import cleanPlugin from "file:///D:/GITFOUNDRYVTT/foundryvtt-better-rolltables/node_modules/vite-plugin-clean/dist/index.cjs";
import { normalizePath } from "file:///D:/GITFOUNDRYVTT/foundryvtt-better-rolltables/node_modules/vite/dist/node/index.js";
import path from "path";
import { run } from "file:///D:/GITFOUNDRYVTT/foundryvtt-better-rolltables/node_modules/vite-plugin-run/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\GITFOUNDRYVTT\\foundryvtt-better-rolltables";
var s_MODULE_ID = "better-rolltables";
var s_PACKAGE_ID = "modules/" + s_MODULE_ID;
var s_ENTRY_JAVASCRIPT = "module.js";
var s_SVELTE_HASH_ID = "ese";
var s_COMPRESS = false;
var s_SOURCEMAPS = true;
var s_TYPHONJS_MODULE_LIB = false;
var s_RESOLVE_CONFIG = {
  browser: true,
  dedupe: ["svelte"]
};
var vite_config_default = () => {
  return {
    root: "src/",
    // Source location / esbuild root.
    base: `/${s_PACKAGE_ID}/`,
    // Base module path that 30001 / served dev directory.
    publicDir: false,
    // No public resources to copy.
    cacheDir: "../.vite-cache",
    // Relative from root directory.
    resolve: { conditions: ["import", "browser"] },
    esbuild: {
      target: ["es2022", "chrome100"],
      keepNames: true
      // Note: doesn't seem to work.
    },
    css: {
      // Creates a standard configuration for PostCSS with autoprefixer & postcss-preset-env.
      postcss: postcssConfig({
        compress: s_COMPRESS,
        sourceMap: s_SOURCEMAPS
      })
    },
    // About server options:
    // - Set to `open` to boolean `false` to not open a browser window automatically. This is useful if you set up a
    // debugger instance in your IDE and launch it with the URL: 'http://localhost:30001/game'.
    //
    // - The top proxy entry redirects requests under the module path for `style.css` and following standard static
    // directories: `assets`, `lang`, and `packs` and will pull those resources from the main Foundry / 30000 server.
    // This is necessary to reference the dev resources as the root is `/src` and there is no public / static
    // resources served with this particular Vite configuration. Modify the proxy rule as necessary for your
    // static resources / project.
    server: {
      port: 29999,
      open: "/game",
      // open: false,
      proxy: {
        // Serves static files from main Foundry server.
        [`^(/${s_PACKAGE_ID}/(images|fonts|assets|lang|languages|packs|styles|templates|style.css))`]: "http://127.0.0.1:30000",
        // All other paths besides package ID path are served from main Foundry server.
        [`^(?!/${s_PACKAGE_ID}/)`]: "http://127.0.0.1:30000",
        // Enable socket.io from main Foundry server.
        "/socket.io": { target: "ws://127.0.0.1:30000", ws: true }
      }
    },
    build: {
      outDir: normalizePath(path.resolve(__vite_injected_original_dirname, `./dist/${s_MODULE_ID}`)),
      // __dirname,
      emptyOutDir: false,
      sourcemap: s_SOURCEMAPS,
      brotliSize: true,
      minify: s_COMPRESS ? "terser" : false,
      target: ["es2022", "chrome100"],
      terserOptions: s_COMPRESS ? { ...terserConfig(), ecma: 2022 } : void 0,
      lib: {
        entry: "./" + s_ENTRY_JAVASCRIPT,
        // "./module.js"
        formats: ["es"],
        fileName: "module"
      }
    },
    // Necessary when using the dev server for top-level await usage inside of TRL.
    optimizeDeps: {
      esbuildOptions: {
        target: "es2022"
      }
    },
    plugins: [
      run([
        {
          name: "run sass",
          run: ["sass", `src/styles:dist/${s_MODULE_ID}/styles`]
        }
      ]),
      viteStaticCopy({
        targets: [
          {
            src: normalizePath(path.resolve(__vite_injected_original_dirname, "./src/assets")) + "/[!.]*",
            // 1️
            dest: normalizePath(path.resolve(__vite_injected_original_dirname, `./dist/${s_MODULE_ID}/assets`))
            // 2️
          },
          {
            src: normalizePath(path.resolve(__vite_injected_original_dirname, "./src/images")) + "/[!.]*",
            // 1️
            dest: normalizePath(path.resolve(__vite_injected_original_dirname, `./dist/${s_MODULE_ID}/images`))
            // 2️
          },
          {
            src: normalizePath(path.resolve(__vite_injected_original_dirname, "./src/icons")) + "/[!.]*",
            // 1️
            dest: normalizePath(path.resolve(__vite_injected_original_dirname, `./dist/${s_MODULE_ID}/icons`))
            // 2️
          },
          {
            src: normalizePath(path.resolve(__vite_injected_original_dirname, "./src/templates")) + "/[!.]*",
            // 1️
            dest: normalizePath(path.resolve(__vite_injected_original_dirname, `./dist/${s_MODULE_ID}/templates`))
            // 2️
          },
          {
            src: normalizePath(path.resolve(__vite_injected_original_dirname, "./src/lang")) + "/[!.]*",
            dest: normalizePath(path.resolve(__vite_injected_original_dirname, `./dist/${s_MODULE_ID}/lang`))
          },
          {
            src: normalizePath(path.resolve(__vite_injected_original_dirname, "./src/languages")) + "/[!.]*",
            dest: normalizePath(path.resolve(__vite_injected_original_dirname, `./dist/${s_MODULE_ID}/languages`))
          },
          {
            src: normalizePath(path.resolve(__vite_injected_original_dirname, "./src/styles")) + "/**/*.css",
            dest: normalizePath(path.resolve(__vite_injected_original_dirname, `./dist/${s_MODULE_ID}/styles`))
          },
          {
            src: normalizePath(path.resolve(__vite_injected_original_dirname, "./src/packs")) + "/[!.]*",
            dest: normalizePath(path.resolve(__vite_injected_original_dirname, `./dist/${s_MODULE_ID}/packs`))
          },
          {
            src: normalizePath(path.resolve(__vite_injected_original_dirname, "./src/module.json")),
            dest: normalizePath(path.resolve(__vite_injected_original_dirname, `./dist/${s_MODULE_ID}/`))
          }
        ]
      }),
      svelte({
        compilerOptions: {
          // Provides a custom hash adding the string defined in `s_SVELTE_HASH_ID` to scoped Svelte styles;
          // This is reasonable to do as the framework styles in TRL compiled across `n` different packages will
          // be the same. Slightly modifying the hash ensures that your package has uniquely scoped styles for all
          // TRL components and makes it easier to review styles in the browser debugger.
          cssHash: ({ hash, css }) => `svelte-${s_SVELTE_HASH_ID}-${hash(css)}`
        },
        preprocess: preprocess(),
        onwarn: (warning, handler) => {
          if (warning.message.includes(`<a> element should have an href attribute`)) {
            return;
          }
          handler(warning);
        }
      }),
      resolve(s_RESOLVE_CONFIG),
      // Necessary when bundling npm-linked packages.
      // When s_TYPHONJS_MODULE_LIB is true transpile against the Foundry module version of TRL.
      s_TYPHONJS_MODULE_LIB && typhonjsRuntime(),
      cleanPlugin()
    ]
  };
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR0lURk9VTkRSWVZUVFxcXFxmb3VuZHJ5dnR0LWJldHRlci1yb2xsdGFibGVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHSVRGT1VORFJZVlRUXFxcXGZvdW5kcnl2dHQtYmV0dGVyLXJvbGx0YWJsZXNcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HSVRGT1VORFJZVlRUL2ZvdW5kcnl2dHQtYmV0dGVyLXJvbGx0YWJsZXMvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSBcIkBzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGVcIjtcbmltcG9ydCByZXNvbHZlIGZyb20gXCJAcm9sbHVwL3BsdWdpbi1ub2RlLXJlc29sdmVcIjsgLy8gVGhpcyByZXNvbHZlcyBOUE0gbW9kdWxlcyBmcm9tIG5vZGVfbW9kdWxlcy5cbmltcG9ydCBwcmVwcm9jZXNzIGZyb20gXCJzdmVsdGUtcHJlcHJvY2Vzc1wiO1xuaW1wb3J0IHtcbiAgcG9zdGNzc0NvbmZpZyxcbiAgdGVyc2VyQ29uZmlnLFxuICB0eXBob25qc1J1bnRpbWVcbn0gZnJvbSAnQHR5cGhvbmpzLWZ2dHQvcnVudGltZS9yb2xsdXAnO1xuaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tICd2aXRlLXBsdWdpbi1zdGF0aWMtY29weSc7XG5pbXBvcnQgY2xlYW5QbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tY2xlYW4nO1xuaW1wb3J0IHsgbm9ybWFsaXplUGF0aCB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBydW4gfSBmcm9tICd2aXRlLXBsdWdpbi1ydW4nXG5cbi8vIEFUVEVOVElPTiFcbi8vIFBsZWFzZSBtb2RpZnkgdGhlIGJlbG93IHZhcmlhYmxlczogc19QQUNLQUdFX0lEIGFuZCBzX1NWRUxURV9IQVNIX0lEIGFwcHJvcHJpYXRlbHkuXG5cbi8vIEZvciBjb252ZW5pZW5jZSwgeW91IGp1c3QgbmVlZCB0byBtb2RpZnkgdGhlIHBhY2thZ2UgSUQgYmVsb3cgYXMgaXQgaXMgdXNlZCB0byBmaWxsIGluIGRlZmF1bHQgcHJveHkgc2V0dGluZ3MgZm9yXG4vLyB0aGUgZGV2IHNlcnZlci5cbmNvbnN0IHNfTU9EVUxFX0lEID0gXCJiZXR0ZXItcm9sbHRhYmxlc1wiO1xuY29uc3Qgc19QQUNLQUdFX0lEID0gXCJtb2R1bGVzL1wiK3NfTU9EVUxFX0lEO1xuY29uc3Qgc19FTlRSWV9KQVZBU0NSSVBUID0gXCJtb2R1bGUuanNcIjtcblxuLy8gQSBzaG9ydCBhZGRpdGlvbmFsIHN0cmluZyB0byBhZGQgdG8gU3ZlbHRlIENTUyBoYXNoIHZhbHVlcyB0byBtYWtlIHlvdXJzIHVuaXF1ZS4gVGhpcyByZWR1Y2VzIHRoZSBhbW91bnQgb2Zcbi8vIGR1cGxpY2F0ZWQgZnJhbWV3b3JrIENTUyBvdmVybGFwIGJldHdlZW4gbWFueSBUUkwgcGFja2FnZXMgZW5hYmxlZCBvbiBGb3VuZHJ5IFZUVCBhdCB0aGUgc2FtZSB0aW1lLiAnZXNlJyBpcyBjaG9zZW5cbi8vIGJ5IHNob3J0ZW5pbmcgJ2Vzc2VudGlhbC1zdmVsdGUtZXNtJy5cbmNvbnN0IHNfU1ZFTFRFX0hBU0hfSUQgPSBcImVzZVwiO1xuXG5jb25zdCBzX0NPTVBSRVNTID0gZmFsc2U7IC8vIFNldCB0byB0cnVlIHRvIGNvbXByZXNzIHRoZSBtb2R1bGUgYnVuZGxlLlxuY29uc3Qgc19TT1VSQ0VNQVBTID0gdHJ1ZTsgLy8gR2VuZXJhdGUgc291cmNlbWFwcyBmb3IgdGhlIGJ1bmRsZSAocmVjb21tZW5kZWQpLlxuXG4vLyBFWFBFUklNRU5UQUw6IFNldCB0byB0cnVlIHRvIGVuYWJsZSBsaW5raW5nIGFnYWluc3QgdGhlIFR5cGhvbkpTIFJ1bnRpbWUgTGlicmFyeSBtb2R1bGUuXG4vLyBZb3UgbXVzdCBhZGQgYSBGb3VuZHJ5IG1vZHVsZSBkZXBlbmRlbmN5IG9uIHRoZSBgdHlwaG9uanNgIEZvdW5kcnkgcGFja2FnZSBvciBtYW51YWxseSBpbnN0YWxsIGl0IGluIEZvdW5kcnkgZnJvbTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS90eXBob25qcy1mdnR0LWxpYi90eXBob25qcy9yZWxlYXNlcy9sYXRlc3QvZG93bmxvYWQvbW9kdWxlLmpzb25cbmNvbnN0IHNfVFlQSE9OSlNfTU9EVUxFX0xJQiA9IGZhbHNlO1xuXG4vLyBVc2VkIGluIGJ1bmRsaW5nIHBhcnRpY3VsYXJseSBkdXJpbmcgZGV2ZWxvcG1lbnQuIElmIHlvdSBucG0tbGluayBwYWNrYWdlcyB0byB5b3VyIHByb2plY3QgYWRkIHRoZW0gaGVyZS5cbmNvbnN0IHNfUkVTT0xWRV9DT05GSUcgPSB7XG4gIGJyb3dzZXI6IHRydWUsXG4gIGRlZHVwZTogW1wic3ZlbHRlXCJdLFxufTtcblxuLy8gQVRURU5USU9OIVxuLy8gWW91IG11c3QgY2hhbmdlIGBiYXNlYCBhbmQgdGhlIGBwcm94eWAgc3RyaW5ncyByZXBsYWNpbmcgYC9tb2R1bGVzLyR7c19NT0RVTEVfSUR9L2Agd2l0aCB5b3VyXG4vLyBtb2R1bGUgb3Igc3lzdGVtIElELlxuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIC8qKiBAdHlwZSB7aW1wb3J0KCd2aXRlJykuVXNlckNvbmZpZ30gKi9cbiAgcmV0dXJuIHtcbiAgICByb290OiBcInNyYy9cIiwgLy8gU291cmNlIGxvY2F0aW9uIC8gZXNidWlsZCByb290LlxuICAgIGJhc2U6IGAvJHtzX1BBQ0tBR0VfSUR9L2AsIC8vIEJhc2UgbW9kdWxlIHBhdGggdGhhdCAzMDAwMSAvIHNlcnZlZCBkZXYgZGlyZWN0b3J5LlxuICAgIHB1YmxpY0RpcjogZmFsc2UsIC8vIE5vIHB1YmxpYyByZXNvdXJjZXMgdG8gY29weS5cbiAgICBjYWNoZURpcjogXCIuLi8udml0ZS1jYWNoZVwiLCAvLyBSZWxhdGl2ZSBmcm9tIHJvb3QgZGlyZWN0b3J5LlxuXG4gICAgcmVzb2x2ZTogeyBjb25kaXRpb25zOiBbXCJpbXBvcnRcIiwgXCJicm93c2VyXCJdIH0sXG5cbiAgICBlc2J1aWxkOiB7XG4gICAgICB0YXJnZXQ6IFsnZXMyMDIyJywgJ2Nocm9tZTEwMCddLFxuICAgICAga2VlcE5hbWVzOiB0cnVlICAgLy8gTm90ZTogZG9lc24ndCBzZWVtIHRvIHdvcmsuXG4gICAgfSxcblxuICAgIGNzczoge1xuICAgICAgLy8gQ3JlYXRlcyBhIHN0YW5kYXJkIGNvbmZpZ3VyYXRpb24gZm9yIFBvc3RDU1Mgd2l0aCBhdXRvcHJlZml4ZXIgJiBwb3N0Y3NzLXByZXNldC1lbnYuXG4gICAgICBwb3N0Y3NzOiBwb3N0Y3NzQ29uZmlnKHsgXG4gICAgICAgIGNvbXByZXNzOiBzX0NPTVBSRVNTLCBcbiAgICAgICAgc291cmNlTWFwOiBzX1NPVVJDRU1BUFNcbiAgICAgIH0pLFxuICAgIH0sXG5cbiAgICAvLyBBYm91dCBzZXJ2ZXIgb3B0aW9uczpcbiAgICAvLyAtIFNldCB0byBgb3BlbmAgdG8gYm9vbGVhbiBgZmFsc2VgIHRvIG5vdCBvcGVuIGEgYnJvd3NlciB3aW5kb3cgYXV0b21hdGljYWxseS4gVGhpcyBpcyB1c2VmdWwgaWYgeW91IHNldCB1cCBhXG4gICAgLy8gZGVidWdnZXIgaW5zdGFuY2UgaW4geW91ciBJREUgYW5kIGxhdW5jaCBpdCB3aXRoIHRoZSBVUkw6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAxL2dhbWUnLlxuICAgIC8vXG4gICAgLy8gLSBUaGUgdG9wIHByb3h5IGVudHJ5IHJlZGlyZWN0cyByZXF1ZXN0cyB1bmRlciB0aGUgbW9kdWxlIHBhdGggZm9yIGBzdHlsZS5jc3NgIGFuZCBmb2xsb3dpbmcgc3RhbmRhcmQgc3RhdGljXG4gICAgLy8gZGlyZWN0b3JpZXM6IGBhc3NldHNgLCBgbGFuZ2AsIGFuZCBgcGFja3NgIGFuZCB3aWxsIHB1bGwgdGhvc2UgcmVzb3VyY2VzIGZyb20gdGhlIG1haW4gRm91bmRyeSAvIDMwMDAwIHNlcnZlci5cbiAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSB0byByZWZlcmVuY2UgdGhlIGRldiByZXNvdXJjZXMgYXMgdGhlIHJvb3QgaXMgYC9zcmNgIGFuZCB0aGVyZSBpcyBubyBwdWJsaWMgLyBzdGF0aWNcbiAgICAvLyByZXNvdXJjZXMgc2VydmVkIHdpdGggdGhpcyBwYXJ0aWN1bGFyIFZpdGUgY29uZmlndXJhdGlvbi4gTW9kaWZ5IHRoZSBwcm94eSBydWxlIGFzIG5lY2Vzc2FyeSBmb3IgeW91clxuICAgIC8vIHN0YXRpYyByZXNvdXJjZXMgLyBwcm9qZWN0LlxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogMjk5OTksXG4gICAgICBvcGVuOiBcIi9nYW1lXCIsXG4gICAgICAvLyBvcGVuOiBmYWxzZSxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgIC8vIFNlcnZlcyBzdGF0aWMgZmlsZXMgZnJvbSBtYWluIEZvdW5kcnkgc2VydmVyLlxuICAgICAgICBbYF4oLyR7c19QQUNLQUdFX0lEfS8oaW1hZ2VzfGZvbnRzfGFzc2V0c3xsYW5nfGxhbmd1YWdlc3xwYWNrc3xzdHlsZXN8dGVtcGxhdGVzfHN0eWxlLmNzcykpYF06XG4gICAgICAgICAgXCJodHRwOi8vMTI3LjAuMC4xOjMwMDAwXCIsXG5cbiAgICAgICAgLy8gQWxsIG90aGVyIHBhdGhzIGJlc2lkZXMgcGFja2FnZSBJRCBwYXRoIGFyZSBzZXJ2ZWQgZnJvbSBtYWluIEZvdW5kcnkgc2VydmVyLlxuICAgICAgICBbYF4oPyEvJHtzX1BBQ0tBR0VfSUR9LylgXTogXCJodHRwOi8vMTI3LjAuMC4xOjMwMDAwXCIsXG5cbiAgICAgICAgLy8gRW5hYmxlIHNvY2tldC5pbyBmcm9tIG1haW4gRm91bmRyeSBzZXJ2ZXIuXG4gICAgICAgIFwiL3NvY2tldC5pb1wiOiB7IHRhcmdldDogXCJ3czovLzEyNy4wLjAuMTozMDAwMFwiLCB3czogdHJ1ZSB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6IG5vcm1hbGl6ZVBhdGgoIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIGAuL2Rpc3QvJHtzX01PRFVMRV9JRH1gKSksIC8vIF9fZGlybmFtZSxcbiAgICAgIGVtcHR5T3V0RGlyOiBmYWxzZSxcbiAgICAgIHNvdXJjZW1hcDogc19TT1VSQ0VNQVBTLFxuICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcbiAgICAgIG1pbmlmeTogc19DT01QUkVTUyA/IFwidGVyc2VyXCIgOiBmYWxzZSxcbiAgICAgIHRhcmdldDogWydlczIwMjInLCAnY2hyb21lMTAwJ10sXG4gICAgICB0ZXJzZXJPcHRpb25zOiBzX0NPTVBSRVNTID8geyAuLi50ZXJzZXJDb25maWcoKSwgZWNtYTogMjAyMiB9IDogdm9pZCAwLFxuICAgICAgbGliOiB7XG4gICAgICAgIGVudHJ5OiBcIi4vXCIgKyBzX0VOVFJZX0pBVkFTQ1JJUFQsIC8vIFwiLi9tb2R1bGUuanNcIlxuICAgICAgICBmb3JtYXRzOiBbXCJlc1wiXSxcbiAgICAgICAgZmlsZU5hbWU6IFwibW9kdWxlXCIsXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyBOZWNlc3Nhcnkgd2hlbiB1c2luZyB0aGUgZGV2IHNlcnZlciBmb3IgdG9wLWxldmVsIGF3YWl0IHVzYWdlIGluc2lkZSBvZiBUUkwuXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgICB0YXJnZXQ6ICdlczIwMjInXG4gICAgICB9XG4gICAgfSxcblxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJ1bihbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAncnVuIHNhc3MnLFxuICAgICAgICAgIHJ1bjogWydzYXNzJywgIGBzcmMvc3R5bGVzOmRpc3QvJHtzX01PRFVMRV9JRH0vc3R5bGVzYF1cbiAgICAgICAgfSxcbiAgICAgIF0pLFxuICAgICAgdml0ZVN0YXRpY0NvcHkoe1xuICAgICAgICB0YXJnZXRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBub3JtYWxpemVQYXRoKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9hc3NldHMnKSkgKyAnL1shLl0qJywgLy8gMVx1RkUwRlxuICAgICAgICAgICAgZGVzdDogbm9ybWFsaXplUGF0aChwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBgLi9kaXN0LyR7c19NT0RVTEVfSUR9L2Fzc2V0c2ApKSwgLy8gMlx1RkUwRlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBub3JtYWxpemVQYXRoKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9pbWFnZXMnKSkgKyAnL1shLl0qJywgLy8gMVx1RkUwRlxuICAgICAgICAgICAgZGVzdDogbm9ybWFsaXplUGF0aChwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBgLi9kaXN0LyR7c19NT0RVTEVfSUR9L2ltYWdlc2ApKSwgLy8gMlx1RkUwRlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBub3JtYWxpemVQYXRoKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9pY29ucycpKSArICcvWyEuXSonLCAvLyAxXHVGRTBGXG4gICAgICAgICAgICBkZXN0OiBub3JtYWxpemVQYXRoKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIGAuL2Rpc3QvJHtzX01PRFVMRV9JRH0vaWNvbnNgKSksIC8vIDJcdUZFMEZcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogbm9ybWFsaXplUGF0aChwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdGVtcGxhdGVzJykpICsgJy9bIS5dKicsIC8vIDFcdUZFMEZcbiAgICAgICAgICAgIGRlc3Q6IG5vcm1hbGl6ZVBhdGgocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgYC4vZGlzdC8ke3NfTU9EVUxFX0lEfS90ZW1wbGF0ZXNgKSksIC8vIDJcdUZFMEZcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogbm9ybWFsaXplUGF0aChwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvbGFuZycpKSArICcvWyEuXSonLFxuICAgICAgICAgICAgZGVzdDogbm9ybWFsaXplUGF0aChwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBgLi9kaXN0LyR7c19NT0RVTEVfSUR9L2xhbmdgKSksXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IG5vcm1hbGl6ZVBhdGgocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2xhbmd1YWdlcycpKSArICcvWyEuXSonLFxuICAgICAgICAgICAgZGVzdDogbm9ybWFsaXplUGF0aChwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBgLi9kaXN0LyR7c19NT0RVTEVfSUR9L2xhbmd1YWdlc2ApKSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogbm9ybWFsaXplUGF0aChwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvc3R5bGVzJykpICsgJy8qKi8qLmNzcycsXG4gICAgICAgICAgICBkZXN0OiBub3JtYWxpemVQYXRoKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIGAuL2Rpc3QvJHtzX01PRFVMRV9JRH0vc3R5bGVzYCkpLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBub3JtYWxpemVQYXRoKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9wYWNrcycpKSArICcvWyEuXSonLFxuICAgICAgICAgICAgZGVzdDogbm9ybWFsaXplUGF0aChwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBgLi9kaXN0LyR7c19NT0RVTEVfSUR9L3BhY2tzYCkpLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBub3JtYWxpemVQYXRoKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9tb2R1bGUuanNvbicpKSxcbiAgICAgICAgICAgIGRlc3Q6IG5vcm1hbGl6ZVBhdGgocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgYC4vZGlzdC8ke3NfTU9EVUxFX0lEfS9gKSksXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgICAgc3ZlbHRlKHtcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgICAvLyBQcm92aWRlcyBhIGN1c3RvbSBoYXNoIGFkZGluZyB0aGUgc3RyaW5nIGRlZmluZWQgaW4gYHNfU1ZFTFRFX0hBU0hfSURgIHRvIHNjb3BlZCBTdmVsdGUgc3R5bGVzO1xuICAgICAgICAgLy8gVGhpcyBpcyByZWFzb25hYmxlIHRvIGRvIGFzIHRoZSBmcmFtZXdvcmsgc3R5bGVzIGluIFRSTCBjb21waWxlZCBhY3Jvc3MgYG5gIGRpZmZlcmVudCBwYWNrYWdlcyB3aWxsXG4gICAgICAgICAvLyBiZSB0aGUgc2FtZS4gU2xpZ2h0bHkgbW9kaWZ5aW5nIHRoZSBoYXNoIGVuc3VyZXMgdGhhdCB5b3VyIHBhY2thZ2UgaGFzIHVuaXF1ZWx5IHNjb3BlZCBzdHlsZXMgZm9yIGFsbFxuICAgICAgICAgLy8gVFJMIGNvbXBvbmVudHMgYW5kIG1ha2VzIGl0IGVhc2llciB0byByZXZpZXcgc3R5bGVzIGluIHRoZSBicm93c2VyIGRlYnVnZ2VyLlxuICAgICAgICAgY3NzSGFzaDogKHsgaGFzaCwgY3NzIH0pID0+IGBzdmVsdGUtJHtzX1NWRUxURV9IQVNIX0lEfS0ke2hhc2goY3NzKX1gLFxuICAgICAgICB9LFxuICAgICAgICBwcmVwcm9jZXNzOiBwcmVwcm9jZXNzKCksXG4gICAgICAgIG9ud2FybjogKHdhcm5pbmcsIGhhbmRsZXIpID0+IHtcbiAgICAgICAgICAvLyBTdXBwcmVzcyBgYTExeS1taXNzaW5nLWF0dHJpYnV0ZWAgZm9yIG1pc3NpbmcgaHJlZiBpbiA8YT4gbGlua3MuXG4gICAgICAgICAgLy8gRm91bmRyeSBkb2Vzbid0IGZvbGxvdyBhY2Nlc3NpYmlsaXR5IHJ1bGVzLlxuICAgICAgICAgIGlmICh3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoYDxhPiBlbGVtZW50IHNob3VsZCBoYXZlIGFuIGhyZWYgYXR0cmlidXRlYCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gTGV0IFJvbGx1cCBoYW5kbGUgYWxsIG90aGVyIHdhcm5pbmdzIG5vcm1hbGx5LlxuICAgICAgICAgIGhhbmRsZXIod2FybmluZyk7XG4gICAgICAgIH0sXG4gICAgICB9KSxcblxuICAgICAgcmVzb2x2ZShzX1JFU09MVkVfQ09ORklHKSwgLy8gTmVjZXNzYXJ5IHdoZW4gYnVuZGxpbmcgbnBtLWxpbmtlZCBwYWNrYWdlcy5cbiAgICAgIFxuICAgICAgLy8gV2hlbiBzX1RZUEhPTkpTX01PRFVMRV9MSUIgaXMgdHJ1ZSB0cmFuc3BpbGUgYWdhaW5zdCB0aGUgRm91bmRyeSBtb2R1bGUgdmVyc2lvbiBvZiBUUkwuXG4gICAgICBzX1RZUEhPTkpTX01PRFVMRV9MSUIgJiYgdHlwaG9uanNSdW50aW1lKCksXG5cbiAgICAgIGNsZWFuUGx1Z2luKClcbiAgICBdXG4gIH07XG59O1xuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlVLFNBQVMsY0FBYztBQUN4VixPQUFPLGFBQWE7QUFDcEIsT0FBTyxnQkFBZ0I7QUFDdkI7QUFBQSxFQUNFO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxPQUNLO0FBQ1AsU0FBUyxzQkFBc0I7QUFDL0IsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsV0FBVztBQVpwQixJQUFNLG1DQUFtQztBQW1CekMsSUFBTSxjQUFjO0FBQ3BCLElBQU0sZUFBZSxhQUFXO0FBQ2hDLElBQU0scUJBQXFCO0FBSzNCLElBQU0sbUJBQW1CO0FBRXpCLElBQU0sYUFB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LENBQUM7QUFBQTtBQUFBLFVBQ2hGO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSyxjQUFjLEtBQUssUUFBUSxrQ0FBVyxZQUFZLENBQUMsSUFBSTtBQUFBLFlBQzVELE1BQU0sY0FBYyxLQUFLLFFBQVEsa0NBQVcsVUFBVSxXQUFXLE9BQU8sQ0FBQztBQUFBLFVBQzNFO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSyxjQUFjLEtBQUssUUFBUSxrQ0FBVyxpQkFBaUIsQ0FBQyxJQUFJO0FBQUEsWUFDakUsTUFBTSxjQUFjLEtBQUssUUFBUSxrQ0FBVyxVQUFVLFdBQVcsWUFBWSxDQUFDO0FBQUEsVUFDaEY7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLLGNBQWMsS0FBSyxRQUFRLGtDQUFXLGNBQWMsQ0FBQyxJQUFJO0FBQUEsWUFDOUQsTUFBTSxjQUFjLEtBQUssUUFBUSxrQ0FBVyxVQUFVLFdBQVcsU0FBUyxDQUFDO0FBQUEsVUFDN0U7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLLGNBQWMsS0FBSyxRQUFRLGtDQUFXLGFBQWEsQ0FBQyxJQUFJO0FBQUEsWUFDN0QsTUFBTSxjQUFjLEtBQUssUUFBUSxrQ0FBVyxVQUFVLFdBQVcsUUFBUSxDQUFDO0FBQUEsVUFDNUU7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLLGNBQWMsS0FBSyxRQUFRLGtDQUFXLG1CQUFtQixDQUFDO0FBQUEsWUFDL0QsTUFBTSxjQUFjLEtBQUssUUFBUSxrQ0FBVyxVQUFVLFdBQVcsR0FBRyxDQUFDO0FBQUEsVUFDdkU7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsTUFDRCxPQUFPO0FBQUEsUUFDTCxpQkFBaUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBS2hCLFNBQVMsQ0FBQyxFQUFFLE1BQU0sSUFBSSxNQUFNLFVBQVUsZ0JBQWdCLElBQUksS0FBSyxHQUFHLENBQUM7QUFBQSxRQUNwRTtBQUFBLFFBQ0EsWUFBWSxXQUFXO0FBQUEsUUFDdkIsUUFBUSxDQUFDLFNBQVMsWUFBWTtBQUc1QixjQUFJLFFBQVEsUUFBUSxTQUFTLDJDQUEyQyxHQUFHO0FBQ3pFO0FBQUEsVUFDRjtBQUdBLGtCQUFRLE9BQU87QUFBQSxRQUNqQjtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BRUQsUUFBUSxnQkFBZ0I7QUFBQTtBQUFBO0FBQUEsTUFHeEIseUJBQXlCLGdCQUFnQjtBQUFBLE1BRXpDLFlBQVk7QUFBQSxJQUNkO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=

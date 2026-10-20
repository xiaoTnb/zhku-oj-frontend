import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
// import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import viteImagemin from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      vue(),
      // 生产环境启用图片压缩
      isProduction && viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false
        },
        mozjpeg: {
          quality: 80
        },
        optipng: {
          optimizationLevel: 7
        },
        pngquant: {
          quality: [0.65, 0.8],
          speed: 4
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox'
            },
            {
              name: 'removeEmptyAttrs',
              active: false
            }
          ]
        }
      }),
      // 生产环境启用Gzip压缩
      isProduction && viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240, // 大于10KB的文件才压缩
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false // 保留原文件
      }),
      // 生产环境启用Brotli压缩
      isProduction && viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginFile: false
      }),
      // 构建分析器
      // isProduction && visualizer({
      //   filename: 'dist/stats.html',
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true
      // })
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`
        }
      }
    },
    optimizeDeps: {
      include: ['monaco-editor']
    },
    base: '/oj/',// 必须在路由文件中同步配置前端路由基地址
    server: {
      port: parseInt(env.VITE_DEV_PORT) || 25173,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_SERVER_HOST || 'http://118.195.215.81:8082',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            const apiProxyPrefix = env.VITE_API_PROXY_PREFIX || '';
            return apiProxyPrefix ? `${apiProxyPrefix}${path}` : path;
          }
        }
      }
    },
    build: {
      // 生产环境构建配置
      target: 'es2015', // 支持现代浏览器
      minify: 'terser', // 使用terser进行更彻底的压缩
      terserOptions: {
        compress: {
          drop_console: true, // 移除console
          drop_debugger: true, // 移除debugger
          pure_funcs: ['console.log'], // 移除指定函数调用
        },
        mangle: {
          safari10: true // 兼容Safari 10
        }
      },
      rollupOptions: {
        output: {
          // 分块策略
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'element-plus': ['element-plus', '@element-plus/icons-vue'],
            'marked': ['marked'],
            'monaco-editor': ['monaco-editor'],
            'utils': ['axios', '@zxing/browser', '@zxing/library']
          },
          // 文件命名策略
          chunkFileNames: 'static/[name]-[hash].js',
          entryFileNames: 'static/[name]-[hash].js',
          assetFileNames: (assetInfo: any) => {
            if (!assetInfo.name) return 'assets/[name]-[hash].[ext]'
            const info = assetInfo.name.split('.')
            let extType = info[info.length - 1]
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              extType = 'media'
            } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name)) {
              extType = 'img'
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              extType = 'fonts'
            }
            return `${extType}/[name]-[hash].[ext]`
          }
        },
        // 外部依赖优化
        external: () => {
          // 可以根据需要排除某些大型库
          return false
        }
      },
      // 启用CSS代码分割
      cssCodeSplit: true,
      // 启用源码映射（生产环境可关闭）
      sourcemap: false,
      // 构建输出目录
      outDir: 'dist',
      // 静态资源处理
      assetsDir: 'static',
      // 小于此阈值的导入或引用资源将内联为base64编码
      assetsInlineLimit: 4096,
      // 启用/禁用CSS压缩
      cssMinify: true,
      // 构建后清除输出目录
      emptyOutDir: true,
      // 启用构建报告
      reportCompressedSize: true,
      // 块大小警告限制
      chunkSizeWarningLimit: 1000
    }
  }
})

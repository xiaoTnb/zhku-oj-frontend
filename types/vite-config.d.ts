// vite 配置类型声明
declare module 'vite' {
  export interface UserConfig {
    // 这里可以添加自定义配置项
  }
}

// 插件类型声明
declare module '@vitejs/plugin-vue' {
  import { Plugin } from 'vite'
  export default function vue(): Plugin
}

declare module 'rollup-plugin-visualizer' {
  import { Plugin } from 'vite'
  export interface VisualizerOptions {
    filename?: string
    open?: boolean
    gzipSize?: boolean
    brotliSize?: boolean
  }
  export function visualizer(options?: VisualizerOptions): Plugin
}

declare module 'vite-plugin-compression' {
  import { Plugin } from 'vite'
  export interface ViteCompressionOptions {
    verbose?: boolean
    disable?: boolean
    threshold?: number
    algorithm?: 'gzip' | 'brotliCompress'
    ext?: string
    deleteOriginFile?: boolean
  }
  export default function viteCompression(options?: ViteCompressionOptions): Plugin
}

declare module 'vite-plugin-imagemin' {
  import { Plugin } from 'vite'
  export interface ImageminOptions {
    gifsicle?: {
      optimizationLevel?: number
      interlaced?: boolean
    }
    mozjpeg?: {
      quality?: number
    }
    optipng?: {
      optimizationLevel?: number
    }
    pngquant?: {
      quality?: [number, number]
      speed?: number
    }
    svgo?: {
      plugins?: Array<{
        name?: string
        active?: boolean
      }>
    }
  }
  export default function viteImagemin(options?: ImageminOptions): Plugin
}
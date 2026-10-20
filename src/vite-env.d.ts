/// <reference types="vite/client" />

// 为 vue3-qrcode-reader 添加类型声明
declare module 'vue3-qrcode-reader' {
  import { DefineComponent } from 'vue'
  
  // 定义摄像头约束类型
  export interface VideoConstraints {
    facingMode?: 'user' | 'environment' | { exact: 'user' | 'environment' } | { ideal: 'user' | 'environment' }
    width?: number | { min?: number; max?: number; ideal?: number; exact?: number }
    height?: number | { min?: number; max?: number; ideal?: number; exact?: number }
    aspectRatio?: number | { min?: number; max?: number; ideal?: number; exact?: number }
    frameRate?: number | { min?: number; max?: number; ideal?: number; exact?: number }
  }
  
  export interface QrStreamConstraints {
    video?: boolean | VideoConstraints
    audio?: boolean | MediaTrackConstraints
    facingMode?: 'user' | 'environment'
  }
  
  export interface QrStreamProps {
    constraints?: QrStreamConstraints
    track?: (promise: Promise<MediaStream>) => void
    paused?: boolean
  }
  
  export interface QrCaptureProps {
    capture?: boolean | string
  }
  
  export interface QrDropZoneProps {
    // 拖拽区域相关属性
  }
  
  export const QrStream: DefineComponent<QrStreamProps>
  export const QrCapture: DefineComponent<QrCaptureProps>
  export const QrDropZone: DefineComponent<QrDropZoneProps>
}
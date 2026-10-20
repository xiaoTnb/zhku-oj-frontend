<template>
  <div class="custom-qr-scanner">
    <video 
      ref="videoRef" 
      autoplay 
      playsinline 
      style="width: 100%; height: 300px; background: #000;"
    ></video>
    <canvas ref="canvasRef" style="display: none;"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/browser';

// Props
interface Props {
  scanning: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'qr-detected': [result: string];
  error: [error: string];
  'camera-on': [];
}>();

// Refs
const videoRef = ref<HTMLVideoElement>();
const canvasRef = ref<HTMLCanvasElement>();
const qrCodeReader = ref<BrowserMultiFormatReader>();
const stream = ref<MediaStream>();
const scanningActive = ref(false);

// 启动摄像头
async function startCamera() {
  try {
    console.log('🔍 启动自定义QR扫描器摄像头...');
    console.log('📱 videoRef:', videoRef.value);
    console.log('🎨 canvasRef:', canvasRef.value);
    
    if (!videoRef.value || !canvasRef.value) {
      throw new Error('视频或画布元素未找到');
    }

    // 初始化QR码读取器
    qrCodeReader.value = new BrowserMultiFormatReader();
    console.log('📖 QR码读取器初始化完成');
    
    // 获取摄像头流
    console.log('🎥 请求摄像头权限...');
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'user', // 改为前置摄像头，更容易测试
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });
    
    console.log('✅ 摄像头权限获取成功');
    stream.value = mediaStream;
    videoRef.value.srcObject = mediaStream;
    
    // 等待视频加载
    await new Promise((resolve) => {
      if (videoRef.value) {
        videoRef.value.onloadedmetadata = () => {
          console.log('📹 视频元数据加载完成');
          resolve(undefined);
        };
      }
    });
    
    console.log('📹 自定义QR扫描器摄像头启动成功');
    emit('camera-on');
    
    // 开始扫描
    startScanning();
    
  } catch (error) {
    console.error('❌ 启动自定义QR扫描器失败:', error);
    emit('error', (error as Error).message || '启动摄像头失败');
  }
}

// 开始扫描
function startScanning() {
  if (!videoRef.value || !canvasRef.value || !qrCodeReader.value) {
    return;
  }

  scanningActive.value = true;
  
  const scanFrame = () => {
    if (!scanningActive.value || !props.scanning || !videoRef.value || !canvasRef.value || !qrCodeReader.value) {
      return;
    }

    try {
      const video = videoRef.value;
      
      // 确保视频已加载
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // 设置canvas尺寸
        canvasRef.value.width = video.videoWidth;
        canvasRef.value.height = video.videoHeight;
        
        // 绘制视频帧到canvas
        const ctx = canvasRef.value.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvasRef.value.width, canvasRef.value.height);
          
          // 尝试解码QR码
          try {
            const result = qrCodeReader.value.decodeFromCanvas(canvasRef.value);
            if (result) {
              console.log('🎯 QR码扫描成功:', result.getText());
              emit('qr-detected', result.getText());
              return; // 扫描成功后停止
            }
          } catch (decodeError) {
            // 扫描失败是正常的，继续下一帧
          }
        }
      }
    } catch (error) {
      console.error('QR扫描错误:', error);
    }

    // 继续扫描下一帧
    if (scanningActive.value && props.scanning) {
      requestAnimationFrame(scanFrame);
    }
  };

  // 开始扫描
  requestAnimationFrame(scanFrame);
}

// 停止摄像头
function stopCamera() {
  console.log('🛑 停止自定义QR扫描器');
  
  scanningActive.value = false;
  
  // 停止摄像头流
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = undefined;
  }
  
  // 清理video元素
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
  
  // 重置QR码读取器
  qrCodeReader.value = undefined;
}

// 监听扫描状态变化
watch(() => props.scanning, (newScanning) => {
  if (newScanning) {
    nextTick(() => {
      startCamera();
    });
  } else {
    stopCamera();
  }
});

// 组件挂载时启动摄像头
onMounted(() => {
  if (props.scanning) {
    nextTick(() => {
      startCamera();
    });
  }
});

// 组件卸载时清理
onUnmounted(() => {
  stopCamera();
});
</script>

<style scoped>
.custom-qr-scanner {
  position: relative;
  width: 100%;
  height: 300px;
  background: #000;
}

/* 移动端适配，覆盖内联高度 */
.custom-qr-scanner video {
  width: 100% !important;
  height: 300px !important;
  background: #000 !important;
  object-fit: cover;
}
@media (max-width: 768px) {
  .custom-qr-scanner {
    height: auto;
  }
  .custom-qr-scanner video {
    height: 40vh !important;
  }
}
@media (max-width: 768px) and (orientation: landscape) and (max-height: 500px) {
  .custom-qr-scanner video {
    height: 50vh !important;
  }
}
</style>
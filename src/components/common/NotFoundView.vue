<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- 动画容器 -->
      <div class="animation-container">
        <div class="ghost">
          <div class="face">
            <div class="eye left"></div>
            <div class="eye right"></div>
            <div class="mouth"></div>
          </div>
        </div>
      </div>
      
      <div class="error-code">404</div>
      <div class="error-message">页面走丢了</div>
      <p class="error-description">
        可能的原因：<br>
        • 页面已被移动或删除<br>
        • 输入了错误的URL<br>
        • 页面正在开发中
      </p>
      
      <div class="action-buttons">
        <el-button type="primary" :icon="House" @click="goHome">
          返回首页
        </el-button>
        <el-button :icon="ArrowLeft" @click="goBack">
          返回上页
        </el-button>
        <el-button :icon="Refresh" @click="reload">
          刷新页面
        </el-button>
      </div>
      
      <!-- 底部链接 -->
      <div class="footer-links">
        <el-link :underline="false" @click="goFeedback">反馈问题</el-link>
        <el-divider direction="vertical" />
        <el-link :underline="false" @click="goHelp">帮助中心</el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { House, ArrowLeft, Refresh } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const reload = () => {
  window.location.reload()
}

const goFeedback = () => {
  // 跳转到反馈页面或打开反馈对话框
  console.log('跳转到反馈页面')
}

const goHelp = () => {
  // 跳转到帮助中心
  console.log('跳转到帮助中心')
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.not-found-content {
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.animation-container {
  margin-bottom: 30px;
}

.ghost {
  width: 100px;
  height: 120px;
  background: #f0f2f5;
  border-radius: 50% 50% 0 0;
  position: relative;
  margin: 0 auto;
  animation: float 3s ease-in-out infinite;
}

.face {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
}

.eye {
  width: 12px;
  height: 12px;
  background: #333;
  border-radius: 50%;
  position: absolute;
  top: 0;
}

.eye.left {
  left: 10px;
}

.eye.right {
  right: 10px;
}

.mouth {
  width: 30px;
  height: 8px;
  background: #333;
  border-radius: 0 0 50% 50%;
  position: absolute;
  top: 25px;
  left: 50%;
  transform: translateX(-50%);
}

.error-code {
  font-size: 80px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
  margin-bottom: 16px;
}

.error-message {
  font-size: 24px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 500;
}

.error-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 32px;
  line-height: 1.6;
  text-align: left;
  display: inline-block;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 20px;
    margin: 20px;
  }
  
  .error-code {
    font-size: 60px;
  }
  
  .error-message {
    font-size: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .el-button {
    width: 200px;
  }
}
</style>
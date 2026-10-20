<template>
  <div class="about">
    <el-container>
      <!-- 头部导航 -->
      <el-header height="1px">
      </el-header>

      <el-main>
        <div class="about__content">
          <el-card class="about__card">
            <div class="about__header">
              <h1>关于仲恺农业工程学院刷题平台</h1>
              <p>提升编程能力，成就技术梦想</p>
            </div>

            <div class="about__sections">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="about__section">
                    <h3>🎯 平台目标</h3>
                    <p>
                      本平台致力于为仲恺农业工程学院的学生提供一个高质量的编程练习环境，
                      帮助大家提升算法思维和编程能力，为将来的学习和工作打下坚实基础。
                    </p>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="about__section">
                    <h3>💻 技术特色</h3>
                    <p>
                      采用现代化的 Web 技术栈构建，提供流畅的用户体验。
                      支持多种编程语言，实时代码编辑和执行，让刷题变得更加高效和有趣。
                    </p>
                  </div>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="about__section">
                    <h3>📚 丰富题库</h3>
                    <p>
                      精心整理的题目涵盖数据结构、算法、数学等多个领域，
                      难度从入门到进阶，适合不同水平的同学进行练习和提升。
                    </p>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="about__section">
                    <h3>🤝 开源共建</h3>
                    <p>
                      欢迎同学们贡献题目、优化功能、提出建议。
                      让我们一起构建更好的学习平台，共同进步。
                    </p>
                  </div>
                </el-col>
              </el-row>
            </div>

            <el-divider />

            <div class="about__tech">
              <h3>🛠️ 技术栈</h3>
              <div class="about__tech-items">
                <el-tag size="large" class="about__tech-tag">Vue 3</el-tag>
                <el-tag size="large" class="about__tech-tag">TypeScript</el-tag>
                <el-tag size="large" class="about__tech-tag">Vite</el-tag>
                <el-tag size="large" class="about__tech-tag">Element Plus</el-tag>
                <el-tag size="large" class="about__tech-tag">Monaco Editor</el-tag>
                <el-tag size="large" class="about__tech-tag">Pinia</el-tag>
              </div>
            </div>

            <el-divider />

            <div class="about__contact">
              <h3>📞 联系我们</h3>
              <p>
                如有问题或建议，请联系开发团队。我们会持续改进平台，为大家提供更好的学习体验。
              </p>
              <div class="about__contact-info">
                <p><strong>项目地址:</strong> <a href="https://github.com/UrmsOne/ZKCodeArenaUI" target="_blank">GitHub</a></p>
                <p><strong>版本:</strong> v1.0.0</p>
                <p><strong>更新时间:</strong> 2025年11月</p>
              </div>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeIndex = ref('3')

const handleSelect = (key: string) => {
  switch (key) {
    case '1':
      router.push('/problems')
      break
    case '2':
      router.push('/problems/category')
      break
    case '3':
      router.push('/about')
      break
  }
}
</script>

<style scoped lang="scss">
.about {
  min-height: 100vh;

  &__content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }

  &__card {
    padding: 20px;
    background: $bg-card;
    border: 1px solid $border-card;
    border-radius: $border-radius-card;
    box-shadow: $shadow-light;
  }

  &__header {
    text-align: center;
    margin-bottom: 40px;

    h1 {
      margin: 0 0 10px 0;
      color: $text-primary;
      font-size: 32px;
    }

    p {
      margin: 0;
      color: $text-secondary;
      font-size: 18px;
    }
  }

  &__sections {
    margin-bottom: 30px;
  }

  &__section {
    margin-bottom: 30px;

    h3 {
      margin: 0 0 15px 0;
      color: $color-primary;
      font-size: 18px;
    }

    p {
      margin: 0;
      color: $text-tertiary;
      line-height: 1.6;
      font-size: 15px;
    }
  }

  &__tech {
    h3 {
      margin: 0 0 20px 0;
      color: $color-primary;
      font-size: 18px;
    }

    &-items {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    &-tag {
      padding: 8px 16px;
      font-size: 14px;
    }
  }

  &__contact {
    h3 {
      margin: 0 0 15px 0;
      color: $color-primary;
      font-size: 18px;
    }

    p {
      margin: 0 0 10px 0;
      color: $text-tertiary;
      line-height: 1.6;
    }

    &-info {
      margin-top: 20px;

      p {
        margin-bottom: 8px;
      }

      a {
        color: $color-primary;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>

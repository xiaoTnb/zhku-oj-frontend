// 语言配置
export const languageConfig = {
  javascript: {
    name: 'JavaScript',
    extension: '.js',
    monaco: 'javascript'
  },
  python: {
    name: 'Python',
    extension: '.py',
    monaco: 'python'
  },
  java: {
    name: 'Java',
    extension: '.java',
    monaco: 'java'
  },
  cpp: {
    name: 'C++',
    extension: '.cpp',
    monaco: 'cpp'
  },
  c: {
    name: 'C',
    extension: '.c',
    monaco: 'c'
  },
  typescript: {
    name: 'TypeScript',
    extension: '.ts',
    monaco: 'typescript'
  },
  go: {
    name: 'Go',
    extension: '.go',
    monaco: 'go'
  },
  rust: {
    name: 'Rust',
    extension: '.rs',
    monaco: 'rust'
  },
  php: {
    name: 'PHP',
    extension: '.php',
    monaco: 'php'
  },
  ruby: {
    name: 'Ruby',
    extension: '.rb',
    monaco: 'ruby'
  },
  csharp: {
    name: 'C#',
    extension: '.cs',
    monaco: 'csharp'
  },
  swift: {
    name: 'Swift',
    extension: '.swift',
    monaco: 'swift'
  },
  kotlin: {
    name: 'Kotlin',
    extension: '.kt',
    monaco: 'kotlin'
  },
  scala: {
    name: 'Scala',
    extension: '.scala',
    monaco: 'scala'
  },
  perl: {
    name: 'Perl',
    extension: '.pl',
    monaco: 'perl'
  },
  r: {
    name: 'R',
    extension: '.r',
    monaco: 'r'
  },
  matlab: {
    name: 'MATLAB',
    extension: '.m',
    monaco: 'matlab'
  },
  shell: {
    name: 'Shell',
    extension: '.sh',
    monaco: 'shell'
  }
}

// 语言模板代码
export const languageTemplates: Record<string, string> = {
  java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
    //请在这里输入代码
    }

}`
}

// 前端显示名称到后端API语言标识符的映射
export const languageDisplayToApi: Record<string, string> = {
  'Python': 'python',
  'Java': 'java',
  'C++': 'cpp',
  'C': 'c',
  'JavaScript': 'javascript',
  'Go': 'go',
  'TypeScript': 'typescript',
  'Rust': 'rust',
  'PHP': 'php',
  'Ruby': 'ruby',
  'C#': 'csharp',
  'Swift': 'swift',
  'Kotlin': 'kotlin',
  'Scala': 'scala',
  'Perl': 'perl',
  'R': 'r',
  'MATLAB': 'matlab',
  'Shell': 'shell'
}

// 转换前端显示的语言名称为后端API期望的格式
export const convertLanguageForApi = (displayLanguage: string): string => {
  return languageDisplayToApi[displayLanguage] || displayLanguage.toLowerCase()
}

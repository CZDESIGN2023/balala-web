<script setup lang="ts">
// import { ref } from 'vue'
// import Editor from '@tinymce/tinymce-vue'
// import { marked } from 'marked'

// const markdownContent = ref('# Hello, world!')
// const init = {
//   height: 400,
//   language_url: '/tinymce/langs/zh-Hans.js',
//   language: 'zh-Hans',
//   skin_url: '/tinymce/skins/ui/oxide',
//   content_css: '/tinymce/skins/content/default/content.css',
//   setup: (editor: any) => {
//     editor.on('change', () => {
//       setTimeout(() => {
//         const text = editor.getContent({ format: 'text' })
//         const markdown = marked.parse(text)
//         markdownContent.value = markdown
//       }, 100)
//     })
//   },
// }
</script>

<template>
  <div>
    <!-- <Editor v-model="markdownContent" :init="init" /> -->
  </div>
</template>

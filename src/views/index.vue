<template>
  <div class="app-container home">

    <div class="pdf-embed">
      <!-- <VuePdfEmbed v-for="(item, index) in totalPages" :key="index" :source="pdfUrl" :page="index + 1"
        @loaded="onDocumentLoad" @page-rendered="onPageRendered" /> -->
      <!-- <div class="pagination">
        <button @click="currentPage--" :disabled="currentPage <= 1">上一页</button>
        <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button @click="currentPage++" :disabled="currentPage >= totalPages">下一页</button>
      </div> -->
    </div>

    <!-- <div style="width: 20%;" v-html="convertedHtml"></div> -->
    <img src="https://yilaapi.openhola.com/profile/upload/2025/12/19/微信图片_20251219125120_263_750_20251219125235A002.png"
      alt="" style="width: 100%;" />
  </div>
</template>

<script setup name="Index">
import { ref, onMounted } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'

const pdfUrl = ref('http://192.168.0.103:8080/profile/易拉报价系统操作指南.pdf')
const currentPage = ref(1)
const totalPages = ref(5)

const onDocumentLoad = (doc) => {
  totalPages.value = doc.numPages
}
const onPageRendered = () => {
  console.log('页面渲染完成')
}
// onMounted(() => {
//   // 可以在这里执行一些初始化操作
//   onDocumentLoad()
// })

// import { ref, onMounted } from 'vue'
// import mammoth from 'mammoth'

// const convertedHtml = ref('')

// onMounted(async () => {
//   try {
//     const response = await fetch('http://192.168.0.103:8080/profile/易拉报价系统操作指南.pdf')
//     const arrayBuffer = await response.arrayBuffer()

//     const result = await mammoth.convertToHtml({ arrayBuffer })
//     convertedHtml.value = result.value
//   } catch (error) {
//     console.error('文档转换失败:', error)
//   }
// })
// function goTarget (url) {
//   window.open(url, '__blank')
// }
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }

  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }

  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans",
  "Helvetica Neue",
  Helvetica,
  Arial,
  sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

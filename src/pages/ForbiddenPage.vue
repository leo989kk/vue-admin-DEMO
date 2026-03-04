<!-- src/pages/ForbiddenPage.vue -->
<template>
  <div class="wrap">
    <el-result
      icon="warning"
      title="403 Forbidden"
      sub-title="你没有权限访问该页面"
    >
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

// 路由实例
const router = useRouter();

// 回到首页
function goHome() {
  router.replace("/");
}

// 返回上一页
function goBack() {
  router.back();
}
</script>

<style scoped>
.wrap {
  height: 100vh;
  display: grid;
  place-items: center;
  background: var(--el-fill-color-lighter);
}
</style>

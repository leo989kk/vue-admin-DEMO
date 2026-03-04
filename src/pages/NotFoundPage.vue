<template>
  <div class="wrap">
    <el-result
      icon="error"
      title="404 not found"
      sub-title="Sorry, the page you visited does not exist."
    >
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

// 路由实例
const router = useRouter();

// 404 页点击返回首页
function goHome() {
  router.replace("/");
}
</script>

<style lang="css" scoped>
.wrap {
  height: 100vh;
  display: grid;
  place-items: center;
  background: var(--el-fill-color-lighter);
}
</style>

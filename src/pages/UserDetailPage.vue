<template>
  <!-- 用户详情页 -->
  <div>
    <h2>用户详情</h2>
    <!-- 当前仅展示路由参数里的用户 ID -->
    <el-descriptions border :column="1">
      <el-descriptions-item label="User ID">{{ id }}</el-descriptions-item>
    </el-descriptions>

    <el-button style="margin-top: 16px" @click="goBack">返回</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

// 读取当前路由与路由实例
const route = useRoute();
const router = useRouter();

// 获取动态路由参数 :id
const id = route.params.id;

// 返回上一页
function goBack() {
  router.back();
}
</script>

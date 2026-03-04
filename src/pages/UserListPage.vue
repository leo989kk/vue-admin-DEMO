<template>
  <div>
    <h2>用户管理</h2>

    <el-space wrap>
      <!-- 只有有 user:create 权限才显示 -->
      <el-button type="primary" v-permission="['user:create']">
        新建用户
      </el-button>

      <!-- 只有有 user:edit 权限才显示 -->
      <el-button type="warning" v-permission="['user:edit']">
        编辑用户
      </el-button>

      <!-- 任意人可见 -->
      <el-button>普通按钮</el-button>
    </el-space>
    <el-space style="margin: 12px 0" wrap>
      <el-button @click="loadUsers">刷新</el-button>
      <el-button type="warning" @click="testConcurrent401">
        并发401测试（只应刷新1次）
      </el-button>
    </el-space>
    <el-divider />

    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column label="操作" width="240">
        <template #default>
          <el-button size="small" v-permission="['user:edit']">编辑</el-button>
          <el-button size="small" type="danger" v-permission="['user:delete']">
            删除（默认无权限）
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-alert
      v-if="errorText"
      type="error"
      :closable="false"
      :title="`接口请求失败：${errorText}`"
      style="margin: 12px 0"
    />
  </div>
</template>

<script setup lang="ts">
import { useAbortable } from "@/composables/useAbortable";
import { getUsers, type User } from "@/services/userApi";
import { onMounted, ref } from "vue";

async function loadUsers() {
  errorText.value = "";
  try {
    tableData.value = await getUsers(newSignal());
  } catch (e: any) {
    errorText.value = e?.message || "加载失败";
    tableData.value = [];
  }
}

async function testConcurrent401() {
  /**
   * 测试思路：
   * 1) 先把 access_token 改成错误值，触发 401
   * 2) 同时发 5 个请求（每个请求独立 signal，避免互相 abort）
   * 3) 观察 Network：/api/auth/refresh 只能出现 1 次
   */
  localStorage.setItem("access_token", "xxx"); // 如果你的 key 不叫这个，换成真实 key

  errorText.value = "";
  const controllers = Array.from({ length: 5 }, () => new AbortController());

  try {
    await Promise.all(controllers.map((c) => getUsers(c.signal)));
    // 并发成功后再拉一次刷新 UI
    tableData.value = await getUsers(newSignal());
  } catch (e: any) {
    errorText.value = e?.message || "并发测试失败";
  }
}

// 请求取消工具：重复进入页面时中止旧请求
const { newSignal } = useAbortable();
// 表格数据
const tableData = ref<User[]>([]);
// 错误文案（用于页面告警）
const errorText = ref("");

// 页面挂载后拉取用户列表
onMounted(async () => {
  // loadUsers;
  try {
    // 传入 signal，支持组件卸载自动取消
    tableData.value = await getUsers(newSignal());

    errorText.value = "";
  } catch (e: any) {
    // 被 AbortController 取消时不提示
    if (e?.code === "ERR_CANCELED") return;

    // 页面只做状态展示，不再二次 toast
    errorText.value = e?.message || "加载失败";
    tableData.value = [];
  }
});
</script>

<style scoped></style>

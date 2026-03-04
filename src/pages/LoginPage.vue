<!-- src/pages/LoginPage.vue -->
<template>
  <div class="login-page">
    <el-card class="login-card">
      <template #header>
        <div class="login-title">登录</div>
      </template>

      <!-- Element Plus 表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        @keyup.enter="onSubmit"
      >
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="submitting"
            @click="onSubmit"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <el-text type="info" size="small">
        说明：目前是 Mock 登录，任何账号密码都能进。
      </el-text>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { apiClient, unwrapData } from "@/services/apiClient";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import type { ApiResponse } from "@/types/api";
import type { FormInstance, FormRules } from "element-plus";
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
const user = useUserStore();
// 表单实例（用于触发表单校验）
const formRef = ref<FormInstance>();

// 表单数据（响应式对象）
const form = reactive({
  username: "",
  password: "",
});

// Element Plus 表单校验规则
const rules: FormRules = {
  username: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const submitting = ref(false);

// 路由与认证 store
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

/**
 * Mock 登录逻辑：
 * 1) 校验表单
 * 2) 生成一个假 token（真实项目里这里会调后端登录接口）
 * 3) 写入 authStore
 * 4) 跳转到登录前想去的页面（如果有 redirect），否则回首页
 */
async function onSubmit() {
  if (!formRef.value) return;

  // 触发表单校验
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    // 登录接口响应结构
    type LoginResp = { accessToken: string; refreshToken: string };

    // 发起登录请求
    const resp = await apiClient.post<ApiResponse<LoginResp>>("/auth/login", {
      username: form.username,
      password: form.password,
    });

    // 解包并写入 token
    const data = unwrapData(resp.data);
    auth.setTokens(data);
    await user.loadMe();
    // 根据 redirect 回跳或默认进入首页
    const redirect = (route.query.redirect as string) || "/";
    await router.replace(redirect);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: grid;
  place-items: center;
  background: var(--el-fill-color-lighter);
}

.login-card {
  width: 420px;
}

.login-title {
  font-weight: 700;
  font-size: 16px;
}
</style>

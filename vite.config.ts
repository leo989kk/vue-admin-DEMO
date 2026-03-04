import vue from "@vitejs/plugin-vue";
import path from "path";
import { type Plugin } from "vite";
import { defineConfig } from "vitest/config";

function mockApiPlugin(): Plugin {
  // ✅ in-memory token store（dev server 进程内有效）
  const validAccessTokens = new Set<string>();
  const validRefreshTokens = new Set<string>();

  // ✅ 解析 POST JSON body 的小工具
  const readJsonBody = (req: any) =>
    new Promise<any>((resolve) => {
      let raw = "";
      req.on("data", (chunk: any) => (raw += chunk));
      req.on("end", () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch {
          resolve({});
        }
      });
    });

  return {
    name: "mock-api-plugin",
    configureServer(server) {
      // 统一 JSON 响应头（只对 /api）
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api")) return next();
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        next();
      });

      // ===== /api/auth/login =====
      server.middlewares.use("/api/auth/login", async (req, res, next) => {
        if (req.method !== "POST") return next();

        // 读 body（这里不校验账号密码，纯 mock）
        await readJsonBody(req);

        const accessToken = `acc_${Date.now()}`;
        const refreshToken = `ref_${Date.now()}`;

        validAccessTokens.add(accessToken);
        validRefreshTokens.add(refreshToken);

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            code: "1",
            msg: null,
            data: { accessToken, refreshToken },
          }),
        );
      });
      server.middlewares.use("/api/me", async (req, res, next) => {
        if (req.method !== "GET") return next();

        // 校验 access token（复用 users 的逻辑）
        const authHeader = req.headers["authorization"] || "";
        const token = String(authHeader).replace("Bearer ", "");

        if (!token || !validAccessTokens.has(token)) {
          res.statusCode = 401;
          res.end(JSON.stringify({ message: "Unauthorized" }));
          return;
        }

        // ✅ mock 用户信息：你可以随时改 permissions 测试菜单/按钮变化
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            code: "1",
            msg: null,
            data: {
              id: 10001,
              name: "admin",
              roles: ["admin"],
              permissions: [
                "dashboard:view",
                "user:list",
                "user:create",
                "user:edit",
                "user:delete", // 打开它：删除按钮会出现
              ],
            },
          }),
        );
      });

      server.middlewares.use("/api/menu", async (req, res, next) => {
        if (req.method !== "GET") return next();

        // 校验 token（同 /api/users）
        const authHeader = req.headers["authorization"] || "";
        const token = String(authHeader).replace("Bearer ", "");
        if (!token || !validAccessTokens.has(token)) {
          res.statusCode = 401;
          res.end(JSON.stringify({ message: "Unauthorized" }));
          return;
        }

        // ✅ 后端下发菜单树（你可以随时改 permissions 观察菜单/路由变化）
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            code: "1",
            msg: null,
            data: [
              {
                path: "", // 对应 "/"
                name: "home",
                title: "首页",
                icon: "House",
                component: "HomePage",
                permissions: ["dashboard:view"],
              },
              {
                path: "users",
                title: "用户管理",
                icon: "User",
                permissions: ["user:list"],
                children: [
                  {
                    path: "",
                    name: "users",
                    component: "UserListPage",
                    // 列表页不写 title，避免面包屑重复（可写也行）
                    permissions: ["user:list"],
                  },
                  {
                    path: ":id",
                    name: "userDetail",
                    title: "用户详情",
                    hidden: true,
                    component: "UserDetailPage",
                    permissions: ["user:list"],
                  },
                ],
              },
            ],
          }),
        );
      });
      // ===== /api/auth/refresh =====
      server.middlewares.use("/api/auth/refresh", async (req, res, next) => {
        if (req.method !== "POST") return next();

        const body = await readJsonBody(req);
        const refreshToken = body?.refreshToken;

        if (!refreshToken || !validRefreshTokens.has(refreshToken)) {
          res.statusCode = 401;
          res.end(
            JSON.stringify({
              success: false,
              code: "401",
              msg: "Invalid refresh token",
              data: null,
            }),
          );
          return;
        }

        const newAccessToken = `acc_${Date.now()}`;
        validAccessTokens.add(newAccessToken);

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            code: "1",
            msg: null,
            data: { accessToken: newAccessToken },
          }),
        );
      });

      // ===== /api/users（需要 access token）=====
      server.middlewares.use("/api/users", async (req, res, next) => {
        if (req.method !== "GET") return next();

        const authHeader = req.headers["authorization"] || "";
        const token = String(authHeader).replace("Bearer ", "");

        if (!token || !validAccessTokens.has(token)) {
          res.statusCode = 401;
          res.end(JSON.stringify({ message: "Unauthorized" }));
          return;
        }

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            code: "1",
            msg: null,
            data: [
              { id: 1, name: "Alice" },
              { id: 2, name: "Bob" },
              { id: 3, name: "Charlie" },
            ],
          }),
        );
      });
    },
  };
}
export default defineConfig({
  plugins: [vue(), mockApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});

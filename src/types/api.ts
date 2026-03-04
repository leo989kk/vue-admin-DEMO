// 成功响应结构：必须包含 data
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  code?: string;
  msg?: string;
  status?: number;
};

// 失败响应结构：通常不包含 data
export type ApiFailureResponse = {
  success: false;
  code?: string;
  msg?: string;
  status?: number;
};

// 通用响应联合类型
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

// 前端统一错误对象
export type ApiError = {
  message: string;
  code?: string;
  status?: number;
};

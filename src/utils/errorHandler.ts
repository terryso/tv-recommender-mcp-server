/**
 * 全局错误处理工具
 */

/**
 * API错误类
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * 格式化错误为用户友好的消息
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return `错误 (${error.statusCode}): ${error.message}`;
  } else if (error instanceof Error) {
    return `错误: ${error.message}`;
  } else {
    return '发生未知错误';
  }
}

/**
 * 注册全局错误处理器
 */
export function registerGlobalErrorHandlers(): void {
  process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
  });
} 
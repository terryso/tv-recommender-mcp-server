import { ApiError, formatErrorMessage, registerGlobalErrorHandlers } from '../../utils/errorHandler';

describe('Error Handler Utils', () => {
  // 保存原始process.on以在测试后恢复
  const originalProcessOn = process.on;
  let processOnMock: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // 模拟process.on以避免实际添加事件处理程序
    processOnMock = jest.fn();
    process.on = processOnMock;
    
    // 监视console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // 恢复原始process.on和console.error
    process.on = originalProcessOn;
    consoleErrorSpy.mockRestore();
  });

  describe('ApiError', () => {
    it('应该正确构造带有默认状态码的ApiError', () => {
      const error = new ApiError('测试错误');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('测试错误');
      expect(error.name).toBe('ApiError');
      expect(error.statusCode).toBe(500); // 默认状态码
    });

    it('应该正确构造带有自定义状态码的ApiError', () => {
      const error = new ApiError('请求错误', 400);
      
      expect(error.message).toBe('请求错误');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('formatErrorMessage', () => {
    it('应该正确格式化ApiError', () => {
      const error = new ApiError('请求错误', 400);
      const formattedMessage = formatErrorMessage(error);
      
      expect(formattedMessage).toBe('错误 (400): 请求错误');
    });

    it('应该正确格式化标准Error', () => {
      const error = new Error('标准错误');
      const formattedMessage = formatErrorMessage(error);
      
      expect(formattedMessage).toBe('错误: 标准错误');
    });

    it('应该处理非Error类型的错误', () => {
      const formattedMessage1 = formatErrorMessage('字符串错误');
      expect(formattedMessage1).toBe('发生未知错误');
      
      const formattedMessage2 = formatErrorMessage(null);
      expect(formattedMessage2).toBe('发生未知错误');
      
      const formattedMessage3 = formatErrorMessage(undefined);
      expect(formattedMessage3).toBe('发生未知错误');
    });
  });

  describe('registerGlobalErrorHandlers', () => {
    it('应该注册全局未捕获异常处理程序', () => {
      registerGlobalErrorHandlers();
      
      // 验证两个事件处理程序是否已注册
      expect(processOnMock).toHaveBeenCalledTimes(2);
      expect(processOnMock).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
      expect(processOnMock).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    });
    
    it('应该正确处理未捕获的异常', () => {
      registerGlobalErrorHandlers();
      
      // 获取注册的uncaughtException处理程序
      const [[, uncaughtExceptionHandler]] = processOnMock.mock.calls.filter(
        call => call[0] === 'uncaughtException'
      );
      
      // 模拟调用处理程序
      const testError = new Error('未捕获的测试错误');
      uncaughtExceptionHandler(testError);
      
      // 验证控制台输出
      expect(consoleErrorSpy).toHaveBeenCalledWith('未捕获的异常:', testError);
    });
    
    it('应该正确处理未处理的Promise拒绝', () => {
      registerGlobalErrorHandlers();
      
      // 获取注册的unhandledRejection处理程序
      const [[, unhandledRejectionHandler]] = processOnMock.mock.calls.filter(
        call => call[0] === 'unhandledRejection'
      );
      
      // 模拟调用处理程序，但不创建真正的rejected Promise
      const testReason = new Error('Promise拒绝原因');
      const mockPromise = {}; // 使用一个空对象模拟Promise，而不是创建真正的Promise
      
      unhandledRejectionHandler(testReason, mockPromise);
      
      // 验证控制台输出
      expect(consoleErrorSpy).toHaveBeenCalledWith('未处理的Promise拒绝:', testReason);
    });
  });
}); 
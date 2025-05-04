declare module 'mcp-server' {
  export class MCPServer {
    constructor();
    
    /**
     * 注册初始化回调
     */
    onInitialize(callback: () => Promise<MCPServerInit>): void;
    
    /**
     * 注册工具回调
     */
    onTool(toolName: string, callback: (params: any) => Promise<any>): void;
    
    /**
     * 启动服务器
     */
    start(): Promise<void>;
  }
  
  /**
   * MCP服务器初始化返回数据
   */
  export interface MCPServerInit {
    name: string;
    description: string;
    tools: MCPTool[];
  }
  
  /**
   * MCP工具定义
   */
  export interface MCPTool {
    name: string;
    description: string;
    parameters?: {
      type: string;
      properties?: Record<string, any>;
      required?: string[];
    };
  }
} 
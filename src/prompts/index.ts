import { input, select, confirm, checkbox } from '@inquirer/prompts';
import { TemplateType, FeatureSet, DatabaseConfig, CacheConfig, AuthConfig } from '../types';

export interface PromptAnswers {
  template: TemplateType;
  features: FeatureSet;
  database?: DatabaseConfig | undefined;
  cache?: CacheConfig | undefined;
  authentication?: AuthConfig | undefined;
  typescript: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  installDependencies: boolean;
  initGit: boolean;
}

export class InteractivePrompter {
  /**
   * 运行交互式提示流程
   */
  async runPrompts(): Promise<PromptAnswers> {
    console.log('🚀 欢迎使用 Koa CLI 生成器！');
    console.log('请回答以下问题来配置您的项目：\n');

    // 模板选择
    const template = await select({
      message: '选择项目模板:',
      choices: [
        {
          name: '基础模板 - 简单的 Koa 服务器',
          value: 'basic' as TemplateType,
          description: '包含基本的 Koa 服务器设置'
        },
        {
          name: 'API 模板 - 包含路由、控制器和中间件的 RESTful API',
          value: 'api' as TemplateType,
          description: '适合构建 RESTful API 服务'
        },
        // {
        //   name: '全栈模板 - 包含前端和后端的完整应用',
        //   value: 'fullstack' as TemplateType,
        //   description: '包含前后端完整架构'
        // }
      ],
      default: 'basic' as TemplateType
    });

    // TypeScript 支持
    const typescript = await confirm({
      message: '是否启用 TypeScript 支持?',
      default: true
    });

    // 功能模块选择
    const selectedFeatures = await checkbox({
      message: '选择需要的功能模块:',
      choices: [
        {
          name: '日志记录 (Winston)',
          value: 'logging',
          checked: true
        },
        {
          name: 'CORS 跨域支持',
          value: 'cors',
          checked: true
        },
        {
          name: 'Helmet 安全中间件',
          value: 'helmet',
          checked: true
        },
        {
          name: '速率限制',
          value: 'rateLimit',
          checked: false
        },
        // {
        //   name: 'Swagger API 文档',
        //   value: 'swagger',
        //   checked: template === 'api' || template === 'fullstack'
        // },
        {
          name: 'Redis 缓存',
          value: 'redis',
          checked: false
        }
      ]
    });

    // 构建功能集合
    const features: FeatureSet = {
      logging: selectedFeatures.includes('logging'),
      cors: selectedFeatures.includes('cors'),
      helmet: selectedFeatures.includes('helmet'),
      rateLimit: selectedFeatures.includes('rateLimit'),
      swagger: selectedFeatures.includes('swagger'),
      redis: selectedFeatures.includes('redis')
    };

    // 数据库配置（如果选择了 API 或全栈模板）
    let database: DatabaseConfig | undefined;
    if (template === 'api' || template === 'fullstack') {
      const databaseType = await select({
        message: '选择数据库类型:',
        choices: [
          { name: '跳过数据库配置', value: 'none' },
          { name: 'MySQL', value: 'mysql' },
          { name: 'PostgreSQL', value: 'postgresql' },
          { name: 'MongoDB', value: 'mongodb' }
        ],
        default: 'none'
      });

      if (databaseType !== 'none') {
        const host = await input({
          message: '数据库主机地址:',
          default: 'localhost'
        });

        const port = await input({
          message: '数据库端口:',
          default: this.getDefaultPort(databaseType).toString(),
          validate: (value) => {
            const num = parseInt(value);
            if (isNaN(num) || num < 1 || num > 65535) {
              return '请输入有效的端口号 (1-65535)';
            }
            return true;
          }
        });

        const databaseName = await input({
          message: '数据库名称:',
          default: 'myapp'
        });

        database = {
          type: databaseType as 'mysql' | 'postgresql' | 'mongodb',
          host,
          port: parseInt(port),
          database: databaseName
        };
      }
    }

    // Redis 缓存配置
    let cache: CacheConfig | undefined;
    if (features.redis) {
      const host = await input({
        message: 'Redis 主机地址:',
        default: 'localhost'
      });

      const port = await input({
        message: 'Redis 端口:',
        default: '6379',
        validate: (value) => {
          const num = parseInt(value);
          if (isNaN(num) || num < 1 || num > 65535) {
            return '请输入有效的端口号 (1-65535)';
          }
          return true;
        }
      });

      const databaseNum = await input({
        message: 'Redis 数据库编号:',
        default: '0',
        validate: (value) => {
          const num = parseInt(value);
          if (isNaN(num) || num < 0 || num > 15) {
            return '请输入有效的数据库编号 (0-15)';
          }
          return true;
        }
      });

      cache = {
        type: 'redis',
        host,
        port: parseInt(port),
        database: parseInt(databaseNum)
      };
    }

    // 认证配置（如果选择了 API 或全栈模板）
    let authentication: AuthConfig | undefined;
    if (template === 'api' || template === 'fullstack') {
      const authType = await select({
        message: '选择认证方式:',
        choices: [
          { name: '跳过认证配置', value: 'none' },
          { name: 'JWT Token', value: 'jwt' },
          { name: 'Session', value: 'session' }
        ],
        default: 'none'
      });

      if (authType !== 'none') {
        authentication = {
          type: authType as 'jwt' | 'session'
        };

        if (authType === 'jwt') {
          const expiresIn = await input({
            message: 'JWT 过期时间:',
            default: '7d'
          });
          authentication.expiresIn = expiresIn;
        }
      }
    }

    // 包管理器选择
    const packageManager = await select({
      message: '选择包管理器:',
      choices: [
        { name: 'pnpm (推荐)', value: 'pnpm' as const },
        { name: 'yarn', value: 'yarn' as const },
        { name: 'npm', value: 'npm' as const }
      ],
      default: 'pnpm' as const
    });

    // 其他选项
    const installDependencies = await confirm({
      message: '是否自动安装依赖?',
      default: true
    });

    const initGit = await confirm({
      message: '是否初始化 Git 仓库?',
      default: true
    });

    return {
      template,
      features,
      database,
      cache,
      authentication,
      typescript,
      packageManager,
      installDependencies,
      initGit
    };
  }

  /**
   * 获取数据库默认端口
   */
  private getDefaultPort(databaseType: string): number {
    switch (databaseType) {
      case 'mysql':
        return 3306;
      case 'postgresql':
        return 5432;
      case 'mongodb':
        return 27017;
      default:
        return 3306;
    }
  }

  /**
   * 显示配置摘要
   */
  displayConfigSummary(answers: PromptAnswers): void {
    console.log('\n📋 项目配置摘要:');
    console.log(`  模板: ${answers.template}`);
    console.log(`  TypeScript: ${answers.typescript ? '是' : '否'}`);
    console.log(`  包管理器: ${answers.packageManager}`);
    
    const enabledFeatures = Object.entries(answers.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => feature);
    
    if (enabledFeatures.length > 0) {
      console.log(`  功能模块: ${enabledFeatures.join(', ')}`);
    }
    
    if (answers.database) {
      console.log(`  数据库: ${answers.database.type} (${answers.database.host}:${answers.database.port})`);
    }
    
    if (answers.cache) {
      console.log(`  缓存: Redis (${answers.cache.host}:${answers.cache.port})`);
    }
    
    if (answers.authentication) {
      console.log(`  认证: ${answers.authentication.type}`);
    }
    
    console.log(`  自动安装依赖: ${answers.installDependencies ? '是' : '否'}`);
    console.log(`  初始化 Git: ${answers.initGit ? '是' : '否'}`);
    console.log('');
  }
}

export const interactivePrompter = new InteractivePrompter();
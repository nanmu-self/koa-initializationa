import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { ProjectConfiguration, ConfigurationPriority, TemplateType, FeatureSet, DatabaseConfig, CacheConfig, AuthConfig } from '../types';
import { PromptAnswers } from '../prompts';

export interface ConfigFileFormat {
  template?: TemplateType;
  typescript?: boolean;
  packageManager?: 'npm' | 'yarn' | 'pnpm';
  features?: Partial<FeatureSet>;
  database?: {
    type?: 'mysql' | 'postgresql' | 'mongodb';
    host?: string;
    port?: number;
    database?: string;
  };
  cache?: {
    type?: 'redis';
    host?: string;
    port?: number;
    database?: number;
  };
  authentication?: {
    type?: 'jwt' | 'session';
    expiresIn?: string;
  };
  installDependencies?: boolean;
  initGit?: boolean;
}

export interface CommandLineOptions {
  template?: string | undefined;
  config?: string | undefined;
  skipInstall?: boolean | undefined;
  packageManager?: string | undefined;
  typescript?: boolean | undefined;
  git?: boolean | undefined;
  force?: boolean | undefined;
}

export class ConfigurationManager {
  /**
   * 合并配置，按照优先级：命令行参数 > 配置文件 > 交互式选项
   */
  async mergeConfigurations(
    projectName: string,
    commandLineOptions: CommandLineOptions,
    interactiveAnswers?: PromptAnswers
  ): Promise<ProjectConfiguration> {
    // 1. 解析配置文件（如果提供）
    let configFileOptions: Partial<ProjectConfiguration> = {};
    if (commandLineOptions.config) {
      configFileOptions = await this.loadConfigFile(commandLineOptions.config);
    }

    // 2. 转换命令行选项
    const commandLineConfig = this.convertCommandLineOptions(commandLineOptions);

    // 3. 转换交互式答案
    const interactiveConfig = interactiveAnswers 
      ? this.convertInteractiveAnswers(interactiveAnswers)
      : {};

    // 4. 按优先级合并配置
    const mergedConfig = this.applyConfigurationPriority({
      commandLine: commandLineConfig,
      configFile: configFileOptions,
      interactive: interactiveConfig
    });

    // 5. 设置项目名称和默认值
    const finalConfig: ProjectConfiguration = {
      name: projectName,
      template: mergedConfig.template || 'basic',
      features: {
        logging: true,
        cors: true,
        helmet: true,
        rateLimit: false,
        swagger: false,
        redis: false,
        ...mergedConfig.features
      },
      packageManager: mergedConfig.packageManager || 'pnpm',
      typescript: mergedConfig.typescript !== undefined ? mergedConfig.typescript : true
    };

    // 添加可选配置
    if (mergedConfig.database) {
      finalConfig.database = mergedConfig.database;
    }

    if (mergedConfig.cache) {
      finalConfig.cache = mergedConfig.cache;
    }

    if (mergedConfig.authentication) {
      finalConfig.authentication = mergedConfig.authentication;
    }

    return finalConfig;
  }

  /**
   * 加载配置文件
   */
  private async loadConfigFile(configPath: string): Promise<Partial<ProjectConfiguration>> {
    try {
      if (!await fs.pathExists(configPath)) {
        throw new Error(`配置文件不存在: ${configPath}`);
      }

      const fileContent = await fs.readFile(configPath, 'utf-8');
      const ext = path.extname(configPath).toLowerCase();
      
      let configData: ConfigFileFormat;
      
      if (ext === '.json') {
        configData = JSON.parse(fileContent);
      } else if (ext === '.yaml' || ext === '.yml') {
        configData = yaml.load(fileContent) as ConfigFileFormat;
      } else {
        throw new Error(`不支持的配置文件格式: ${ext}。支持的格式: .json, .yaml, .yml`);
      }

      return this.convertConfigFileFormat(configData);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`配置文件解析失败: ${error.message}`);
      }
      throw new Error('配置文件解析失败: 未知错误');
    }
  }

  /**
   * 转换配置文件格式为内部格式
   */
  private convertConfigFileFormat(configData: ConfigFileFormat): Partial<ProjectConfiguration> {
    const config: Partial<ProjectConfiguration> = {};

    if (configData.template) {
      config.template = configData.template;
    }

    if (configData.typescript !== undefined) {
      config.typescript = configData.typescript;
    }

    if (configData.packageManager) {
      config.packageManager = configData.packageManager;
    }

    if (configData.features) {
      config.features = {
        logging: true,
        cors: true,
        helmet: true,
        rateLimit: false,
        swagger: false,
        redis: false,
        ...configData.features
      };
    }

    if (configData.database) {
      config.database = {
        type: configData.database.type || 'mysql',
        host: configData.database.host || 'localhost',
        port: configData.database.port || 3306,
        database: configData.database.database || 'myapp'
      };
    }

    if (configData.cache) {
      config.cache = {
        type: 'redis',
        host: configData.cache.host || 'localhost',
        port: configData.cache.port || 6379,
        database: configData.cache.database || 0
      };
    }

    if (configData.authentication) {
      config.authentication = {
        type: configData.authentication.type || 'jwt',
        expiresIn: configData.authentication.expiresIn || '7d'
      };
    }

    return config;
  }

  /**
   * 转换命令行选项为内部格式
   */
  private convertCommandLineOptions(options: CommandLineOptions): Partial<ProjectConfiguration> {
    const config: Partial<ProjectConfiguration> = {};

    if (options.template && options.template !== undefined) {
      config.template = options.template as TemplateType;
    }

    if (options.typescript !== undefined) {
      config.typescript = options.typescript;
    }

    if (options.packageManager && options.packageManager !== undefined) {
      config.packageManager = options.packageManager as 'npm' | 'yarn' | 'pnpm';
    }

    // git 选项转换（注意：--no-git 会设置 git 为 false）
    if (options.git !== undefined) {
      // 这里需要在调用时处理 initGit 逻辑
    }

    return config;
  }

  /**
   * 转换交互式答案为内部格式
   */
  private convertInteractiveAnswers(answers: PromptAnswers): Partial<ProjectConfiguration> {
    const config: Partial<ProjectConfiguration> = {
      template: answers.template,
      features: answers.features,
      typescript: answers.typescript,
      packageManager: answers.packageManager
    };

    if (answers.database) {
      config.database = answers.database;
    }

    if (answers.cache) {
      config.cache = answers.cache;
    }

    if (answers.authentication) {
      config.authentication = answers.authentication;
    }

    return config;
  }

  /**
   * 应用配置优先级：命令行参数 > 配置文件 > 交互式选项
   */
  private applyConfigurationPriority(configs: ConfigurationPriority): Partial<ProjectConfiguration> {
    const result: Partial<ProjectConfiguration> = {};

    // 从低优先级到高优先级合并
    this.mergeConfig(result, configs.interactive);
    this.mergeConfig(result, configs.configFile);
    this.mergeConfig(result, configs.commandLine);

    return result;
  }

  /**
   * 深度合并配置对象
   */
  private mergeConfig(target: Partial<ProjectConfiguration>, source: Partial<ProjectConfiguration>): void {
    for (const key in source) {
      const sourceValue = source[key as keyof ProjectConfiguration];
      if (sourceValue !== undefined) {
        if (key === 'features' && typeof sourceValue === 'object' && sourceValue !== null) {
          // 特殊处理 features 对象
          target.features = {
            ...target.features,
            ...(sourceValue as FeatureSet)
          };
        } else if (key === 'database' && typeof sourceValue === 'object' && sourceValue !== null) {
          // 特殊处理 database 对象
          target.database = {
            ...target.database,
            ...(sourceValue as DatabaseConfig)
          };
        } else if (key === 'cache' && typeof sourceValue === 'object' && sourceValue !== null) {
          // 特殊处理 cache 对象
          target.cache = {
            ...target.cache,
            ...(sourceValue as CacheConfig)
          };
        } else if (key === 'authentication' && typeof sourceValue === 'object' && sourceValue !== null) {
          // 特殊处理 authentication 对象
          target.authentication = {
            ...target.authentication,
            ...(sourceValue as AuthConfig)
          };
        } else {
          // 直接覆盖其他属性
          (target as any)[key] = sourceValue;
        }
      }
    }
  }

  /**
   * 验证最终配置
   */
  validateConfiguration(config: ProjectConfiguration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证项目名称
    if (!config.name || config.name.trim() === '') {
      errors.push('项目名称不能为空');
    }

    // 验证模板类型
    const validTemplates: TemplateType[] = ['basic', 'api', 'fullstack'];
    if (!validTemplates.includes(config.template)) {
      errors.push(`无效的模板类型: ${config.template}。有效选项: ${validTemplates.join(', ')}`);
    }

    // 验证包管理器
    const validPackageManagers = ['npm', 'yarn', 'pnpm'];
    if (!validPackageManagers.includes(config.packageManager)) {
      errors.push(`无效的包管理器: ${config.packageManager}。有效选项: ${validPackageManagers.join(', ')}`);
    }

    // 验证数据库配置
    if (config.database) {
      const validDatabaseTypes = ['mysql', 'postgresql', 'mongodb'];
      if (!validDatabaseTypes.includes(config.database.type)) {
        errors.push(`无效的数据库类型: ${config.database.type}。有效选项: ${validDatabaseTypes.join(', ')}`);
      }

      if (config.database.port < 1 || config.database.port > 65535) {
        errors.push(`无效的数据库端口: ${config.database.port}。端口范围: 1-65535`);
      }
    }

    // 验证缓存配置
    if (config.cache) {
      if (config.cache.type !== 'redis') {
        errors.push(`无效的缓存类型: ${config.cache.type}。当前仅支持: redis`);
      }

      if (config.cache.port < 1 || config.cache.port > 65535) {
        errors.push(`无效的缓存端口: ${config.cache.port}。端口范围: 1-65535`);
      }
    }

    // 验证认证配置
    if (config.authentication) {
      const validAuthTypes = ['jwt', 'session'];
      if (!validAuthTypes.includes(config.authentication.type)) {
        errors.push(`无效的认证类型: ${config.authentication.type}。有效选项: ${validAuthTypes.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 显示配置来源信息（用于调试）
   */
  displayConfigurationSources(
    configs: ConfigurationPriority,
    finalConfig: ProjectConfiguration
  ): void {
    console.log('\n🔧 配置来源分析:');
    
    if (Object.keys(configs.commandLine).length > 0) {
      console.log('  命令行参数:', configs.commandLine);
    }
    
    if (Object.keys(configs.configFile).length > 0) {
      console.log('  配置文件:', configs.configFile);
    }
    
    if (Object.keys(configs.interactive).length > 0) {
      console.log('  交互式选择:', configs.interactive);
    }
    
    console.log('  最终配置:', finalConfig);
    console.log('');
  }
}

export const configurationManager = new ConfigurationManager();
import { validator } from '../utils/validator';
import { interactivePrompter, PromptAnswers } from '../prompts';
import { configurationManager, CommandLineOptions } from '../config/manager';
import { ProjectConfiguration } from '../types';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

/**
 * Create project command handler
 */
export async function createProject(
  projectName: string,
  options: {
    template?: string;
    config?: string;
    skipInstall?: boolean;
    packageManager?: string;
    typescript?: boolean;
    git?: boolean;
    force?: boolean;
  }
): Promise<void> {
  console.log(`正在创建项目: ${projectName}`);
  
  // 1. 验证项目名称
  const validationResult = validator.validateProjectName(projectName);
  
  if (!validationResult.valid) {
    console.error(chalk.red('❌ 项目名称验证失败:'));
    validationResult.errors.forEach(error => {
      console.error(chalk.red(`  • ${error.message}`));
    });
    
    // Show naming rules
    console.log(chalk.yellow(validator.getNamingRules()));
    
    // Suggest a valid name
    const suggestion = validator.suggestValidName(projectName);
    console.log(chalk.cyan(`💡 建议使用: ${suggestion}`));
    
    throw new Error(`Invalid project name: ${projectName}`);
  }
  
  // Show warnings if any
  if (validationResult.warnings.length > 0) {
    console.warn(chalk.yellow('⚠️  警告:'));
    validationResult.warnings.forEach(warning => {
      console.warn(chalk.yellow(`  • ${warning.message}`));
    });
  }
  
  console.log(chalk.green('✅ 项目名称验证通过'));

  // 2. 检查目录冲突
  const targetPath = path.resolve(process.cwd(), projectName);
  await checkDirectoryConflict(targetPath, options.force);

  // 3. 准备配置选项
  const commandLineOptions: CommandLineOptions = {
    template: options.template,
    config: options.config,
    skipInstall: options.skipInstall,
    packageManager: options.packageManager,
    typescript: options.typescript,
    git: options.git,
    force: options.force
  };

  // 4. 运行交互式提示（如果没有提供配置文件或需要补充信息）
  let interactiveAnswers: PromptAnswers | undefined;
  
  if (!options.config || await needsInteractiveInput(commandLineOptions)) {
    console.log('');
    interactiveAnswers = await interactivePrompter.runPrompts();
  }

  // 5. 合并配置
  const projectConfig = await configurationManager.mergeConfigurations(
    projectName,
    commandLineOptions,
    interactiveAnswers
  );

  // 6. 验证最终配置
  const configValidation = configurationManager.validateConfiguration(projectConfig);
  if (!configValidation.valid) {
    console.error(chalk.red('❌ 配置验证失败:'));
    configValidation.errors.forEach(error => {
      console.error(chalk.red(`  • ${error}`));
    });
    throw new Error('Configuration validation failed');
  }

  // 7. 显示配置摘要
  if (interactiveAnswers) {
    interactivePrompter.displayConfigSummary(interactiveAnswers);
  } else {
    displayConfigSummary(projectConfig);
  }

  console.log(chalk.green('✅ 配置验证通过，准备生成项目...'));
  
  // TODO: Implement project generation logic in subsequent tasks
  // This will include:
  // - Template processing
  // - File generation
  // - Dependency installation
  
  console.log(chalk.blue('项目生成功能将在后续任务中实现'));
}

/**
 * 检查目录冲突
 */
async function checkDirectoryConflict(targetPath: string, force?: boolean): Promise<void> {
  if (await fs.pathExists(targetPath)) {
    if (force) {
      console.log(chalk.yellow(`⚠️  目录已存在，将被强制覆盖: ${targetPath}`));
      await fs.remove(targetPath);
    } else {
      throw new Error(`目录已存在: ${targetPath}。使用 --force 选项强制覆盖。`);
    }
  }
}

/**
 * 判断是否需要交互式输入
 */
async function needsInteractiveInput(options: CommandLineOptions): Promise<boolean> {
  // 如果提供了配置文件，检查是否包含所有必要信息
  if (options.config) {
    try {
      // 这里可以添加更复杂的逻辑来检查配置文件的完整性
      return false; // 暂时假设配置文件包含所有信息
    } catch {
      return true; // 配置文件有问题，需要交互式输入
    }
  }
  
  // 如果没有配置文件，需要交互式输入
  return true;
}

/**
 * 显示配置摘要
 */
function displayConfigSummary(config: ProjectConfiguration): void {
  console.log('\n📋 项目配置摘要:');
  console.log(`  项目名称: ${config.name}`);
  console.log(`  模板: ${config.template}`);
  console.log(`  TypeScript: ${config.typescript ? '是' : '否'}`);
  console.log(`  包管理器: ${config.packageManager}`);
  
  const enabledFeatures = Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature);
  
  if (enabledFeatures.length > 0) {
    console.log(`  功能模块: ${enabledFeatures.join(', ')}`);
  }
  
  if (config.database) {
    console.log(`  数据库: ${config.database.type} (${config.database.host}:${config.database.port})`);
  }
  
  if (config.cache) {
    console.log(`  缓存: Redis (${config.cache.host}:${config.cache.port})`);
  }
  
  if (config.authentication) {
    console.log(`  认证: ${config.authentication.type}`);
  }
  
  console.log('');
}
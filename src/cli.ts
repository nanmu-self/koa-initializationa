#!/usr/bin/env node

import { Command } from 'commander';
import { createProject } from './commands/create';
import { updateCLI } from './commands/update';
import { getVersionInfo } from './utils';
import { errorHandler } from './utils/error-handler';

const program = new Command();

// 全局错误处理
process.on('uncaughtException', (error) => {
  const formattedError = errorHandler.handleError(error, { command: 'global' });
  errorHandler.logError(formattedError);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  const formattedError = errorHandler.handleError(error, { command: 'global' });
  errorHandler.logError(formattedError);
  process.exit(1);
});

// CLI 基本信息
program
  .name('koa')
  .description('用于生成 Koa.js 项目脚手架的命令行工具')
  .version(getVersionInfo().cliVersion, '-v, --version', '显示版本号')
  .helpOption('-h, --help', '显示帮助信息')
  .addHelpText('after', `
示例:
  $ koa create my-app                    创建名为 my-app 的项目
  $ koa create my-api -t api             使用 API 模板创建项目
  $ koa create my-app --skip-install     创建项目但跳过依赖安装
  $ koa update                           更新 CLI 和模板到最新版本

更多信息请访问: https://github.com/nanmu-self/koa-initializationa
`);

// 创建项目命令
program
  .command('create <project-name>')
  .description('创建一个新的 Koa.js 项目')
  .option('-t, --template <template>', '项目模板 (basic, api, fullstack)', 'basic')
  .option('-c, --config <config>', '配置文件路径 (支持 JSON 和 YAML 格式)')
  .option('--skip-install', '跳过依赖安装')
  .option('--package-manager <manager>', '指定包管理器 (npm, yarn, pnpm)')
  .option('--typescript', '启用 TypeScript 支持')
  .option('--no-git', '不初始化 Git 仓库')
  .option('--force', '强制覆盖已存在的目录')
  .addHelpText('after', `
示例:
  $ koa create my-app                    使用默认设置创建项目
  $ koa create my-api -t api             使用 API 模板
  $ koa create my-app --typescript       启用 TypeScript
  $ koa create my-app --force            强制覆盖已存在目录
`)
  .action(async (projectName: string, options: any) => {
    try {
      await createProject(projectName, options);
    } catch (error) {
      const formattedError = errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { command: 'create', additionalInfo: { projectName } }
      );
      errorHandler.logError(formattedError);
      process.exit(1);
    }
  });

// 更新命令
program
  .command('update')
  .description('更新 CLI 和模板到最新版本')
  .option('--check-only', '仅检查更新，不执行更新')
  .option('--force', '强制更新，即使已是最新版本')
  .addHelpText('after', `
示例:
  $ koa update                           检查并更新到最新版本
  $ koa update --check-only              仅检查是否有更新
  $ koa update --force                   强制重新下载最新版本
`)
  .action(async (options: any) => {
    try {
      await updateCLI(options);
    } catch (error) {
      const formattedError = errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { command: 'update' }
      );
      errorHandler.logError(formattedError);
      process.exit(1);
    }
  });

// 版本信息命令（详细版本）
program
  .command('info')
  .description('显示详细的版本和环境信息')
  .action(() => {
    try {
      const versionInfo = getVersionInfo();
      console.log('Koa CLI Generator 信息:');
      console.log(`  CLI 版本: ${versionInfo.cliVersion}`);
      console.log(`  模板版本: ${versionInfo.templatesVersion}`);
      console.log(`  最后更新检查: ${versionInfo.lastUpdateCheck.toLocaleString('zh-CN')}`);
      console.log(`  Node.js 版本: ${process.version}`);
      console.log(`  平台: ${process.platform} ${process.arch}`);
      console.log(`  工作目录: ${process.cwd()}`);
    } catch (error) {
      const formattedError = errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { command: 'info' }
      );
      errorHandler.logError(formattedError);
      process.exit(1);
    }
  });

// 配置全局选项
program
  .option('--verbose', '显示详细输出')
  .option('--quiet', '静默模式，仅显示错误')
  .option('--no-color', '禁用彩色输出');

// 处理未知命令
program.on('command:*', (operands) => {
  console.error(`未知命令: ${operands[0]}`);
  console.error('使用 --help 查看可用命令');
  process.exit(1);
});

// 解析命令行参数
program.parse();

// 如果没有提供任何参数，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
#!/usr/bin/env node

import { Command } from 'commander';
import { createProject } from './commands/create';
import { updateCLI } from './commands/update';
import { getVersionInfo } from './utils';

const program = new Command();

// CLI 基本信息
program
  .name('koa')
  .description('A CLI tool for generating Koa.js project scaffolds')
  .version(getVersionInfo().cliVersion);

// 创建项目命令
program
  .command('create <project-name>')
  .description('Create a new Koa.js project')
  .option('-t, --template <template>', 'Project template (basic, api, fullstack)', 'basic')
  .option('-c, --config <config>', 'Configuration file path')
  .option('--skip-install', 'Skip dependency installation')
  .option('--package-manager <manager>', 'Package manager to use (npm, yarn, pnpm)')
  .action(createProject);

// 更新命令
program
  .command('update')
  .description('Update CLI and templates to latest version')
  .action(updateCLI);

// 版本信息命令
program
  .command('version')
  .description('Show version information')
  .action(() => {
    const versionInfo = getVersionInfo();
    console.log(`CLI Version: ${versionInfo.cliVersion}`);
    console.log(`Templates Version: ${versionInfo.templatesVersion}`);
    console.log(`Last Update Check: ${versionInfo.lastUpdateCheck.toISOString()}`);
  });

// 解析命令行参数
program.parse();
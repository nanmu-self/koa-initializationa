import { ValidationResult, ValidationError } from '../types';

/**
 * Input validation utilities
 */
export class InputValidator {
  /**
   * Validate project name according to npm package naming rules
   * and additional constraints for directory creation
   */
  validateProjectName(name: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: any[] = [];

    // Check if name is empty
    if (!name || name.trim().length === 0) {
      errors.push({
        type: 'EMPTY_NAME',
        message: '项目名称不能为空'
      });
      return { valid: false, errors, warnings };
    }

    const trimmedName = name.trim();

    // Check length constraints
    if (trimmedName.length > 214) {
      errors.push({
        type: 'NAME_TOO_LONG',
        message: '项目名称不能超过 214 个字符'
      });
    }

    if (trimmedName.length < 1) {
      errors.push({
        type: 'NAME_TOO_SHORT',
        message: '项目名称至少需要 1 个字符'
      });
    }

    // Check for invalid characters
    if (!/^[a-z0-9._-]+$/i.test(trimmedName)) {
      errors.push({
        type: 'INVALID_CHARACTERS',
        message: '项目名称只能包含字母、数字、点号(.)、下划线(_)和连字符(-)'
      });
    }

    // Check if name starts with dot or underscore (not recommended)
    if (/^[._]/.test(trimmedName)) {
      errors.push({
        type: 'INVALID_START',
        message: '项目名称不能以点号(.)或下划线(_)开头'
      });
    }

    // Check if name ends with dot or dash (not allowed)
    if (/[.-]$/.test(trimmedName)) {
      errors.push({
        type: 'INVALID_END',
        message: '项目名称不能以点号(.)或连字符(-)结尾'
      });
    }

    // Check for reserved names
    const reservedNames = [
      'node_modules', 'favicon.ico', 'package.json', 'package-lock.json',
      'yarn.lock', 'pnpm-lock.yaml', '.git', '.gitignore', '.env',
      'con', 'prn', 'aux', 'nul', // Windows reserved names
      'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
      'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'
    ];

    if (reservedNames.includes(trimmedName.toLowerCase())) {
      errors.push({
        type: 'RESERVED_NAME',
        message: `"${trimmedName}" 是保留名称，不能用作项目名称`
      });
    }

    // Check for npm scope format (starts with @)
    if (trimmedName.startsWith('@')) {
      const scopeMatch = trimmedName.match(/^@([a-z0-9._-]+)\/([a-z0-9._-]+)$/i);
      if (!scopeMatch) {
        errors.push({
          type: 'INVALID_SCOPE_FORMAT',
          message: 'npm 作用域格式应为 @scope/package-name'
        });
      }
    }

    // Check for consecutive dots or dashes
    if (/[.-]{2,}/.test(trimmedName)) {
      errors.push({
        type: 'CONSECUTIVE_SEPARATORS',
        message: '项目名称不能包含连续的点号或连字符'
      });
    }

    // Check for uppercase letters (warning, not error)
    if (/[A-Z]/.test(trimmedName)) {
      warnings.push({
        type: 'UPPERCASE_WARNING',
        message: '建议使用小写字母作为项目名称'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get naming rules as a formatted string for help messages
   */
  getNamingRules(): string {
    return `
项目名称规则:
  • 只能包含小写字母、数字、点号(.)、下划线(_)和连字符(-)
  • 长度在 1-214 个字符之间
  • 不能以点号(.)或下划线(_)开头
  • 不能以点号(.)或连字符(-)结尾
  • 不能包含连续的点号或连字符
  • 不能使用系统保留名称
  • 建议使用小写字母和连字符分隔单词

有效示例:
  • my-app
  • koa-api-server
  • user-management
  • @myorg/my-package

无效示例:
  • My-App (包含大写字母)
  • .my-app (以点号开头)
  • my-app- (以连字符结尾)
  • my--app (连续连字符)
  • node_modules (保留名称)
`;
  }

  /**
   * Suggest a valid project name based on an invalid input
   */
  suggestValidName(invalidName: string): string {
    let suggestion = invalidName.trim().toLowerCase();
    
    // Remove invalid characters
    suggestion = suggestion.replace(/[^a-z0-9._-]/g, '-');
    
    // Remove leading dots and underscores
    suggestion = suggestion.replace(/^[._]+/, '');
    
    // Remove trailing dots and dashes
    suggestion = suggestion.replace(/[.-]+$/, '');
    
    // Replace consecutive separators with single dash
    suggestion = suggestion.replace(/[._-]+/g, '-');
    
    // Ensure it's not empty
    if (!suggestion) {
      suggestion = 'my-koa-app';
    }
    
    // Ensure it doesn't start with a number (optional improvement)
    if (/^[0-9]/.test(suggestion)) {
      suggestion = 'app-' + suggestion;
    }
    
    return suggestion;
  }
}

// Export a default validator instance
export const validator = new InputValidator();
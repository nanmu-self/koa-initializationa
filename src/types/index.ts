// Core CLI Types
export interface CLICommand {
  name: string;
  description: string;
  options: CLIOption[];
  action: (args: any, options: any) => Promise<void>;
}

export interface CLIOption {
  flags: string;
  description: string;
  defaultValue?: any;
}

// Project Configuration Types
export interface ProjectConfiguration {
  name: string;
  template: TemplateType;
  features: FeatureSet;
  database?: DatabaseConfig;
  cache?: CacheConfig;
  authentication?: AuthConfig;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  typescript: boolean;
}

export interface ConfigurationPriority {
  commandLine: Partial<ProjectConfiguration>;
  configFile: Partial<ProjectConfiguration>;
  interactive: Partial<ProjectConfiguration>;
}

export interface FeatureSet {
  logging: boolean;
  cors: boolean;
  helmet: boolean;
  rateLimit: boolean;
  swagger: boolean;
  redis: boolean;
}

export interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
}

export interface CacheConfig {
  type: 'redis';
  host: string;
  port: number;
  password?: string;
  database?: number;
}

export interface AuthConfig {
  type: 'jwt' | 'session';
  secret?: string;
  expiresIn?: string;
}

// Template Types
export type TemplateType = 'basic' | 'api' | 'fullstack';

export interface Template {
  content: string;
  metadata: TemplateMetadata;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
}

export interface TemplateContext {
  project: ProjectConfiguration;
  helpers: Record<string, any>;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  repository: TemplateRepository;
  files: TemplateFile[];
  dependencies: DependencySet;
  scripts: ScriptSet;
  configuration: TemplateConfiguration;
  featureFiles: FeatureFileMap;
}

export interface TemplateFile {
  source: string;
  destination: string;
  condition?: string; // Handlebars 条件表达式
  transform?: boolean; // 是否需要模板变量替换
  feature?: string; // 关联的功能特性
}

export interface FeatureFileMap {
  mysql: string[];
  redis: string[];
  jwt: string[];
  logging: string[];
  typescript: string[];
}

export interface DependencySet {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  featureDependencies: FeatureDependencyMap;
}

export interface FeatureDependencyMap {
  mysql: {
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  redis: {
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  jwt: {
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  logging: {
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  typescript: {
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

export interface ScriptSet {
  [key: string]: string;
}

export interface TemplateConfiguration {
  [key: string]: any;
}

// Update Manager Types
export interface UpdateManager {
  checkForUpdates(): Promise<UpdateInfo>;
  updateCLI(): Promise<UpdateResult>;
  updateTemplates(): Promise<UpdateResult>;
  getVersionInfo(): VersionInfo;
  fetchTemplateFromRepository(templateId: string, version?: string): Promise<Template>;
}

export interface TemplateRepository {
  url: string;
  templates: TemplateReference[];
}

export interface TemplateReference {
  id: string;
  name: string;
  branch: string;
  tag?: string;
  description: string;
}

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes?: string;
}

export interface UpdateResult {
  success: boolean;
  message: string;
  errors?: string[];
}

export interface VersionInfo {
  cliVersion: string;
  templatesVersion: string;
  lastUpdateCheck: Date;
}

// Feature Management Types
export interface FeatureManager {
  applyFeatureSelection(projectPath: string, features: FeatureSet): Promise<void>;
  removeUnselectedFeatures(projectPath: string, features: FeatureSet): Promise<void>;
  updateDependencies(projectPath: string, features: FeatureSet): Promise<void>;
}

export interface FeatureRemovalScript {
  feature: string;
  filesToRemove: string[];
  codeToRemove: CodeRemovalRule[];
}

export interface CodeRemovalRule {
  file: string;
  patterns: string[];
  type: 'require' | 'import' | 'block' | 'line';
}

// Package Manager Types
export interface PackageManagerDetector {
  detectAvailableManagers(): Promise<PackageManager[]>;
  selectBestManager(): Promise<PackageManager>;
  validateManager(manager: PackageManager): Promise<boolean>;
}

export interface PackageManager {
  name: 'pnpm' | 'yarn' | 'npm';
  version: string;
  available: boolean;
  priority: number; // pnpm: 1, yarn: 2, npm: 3
}

// Template Engine Types
export interface TemplateEngine {
  loadTemplate(templatePath: string): Promise<Template>;
  renderFile(template: Template, context: TemplateContext): Promise<string>;
  registerHelper(name: string, helper: HandlebarsHelper): void;
}

export type HandlebarsHelper = (...args: any[]) => any;

// Project Generator Types
export interface ProjectGenerator {
  generateProject(config: ProjectConfiguration): Promise<GenerationResult>;
  installDependencies(projectPath: string, packageManager: string): Promise<void>;
  validateProject(projectPath: string): Promise<ValidationResult>;
}

export interface GenerationResult {
  success: boolean;
  projectPath: string;
  generatedFiles: string[];
  errors?: GenerationError[];
}

export interface GenerationError {
  code: string;
  message: string;
  file?: string;
  details?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: string;
  message: string;
  file?: string;
  line?: number;
}

export interface ValidationWarning {
  type: string;
  message: string;
  file?: string;
  line?: number;
}

// Error Handling Types
export interface ErrorHandler {
  handleError(error: Error, context: ErrorContext): FormattedError;
  logError(error: FormattedError): void;
}

export interface ErrorContext {
  command?: string;
  operation?: string;
  projectPath?: string;
  additionalInfo?: Record<string, any>;
}

export interface FormattedError {
  code: string;
  message: string;
  details?: any;
  suggestions?: string[];
  timestamp: Date;
}

// Logging Types
export interface Logger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

// Project Structure Types
export interface ProjectStructure {
  root: string;
  directories: DirectoryNode[];
  files: FileNode[];
}

export interface DirectoryNode {
  name: string;
  path: string;
  children?: (DirectoryNode | FileNode)[];
}

export interface FileNode {
  name: string;
  path: string;
  template?: string;
  content?: string;
}

// Standard Project Files Types
export interface StandardProjectFiles {
  packageJson: PackageJsonTemplate;
  readme: ReadmeTemplate;
  editorConfig: EditorConfigTemplate;
  eslintIgnore: EslintIgnoreTemplate;
  gitIgnore: GitIgnoreTemplate;
  envExample: EnvExampleTemplate;
}

export interface PackageJsonTemplate {
  name: string;
  version: string;
  description: string;
  main: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  keywords: string[];
  author: string;
  license: string;
}

export interface ReadmeTemplate {
  title: string;
  description: string;
  installation: string;
  usage: string;
  features: string[];
  license: string;
}

export interface EditorConfigTemplate {
  root: boolean;
  indentStyle: 'space' | 'tab';
  indentSize: number;
  endOfLine: 'lf' | 'crlf';
  charset: 'utf-8';
  trimTrailingWhitespace: boolean;
  insertFinalNewline: boolean;
}

export interface EslintIgnoreTemplate {
  patterns: string[];
}

export interface GitIgnoreTemplate {
  patterns: string[];
}

export interface EnvExampleTemplate {
  variables: Record<string, string>;
}

// Error Recovery Types
export interface ErrorRecovery {
  cleanup(): Promise<void>;
  retry(options?: RetryOptions): Promise<void>;
  rollback(): Promise<void>;
  saveState(): Promise<void>;
}

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}
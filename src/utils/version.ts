import { VersionInfo } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Get version information for the CLI
 */
export function getVersionInfo(): VersionInfo {
  const packageJsonPath = path.join(__dirname, '../../package.json');
  
  let cliVersion = '1.0.0';
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    cliVersion = packageJson.version || '1.0.0';
  } catch (error) {
    // Fallback to default version if package.json cannot be read
    console.warn('Could not read package.json, using default version');
  }
  
  return {
    cliVersion,
    templatesVersion: '1.0.0', // TODO: Implement template versioning in later tasks
    lastUpdateCheck: new Date() // TODO: Implement persistent update check tracking
  };
}
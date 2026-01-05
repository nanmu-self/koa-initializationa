import { getVersionInfo } from './version';

describe('Version Utils', () => {
  describe('getVersionInfo', () => {
    it('should return version information', () => {
      const versionInfo = getVersionInfo();
      
      expect(versionInfo).toBeDefined();
      expect(versionInfo.cliVersion).toBeDefined();
      expect(versionInfo.templatesVersion).toBeDefined();
      expect(versionInfo.lastUpdateCheck).toBeInstanceOf(Date);
    });

    it('should return default version when package.json cannot be read', () => {
      const versionInfo = getVersionInfo();
      
      expect(typeof versionInfo.cliVersion).toBe('string');
      expect(versionInfo.cliVersion.length).toBeGreaterThan(0);
    });
  });
});
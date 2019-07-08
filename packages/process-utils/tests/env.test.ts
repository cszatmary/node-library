import chalk from 'chalk';

import { cwd, ensureChildSucceeded } from '../src';

describe('src/env.ts tests', () => {
  describe('cwd', () => {
    it('should return process.env.INIT_CWD when it is set', () => {
      // Setup
      const initCwd = process.env.INIT_CWD;
      process.env.INIT_CWD = '/packages/src/tests';

      // Assert
      expect(cwd()).toBe('/packages/src/tests');

      // Cleanup
      process.env.INIT_CWD = initCwd;
    });

    it('should return process.cwd() since process.env.INIT_CWD is not set', () => {
      // Setup
      const initCwd = process.env.INIT_CWD;
      delete process.env.INIT_CWD;
      const spyCwd = jest
        .spyOn(process, 'cwd')
        .mockImplementation(() => '/packages/src');

      // Assert
      expect(cwd()).toBe('/packages/src');

      // Cleanup
      spyCwd.mockRestore();
      process.env.INIT_CWD = initCwd;
    });
  });

  describe('ensureChildSucceeded', () => {
    let spyExit: jest.SpyInstance;
    let stderrData: string;
    let spyError: jest.SpyInstance;

    beforeEach(() => {
      spyExit = jest
        .spyOn(process, 'exit')
        // @ts-ignore
        .mockImplementation(() => {});

      stderrData = '';
      spyError = jest
        .spyOn(console, 'error')
        .mockImplementation((inputs: string) => {
          stderrData += inputs;
        });
    });

    afterEach(() => {
      spyExit.mockRestore();
      spyError.mockRestore();
    });

    it('should call process.exit since status 1 is a failure', () => {
      // Setup
      ensureChildSucceeded(1, 'node', 2);

      // Assert
      expect(spyExit.mock.calls).toHaveLength(1);
      expect(spyExit.mock.calls[0][0]).toBe(2);
      expect(spyError.mock.calls).toHaveLength(1);
      expect(stderrData).toEqual(chalk.red('node exited with code 1'));
    });

    it('should do nothing since status 0 is success', () => {
      // Setup
      ensureChildSucceeded(0, 'node');

      // Assert
      expect(spyExit.mock.calls).toHaveLength(0);
      expect(spyError.mock.calls).toHaveLength(0);
    });
  });
});

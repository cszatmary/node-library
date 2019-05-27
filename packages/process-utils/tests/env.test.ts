import { cwd, ensureChildSucceeded } from '../src';

describe('src/env.ts tests', () => {
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

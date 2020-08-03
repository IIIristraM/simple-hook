import path from 'path';
import fs from 'fs';

import { cloneBranch } from '../git';

const REPO_PATH = path.join(__dirname, 'test-repo');

test('cloneBranch', async () => {
    await cloneBranch('https://github.com/IIIristraM/simple-hook-test.git', 'master', REPO_PATH);

    expect(fs.existsSync(`${REPO_PATH}/simple-hook-test/README.md`)).toBe(true);
});

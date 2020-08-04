import { downloadFile } from '../network';

test('downloadFile', async () => {
    const content = JSON.parse(
        await downloadFile(`https://raw.github.com/IIIristraM/simple-hook-test/config/download.json`),
    );

    expect(content).toEqual({
        a: 1,
    });
});

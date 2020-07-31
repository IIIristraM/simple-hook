import { buildBaseImage, runImage, removeImage } from '../docker';

let tag: string;
let id: string;

test('buildBaseImage', async () => {
    tag = await buildBaseImage();
}, 20000);

test('runImage', async () => {
    id = await runImage(
        tag,
        {
            repository: {
                name: 'test',
            },
            pull_request: {
                body: '"<div></div>"',
            },
        } as any,
        8001,
    );

    expect(typeof id === 'string');
}, 20000);

test('removeImage', async () => {
    await removeImage(tag);
}, 20000);

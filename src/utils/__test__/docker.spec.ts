import { buildBaseImage, buildInstanceImage, runImage, removeImage } from '../docker'

test('buildBaseImage', async () => {
    await buildBaseImage();
}, 20000)

let tag: string;
let id: string;

test('buildInstanceImage', async () => {
    tag = await buildInstanceImage({
        repository: {
            name: 'test'
        },
        pull_request: {
            body: '<div></div>'
        }
    } as any);

    expect(typeof tag === 'string');
}, 20000)

test('runImage', async () => {
    id = await runImage(tag);

    expect(typeof id === 'string');
}, 20000)

test('removeImage', async () => {
    await removeImage(tag);
}, 20000)
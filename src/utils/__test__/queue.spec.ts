import { createQueue } from '../queue';

type Item = { flag: boolean };

function delay() {
    return new Promise(resolve => {
        setTimeout(resolve, 1);
    });
}

async function template(createTask: (item: Item) => Promise<{ done: Promise<unknown> }>) {
    const arr = [];
    for (let i = 0; i < 100; i++) {
        arr.push({
            flag: false,
        });
    }

    const queue = createQueue<Item>({
        createTask,
    });

    for (let i = 0; i < 50; i++) {
        queue.push(arr[i]);
        await delay();
    }

    await queue.done();

    for (let i = 50; i < 100; i++) {
        queue.push(arr[i]);
    }

    await queue.done();

    expect(arr.every(({ flag }) => flag === true)).toBe(true);
}

test('queue success', async () => {
    await template(async function (item) {
        return new Promise(resolve => {
            item.flag = true;
            setTimeout(() => {
                resolve({
                    done: delay(),
                });
            }, 1);
        });
    });
});

test('queue errors', async () => {
    await template(async function (item) {
        return new Promise(resolve => {
            item.flag = true;
            setTimeout(() => {
                resolve({
                    done: new Promise((resolve, reject) => {
                        setTimeout(reject, 1);
                    }),
                });
            }, 1);
        });
    });
});

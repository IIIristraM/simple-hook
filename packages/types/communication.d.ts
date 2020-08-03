export type Message<T> = {
    type: 'info' | 'complete';
    data: T;
};

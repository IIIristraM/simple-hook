type NonObj = number | string | boolean | Function | null | undefined;

export type DeepPartial<T> = T extends NonObj
    ? T
    : T extends Array<infer U>
    ? {
          [K in keyof U]?: DeepPartial<U[K]>;
      }[]
    : {
          [K in keyof T]?: DeepPartial<T[K]>;
      };

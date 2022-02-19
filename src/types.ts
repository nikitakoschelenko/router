export type AnyDict = Record<string, any>;
export type StringDict = Record<string, string>;

export type FallbackMeta<T extends AnyDict> = {
  from: string;
  meta: T;
};

import Logger from "../../logger/logger";
export const withTryCatch = async (
  fn: Function,
  fnArgs: Array<any>,
  returnSomething?: boolean,
  customMessage?: string,
  ifError?: Function
) => {
  try {
    if (returnSomething) {
      const res = await fn(...fnArgs);
      return res;
    }
    await fn(...fnArgs);
    return "OK";
  } catch ({ message }) {
    Logger.error(`${customMessage || ""}${message}`);
    return "ERROR";
  }
};

import { Job } from "../../types";
import fs from "fs";
import { promisify } from "util";
const write = promisify(fs.writeFile);

export const writeToJson = async (data: Job) => {
  await write("./jobs.txt", JSON.stringify(data), { flag: "a+" });
};

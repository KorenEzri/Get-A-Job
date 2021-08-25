import { Job } from "../../../types";
import fs from "fs";
import { promisify } from "util";
const write = promisify(fs.writeFile);
const read = promisify(fs.readFile);

export const writeToJson = async (data: Job) => {
  await write("saved-data/jobMaster/jobs.txt", JSON.stringify(data), {
    flag: "a+",
  });
};
export const appendToJsonArray = async (
  content: string | string[],
  path: string,
  unique?: boolean
) => {
  let data = await read(path, "utf8");
  if (Array.isArray(content)) {
    if (unique) {
      content = Array.from(new Set(content));
    }
    if (data) data = JSON.stringify(JSON.parse(data).concat(content));
    else data = JSON.stringify(content);
    await write(path, data);
  } else {
    if (data) data = JSON.stringify(JSON.parse(data).push(content));
    else data = JSON.stringify(content);
    await write(path, data);
  }
};

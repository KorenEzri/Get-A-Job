import fs from "fs";
import { promisify } from "util";
import { Job } from "../../types";
const write = promisify(fs.writeFile);

const convertToCSV = (array: Job[]) => {
  const newArray = [Object.keys(array[0]) as string[] | Job[]].concat(array);
  return newArray
    .map((it) => {
      return Object.values(it).toString();
    })
    .join("\n");
};

export const writeToCSV = async (array: any[]) => {
  const csvFormat = convertToCSV(array);
  await write("./jobs.csv", csvFormat, { flag: "a+" });
};

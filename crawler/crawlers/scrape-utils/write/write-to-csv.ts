import fs from "fs";
import { promisify } from "util";
import { Job } from "../../../types";
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
  // const csvFormat = convertToCSV(array);
  await write("saved-data/jobMaster/jobs.csv", array[0], {
    flag: "a+",
  });
};

// function convertArrayOfObjectsToCSV(data: any[]) {
//   let result: string,
//     ctr: number,
//     keys: any[],
//     columnDelimiter: string | undefined,
//     lineDelimiter: string;
//   if (data == null || !data.length) {
//     return null;
//   }
//   columnDelimiter = ",";
//   lineDelimiter = "\n";
//   keys = Object.keys(data[0]);
//   result = "";
//   result += keys.join(columnDelimiter);
//   result += lineDelimiter;
//   data.forEach(function (item: { [x: string]: any }) {
//     ctr = 0;
//     keys.forEach(function (key: string | number) {
//       if (ctr > 0) result += columnDelimiter;

//       result += item[key];
//       ctr++;
//     });
//     result += lineDelimiter;
//   });

//   return result;
// }

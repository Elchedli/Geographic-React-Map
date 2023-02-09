const axios = require("axios");
import Papa from "papaparse";

export const csvUrlParse = async (urlCsvFile: string) => {
  const { data } = await axios.get(urlCsvFile);
  return Papa.parse(data).data;
};

const findIdField = (obj: any, idTables: string[]) =>
  Object.keys(obj).find((key) => idTables.includes(key));

const mapIdField = (obj: any, idField: string) => {
  const newObj = { ...obj };
  newObj.geoNeon = newObj[idField];
  delete newObj[idField];
  return newObj;
};

const fuseCSVTablesIntoOne = (
  tables: string[][][],
  idTables: string[]
): any[] => {
  const fused: any[] = [];

  tables.forEach((table, index) => {
    const header = table[0];
    const idField = idTables[index];
    const data = table.slice(1);

    data.forEach((row) => {
      const identifier = row[header.indexOf(idField)];
      const existingRow = fused.find(
        (fusedRow) => fusedRow[idField] === identifier
      );

      if (existingRow) {
        header.forEach((col: any, i) => {
          existingRow[col] = row[i];
        });
      } else {
        const newRow: any = {};
        newRow[idField] = identifier;
        header.forEach((col, i) => {
          newRow[col] = row[i];
        });
        fused.push(newRow);
      }
    });
  });

  return fused;
};

const fuseObjectsUniqueId = (
  tables: string[][][],
  idTables: string[]
): any[] => {
  return tables.reduce((acc, curr) => {
    const idField: any = findIdField(curr, idTables) || "";
    const geoNeon = curr[idField];
    const existing = acc.find((obj: any) => obj.geoNeon === geoNeon);

    if (existing) {
      Object.assign(existing, mapIdField(curr, idField));
    } else {
      acc.push(mapIdField(curr, idField));
    }

    return acc;
  }, []);
};

export function ConvertCSVToPageCartoData(
  tables: string[][][],
  idTables: string[]
): { convertedToOne: Array<any>; fuseObjectsUnique: () => Array<any> } {
  const convertedToOne: Array<any> = fuseCSVTablesIntoOne(tables, idTables);
  return {
    convertedToOne,
    fuseObjectsUnique: () => {
      return fuseObjectsUniqueId(convertedToOne, idTables);
    },
  };
}

import { Column } from 'interfaces/column';
import Papa from 'papaparse';

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function () {
      if (!reader.result) {
        return reject(new Error('Unable to read the file!'));
      }
      resolve(reader.result.toString());
    };

    reader.onerror = function () {
      reject(reader.error);
    };
  });
};

export const GEOJSON_ALLOWED_MIME_TYPES = [
  'application/geo+json',
  'application/json',
];
export const MAX_FILE_SIZE_MB = 10;
const CSV_ALLOWED_MIME_TYPES = ['text/csv'];

export const validateGeoJsonFile = async (file: File) => {
  if (!GEOJSON_ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Le type de fichier est invalide ! Les types autorisés sont : ${GEOJSON_ALLOWED_MIME_TYPES.join(
        ','
      )}`
    );
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 ** 2) {
    throw new Error(
      `La taille maximale de fichier est dépassée : ${MAX_FILE_SIZE_MB} Mo.`
    );
  }
  try {
    const content = await readFile(file);
    const json = JSON.parse(content);
    if (json.type !== 'FeatureCollection' || !Array.isArray(json.features)) {
      throw new Error(
        `Le format GeoJSON est invalide (FeatureCollection, features).`
      );
    }
    return json;
  } catch (e) {
    throw new Error(`Impossible de valider le format GeoJSON du fichier.`);
  }
};

export const validateCsv = async (file: File) => {
  if (!CSV_ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Le type de fichier est invalide ! Les types autorisés sont : ${CSV_ALLOWED_MIME_TYPES.join(
        ','
      )}`
    );
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 ** 2) {
    throw new Error(
      `La taille maximale de fichier est dépassée : ${MAX_FILE_SIZE_MB} Mo.`
    );
  }
  try {
    const content = await readFile(file);
    const csvData = Papa.parse(content, { header: true });
    return csvData;
  } catch (e) {
    throw new Error(`Impossible de valider le format CSV du fichier.`);
  }
};

export const parseCsvColumns = (columnNames: string[]) => {
  return columnNames.reduce((acc, curr, idx) => {
    let metadata: { [key: string]: string } = {};
    let name = curr;
    const [match] = name.match(/\[(.+)\]/gi) || [''];
    if (match) {
      name = name.replace(match, '');
      const meta = match.slice(1, -1);
      metadata = meta.split('&').reduce((params, param) => {
        const [key, value] = param.split('=');
        params[key] = value ? value.trim() : '';
        return params;
      }, metadata);
    }
    acc.push({
      name: name.trim(),
      source: 's' in metadata ? metadata['s'] : '',
      validity: 'v' in metadata ? metadata['v'] : '',
      isGeoCode: idx === 0,
    });
    return acc;
  }, [] as Column[]);
};

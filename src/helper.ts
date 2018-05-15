import { readFile, readFileSync, statSync } from 'fs'
import { parse } from 'hjson'
import { sync as glob } from 'globby'
import { promisify } from 'util'

// Capitalizes the first letter in a string.
export const capitalize = (str: string): string => {
  if (str === '') { return str; }
  return str[0].toUpperCase() + str.substr(1);
};

// Flattens an array of arrays.
export const flatten = (arrayOfArrays: any[]): any[] => {
  return [].concat(...arrayOfArrays)
};

// Converts the argument into an array, if not already one.
export const toArray = <T>(a: T | T[]): T[] => {
  return Array.isArray(a) ? a : [a];
};

// Parses an (H)JSON file.
interface ParseJsonOptions {
  ignoreErrors?: boolean
}
export const parseJson = (filename: string, opts: ParseJsonOptions = {}) => {
  try {
    return parse(readFileSync(filename, 'utf8'));
  } catch (err) {
    if (opts.ignoreErrors) {
      return {};
    } else {
      throw err;
    }
  }
};

// Reads in the contents of files matching a pattern.
export const readFiles = async (filePattern: string | string[]): Promise<FileInfo[]> => {
  // Find all matching files.
  let files: string[];
  try {
    files = glob(filePattern);
  } catch (err) {
    files = [];
  }

  if (files.length === 0) {
    return [];
  }

  const isFile = (file: string) => {
    let stat = statSync(file);
    if (stat.isFile()) { return true; }
    return false;
  };

  return await Promise.all(files.filter(isFile).map(file => {
    return promisify(readFile)(file, 'utf8').then(contents => {
    	return {
    		file: file,
    		contents: contents
    	}
    }).catch((err) => {
    	throw new Error('could not read file ' + file + ': ' + err.message);
    })
  }))
};

// Sort function for an array of linting errors.
export const sort = (a: LinterResult, b: LinterResult) => {
  // First sort by filename.
  if (a.file === null) { return -1; }
  if (b.file === null) { return 1; }
  if (a.file < b.file) { return -1; }
  if (a.file > b.file) { return 1; }

  // Then sort by line number.
  if (a.line < b.line) { return -1; }
  if (a.line > b.line) { return 1; }

  // Then sort by character (column) number.
  if (a.character < b.character) { return -1; }
  if (a.character > b.character) { return 1; }

  // Then sort by plugin.
  if (a.plugin < b.plugin) { return -1; }
  if (a.plugin > b.plugin) { return 1; }

  return 0;
};

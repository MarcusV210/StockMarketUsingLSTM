import Papa from "papaparse";
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Loads and parses a CSV file from the public directory.
 * @param filePath - The path to the CSV file.
 * @returns A promise that resolves to an array of objects.
 */
export async function loadCSV(stockName: string): Promise<any[]> {
  try {
    const filePath = `/stocks/${stockName}.csv`; // Ensure correct path
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${filePath} (Status: ${response.status})`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0) {
            console.error("CSV Parsing Errors:", result.errors);
            reject(new Error("CSV parsing failed due to errors"));
          } else {
            resolve(result.data);
          }
        },
        error: (error: any) => {
          console.error("CSV Parsing Failed:", error);
          reject(new Error("CSV parsing failed"));
        },
      });
    });
  } catch (error) {
    console.error("Error loading CSV:", error);
    return [];
  }
}



/**
 * Combines multiple class names into a single string.
 * @param inputs - Class names or expressions.
 * @returns A merged class string.
 */
export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs))
}

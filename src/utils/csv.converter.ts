import { parse } from 'csv-parse';

export function CsvConverter(csvString: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        parse(csvString, {
            columns: true, // Trata la primera fila como encabezados
            skip_empty_lines: false,
        }, (err, output) => {
            if (err) {
                reject(err);
            } else {
                resolve(output);
            }
        });
    });
}
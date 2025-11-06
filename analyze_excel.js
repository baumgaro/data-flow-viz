const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('data-flow-viz-example.xlsx');
console.log('Sheet Names:', workbook.SheetNames);
 
workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`\nColumns in ${sheetName}:`, jsonData[0]);
}); 
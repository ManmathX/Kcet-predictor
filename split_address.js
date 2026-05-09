const fs = require('fs');

const dataFile = './Rank-predict/src/data.json';
const data = require(dataFile);

for (let i = 0; i < data.rows.length; i++) {
    const row = data.rows[i];
    const originalName = row[1];
    
    let cleanName = originalName;
    let address = '';

    const matchAuto = originalName.match(/(.*?\(AUTONOMOUS\))\s*(.*)/i);
    const matchIIT = originalName.match(/(.*?IIT Model\))\s*(.*)/i);
    const upperBlock = originalName.match(/(.*?) ([A-Z0-9,\.\- ]{15,})$/);

    if (matchAuto && matchAuto[2].length > 4) {
        cleanName = matchAuto[1].trim();
        address = matchAuto[2].trim();
    } else if (matchIIT && matchIIT[2].length > 4) {
        cleanName = matchIIT[1].trim();
        address = matchIIT[2].trim();
    } else if (upperBlock && upperBlock[2].length > 10) {
        cleanName = upperBlock[1].trim();
        address = upperBlock[2].trim();
    } else {
        // Fallback: look for common address indicators or just the first comma
        const addressMatch = originalName.match(/(.*?\b(?:Engineering|Technology|Institute|College|University|Academy|Sciences?)\b)(?:\s*,?\s*)(.*)/i);
        if (addressMatch && addressMatch[2].length > 5) {
            cleanName = addressMatch[1].trim();
            address = addressMatch[2].trim();
        } else {
             // Just split by first comma if exists
             const commaIdx = originalName.indexOf(',');
             if (commaIdx > 15) {
                 cleanName = originalName.substring(0, commaIdx).trim();
                 address = originalName.substring(commaIdx + 1).trim();
             }
        }
    }
    
    // clean up trailing commas
    cleanName = cleanName.replace(/,\s*$/, '');
    
    // Update the row
    row[1] = cleanName;
    
    // Check if row already has enough elements, if not pad it
    while (row.length < 7) {
        row.push(null);
    }
    // Set index 7 as address
    row[7] = address;
}

fs.writeFileSync(dataFile, JSON.stringify(data));
console.log("data.json updated successfully with split addresses.");

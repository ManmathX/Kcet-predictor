/**
 * Migration Script: Clean up college names and add addresses from CSV
 * 
 * Reads KCET_Colleges_Branches_Cutoffs_Separated.csv and for each unique college:
 * - Sets college_name to the clean name (without address)
 * - Sets address to the College Address column from the CSV
 * - Sets city from the City column
 * - Sets location to "Address, City" format
 * 
 * Usage: node migrate_college_addresses.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// --- CSV Parser (handles quoted fields with commas) ---
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

// --- Load the College model ---
const College = require('./models/College');

async function migrate() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kcet_colleges';
  
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // --- Read and parse CSV ---
  const csvPath = path.join(__dirname, '..', 'Rank-predict', 'KCET_Colleges_Branches_Cutoffs_Separated.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(l => l.trim());
  
  // Parse header
  const header = parseCSVLine(lines[0]);
  console.log(`📄 CSV headers: ${header.slice(0, 6).join(', ')}...`);
  
  // Find column indices
  const codeIdx = header.findIndex(h => h.toLowerCase().includes('college code'));
  const nameIdx = header.findIndex(h => h.toLowerCase().includes('college name'));
  const addressIdx = header.findIndex(h => h.toLowerCase().includes('college address'));
  const cityIdx = header.findIndex(h => h.toLowerCase().includes('city'));
  
  console.log(`   Code col: ${codeIdx}, Name col: ${nameIdx}, Address col: ${addressIdx}, City col: ${cityIdx}`);

  if (codeIdx < 0 || nameIdx < 0 || addressIdx < 0) {
    console.error('❌ Required columns not found in CSV');
    process.exit(1);
  }

  // --- Extract unique colleges ---
  const colleges = new Map();
  
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const code = fields[codeIdx];
    if (!code || colleges.has(code)) continue;
    
    colleges.set(code, {
      college_code: code,
      college_name: fields[nameIdx] || '',
      address: fields[addressIdx] || '',
      city: fields[cityIdx] || '',
    });
  }

  console.log(`\n📊 Found ${colleges.size} unique colleges in CSV\n`);

  // --- Preview first 5 ---
  let count = 0;
  for (const [code, data] of colleges) {
    if (count >= 5) break;
    console.log(`   ${code}: "${data.college_name}" | Address: "${data.address}" | City: "${data.city}"`);
    count++;
  }
  console.log('   ...\n');

  // --- Update MongoDB ---
  let updated = 0;
  let created = 0;
  let skipped = 0;

  for (const [code, csvData] of colleges) {
    const location = csvData.address
      ? `${csvData.address}, ${csvData.city}`
      : csvData.city;

    const updateData = {
      college_name: csvData.college_name,
      address: csvData.address,
      city: csvData.city,
      location: location,
    };

    try {
      const existing = await College.findOne({ college_code: code });

      if (existing) {
        // Update name, address, city, location — but preserve other fields
        await College.updateOne(
          { college_code: code },
          { $set: updateData }
        );
        updated++;
      } else {
        // Create new entry with basic info
        await College.create({
          college_code: code,
          ...updateData,
          isPublished: false,
        });
        created++;
      }
    } catch (err) {
      console.error(`   ❌ Error for ${code}: ${err.message}`);
      skipped++;
    }
  }

  console.log('═══════════════════════════════════════');
  console.log(`✅ Migration complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log('═══════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

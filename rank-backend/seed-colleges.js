/**
 * Seed script — reads KCET_Colleges_Branches_Cutoffs.csv,
 * extracts unique colleges, and upserts them into MongoDB.
 *
 * Usage:  node seed-colleges.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const College = require('./models/College');

const CSV_PATH = path.join(__dirname, '..', 'Rank-predict', 'KCET_Colleges_Branches_Cutoffs.csv');

// ──────────────────────────────────────────────
// Simple CSV parser that handles quoted fields
// ──────────────────────────────────────────────
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
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

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kcet_colleges';

  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Read CSV
  console.log(`📄 Reading CSV from: ${CSV_PATH}`);
  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = raw.split('\n').map(l => l.replace(/\r/g, '')).filter(l => l.trim());

  // Parse header
  const header = parseCSVLine(lines[0]);
  console.log(`📋 CSV columns: ${header.slice(0, 6).join(', ')}...`);

  // Extract unique colleges
  const collegesMap = new Map();
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const collegeCode = fields[0]?.trim();
    const collegeName = fields[2]?.trim();
    const city = fields[4]?.trim();

    if (!collegeCode || !collegeName) {
      skipped++;
      continue;
    }

    if (!collegesMap.has(collegeCode)) {
      collegesMap.set(collegeCode, {
        college_code: collegeCode,
        college_name: collegeName,
        location: city || '',
        city: city || '',
      });
    }
  }

  const colleges = Array.from(collegesMap.values());
  console.log(`\n📊 Found ${colleges.length} unique colleges (${skipped} rows skipped)`);

  // Upsert into MongoDB
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const college of colleges) {
    try {
      const result = await College.findOneAndUpdate(
        { college_code: college.college_code },
        {
          $setOnInsert: {
            description: '',
            photo_url: '',
            website: '',
            established_year: null,
            ranking: '',
            accreditation: '',
            affiliation: '',
            mode_of_admission: '',
            fees: '',
            courses_offered: '',
            contact_email: '',
            contact_phone: '',
            campus_area: '',
            hostel_facilities: '',
            other_facilities: '',
            placement_rate: '',
            highest_package: '',
            average_package: '',
            median_package: '',
            branchwise_placement: '',
            companies_visited: '',
            offers_made: '',
            total_internships: '',
            top_recruiters: '',
            naac_grade: '',
            placement_info: '',
            hostel_available: false,
          },
          $set: {
            college_name: college.college_name,
            location: college.location,
            city: college.city,
          },
        },
        { upsert: true, new: true }
      );

      if (result.created_at && result.updated_at &&
          Math.abs(result.created_at.getTime() - result.updated_at.getTime()) < 1000) {
        created++;
      } else {
        updated++;
      }
    } catch (err) {
      errors++;
      console.error(`  ❌ Error for ${college.college_code}: ${err.message}`);
    }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   📝 Created: ${created}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ❌ Errors:  ${errors}`);
  console.log(`   📦 Total in DB: ${await College.countDocuments()}`);

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB');
}

main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});

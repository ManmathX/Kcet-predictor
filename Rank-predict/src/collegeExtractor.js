import DATA from './data.json';

// Extract unique colleges from the data
export function extractUniqueColleges() {
  const collegesMap = new Map();
  
  DATA.rows.forEach(row => {
    const collegeCode = row[0];
    const collegeName = row[1];
    const city = row[3];
    
    if (!collegesMap.has(collegeCode)) {
      collegesMap.set(collegeCode, {
        college_code: collegeCode,
        college_name: collegeName,
        location: city,
        city: city,
        description: null,
        photo_url: null,
        website: null,
        established_year: null,
        affiliation: null
      });
    }
  });
  
  return Array.from(collegesMap.values());
}

// Get college by code from existing data
export function getCollegeFromData(collegeCode) {
  const row = DATA.rows.find(r => r[0] === collegeCode);
  if (!row) return null;
  
  return {
    college_code: row[0],
    college_name: row[1],
    city: row[3]
  };
}

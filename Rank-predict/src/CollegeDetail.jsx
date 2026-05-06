import { useState, useEffect, useMemo } from 'react';
import { getCollegeById } from './db';
import { getCollegeFromData, getCollegeCutoffs } from './collegeExtractor';

export default function CollegeDetail({ collegeCode, onClose }) {
  const [college, setCollege] = useState(null);
  const [collegeCourses, setCollegeCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDatabase, setFromDatabase] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(15); // Default GM
  const [activeTab, setActiveTab] = useState('about');

  // Memoize sorted courses based on cutoffs for the selected category, or by name
  const sortedCourses = useMemo(() => {
    if (!collegeCourses) return [];
    return [...collegeCourses].sort((a, b) => {
      const cutA = a.cutoffs && a.cutoffs[selectedCategory];
      const cutB = b.cutoffs && b.cutoffs[selectedCategory];
      if (cutA && cutB) return cutA - cutB;
      if (cutA) return -1;
      if (cutB) return 1;
      return (a.branchName || "").localeCompare(b.branchName || "");
    });
  }, [collegeCourses, selectedCategory]);

  // Index → seatCode mapping from data.json seatCodes array:
  // 0:1G 1:1K 2:1R 3:2AG 4:2AK 5:2AR 6:2BG 7:2BK 8:2BR
  // 9:3AG 10:3AK 11:3AR 12:3BG 13:3BK 14:3BR 15:GM 16:GMK 17:GMP
  // 18:GMR 19:NRI 20:OPN 21:OTH 22:SCG 23:SCK 24:SCR 25:STG 26:STK 27:STR
  const CATEGORY_GROUPS = [
    { label: 'General', options: [
      { id: 15, label: 'GM (General Merit)' },
      { id: 16, label: 'GMK (GM Kannada)' },
      { id: 17, label: 'GMP (GM Priority)' },
      { id: 18, label: 'GMR (GM Rural)' },
    ]},
    { label: 'Category 1', options: [
      { id: 0, label: '1G (Cat-1 General)' },
      { id: 1, label: '1K (Cat-1 Kannada)' },
      { id: 2, label: '1R (Cat-1 Rural)' },
    ]},
    { label: 'Category 2A', options: [
      { id: 3, label: '2AG (Cat-2A General)' },
      { id: 4, label: '2AK (Cat-2A Kannada)' },
      { id: 5, label: '2AR (Cat-2A Rural)' },
    ]},
    { label: 'Category 2B', options: [
      { id: 6, label: '2BG (Cat-2B General)' },
      { id: 7, label: '2BK (Cat-2B Kannada)' },
      { id: 8, label: '2BR (Cat-2B Rural)' },
    ]},
    { label: 'Category 3A', options: [
      { id: 9, label: '3AG (Cat-3A General)' },
      { id: 10, label: '3AK (Cat-3A Kannada)' },
      { id: 11, label: '3AR (Cat-3A Rural)' },
    ]},
    { label: 'Category 3B', options: [
      { id: 12, label: '3BG (Cat-3B General)' },
      { id: 13, label: '3BK (Cat-3B Kannada)' },
      { id: 14, label: '3BR (Cat-3B Rural)' },
    ]},
    { label: 'SC / ST', options: [
      { id: 22, label: 'SCG (SC General)' },
      { id: 23, label: 'SCK (SC Kannada)' },
      { id: 24, label: 'SCR (SC Rural)' },
      { id: 25, label: 'STG (ST General)' },
      { id: 26, label: 'STK (ST Kannada)' },
      { id: 27, label: 'STR (ST Rural)' },
    ]},
    { label: 'Other', options: [
      { id: 19, label: 'NRI' },
      { id: 20, label: 'OPN (Open)' },
      { id: 21, label: 'OTH (Other)' },
    ]},
  ];

  useEffect(() => {
    loadCollege();
  }, [collegeCode]);

  async function loadCollege() {
    setLoading(true);
    try {
      let dataToUse = null;
      let isDb = false;

      // Try to get from MongoDB API first
      const dbData = await getCollegeById(collegeCode);
      if (dbData) {
        dataToUse = dbData;
        isDb = true;
      } else {
        // Fallback to data.json
        dataToUse = getCollegeFromData(collegeCode);
      }

      setCollege(dataToUse);
      setFromDatabase(isDb);

      // ── Course & Cutoff Loading Priority ──
      // 1. Backend = Source of Truth (if courses are explicitly defined)
      if (dataToUse && Array.isArray(dataToUse.courses) && dataToUse.courses.length > 0) {
        setCollegeCourses(dataToUse.courses);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Data Sync] Using BACKEND courses for ${collegeCode}`);
        }
      } else {
        // 2. Frontend data.json = Temporary Fallback
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Data Sync] ⚠️ Backend missing courses for ${collegeCode}. Falling back to local data.json`);
        }
        const localCourses = getCollegeCutoffs(collegeCode) || [];
        setCollegeCourses(localCourses);
      }

    } catch (error) {
      console.warn(`[Data Sync] 🚨 API request completely failed for ${collegeCode}. Forcing total fallback to local data.json.`);
      // Fallback to data.json on error
      const jsonData = getCollegeFromData(collegeCode);
      setCollege(jsonData);
      setFromDatabase(false);
      
      const localCourses = getCollegeCutoffs(collegeCode) || [];
      setCollegeCourses(localCourses);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="auth-overlay" style={{ zIndex: 150 }}>
        <div className="auth-shell">
          <div className="panel college-detail-panel" style={{ maxWidth: 900, padding: 0, overflow: 'hidden' }}>
            {/* Skeleton loading */}
            <div className="cd-skeleton-hero" />
            <div style={{ padding: '32px 40px' }}>
              <div className="cd-skeleton-line" style={{ width: '60%', height: 28, marginBottom: 12 }} />
              <div className="cd-skeleton-line" style={{ width: '35%', height: 16, marginBottom: 32 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="cd-skeleton-line" style={{ height: 70, borderRadius: 10 }} />
                <div className="cd-skeleton-line" style={{ height: 70, borderRadius: 10 }} />
                <div className="cd-skeleton-line" style={{ height: 70, borderRadius: 10 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="auth-overlay" style={{ zIndex: 150 }}>
        <div className="auth-shell">
          <div className="panel" style={{ maxWidth: 500, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🏫</div>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>College Not Found</h2>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
              Details for college code "{collegeCode}" are not available yet.
            </p>
            <button className="primary-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const hasPlacement = fromDatabase && (
    college.placement_info || college.placement_rate || college.highest_package || college.average_package ||
    college.median_package || college.branchwise_placement || college.companies_visited ||
    college.offers_made || college.total_internships || college.top_recruiters
  );
  
  const hasFacilities = fromDatabase && (college.facilities || college.hostel_facilities || college.other_facilities);
  const hasContact = fromDatabase && (college.contact_email || college.contact_phone);
  const hasCourses = collegeCourses && collegeCourses.length > 0;

  const tabs = [
    { id: 'about', label: 'Overview', icon: '📋' },
    ...(hasCourses ? [{ id: 'courses', label: 'Courses & Cutoffs', icon: '📚' }] : []),
    ...(hasPlacement ? [{ id: 'placement', label: 'Placement', icon: '💼' }] : []),
    ...(hasFacilities || hasContact ? [{ id: 'facilities', label: 'Facilities & Contact', icon: '🏢' }] : []),
  ];

  return (
    <div className="auth-overlay" style={{ zIndex: 150 }} onClick={onClose}>
      <div className="auth-shell">
        <div
          className="panel college-detail-panel"
          style={{ maxWidth: 900, padding: 0, overflow: 'hidden', position: 'relative' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            className="rating-close"
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 10,
              background: 'rgba(0,0,0,0.5)', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', color: '#fff',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Hero / Photo */}
          {college.photo_url ? (
            <div className="cd-hero">
              <img src={college.photo_url} alt={college.college_name} />
              <div className="cd-hero-gradient" />
            </div>
          ) : (
            <div className="cd-hero-placeholder">
              <span>🏛</span>
            </div>
          )}

          {/* Content */}
          <div className="cd-content">
            {/* Header */}
            <div className="cd-header">
              <h1 className="cd-title">{college.college_name}</h1>
              <p className="cd-location">
                📍 {college.location || college.city}
                {college.city && college.location && college.location !== college.city ? `, ${college.city}` : ''}
              </p>
            </div>

            {/* Fallback notice */}
            {!fromDatabase && (
              <div className="cd-notice">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
                Basic information shown. Full details will be available soon.
              </div>
            )}

            {/* Stats Cards */}
            <div className="cd-stats">
              {college.established_year && (
                <div className="cd-stat-card">
                  <div className="cd-stat-icon">🗓</div>
                  <div>
                    <div className="cd-stat-label">Established</div>
                    <div className="cd-stat-value">{college.established_year}</div>
                  </div>
                </div>
              )}
              {college.affiliation && (
                <div className="cd-stat-card">
                  <div className="cd-stat-icon">🎓</div>
                  <div>
                    <div className="cd-stat-label">Affiliation</div>
                    <div className="cd-stat-value">{college.affiliation}</div>
                  </div>
                </div>
              )}
              <div className="cd-stat-card">
                <div className="cd-stat-icon">🔢</div>
                <div>
                  <div className="cd-stat-label">College Code</div>
                  <div className="cd-stat-value">{college.college_code}</div>
                </div>
              </div>
              {college.naac_grade && (
                <div className="cd-stat-card">
                  <div className="cd-stat-icon">⭐</div>
                  <div>
                    <div className="cd-stat-label">NAAC Grade</div>
                    <div className="cd-stat-value">{college.naac_grade}</div>
                  </div>
                </div>
              )}
              {college.campus_area && (
                <div className="cd-stat-card">
                  <div className="cd-stat-icon">🏞</div>
                  <div>
                    <div className="cd-stat-label">Campus</div>
                    <div className="cd-stat-value">{college.campus_area}</div>
                  </div>
                </div>
              )}
              {college.hostel_available && (
                <div className="cd-stat-card">
                  <div className="cd-stat-icon">🏠</div>
                  <div>
                    <div className="cd-stat-label">Hostel</div>
                    <div className="cd-stat-value">Available</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            {tabs.length > 1 && (
              <div className="cd-tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`cd-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'about' && (
              <div key="about" className="cd-tab-content">
                {college.description && (
                  <div className="cd-section">
                    <h3 className="cd-section-title">About the College</h3>
                    <p className="cd-section-text">{college.description}</p>
                  </div>
                )}

                {(college.ranking || college.accreditation || college.affiliation) && (
                  <div className="cd-section">
                    <h3 className="cd-section-title">🏆 Recognition</h3>
                    <div className="cd-contact-grid">
                      {college.ranking && (
                        <div className="cd-contact-item">
                          <span className="cd-contact-icon">📈</span>
                          <div>
                            <div className="cd-contact-label">Ranking</div>
                            <div className="cd-contact-value" style={{ color: '#e2e8f0' }}>{college.ranking}</div>
                          </div>
                        </div>
                      )}
                      {(college.accreditation || college.naac_grade) && (
                        <div className="cd-contact-item">
                          <span className="cd-contact-icon">⭐</span>
                          <div>
                            <div className="cd-contact-label">Accreditation</div>
                            <div className="cd-contact-value" style={{ color: '#e2e8f0' }}>{college.accreditation || `NAAC ${college.naac_grade}`}</div>
                          </div>
                        </div>
                      )}
                      {college.affiliation && (
                        <div className="cd-contact-item">
                          <span className="cd-contact-icon">🎓</span>
                          <div>
                            <div className="cd-contact-label">Affiliation</div>
                            <div className="cd-contact-value" style={{ color: '#e2e8f0' }}>{college.affiliation}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(college.mode_of_admission || college.fees || college.courses_offered) && (
                  <div className="cd-section">
                    <h3 className="cd-section-title">📚 Academics & Admission</h3>
                    <div className="cd-contact-grid">
                      {college.mode_of_admission && (
                        <div className="cd-contact-item">
                          <span className="cd-contact-icon">📝</span>
                          <div>
                            <div className="cd-contact-label">Mode of Admission</div>
                            <div className="cd-contact-value" style={{ color: '#e2e8f0' }}>{college.mode_of_admission}</div>
                          </div>
                        </div>
                      )}
                      {college.fees && (
                        <div className="cd-contact-item">
                          <span className="cd-contact-icon">💰</span>
                          <div>
                            <div className="cd-contact-label">Fees</div>
                            <div className="cd-contact-value" style={{ color: '#e2e8f0' }}>{college.fees}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    {college.courses_offered && (
                      <div className="cd-contact-item" style={{ marginTop: '12px' }}>
                        <span className="cd-contact-icon">📋</span>
                        <div>
                          <div className="cd-contact-label">Courses Offered</div>
                          <div className="cd-contact-value" style={{ color: '#e2e8f0' }}>{college.courses_offered}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'courses' && (
              <div key="courses" className="cd-tab-content">
                <div className="cd-section cd-section-table">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 className="cd-section-title" style={{ marginBottom: 0 }}>📚 Courses & Cutoffs</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label htmlFor="category-select" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Category:</label>
                      <select 
                        id="category-select"
                        className="cd-category-select"
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(Number(e.target.value))}
                      >
                        {CATEGORY_GROUPS.map(group => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="cd-grid-table">
                    <div className="cd-grid-header">
                      <span>Branch Name</span>
                      <span style={{ textAlign: 'right' }}>Closing Rank</span>
                    </div>
                    <div className="cd-grid-subheader">
                      4-Year B.E./B.Tech. Course
                    </div>
                    {sortedCourses.map((course) => (
                      <div key={`${course.branchCode}-${course.branchName}`} className="cd-grid-row">
                        <div className="cd-grid-cell branch-name">
                          <div className="branch-main-info">
                            <span className="branch-title">{course.branchName}</span>
                            <span className="branch-code">{course.branchCode}</span>
                          </div>
                          <span className="branch-group">{course.branchGroup}</span>
                        </div>
                        <div className={`cd-grid-cell rank ${course.cutoffs && course.cutoffs[selectedCategory] != null ? 'has-value' : ''}`}>
                          {course.cutoffs && course.cutoffs[selectedCategory] != null ? course.cutoffs[selectedCategory].toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!collegeCourses.some(c => c.cutoffs && c.cutoffs[selectedCategory] != null) && (
                    <div className="cd-courses-empty">
                      <span>ℹ️</span>
                      No cutoff data available for this category. Try selecting a different category above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'placement' && (
              <div key="placement" className="cd-tab-content">
                <div className="cd-section">
                  <h3 className="cd-section-title">💼 Placement Overview</h3>
                  
                  {/* Highlights Grid */}
                  <div className="cd-stats" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                    {college.highest_package && (
                      <div className="cd-stat-card">
                        <div className="cd-stat-icon" style={{ color: 'var(--accent-1)' }}>💰</div>
                        <div>
                          <div className="cd-stat-label">Highest Package</div>
                          <div className="cd-stat-value">{college.highest_package}</div>
                        </div>
                      </div>
                    )}
                    {college.average_package && (
                      <div className="cd-stat-card">
                        <div className="cd-stat-icon" style={{ color: 'var(--green)' }}>📈</div>
                        <div>
                          <div className="cd-stat-label">Average Package</div>
                          <div className="cd-stat-value">{college.average_package}</div>
                        </div>
                      </div>
                    )}
                    {college.median_package && (
                      <div className="cd-stat-card">
                        <div className="cd-stat-icon" style={{ color: 'var(--lime)' }}>📊</div>
                        <div>
                          <div className="cd-stat-label">Median Package</div>
                          <div className="cd-stat-value">{college.median_package}</div>
                        </div>
                      </div>
                    )}
                    {college.placement_rate && (
                      <div className="cd-stat-card">
                        <div className="cd-stat-icon" style={{ color: 'var(--teal)' }}>🎯</div>
                        <div>
                          <div className="cd-stat-label">Placement Rate</div>
                          <div className="cd-stat-value">{college.placement_rate}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="cd-contact-grid" style={{ marginTop: '16px' }}>
                    {college.companies_visited && (
                      <div className="cd-contact-item">
                        <span className="cd-contact-icon">🏢</span>
                        <div>
                          <div className="cd-contact-label">Companies Visited</div>
                          <div className="cd-contact-value" style={{ color: '#e2e8f0' }}>{college.companies_visited}</div>
                        </div>
                      </div>
                    )}
                    {college.offers_made && (
                      <div className="cd-contact-item">
                        <span className="cd-contact-icon">🤝</span>
                        <div>
                          <div className="cd-contact-label">Offers Made</div>
                          <div className="cd-contact-value" style={{ color: '#e2e8f0' }}>{college.offers_made}</div>
                        </div>
                      </div>
                    )}
                    {college.total_internships && (
                      <div className="cd-contact-item">
                        <span className="cd-contact-icon">👨‍💻</span>
                        <div>
                          <div className="cd-contact-label">Internships</div>
                          <div className="cd-contact-value" style={{ color: '#e2e8f0' }}>{college.total_internships}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {college.top_recruiters && (
                    <div className="cd-contact-item" style={{ marginTop: '12px' }}>
                      <span className="cd-contact-icon">🌟</span>
                      <div>
                        <div className="cd-contact-label">Top Recruiters</div>
                        <div className="cd-contact-value" style={{ color: '#e2e8f0' }}>{college.top_recruiters}</div>
                      </div>
                    </div>
                  )}

                  {college.branchwise_placement && (
                    <div className="cd-contact-item" style={{ marginTop: '12px' }}>
                      <span className="cd-contact-icon">📋</span>
                      <div>
                        <div className="cd-contact-label">Branch-wise Placement</div>
                        <div className="cd-contact-value" style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{college.branchwise_placement}</div>
                      </div>
                    </div>
                  )}

                  {college.placement_info && (
                    <div className="cd-contact-item" style={{ marginTop: '12px' }}>
                      <span className="cd-contact-icon">ℹ️</span>
                      <div>
                        <div className="cd-contact-label">Additional Info</div>
                        <div className="cd-contact-value" style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{college.placement_info}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'facilities' && (
              <div key="facilities" className="cd-tab-content">
                {hasFacilities && (() => {
                  // Parse facility strings into individual items and deduplicate
                  const parseFacilities = (str) => {
                    if (!str) return [];
                    return str
                      .split(/[,\n;]+/)
                      .map(s => s.trim())
                      .filter(s => s.length > 0);
                  };

                  // Use merged `facilities` field, with backward compat for old separate fields
                  const facilityItems = college.facilities
                    ? parseFacilities(college.facilities)
                    : [...parseFacilities(college.hostel_facilities), ...parseFacilities(college.other_facilities)];

                  // Deduplicate by normalized name
                  const normalize = (str) => str.toLowerCase().replace(/[-\s]/g, "");
                  const seen = new Set();
                  const uniqueFacilities = facilityItems.filter(f => {
                    const key = normalize(f);
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  });

                  // Sort alphabetically
                  uniqueFacilities.sort((a, b) => a.localeCompare(b));

                  return (
                    <div className="cd-section" aria-label="College facilities">
                      <h3 className="cd-section-title">🏢 Campus Facilities</h3>
                      {college.hostel_available && (
                        <div className="cd-facility-badge">
                          <span>✅</span> Hostel Available
                        </div>
                      )}
                      {uniqueFacilities.length > 0 ? (
                        <div className="cd-facility-tags">
                          {uniqueFacilities.map((f, i) => (
                            <span key={i} className="cd-facility-tag">
                              <span className="cd-facility-tag__icon">🏢</span>
                              {f}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="cd-courses-empty">
                          <span>ℹ️</span>
                          Facility details are not available yet for this college.
                        </div>
                      )}
                    </div>
                  );
                })()}

                {hasContact && (
                  <div className="cd-section">
                    <h3 className="cd-section-title">📞 Contact Information</h3>
                    <div className="cd-contact-grid">
                      {college.contact_email && (
                        <div className="cd-contact-item">
                          <span className="cd-contact-icon">✉️</span>
                          <div>
                            <div className="cd-contact-label">Email</div>
                            <a href={`mailto:${college.contact_email}`} className="cd-contact-value">
                              {college.contact_email}
                            </a>
                          </div>
                        </div>
                      )}
                      {college.contact_phone && (
                        <div className="cd-contact-item">
                          <span className="cd-contact-icon">📱</span>
                          <div>
                            <div className="cd-contact-label">Phone</div>
                            <a href={`tel:${college.contact_phone}`} className="cd-contact-value">
                              {college.contact_phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="cd-actions">
              {college.website && (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-btn cd-website-btn"
                >
                  🌐 Visit Website
                </a>
              )}
              <button className="secondary-btn" onClick={onClose} style={{ flex: college.website ? 0 : 1 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

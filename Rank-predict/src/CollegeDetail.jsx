import { useState, useEffect } from 'react';
import { getCollegeById } from './db';
import { getCollegeFromData } from './collegeExtractor';

export default function CollegeDetail({ collegeCode, onClose }) {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDatabase, setFromDatabase] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    loadCollege();
  }, [collegeCode]);

  async function loadCollege() {
    setLoading(true);
    try {
      // Try to get from MongoDB API first
      const dbData = await getCollegeById(collegeCode);
      if (dbData) {
        setCollege(dbData);
        setFromDatabase(true);
      } else {
        // Fallback to data.json
        const jsonData = getCollegeFromData(collegeCode);
        if (jsonData) {
          setCollege(jsonData);
          setFromDatabase(false);
        }
      }
    } catch (error) {
      console.error('Error loading college:', error);
      // Fallback to data.json on error
      const jsonData = getCollegeFromData(collegeCode);
      if (jsonData) {
        setCollege(jsonData);
        setFromDatabase(false);
      }
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
  
  const hasFacilities = fromDatabase && (college.hostel_facilities || college.other_facilities);
  const hasContact = fromDatabase && (college.contact_email || college.contact_phone);

  const tabs = [
    { id: 'about', label: 'About', icon: '📋' },
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
                {hasFacilities && (
                  <div className="cd-section">
                    <h3 className="cd-section-title">🏢 Campus Facilities</h3>
                    {college.hostel_facilities && (
                      <div className="cd-contact-item" style={{ marginBottom: '12px' }}>
                        <span className="cd-contact-icon">🏠</span>
                        <div>
                          <div className="cd-contact-label">Hostel Facilities</div>
                          <div className="cd-contact-value" style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{college.hostel_facilities}</div>
                        </div>
                      </div>
                    )}
                    {college.other_facilities && (
                      <div className="cd-contact-item">
                        <span className="cd-contact-icon">🎾</span>
                        <div>
                          <div className="cd-contact-label">Other Facilities</div>
                          <div className="cd-contact-value" style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{college.other_facilities}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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

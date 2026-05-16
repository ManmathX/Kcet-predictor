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

  // Index → seatCode mapping
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

      const dbData = await getCollegeById(collegeCode);
      if (dbData) {
        dataToUse = dbData;
        isDb = true;
      } else {
        dataToUse = getCollegeFromData(collegeCode);
      }

      setCollege(dataToUse);
      setFromDatabase(isDb);

      if (dataToUse && Array.isArray(dataToUse.courses) && dataToUse.courses.length > 0) {
        setCollegeCourses(dataToUse.courses);
      } else {
        const localCourses = getCollegeCutoffs(collegeCode) || [];
        setCollegeCourses(localCourses);
      }
    } catch (error) {
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
        <div className="auth-shell" style={{ padding: 0, width: '100vw', height: '100vh' }}>
          <div className="panel college-detail-panel" style={{ width: '100%', height: '100%', maxWidth: 'none', borderRadius: 0, padding: 0, overflow: 'hidden' }}>
            <div className="cd-skeleton-hero" style={{ height: '350px' }} />
            <div style={{ padding: '32px 40px' }}>
              <div className="cd-skeleton-line" style={{ width: '60%', height: 36, marginBottom: 16 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="cd-skeleton-line" style={{ height: 80, borderRadius: 12 }} />
                <div className="cd-skeleton-line" style={{ height: 80, borderRadius: 12 }} />
                <div className="cd-skeleton-line" style={{ height: 80, borderRadius: 12 }} />
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
        <div className="auth-shell" style={{ padding: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ maxWidth: 500, padding: 48, textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>College Not Found</h2>
            <button className="primary-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const hasPlacement = fromDatabase && (
    college.placement_info || college.placement_rate || college.highest_package || college.average_package
  );
  const hasFacilities = fromDatabase && (college.facilities || college.hostel_facilities);
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
      <div className="auth-shell" style={{ padding: 0, width: '100vw', height: '100vh' }}>
        <div
          className="panel college-detail-panel"
          style={{ width: '100%', height: '100%', maxWidth: 'none', borderRadius: 0, padding: 0, overflowY: 'auto', position: 'relative' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className="rating-close" onClick={onClose} style={{ position: 'fixed', top: 24, right: 24, zIndex: 100, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff', backdropFilter: 'blur(10px)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Hero */}
          <div className="cd-hero" style={{ height: '350px' }}>
            {college.photo_url ? <img src={college.photo_url} alt={college.college_name} /> : <div className="cd-hero-placeholder"><span>🏛</span></div>}
            <div className="cd-hero-gradient" />
          </div>

          <div className="cd-content">
            <div className="cd-header">
              <h1 className="cd-title">{college.college_name}</h1>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', color: '#94a3b8', fontSize: '15px' }}>
                <span className="cd-location" style={{ margin: 0 }}>📍 {college.location || college.city}</span>
                {college.established_year && <span className="cd-location" style={{ margin: 0 }}>🗓 Est. {college.established_year}</span>}
                <span className="cd-location" style={{ margin: 0 }}>🔢 Code: {college.college_code}</span>
              </div>
            </div>

            <div className="cd-tabs">
              {tabs.map((tab) => (
                <button key={tab.id} className={`cd-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'about' && (
              <div className="cd-tab-content">
                {college.description && (
                  <div className="cd-section">
                    <h3 className="cd-section-title">About the College</h3>
                    <p className="cd-section-text">{college.description}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="cd-tab-content">
                <div className="cd-section cd-section-table">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 className="cd-section-title" style={{ marginBottom: 0 }}>📚 Courses & Cutoffs</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select className="cd-category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(Number(e.target.value))}>
                        {CATEGORY_GROUPS.map(group => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
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
                    <div className="cd-grid-subheader">4-Year B.E./B.Tech. Course</div>
                    {sortedCourses.map((course) => (
                      <div key={`${course.branchCode}-${course.branchName}`} className="cd-grid-row">
                        <div className="cd-grid-cell branch-name">
                          <span className="branch-title">{course.branchName}</span>
                        </div>
                        <div className={`cd-grid-cell rank ${course.cutoffs && course.cutoffs[selectedCategory] != null ? "has-value" : ""}`}>
                          {course.cutoffs && course.cutoffs[selectedCategory] != null ? course.cutoffs[selectedCategory].toLocaleString() : "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'placement' && (
              <div className="cd-tab-content">
                <div className="cd-section">
                  <h3 className="cd-section-title">💼 Placement Overview</h3>
                  
                  <div 
                    className="cd-placement-info-box" 
                    style={{ 
                      minHeight: '300px',
                      padding: '32px', 
                      background: 'rgba(15, 23, 42, 0.6)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px', 
                      whiteSpace: 'pre-wrap', 
                      fontSize: '17px', 
                      lineHeight: '1.8', 
                      color: '#e2e8f0',
                      boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.3)',
                      overflowY: 'auto'
                    }}
                  >
                    {college.placement_info || "Detailed placement information is currently being updated. Please check back later for comprehensive statistics on companies visited, branchwise placements, and more."}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'facilities' && (
              <div className="cd-tab-content">
                <div className="cd-section">
                  <h3 className="cd-section-title">🏢 Campus Facilities</h3>
                  <div className="cd-facility-tags">
                    {(college.facilities || "").split(/[,\n]+/).filter(f => f.trim()).map((f, i) => (
                      <span key={i} className="cd-facility-tag">🏢 {f.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="cd-actions">
              {college.website && <a href={college.website} target="_blank" rel="noopener noreferrer" className="primary-btn cd-website-btn">🌐 Visit Website</a>}
              <button className="secondary-btn" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

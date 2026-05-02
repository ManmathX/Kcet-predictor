import { useState, useEffect, useCallback } from 'react';
import {
  fetchColleges,
  fetchCollege,
  createCollege,
  updateCollege,
  deleteCollege as deleteCollegeApi,
  verifyPassword,
  setAdminPassword,
  clearAdminPassword,
  isLoggedIn,
} from './api';
import './index.css';

/* ═══════════════════════════════════════════════
   Toast Notification System
   ═══════════════════════════════════════════════ */
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✅' : '❌'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Login Page
   ═══════════════════════════════════════════════ */
function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');

    try {
      const ok = await verifyPassword(password.trim());
      if (ok) {
        setAdminPassword(password.trim());
        onLogin();
      } else {
        setError('Invalid admin password. Please try again.');
      }
    } catch {
      setError('Cannot reach the server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="logo-icon">🎓</div>
        <h1>Admin Portal</h1>
        <p className="subtitle">KCET College Management System</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="adminPassword">Admin Password</label>
            <input
              id="adminPassword"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   College Form Modal
   ═══════════════════════════════════════════════ */
const EMPTY_FORM = {
  college_code: '',
  college_name: '',
  location: '',
  city: '',
  description: '',
  photo_url: '',
  website: '',
  established_year: '',
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
};

function CollegeFormModal({ editCode, onClose, onSaved, addToast }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editCode);
  const isEdit = !!editCode;

  useEffect(() => {
    if (!editCode) return;
    setFetching(true);
    fetchCollege(editCode)
      .then((data) => {
        setForm({
          college_code: data.college_code || '',
          college_name: data.college_name || '',
          location: data.location || '',
          city: data.city || '',
          description: data.description || '',
          photo_url: data.photo_url || '',
          website: data.website || '',
          established_year: data.established_year || '',
          ranking: data.ranking || '',
          accreditation: data.accreditation || '',
          affiliation: data.affiliation || '',
          mode_of_admission: data.mode_of_admission || '',
          fees: data.fees || '',
          courses_offered: data.courses_offered || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          campus_area: data.campus_area || '',
          hostel_facilities: data.hostel_facilities || '',
          other_facilities: data.other_facilities || '',
          placement_rate: data.placement_rate || '',
          highest_package: data.highest_package || '',
          average_package: data.average_package || '',
          median_package: data.median_package || '',
          branchwise_placement: data.branchwise_placement || '',
          companies_visited: data.companies_visited || '',
          offers_made: data.offers_made || '',
          total_internships: data.total_internships || '',
          top_recruiters: data.top_recruiters || '',
          naac_grade: data.naac_grade || '',
          placement_info: data.placement_info || '',
          hostel_available: data.hostel_available || false,
        });
      })
      .catch(() => addToast('Failed to load college details.', 'error'))
      .finally(() => setFetching(false));
  }, [editCode, addToast]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.college_code.trim() || !form.college_name.trim()) {
      addToast('College code and name are required.', 'error');
      return;
    }
    setLoading(true);

    const payload = {
      ...form,
      established_year: form.established_year ? Number(form.established_year) : null,
    };

    try {
      if (isEdit) {
        await updateCollege(editCode, payload);
        addToast(`"${form.college_name}" updated successfully.`, 'success');
      } else {
        await createCollege(payload);
        addToast(`"${form.college_name}" created successfully.`, 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      addToast(err.message || 'Operation failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? '✏️ Edit College' : '➕ Add New College'}</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {fetching ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading college data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <h3 style={{ marginTop: 0, color: 'var(--accent-1)', fontSize: '16px' }}>Core Identity</h3>
              {/* Basic Info */}
              <div className="field-row">
                <div className="field">
                  <label>College Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. E001"
                    value={form.college_code}
                    onChange={(e) => handleChange('college_code', e.target.value)}
                    disabled={isEdit}
                    required
                    style={isEdit ? { opacity: 0.5 } : {}}
                  />
                </div>
                <div className="field">
                  <label>Established Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 1962"
                    min="1800"
                    max="2030"
                    value={form.established_year}
                    onChange={(e) => handleChange('established_year', e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>College Name *</label>
                <input
                  type="text"
                  placeholder="Full name of the college"
                  value={form.college_name}
                  onChange={(e) => handleChange('college_name', e.target.value)}
                  required
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. K.R. Circle, Bengaluru"
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>Description</label>
                <textarea
                  placeholder="Brief description of the college, its history, highlights..."
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              <h3 style={{ marginTop: '24px', color: 'var(--accent-1)', fontSize: '16px' }}>Academic & Admission Info</h3>
              <div className="field-row">
                <div className="field">
                  <label>Affiliation</label>
                  <input
                    type="text"
                    placeholder="e.g. VTU, Autonomous"
                    value={form.affiliation}
                    onChange={(e) => handleChange('affiliation', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Accreditation (NAAC/NBA)</label>
                  <input
                    type="text"
                    placeholder="e.g. NAAC A++, NBA Accredited"
                    value={form.accreditation}
                    onChange={(e) => handleChange('accreditation', e.target.value)}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Ranking</label>
                  <input
                    type="text"
                    placeholder="e.g. NIRF 100, QS 200"
                    value={form.ranking}
                    onChange={(e) => handleChange('ranking', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Mode of Admission</label>
                  <input
                    type="text"
                    placeholder="e.g. KCET, COMEDK, Management"
                    value={form.mode_of_admission}
                    onChange={(e) => handleChange('mode_of_admission', e.target.value)}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Fees</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹90,000/year (KCET)"
                    value={form.fees}
                    onChange={(e) => handleChange('fees', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Courses Offered</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE, ISE, ECE, ME, CE"
                    value={form.courses_offered}
                    onChange={(e) => handleChange('courses_offered', e.target.value)}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '24px', color: 'var(--accent-1)', fontSize: '16px' }}>Placement Details (Optional)</h3>
              
              <div className="field-row-3">
                <div className="field">
                  <label>Highest Package</label>
                  <input
                    type="text"
                    placeholder="e.g. 50 LPA"
                    value={form.highest_package}
                    onChange={(e) => handleChange('highest_package', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Average Package</label>
                  <input
                    type="text"
                    placeholder="e.g. 8.5 LPA"
                    value={form.average_package}
                    onChange={(e) => handleChange('average_package', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Median Package</label>
                  <input
                    type="text"
                    placeholder="e.g. 6.5 LPA"
                    value={form.median_package}
                    onChange={(e) => handleChange('median_package', e.target.value)}
                  />
                </div>
              </div>

              <div className="field-row-3" style={{ marginTop: '10px' }}>
                <div className="field">
                  <label>Placement Rate</label>
                  <input
                    type="text"
                    placeholder="e.g. 95%"
                    value={form.placement_rate}
                    onChange={(e) => handleChange('placement_rate', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Companies Visited</label>
                  <input
                    type="text"
                    placeholder="e.g. 250+"
                    value={form.companies_visited}
                    onChange={(e) => handleChange('companies_visited', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Offers Made</label>
                  <input
                    type="text"
                    placeholder="e.g. 1500+"
                    value={form.offers_made}
                    onChange={(e) => handleChange('offers_made', e.target.value)}
                  />
                </div>
              </div>

              <div className="field" style={{ marginTop: '10px' }}>
                <label>Top Recruiters</label>
                <input
                  type="text"
                  placeholder="e.g. TCS, Infosys, Amazon, Microsoft"
                  value={form.top_recruiters}
                  onChange={(e) => handleChange('top_recruiters', e.target.value)}
                />
              </div>

              <div className="field-row" style={{ marginTop: '10px' }}>
                <div className="field">
                  <label>Branchwise Placement Data</label>
                  <textarea
                    placeholder="e.g. CSE: 98%, ECE: 92%, ME: 80%"
                    value={form.branchwise_placement}
                    onChange={(e) => handleChange('branchwise_placement', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="field">
                  <label>Total Internships</label>
                  <textarea
                    placeholder="e.g. 500+ students secured internships"
                    value={form.total_internships}
                    onChange={(e) => handleChange('total_internships', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '24px', color: 'var(--accent-1)', fontSize: '16px' }}>Facilities & Contact</h3>

              <div className="field">
                <label>Hostel Facilities</label>
                <textarea
                  placeholder="e.g. Separate boys and girls hostels, WiFi, Mess..."
                  value={form.hostel_facilities}
                  onChange={(e) => handleChange('hostel_facilities', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="field">
                <label>Other Facilities</label>
                <textarea
                  placeholder="e.g. Library, Sports Complex, Gym, Auditorium..."
                  value={form.other_facilities}
                  onChange={(e) => handleChange('other_facilities', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Media & Links */}
              <div className="field">
                <label>Photo URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/college-photo.jpg"
                  value={form.photo_url}
                  onChange={(e) => handleChange('photo_url', e.target.value)}
                />
                {form.photo_url && (
                  <div className="img-preview">
                    <img
                      src={form.photo_url}
                      alt="Preview"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div className="field">
                <label>Website</label>
                <input
                  type="url"
                  placeholder="https://college-website.edu"
                  value={form.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
              </div>

              <div className="field-row-3">
                <div className="field">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    placeholder="info@college.edu"
                    value={form.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91-80-XXXXXXXX"
                    value={form.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Campus Area</label>
                  <input
                    type="text"
                    placeholder="e.g. 50 acres"
                    value={form.campus_area}
                    onChange={(e) => handleChange('campus_area', e.target.value)}
                  />
                </div>
              </div>

              <label className="checkbox-field" style={{ marginTop: '16px' }}>
                <input
                  type="checkbox"
                  checked={form.hostel_available}
                  onChange={(e) => handleChange('hostel_available', e.target.checked)}
                />
                <span>Quick Flag: Hostel Available</span>
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEdit ? 'Update College' : 'Create College'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Delete Confirmation Modal
   ═══════════════════════════════════════════════ */
function DeleteModal({ college, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel delete-modal" onClick={(e) => e.stopPropagation()} style={{ padding: 40 }}>
        <div className="icon">⚠️</div>
        <h2>Delete College?</h2>
        <p>
          Are you sure you want to delete <strong>"{college.college_name}"</strong> ({college.college_code})?
          This action cannot be undone.
        </p>
        <div className="actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Dashboard
   ═══════════════════════════════════════════════ */
function Dashboard({ onLogout }) {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCode, setEditCode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const loadColleges = useCallback(async () => {
    try {
      const data = await fetchColleges(search);
      setColleges(data);
    } catch {
      addToast('Failed to load colleges.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, addToast]);

  useEffect(() => {
    loadColleges();
  }, [loadColleges]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadColleges();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, loadColleges]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCollegeApi(deleteTarget.college_code);
      addToast(`"${deleteTarget.college_name}" deleted.`, 'success');
      setDeleteTarget(null);
      loadColleges();
    } catch (err) {
      addToast(err.message || 'Failed to delete.', 'error');
    }
  };

  const openEdit = (code) => {
    setEditCode(code);
    setShowForm(true);
  };

  const openAdd = () => {
    setEditCode(null);
    setShowForm(true);
  };

  const withPhoto = colleges.filter((c) => c.photo_url).length;
  const withDesc = colleges.filter((c) => c.description).length;

  return (
    <div className="admin-shell">
      <ToastContainer toasts={toasts} />

      {/* Top Bar */}
      <div className="top-bar">
        <div className="brand">
          <div className="brand-icon">🎓</div>
          <div>
            <h1>College Admin</h1>
          </div>
          <span>KCET 2025</span>
        </div>
        <div className="top-bar-actions">
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content fade-in">
        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon purple">🏫</div>
            <div className="stat-info">
              <div className="stat-value">{colleges.length}</div>
              <div className="stat-label">Total Colleges</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">📸</div>
            <div className="stat-info">
              <div className="stat-value">{withPhoto}</div>
              <div className="stat-label">With Photos</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">📝</div>
            <div className="stat-info">
              <div className="stat-value">{withDesc}</div>
              <div className="stat-label">With Description</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search colleges by name, code, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add College
          </button>
        </div>

        {/* College Table */}
        <div className="college-table-wrap">
          {loading ? (
            <div className="empty-state">
              <p style={{ color: 'var(--text-muted)' }}>Loading colleges...</p>
            </div>
          ) : colleges.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🏫</div>
              <h3>{search ? 'No results found' : 'No colleges yet'}</h3>
              <p>{search ? 'Try a different search term.' : 'Start by adding your first college.'}</p>
              {!search && (
                <button className="btn btn-primary" onClick={openAdd}>
                  Add First College
                </button>
              )}
            </div>
          ) : (
            <table className="college-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}></th>
                  <th>College</th>
                  <th>Code</th>
                  <th>Affiliation</th>
                  <th>Status</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {colleges.map((c) => (
                  <tr key={c.college_code || c._id}>
                    <td>
                      {c.photo_url ? (
                        <img className="college-row-thumb" src={c.photo_url} alt="" />
                      ) : (
                        <div className="college-row-thumb-placeholder">🏛</div>
                      )}
                    </td>
                    <td>
                      <div className="college-row-name">{c.college_name}</div>
                      <div className="college-row-location">
                        📍 {c.location || c.city || '—'}
                        {c.city && c.location && c.location !== c.city ? `, ${c.city}` : ''}
                      </div>
                    </td>
                    <td>
                      <span className="college-row-code">{c.college_code}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {c.affiliation || '—'}
                    </td>
                    <td>
                      {c.description ? (
                        <span className="badge badge-green">Complete</span>
                      ) : (
                        <span className="badge badge-yellow">Basic</span>
                      )}
                    </td>
                    <td>
                      <div className="college-row-actions">
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Edit"
                          onClick={() => openEdit(c.college_code)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Delete"
                          onClick={() => setDeleteTarget(c)}
                          style={{ color: 'var(--red)' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <CollegeFormModal
          editCode={editCode}
          onClose={() => { setShowForm(false); setEditCode(null); }}
          onSaved={loadColleges}
          addToast={addToast}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteModal
          college={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Root App
   ═══════════════════════════════════════════════ */
export default function App() {
  const [authenticated, setAuthenticated] = useState(() => isLoggedIn());

  const handleLogin = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    clearAdminPassword();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

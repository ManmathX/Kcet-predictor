const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function getAdminPassword() {
  return localStorage.getItem('admin_password') || '';
}

export function setAdminPassword(password) {
  localStorage.setItem('admin_password', password);
}

export function clearAdminPassword() {
  localStorage.removeItem('admin_password');
}

export function isLoggedIn() {
  return !!localStorage.getItem('admin_password');
}

export async function verifyPassword(password) {
  const res = await fetch(`${API_BASE}/colleges/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

export async function fetchColleges(search = '') {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  const res = await fetch(`${API_BASE}/colleges?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch colleges');
  return res.json();
}

export async function fetchCollege(code) {
  const res = await fetch(`${API_BASE}/colleges/${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error('Failed to fetch college');
  return res.json();
}

export async function createCollege(data) {
  const res = await fetch(`${API_BASE}/colleges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': getAdminPassword(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create college');
  }
  return res.json();
}

export async function updateCollege(code, data) {
  const res = await fetch(`${API_BASE}/colleges/${encodeURIComponent(code)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': getAdminPassword(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update college');
  }
  return res.json();
}

export async function deleteCollege(code) {
  const res = await fetch(`${API_BASE}/colleges/${encodeURIComponent(code)}`, {
    method: 'DELETE',
    headers: {
      'x-admin-password': getAdminPassword(),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete college');
  }
  return res.json();
}

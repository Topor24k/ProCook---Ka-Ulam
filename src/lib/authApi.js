// Authentication API Functions
// Use these functions in LoginView.tsx and SignupView.tsx

const API_BASE = 'http://localhost:3001/api';

/**
 * Sign up a new user
 * @param {string} fullName - User's full name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} New user data with _id
 */
export async function signup(fullName, email, password) {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password })
  });
  
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Signup failed');
  
  return json.data;
}

/**
 * Log in a user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data with _id, email, fullName, profile
 */
export async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Login failed');
  
  return json.data;
}

/**
 * Get user profile
 * @param {string} userId - MongoDB user ID
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(userId) {
  const response = await fetch(`${API_BASE}/auth/user/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch profile');
  
  const json = await response.json();
  return json.data;
}

/**
 * Update user profile
 * @param {string} userId - MongoDB user ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated user data
 */
export async function updateProfile(userId, profileData) {
  const response = await fetch(`${API_BASE}/auth/user/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Update failed');
  
  return json.data;
}

/**
 * Save auth token to localStorage
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} fullName - User full name
 */
export function saveAuthToken(userId, email, fullName) {
  localStorage.setItem('authUser', JSON.stringify({
    _id: userId,
    email,
    fullName,
    loginTime: new Date().toISOString()
  }));
}

/**
 * Get auth token from localStorage
 * @returns {Object|null} User data or null
 */
export function getAuthToken() {
  const auth = localStorage.getItem('authUser');
  return auth ? JSON.parse(auth) : null;
}

/**
 * Clear auth token
 */
export function clearAuthToken() {
  localStorage.removeItem('authUser');
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  return getAuthToken() !== null;
}

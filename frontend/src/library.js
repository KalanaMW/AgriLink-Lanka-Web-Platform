// Static site image mapping. Put files under the backend `library/` folder.
// They will be served at `${API_BASE}/assets/...`.

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const LIB = {
  logo: `${API_BASE}/assets/logo.png`,
  hero: `${API_BASE}/assets/hero.jpg`,
  footerBadge: `${API_BASE}/assets/footer-badge.png`,
  // Add more as needed:
  // aboutBanner: `${API_BASE}/assets/about/banner.jpg`,
};

export default LIB;



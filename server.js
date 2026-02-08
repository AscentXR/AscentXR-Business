// Ascent XR Unified Server
// Loads backend/server.js and starts listening
require('dotenv').config({ path: require('path').join(__dirname, 'backend', '.env') });
const app = require('./backend/server');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Ascent XR running on http://localhost:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard_v19.html`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
});

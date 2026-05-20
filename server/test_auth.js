async function testAuth() {
  try {
    // 1. Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
    });
    console.log("Login success:", loginRes.status);
    
    // Get cookies
    const cookies = loginRes.headers.getSetCookie();
    console.log("Cookies:", cookies);
    
    let refreshToken = '';
    if (cookies) {
      const refreshCookie = cookies.find(c => c.startsWith('refreshToken='));
      if (refreshCookie) {
        refreshToken = refreshCookie.split(';')[0];
      }
    }
    
    // 2. Request /me with ONLY refresh token (simulate expired access token)
    console.log("Requesting /me with", refreshToken);
    const meRes = await fetch('http://localhost:5000/api/auth/me', {
      headers: {
        Cookie: refreshToken
      }
    });
    
    console.log("Me success:", meRes.status);
    const data = await meRes.json();
    console.log("Me data:", data);
    console.log("Me set-cookie:", meRes.headers.getSetCookie());
  } catch (err) {
    console.error("Error:", err);
  }
}

async function run() {
  try {
    await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'password123' })
    });
  } catch (e) {} // ignore if exists
  await testAuth();
}

run();

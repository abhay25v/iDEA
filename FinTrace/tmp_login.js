(async ()=>{
  try{
    const { execSync } = require('child_process');
    try { console.log(execSync('netstat -ano | findstr :5000').toString()); } catch(e) { console.log('netstat check failed or empty'); }

    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fintrace.io', password: 'AdminPass123!' })
    });

    console.log('STATUS', res.status);
    const text = await res.text();
    console.log('BODY:', text);
  } catch (err) {
    console.error('ERR', err.message || err);
  }
})();

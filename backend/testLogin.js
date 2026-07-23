import axios from 'axios';

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@arturee.com',
      password: 'admin'
    });
    console.log("Login response:", res.data);
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
  }
}

testLogin();

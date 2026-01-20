import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const run = async () => {
    try {
        // 1. Login as Admin (assuming user with this email exists and is admin)
        // You might need to adjust email/password if they are different
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@zain.com',
            password: '123456'
        });

        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        // 2. Fetch Stats
        console.log('Fetching Admin Stats...');
        const statsRes = await axios.get(`${API_URL}/orders/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Admin Stats Response:');
        console.log(JSON.stringify(statsRes.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

run();

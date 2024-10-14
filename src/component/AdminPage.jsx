import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // นำเข้า useAuth จาก AuthContext

function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // ใช้ฟังก์ชัน login จาก Context
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === 'Admin' && password === '1234') {
      // Login ด้วยข้อมูล admin
      login({ username, isAdmin: true });
      navigate('/admindashboard'); // เปลี่ยนไปที่หน้า admin dashboard
    } else {
      // ตั้งค่าข้อความ error ถ้ารหัสผ่านหรือ username ไม่ถูกต้อง
      setError('Incorrect username or password');
    }
  };

  return (
    <div className="bg-gradient-to-b from-green-500 to-white h-screen">
      <div className='flex justify-center text-center'>
        <h1 className='bg-green-400  p-5 w-1/2'>Admin Page</h1>
      </div>
      <div className='text-center flex justify-center h-full'>
        <div className='mt-0 p-20 w-1/2 bg-green-200'>
          <form onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="username">Username:</label>
              <input
                className='border-2 ml-2 p-1'
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <br />
            <div>
              <label htmlFor="password">Password:</label>
              <input
                className='border-2 ml-2 p-1'
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <br />
            <button
              className='bg-blue-500 hover:bg-blue-700 text-white rounded px-4 py-2'
              type="button"
              onClick={handleLogin}
            >
              Login
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;

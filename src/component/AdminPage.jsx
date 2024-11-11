import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // นำเข้า useAuth จาก AuthContext

function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth(); // ใช้ฟังก์ชัน login จาก Context
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === "Admin" && password === "1234") {
      // Login ด้วยข้อมูล admin
      login({ username, isAdmin: true });
      navigate("/admindashboard"); // เปลี่ยนไปที่หน้า admin dashboard
    } else {
      // ตั้งค่าข้อความ error ถ้ารหัสผ่านหรือ username ไม่ถูกต้อง
      setError("Incorrect username or password");
    }
  };

  return (
    <div class="bg-gradient-to-b from-green-500 to-white min-h-screen p-10">
      <div className="flex justify-center text-center mb-8">
        <h1 className="bg-green-400 p-6 w-3/5 rounded-lg shadow-lg text-3xl font-bold">
          Admin
        </h1>
      </div>
      <div className="text-center flex justify-center h-full">
        <div className="mt-0 p-10 w-3/5 bg-white rounded-lg shadow-lg">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-6">
              <label
                htmlFor="username"
                className="block text-left text-gray-700 font-semibold mb-1"
              >
                Username:
              </label>
              <input
                className="border-2 border-gray-300 rounded w-full p-2 focus:border-green-500"
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-left text-gray-700 font-semibold mb-1"
              >
                Password:
              </label>
              <input
                className="border-2 border-gray-300 rounded w-full p-2 focus:border-green-500"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold rounded w-full py-2 mt-4"
              type="button"
              onClick={handleLogin}
            >
              Login
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;

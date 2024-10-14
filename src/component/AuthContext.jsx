import React, { createContext, useContext, useState, useEffect } from 'react'; // ตรวจสอบว่าไฟล์นี้อยู่ภายใต้บริบทฟังก์ชัน

const AuthContext = createContext(); // สร้าง Context

export const useAuth = () => {
  return useContext(AuthContext); // สร้าง Hook useAuth เพื่อใช้ Context
};

// ฟังก์ชัน AuthProvider ที่เป็น Context Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ตรวจสอบว่า useEffect ถูกเรียกภายในฟังก์ชันคอมโพเนนต์
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // คืนค่า provider ที่ส่ง user, login, logout ให้กับ children
  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

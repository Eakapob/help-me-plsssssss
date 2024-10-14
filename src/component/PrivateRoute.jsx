import { useAuth } from './AuthContext'; // นำเข้าจาก AuthContext
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // ถ้าผู้ใช้ไม่อยู่หรือไม่ใช่ admin จะถูกเปลี่ยนไปที่หน้า admin
    if (!user || !user.isAdmin) {
      navigate('/admin'); 
    }
  }, [user, navigate]);

  return user && user.isAdmin ? children : null; // render เฉพาะเมื่อเป็น admin
};

export default PrivateRoute;

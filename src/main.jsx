import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './component/AuthContext'; // นำเข้า AuthProvider
import Dashboard from './component/DashboardPage.jsx'
import AdminPage from './component/AdminPage.jsx'
import AdminDashboardPage from './component/AdminDashboardPage.jsx'
import InfoPage from './component/InfoPage.jsx'
import Info from './component/Info.jsx'
import PrivateRoute from './component/PrivateRoute'; // นำเข้า PrivateRoute
import CourseDetailsPage from "./component/CourseDetailsPage";
import CourseDetails from "./component/CourseDetails";
import PLOPage from "./component/PLOPage";
import PLO from "./component/PLO.jsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />
  },
  {
    path: "/admin",
    element: <AdminPage /> // หน้า Login
  },
  {
    path: "/admindashboard",
    element: (
      <PrivateRoute>
        <AdminDashboardPage />
      </PrivateRoute>
    ) // ตรวจสอบสิทธิ์ admin ก่อน
  },
  {
    path: "/info",
    element: (
      <PrivateRoute>
        <InfoPage />
      </PrivateRoute>
    ) // ตรวจสอบสิทธิ์ admin ก่อน
  },
  {
    path: "/infouser",
    element: <Info /> // ไม่ต้องตรวจสอบสิทธิ์
  },
  {
    path: "/course-details/:subjectCode", // เพิ่ม route สำหรับ CourseDetailsPage
    element: (
      <PrivateRoute>
        <CourseDetailsPage />
      </PrivateRoute>
    )
  },
  {
    path: "/course-detailsuser/:subjectCode",
    element: <CourseDetails /> // ไม่ต้องตรวจสอบสิทธิ์
  },
  {
    path: "/plos", // เส้นทางสำหรับหน้า PLO
    element: (
      <PrivateRoute>
        <PLOPage />
      </PrivateRoute>
    ) // ตรวจสอบสิทธิ์ก่อนเข้า PLOPage
  },
  {
    path: "/plosuser", // เส้นทางสำหรับหน้า PLO
    element: <PLO />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)

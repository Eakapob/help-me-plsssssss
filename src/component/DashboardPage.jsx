import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import classes from './AdminDashboardPage.module.css';

function DashboardPage() {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [levelEduData, setLevelEduData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [courseYearData, setCourseYearData] = useState([]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "faculty"));
        const facultyList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setFaculties(facultyList);
      } catch (error) {
        console.error("Error fetching faculties: ", error);
      }
    };
    fetchFaculties();
  }, []);

  const fetchLevelEduData = async (facultyId) => {
    try {
      const querySnapshot = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu`));
      const newLevelEduData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setLevelEduData(newLevelEduData);
    } catch (error) {
      console.error("Error fetching level education data: ", error);
    }
  };

  const fetchDepartmentData = async (facultyId, levelEduId) => {
    try {
      const querySnapshot = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department`));
      const newDepartmentData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setDepartmentData((prevData) => [...prevData, ...newDepartmentData.map(item => ({ ...item, LevelEduId: levelEduId }))]);
    } catch (error) {
      console.error("Error fetching department data: ", error);
    }
  };

  const fetchCourseYearData = async (facultyId, levelEduId, departmentId) => {
    try {
      const querySnapshot = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear`));
      const newCourseYearData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setCourseYearData((prevData) => [...prevData, ...newCourseYearData.map(item => ({ ...item, DepartmentId: departmentId }))]);
    } catch (error) {
      console.error("Error fetching course year data: ", error);
    }
  };

  useEffect(() => {
    if (selectedFaculty) {
      const fetchData = async () => {
        setLevelEduData([]);
        setDepartmentData([]);
        setCourseYearData([]);
        await fetchLevelEduData(selectedFaculty);
      };
      fetchData();
    }
  }, [selectedFaculty]);

  useEffect(() => {
    if (levelEduData.length > 0) {
      levelEduData.forEach(async (levelEdu) => {
        await fetchDepartmentData(selectedFaculty, levelEdu.id);
      });
    }
  }, [levelEduData]);

  useEffect(() => {
    if (departmentData.length > 0) {
      departmentData.forEach(async (department) => {
        await fetchCourseYearData(selectedFaculty, department.LevelEduId, department.id);
      });
    }
  }, [departmentData]);

  return (
    <div class="bg-gradient-to-b from-green-500 to-white h-screen">
      <div className='flex justify-center text-center'><h1 className='bg-green-400 p-5 w-1/2'>
        แพลทฟอร์มระบบสารสนเทศสำหรับรายละเอียดของหลักสูตร (มคอ.2) ตามเกณฑ์มาตรฐาน AUN-QA </h1>
        </div>
      <div className='text-center  flex justify-center h-full'>
        <div className='mt-0 w-1/2 bg-green-200 flex flex-row h-full'>
          {/* <div className="text-start border-black bg-white flex flex-col h-full items-center w-60 mt-0">
            <p>เข้าสู่ระบบAdmin<Link className='bg-blue-500 hover:bg-blue-700 rounded text-white' to="/admin">Login</Link></p>
          </div> */}
        <div className='flex flex-col items-center w-full'>
          <div className='mt-5'>
            <label htmlFor="facultySelect">เลือก คณะ: </label>
            <select
              id="facultySelect"
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
            >
              <option value="">Select a faculty</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.Faculty}
                </option>
              ))}
            </select>
          </div>
          <table className='w-5/6 mt-4'>
            <thead className='bg-slate-500 border-black border-gray-200 text-white'>
              <tr>
                <th className={classes.theader}>หลักสูตร</th>
                <th className={classes.theader}>หน่วยกิต</th>
                <th className={classes.theader}>ระยะเวลาศึกษา</th>
                <th className={classes.theader}>เกรดต่ำสุด</th>
              </tr>
            </thead>
            <tbody>
              {levelEduData.map((level) => (
                <React.Fragment key={level.id}>
                  <tr>
                    <td className='bg-slate-200 w-fit text-start' colSpan='4'>ระดับการศึกษา: {level.level}</td>
                  </tr>
                  {departmentData.filter(dept => dept.LevelEduId === level.id).map((department) => (
                    <React.Fragment key={department.id}>
                      <tr className='bg-yellow-200'>
                        <td className='text-start' colSpan='4'>ภาควิชา: {department.DepartName}</td>
                      </tr>
                      {courseYearData.filter(course => course.DepartmentId === department.id).map((courseYear) => (
                        <tr key={courseYear.id} className='text-blue-500 w-full gap-3 border border-white'>
                          <td className='bg-yellow-100'>
                            <Link className='text-blue-500 flex'
                              to={{
                                pathname: "/infouser",
                                search: `?faculty=${selectedFaculty}&levelEdu=${level.id}&department=${department.id}&courseYear=${courseYear.id}`
                              }}
                              onClick={() => console.log(`faculty=${selectedFaculty}&levelEdu=${level.id}&department=${department.id}&courseYear=${courseYear.id}`)}
                            >
                              {courseYear.CourseYear}
                            </Link></td>
                          <td className={classes.bdw}>{courseYear.Credits}</td>
                          <td className={classes.bdw}>{courseYear.StudyDuration}</td>
                          <td className={classes.bdw}>{courseYear.MinGrade}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
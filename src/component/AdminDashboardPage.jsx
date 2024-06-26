import React, { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, QuerySnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { Link } from 'react-router-dom';

function AdminDashboardPage() {
  const [Faculty, setFaculty] = useState("");
  const [show, setShow] = useState([]);
  const [LevelEdu, setLevelEdu] = useState("");
  const [showLevelEdu, setShowLevelEdu] = useState([]);
  const [Department, setDepartment] = useState("");
  const [showDepartment, setShowDepartment] = useState([]);
  const [CourseYear, setCourseYear] = useState([]);
  const [showCourseYear, setShowCourseYear] = useState([]);
  const [isAddingCourseYear, setIsAddingCourseYear] = useState({});
  const [isAddingDepartment, setIsAddingDepartment] = useState({});
  const [isAddingLevel, setIsAddingLevel] = useState(false);

  const AddData = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "faculty"), { Faculty: Faculty })
      console.log("Doc written with ID: ", docRef.id);
    } catch (e) {
      console.error("error adding data: ", e);
    }
  }

  const handleAddCourseYear = async (departmentId) => {
    try {
      const courseYearValue = CourseYear[departmentId];
      if (!courseYearValue) {
        console.error('CourseYear is empty');
        return;
      }
      console.log('CourseYear value:', courseYearValue); // Logging CourseYear value

      const docRef = await addDoc(
        collection(db, `/faculty/${Faculty}/LevelEdu/${LevelEdu}/Department/${departmentId}/CourseYear`),
        { CourseYear: courseYearValue }
      );
      console.log('Course year added with ID: ', docRef.id);
      setShowCourseYear((prevData) => [
        ...prevData,
        { id: docRef.id, CourseYear: courseYearValue, YearsCourseId: departmentId },
      ]);
      setCourseYear((prevData) => ({ ...prevData, [departmentId]: '' }));
      setIsAddingCourseYear((prevData) => ({ ...prevData, [departmentId]: false }));
    } catch (error) {
      console.error('Error adding course year: ', error);
    }
  };


  const handleAddDepartment = async (levelId) => {
    try {
      const departmentValue = Department[levelId];
      if (!departmentValue) {
        console.error('Department is empty');
        return;
      }

      const docRef = await addDoc(
        collection(db, `/faculty/${Faculty}/LevelEdu/${levelId}/Department`),
        { DepartName: departmentValue }
      );
      console.log('Department added with ID: ', docRef.id);
      setShowDepartment((prevData) => [
        ...prevData,
        { id: docRef.id, DepartName: departmentValue, LevelEduId: levelId },
      ]);
      setDepartment((prevData) => ({ ...prevData, [levelId]: '' }));
      setIsAddingDepartment((prevData) => ({ ...prevData, [levelId]: false }));
    } catch (error) {
      console.error('Error adding department: ', error);
    }
  };

  const handleAddLevel = async () => {
    try {
      if (!LevelEdu) {
        console.error('Level is empty');
        return;
      }
      const docRef = await addDoc(
        collection(db, `/faculty/${Faculty}/LevelEdu`),
        { level: LevelEdu }
      );
      console.log('Level added with ID: ', docRef.id);
      setShowLevelEdu((prevData) => [
        ...prevData,
        { id: docRef.id, level: LevelEdu },
      ]);
      setLevelEdu(''); // Clear the input field
      setIsAddingLevel(false); // Hide the input field
    } catch (error) {
      console.error('Error adding level: ', error);
    }
  };

  const fetchPost = async () => {
    await getDocs(collection(db, "faculty"))
      .then((querySnapshot) => {
        const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        setShow(newData);
        console.log("fetchPost", show, newData)
      })
  }

  const fetchPostEdu = async (facultyId) => {
    const querySnapshot = await getDocs(collection(db, `/faculty/${facultyId}/LevelEdu`));
    const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setShowLevelEdu(newData);
    setLevelEdu(newData[0]?.id || "");
    console.log("fetchPostEdu:", showLevelEdu, newData);
    await fetchPostDepart(facultyId, newData);
  }

  const fetchPostDepart = async (facultyId, showLevelEdu) => {
    try {
      for (const level of showLevelEdu) {
        const levelEduId = level.id;
        const querySnapshot = await getDocs(collection(db, `/faculty/${facultyId}/LevelEdu/${levelEduId}/Department`));
        const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setShowDepartment((prevData) => [...prevData, ...newData.map(item => ({ ...item, LevelEduId: levelEduId }))]);
        // console.log("fetchPostDepart:", levelEduId, newData);
        await fetchPostCourseYear(facultyId, levelEduId, newData);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchPostCourseYear = async (facultyId, levelEduId, showCourseYear) => {
    try {
      for (const year of showCourseYear) {
        const yearsCourseId = year.id;
        const querySnapshot = await getDocs(collection(db, `/faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${yearsCourseId}/CourseYear`));
        const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setShowCourseYear((prevData) => [...prevData, ...newData.map(item => ({ ...item, YearsCourseId: yearsCourseId }))]);
        //console.log("fetchCourseYearID:", newData);
      }
    } catch (error) {
      console.error("Error fetching CourseYear:", error);
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);


  return (
    <>
      <div className='flex justify-center text-center'><h1 className='bg-green-400 text-white p-5 w-1/2'>Admin Dashboard</h1></div>
      <div className='text-center border-2 flex justify-center h-full'>
        <div className='p-20 w-1/2 bg-green-200 flex h-full'>
          <div className='text-start mr-2px border-2 bg-white flex flex-col'>
            <button className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full' onClick={() => window.history.back()}>ย้อนกลับ</button>
            <button className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full' onClick={() => {
              //Implement logout logic here
              console.log("Logout button clicked");
            }}>ออกจากระบบ</button>
          </div>
          <div className='border-2 bg-white'>
            <div>
              <h2 className='border-2'>เพิ่มข้อมูลไปยัง Firebase:</h2>
              <input className='border-2' type="text" placeholder='Add' onChange={(e) => setFaculty(e.target.value)} />
              <button className='bg-black text-white' type='submit' onClick={AddData}>Add</button>
            </div>
            <div className='Dropdown'>
              <select value={Faculty} onChange={(e) => {
                setFaculty(e.target.value)
                fetchPostEdu(e.target.value)
              }}>
                <option value="">Select Faculty</option>
                {show?.map((data) => (
                  <option key={data.id} value={data.id}>{data.add}</option>
                ))}
              </select>
            </div>
            <div>
              <table className='w-full'>
                <thead className='bg-slate-500 border-b-2 border-gray-200 text-white'>
                  <tr>
                    <th className='p-3 text-sm tracking-normal'>หลักสูตร</th>
                    <th className='p-3 text-sm tracking-normal'>หน่วยกิต</th>
                    <th className='p-3 text-sm tracking-normal'>ระยะเวลาศึกษา</th>
                    <th className='p-3 text-sm tracking-normal'>เกรดต่ำสุด</th>
                  </tr>
                </thead>
                <tbody>
                  {showLevelEdu?.map((level, index) => (
                    <tr key={index}>
                      <tr className=''>ระดับการศึกษา: {level.level}</tr>
                      <tr>
                        {showDepartment?.map((department, deptIndex) => (
                          level.id === department.LevelEduId && (
                            <div key={deptIndex} className='year'>
                              ภาควิชา: {department.DepartName}
                              <tr>
                                {showCourseYear?.map((courseyear, cyIndex) => (
                                  department.id === courseyear.YearsCourseId && (
                                    <div key={cyIndex} className='text-blue-500'>
                                      <Link
                                        to={{
                                          pathname: "/info",
                                          search: `?faculty=${Faculty}&levelEdu=${level.id}&department=${department.id}&courseYear=${courseyear.id}`
                                        }}
                                      >
                                        หลักสูตรปี: {courseyear.CourseYear}
                                      </Link>
                                    </div>
                                  )
                                ))}
                                <p style={{ display: 'inline' }}>Add CourseYear</p>
                                <button
                                  className='bg-blue-500 hover:bg-blue-700'
                                  style={{ display: 'inline' }}
                                  onClick={() =>
                                    setIsAddingCourseYear((prevData) => ({ ...prevData, [department.id]: true }))
                                  }
                                >
                                  +
                                </button>
                                {isAddingCourseYear[department.id] && (
                                  <div>
                                    <input
                                      type='text'
                                      placeholder='Add CourseYear'
                                      value={CourseYear[department.id] || ''}
                                      onChange={(e) =>
                                        setCourseYear((prevData) => ({
                                          ...prevData,
                                          [department.id]: e.target.value,
                                        }))
                                      }
                                    />
                                    <button className='bg-blue-500 hover:bg-blue-700' onClick={() => handleAddCourseYear(department.id)}>Save</button>
                                  </div>
                                )}
                              </tr>
                            </div>
                          )
                        ))}
                        <p style={{ display: 'inline' }}>Add Department</p>
                        <button
                          className='bg-blue-500 hover:bg-blue-700'
                          style={{ display: 'inline' }}
                          onClick={() =>
                            setIsAddingDepartment((prevData) => ({ ...prevData, [level.id]: true }))
                          }
                        >
                          +
                        </button>
                        {isAddingDepartment[level.id] && (
                          <div>
                            <input
                              type='text'
                              placeholder='Add Department'
                              value={Department[level.id] || ''}
                              onChange={(e) =>
                                setDepartment((prevData) => ({
                                  ...prevData,
                                  [level.id]: e.target.value,
                                }))
                              }
                            />
                            <button className='bg-blue-500 hover:bg-blue-700' onClick={() => handleAddDepartment(level.id)}>Save</button>
                          </div>
                        )}
                      </tr>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="4">
                      <p style={{ display: 'inline' }}>Add Level</p>
                      <button className='bg-blue-500 hover:bg-blue-700' style={{ display: 'inline' }} onClick={() => setIsAddingLevel(true)}>+</button>
                      {isAddingLevel && (
                        <div>
                          <input
                            type='text'
                            placeholder='Add Level'
                            value={LevelEdu}
                            onChange={(e) => setLevelEdu(e.target.value)}
                          />
                          <button className='bg-blue-500 hover:bg-blue-700' onClick={handleAddLevel}>Save</button>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboardPage;
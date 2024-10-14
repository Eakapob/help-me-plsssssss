import React, { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'
import { Link } from 'react-router-dom';
import classes from './AdminDashboardPage.module.css'
import { useAuth } from './AuthContext';

function AdminDashboardPage() {
  const [Faculty, setFaculty] = useState("");
  const [show, setShow] = useState([]);

  const [LevelEdu, setLevelEdu] = useState("");
  const [showLevelEdu, setShowLevelEdu] = useState([]);

  const [Department, setDepartment] = useState("");
  const [showDepartment, setShowDepartment] = useState([]);

  const [CourseYear, setCourseYear] = useState([]);
  const [Credits, setCredits] = useState([]);
  const [StudyDuration, setStudyDuration] = useState([]);
  const [MinGrade, setMinGrade] = useState([]);

  const [showCourseYear, setShowCourseYear] = useState([]);
  const [isAddingCourseYear, setIsAddingCourseYear] = useState({});
  const [isAddingDepartment, setIsAddingDepartment] = useState({});
  const [isAddingLevel, setIsAddingLevel] = useState(false);

  const { logout } = useAuth();

  const AddData = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "faculty"), { Faculty: Faculty })
      console.log("Doc written with ID: ", docRef.id);
    } catch (e) {
      console.error("error adding data: ", e);
    }
  }

  const handleAddCourseYear = async (departmentId, LevelEdu) => {
    try {
      const courseYearValue = CourseYear[departmentId];
      const creditsValue = Credits[departmentId];
      const studyDurationValue = StudyDuration[departmentId];
      const minGradeValue = MinGrade[departmentId];

      if (!courseYearValue || !creditsValue || !studyDurationValue || !minGradeValue) {
        console.error('All fields are required');
        return;
      }

      if (!LevelEdu) {
        console.error('LevelEdu is empty');
        return;
      }

      const docRef = await addDoc(
        collection(db, `/faculty/${Faculty}/LevelEdu/${LevelEdu}/Department/${departmentId}/CourseYear`),
        { CourseYear: courseYearValue, Credits: creditsValue, StudyDuration: studyDurationValue, MinGrade: minGradeValue }
      );
      console.log('Course year added with ID: ', LevelEdu, ' ', departmentId, ' ', docRef.id);

      setShowCourseYear((prevData) => [
        ...prevData,
        { id: docRef.id, CourseYear: courseYearValue, Credits: creditsValue, StudyDuration: studyDurationValue, MinGrade: minGradeValue, YearsCourseId: departmentId },
      ]);

      setCourseYear((prevData) => ({ ...prevData, [departmentId]: '' }));
      setCredits((prevData) => ({ ...prevData, [departmentId]: '' }));
      setStudyDuration((prevData) => ({ ...prevData, [departmentId]: '' }));
      setMinGrade((prevData) => ({ ...prevData, [departmentId]: '' }));
      setIsAddingCourseYear((prevData) => ({ ...prevData, [departmentId]: false }));
    } catch (error) {
      console.error('Error adding course year: ', error);
    }
  };

  const handleEditCourseYear = async (courseYearId, departmentId) => {
    try {
      const courseYearValue = CourseYear[departmentId];
      const creditsValue = Credits[departmentId];
      const studyDurationValue = StudyDuration[departmentId];
      const minGradeValue = MinGrade[departmentId];

      if (!courseYearValue || !creditsValue || !studyDurationValue || !minGradeValue) {
        console.error('All fields are required');
        return;
      }

      const docRef = doc(db, `/faculty/${Faculty}/LevelEdu/${LevelEdu}/Department/${departmentId}/CourseYear/${courseYearId}`);
      await updateDoc(docRef, {
        CourseYear: courseYearValue,
        Credits: creditsValue,
        StudyDuration: studyDurationValue,
        MinGrade: minGradeValue,
      });

      setShowCourseYear((prevData) =>
        prevData.map((item) =>
          item.id === courseYearId
            ? { ...item, CourseYear: courseYearValue, Credits: creditsValue, StudyDuration: studyDurationValue, MinGrade: minGradeValue }
            : item
        )
      );
      setIsAddingCourseYear((prevData) => ({ ...prevData, [departmentId]: false }));
    } catch (error) {
      console.error('Error editing course year: ', error);
    }
  };

  const handleDeleteCourseYear = async (courseYearId, departmentId) => {
    try {
      const docRef = doc(db, `/faculty/${Faculty}/LevelEdu/${LevelEdu}/Department/${departmentId}/CourseYear/${courseYearId}`);
      await deleteDoc(docRef);

      setShowCourseYear((prevData) => prevData.filter((item) => item.id !== courseYearId));
    } catch (error) {
      console.error('Error deleting course year: ', error);
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
        // console.log("fetchPost", show, newData)
      })
  }

  const fetchPostEdu = async (facultyId) => {
    const querySnapshot = await getDocs(collection(db, `/faculty/${facultyId}/LevelEdu`));
    const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setShowLevelEdu(newData);
    setLevelEdu(newData[0]?.id || "");
    // console.log("fetchPostEdu:", showLevelEdu, newData);
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
      <div className='min-h-screen bg-gradient-to-b from-green-500 to-white h-screen"'>
        <div className='flex justify-center text-center'><h1 className='bg-green-400 p-5 w-1/2'>Admin Dashboard</h1></div>
        <div className='flex justify-center'>
          <div className='flex text-center w-1/2 border border-black'>
            <div className='text-start border-black bg-white flex flex-col h-full items-center w-60'>
              <button className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full' onClick={() => window.history.back()}>ย้อนกลับ</button>
              <button
                className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full'
                onClick={() => {
                  logout(); // เรียกใช้ logout เมื่อคลิกปุ่ม
                  console.log("Logout button clicked");
                }}
              >
                ออกจากระบบ
              </button>
            </div>
            <div className='border-2 bg-white w-full'>
              <div>
                เพิ่มคณะ 
                <input className='border border-black mb-1 ml-1' type="text" placeholder='Add' onChange={(e) => setFaculty(e.target.value)}/>
                <button className='bg-black text-white' type='submit' onClick={AddData}>Add</button>
              </div>
              <div className=''>
                <select className='border border-black' value={Faculty} onChange={(e) => {
                  setFaculty(e.target.value)
                  fetchPostEdu(e.target.value)
                }}>
                  <option value="">Select Faculty</option>
                  {show?.map((data) => (
                    <option key={data.id} value={data.id}>{data.Faculty}</option>
                  ))}
                </select>
              </div>
              <div>
                <table className='w-full'>
                  <thead className='bg-slate-500 border-black border-gray-200 text-white'>
                    <tr>
                      <th className={classes.theader}>หลักสูตร</th>
                      <th className={classes.theader}>หน่วยกิต</th>
                      <th className={classes.theader}>ระยะเวลาศึกษา</th>
                      <th className={classes.theader}>เกรดต่ำสุด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showLevelEdu?.map((level, index) => (
                      <React.Fragment key={level.id}>
                        <tr key={index}>
                          <td className='bg-slate-200 w-fit text-start' colSpan='4'>ระดับการศึกษา: {level.level}</td>
                        </tr>
                        {showDepartment?.map((department, deptIndex) => (
                          level.id === department.LevelEduId && (
                            <React.Fragment key={department.id}>
                              <tr className='bg-yellow-200' key={deptIndex}>
                                <td className='text-start' colSpan='4'>ภาควิชา: {department.DepartName}</td>
                              </tr>
                              {showCourseYear?.map((courseyear, cyIndex) => (
                                department.id === courseyear.YearsCourseId && (
                                  <>
                                    <tr key={cyIndex} className='w-full gap-3 border border-white' colSpan='5'>
                                      <td className='bg-yellow-100'>
                                        <Link className='text-blue-500 flex'
                                          to={{
                                            pathname: "/info",
                                            search: `?faculty=${Faculty}&levelEdu=${level.id}&department=${department.id}&courseYear=${courseyear.id}`
                                          }}
                                          // onClick={() => console.log("pathlink check",`faculty=${Faculty}&levelEdu=${level.id}&department=${department.id}&courseYear=${courseyear.id}`)}
                                        >
                                          {courseyear.CourseYear}
                                        </Link>
                                      </td>
                                      <td className={classes.bdw}>{courseyear.Credits}</td>
                                      <td className={classes.bdw}>{courseyear.StudyDuration}</td>
                                      <td className={classes.bdw}>{courseyear.MinGrade}</td>
                                      <td><button className="text-rose-600 bg-white border-white" onClick={() => handleDeleteCourseYear(courseyear.id, department.id)}>Delete</button></td>
                                    </tr>
                                  </>
                                )
                              ))}
                              <tr>
                                <td colSpan="4">
                                  <span style={{ display: 'inline' }}>Add CourseYear</span>
                                  <button
                                className='bg-blue-500 hover:bg-blue-700'
                                style={{ display: 'inline' }}
                                onClick={() => {
                                  console.log(level.id)
                                  setIsAddingCourseYear(prevData => ({
                                    ...prevData,
                                    [department.id]: true
                                  }))
                                }}
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
                                  <input
                                    type='text'
                                    placeholder='Add Credits'
                                    value={Credits[department.id] || ''}
                                    onChange={(e) =>
                                      setCredits((prevData) => ({
                                        ...prevData,
                                        [department.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <input
                                    type='text'
                                    placeholder='Add Study Duration'
                                    value={StudyDuration[department.id] || ''}
                                    onChange={(e) =>
                                      setStudyDuration((prevData) => ({
                                        ...prevData,
                                        [department.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <input
                                    type='text'
                                    placeholder='Add Min Grade'
                                    value={MinGrade[department.id] || ''}
                                    onChange={(e) =>
                                      setMinGrade((prevData) => ({
                                        ...prevData,
                                        [department.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <button className='bg-blue-500 hover:bg-blue-700' onClick={() => { console.log(LevelEdu); handleAddCourseYear(department.id, level.id) }}>Save</button>
                                </div>
                              )}
                                </td>
                              </tr>
                            </React.Fragment>
                          )
                        ))}
                        <tr>
                          <td colSpan="4">
                            <span style={{ display: 'inline' }}>Add Department</span>
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
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                    <tr>
                      <td colSpan="4">
                        <span style={{ display: 'inline' }}>Add Level</span>
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
      </div>
    </>
  );
}

export default AdminDashboardPage;
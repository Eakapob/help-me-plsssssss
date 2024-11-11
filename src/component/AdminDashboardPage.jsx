import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import classes from "./AdminDashboardPage.module.css";
import { useAuth } from "./AuthContext";

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
      const docRef = await addDoc(collection(db, "faculty"), {
        Faculty: Faculty,
      });
      console.log("Doc written with ID: ", docRef.id);
    } catch (e) {
      console.error("error adding data: ", e);
    }
  };

  const handleAddCourseYear = async (departmentId, LevelEdu) => {
    try {
      const courseYearValue = CourseYear[departmentId];
      const creditsValue = Credits[departmentId];
      const studyDurationValue = StudyDuration[departmentId];
      const minGradeValue = MinGrade[departmentId];

      if (
        !courseYearValue ||
        !creditsValue ||
        !studyDurationValue ||
        !minGradeValue
      ) {
        console.error("All fields are required");
        return;
      }

      if (!LevelEdu) {
        console.error("LevelEdu is empty");
        return;
      }

      const docRef = await addDoc(
        collection(
          db,
          `/faculty/${Faculty}/LevelEdu/${LevelEdu}/Department/${departmentId}/CourseYear`
        ),
        {
          CourseYear: courseYearValue,
          Credits: creditsValue,
          StudyDuration: studyDurationValue,
          MinGrade: minGradeValue,
        }
      );
      console.log(
        "Course year added with ID: ",
        LevelEdu,
        " ",
        departmentId,
        " ",
        docRef.id
      );

      setShowCourseYear((prevData) => [
        ...prevData,
        {
          id: docRef.id,
          CourseYear: courseYearValue,
          Credits: creditsValue,
          StudyDuration: studyDurationValue,
          MinGrade: minGradeValue,
          YearsCourseId: departmentId,
        },
      ]);

      setCourseYear((prevData) => ({ ...prevData, [departmentId]: "" }));
      setCredits((prevData) => ({ ...prevData, [departmentId]: "" }));
      setStudyDuration((prevData) => ({ ...prevData, [departmentId]: "" }));
      setMinGrade((prevData) => ({ ...prevData, [departmentId]: "" }));
      setIsAddingCourseYear((prevData) => ({
        ...prevData,
        [departmentId]: false,
      }));
    } catch (error) {
      console.error("Error adding course year: ", error);
    }
  };

  const handleEditCourseYear = async (courseYearId, departmentId) => {
    try {
      const courseYearValue = CourseYear[departmentId];
      const creditsValue = Credits[departmentId];
      const studyDurationValue = StudyDuration[departmentId];
      const minGradeValue = MinGrade[departmentId];

      if (
        !courseYearValue ||
        !creditsValue ||
        !studyDurationValue ||
        !minGradeValue
      ) {
        console.error("All fields are required");
        return;
      }

      const docRef = doc(
        db,
        `/faculty/${Faculty}/LevelEdu/${LevelEdu}/Department/${departmentId}/CourseYear/${courseYearId}`
      );
      await updateDoc(docRef, {
        CourseYear: courseYearValue,
        Credits: creditsValue,
        StudyDuration: studyDurationValue,
        MinGrade: minGradeValue,
      });

      setShowCourseYear((prevData) =>
        prevData.map((item) =>
          item.id === courseYearId
            ? {
                ...item,
                CourseYear: courseYearValue,
                Credits: creditsValue,
                StudyDuration: studyDurationValue,
                MinGrade: minGradeValue,
              }
            : item
        )
      );
      setIsAddingCourseYear((prevData) => ({
        ...prevData,
        [departmentId]: false,
      }));
    } catch (error) {
      console.error("Error editing course year: ", error);
    }
  };

  const handleDeleteCourseYear = async (courseYearId, departmentId) => {
    try {
      const docRef = doc(
        db,
        `/faculty/${Faculty}/LevelEdu/${LevelEdu}/Department/${departmentId}/CourseYear/${courseYearId}`
      );
      await deleteDoc(docRef);

      setShowCourseYear((prevData) =>
        prevData.filter((item) => item.id !== courseYearId)
      );
    } catch (error) {
      console.error("Error deleting course year: ", error);
    }
  };

  const handleAddDepartment = async (levelId) => {
    try {
      const departmentValue = Department[levelId];
      if (!departmentValue) {
        console.error("Department is empty");
        return;
      }

      const docRef = await addDoc(
        collection(db, `/faculty/${Faculty}/LevelEdu/${levelId}/Department`),
        { DepartName: departmentValue }
      );
      console.log("Department added with ID: ", docRef.id);
      setShowDepartment((prevData) => [
        ...prevData,
        { id: docRef.id, DepartName: departmentValue, LevelEduId: levelId },
      ]);
      setDepartment((prevData) => ({ ...prevData, [levelId]: "" }));
      setIsAddingDepartment((prevData) => ({ ...prevData, [levelId]: false }));
    } catch (error) {
      console.error("Error adding department: ", error);
    }
  };

  const handleAddLevel = async () => {
    try {
      if (!LevelEdu) {
        console.error("Level is empty");
        return;
      }
      const docRef = await addDoc(
        collection(db, `/faculty/${Faculty}/LevelEdu`),
        { level: LevelEdu }
      );
      console.log("Level added with ID: ", docRef.id);
      setShowLevelEdu((prevData) => [
        ...prevData,
        { id: docRef.id, level: LevelEdu },
      ]);
      setLevelEdu(""); // Clear the input field
      setIsAddingLevel(false); // Hide the input field
    } catch (error) {
      console.error("Error adding level: ", error);
    }
  };

  const fetchPost = async () => {
    await getDocs(collection(db, "faculty")).then((querySnapshot) => {
      const newData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setShow(newData);
      // console.log("fetchPost", show, newData)
    });
  };

  const fetchPostEdu = async (facultyId) => {
    const querySnapshot = await getDocs(
      collection(db, `/faculty/${facultyId}/LevelEdu`)
    );
    const newData = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setShowLevelEdu(newData);
    setLevelEdu(newData[0]?.id || "");
    // console.log("fetchPostEdu:", showLevelEdu, newData);
    await fetchPostDepart(facultyId, newData);
  };

  const fetchPostDepart = async (facultyId, showLevelEdu) => {
    try {
      for (const level of showLevelEdu) {
        const levelEduId = level.id;
        const querySnapshot = await getDocs(
          collection(
            db,
            `/faculty/${facultyId}/LevelEdu/${levelEduId}/Department`
          )
        );
        const newData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setShowDepartment((prevData) => [
          ...prevData,
          ...newData.map((item) => ({ ...item, LevelEduId: levelEduId })),
        ]);
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
        const querySnapshot = await getDocs(
          collection(
            db,
            `/faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${yearsCourseId}/CourseYear`
          )
        );
        const newData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setShowCourseYear((prevData) => [
          ...prevData,
          ...newData.map((item) => ({ ...item, YearsCourseId: yearsCourseId })),
        ]);
        //console.log("fetchCourseYearID:", newData);
      }
    } catch (error) {
      console.error("Error fetching CourseYear:", error);
    }
  };

  const handleDeleteLevelEdu = async (levelEduId) => {
    try {
      const docRef = doc(db, `/faculty/${Faculty}/LevelEdu/${levelEduId}`);
      await deleteDoc(docRef);
      setShowLevelEdu((prevData) => prevData.filter((item) => item.id !== levelEduId));
    } catch (error) {
      console.error("Error deleting level education:", error);
    }
  };
  
  const handleEditLevelEdu = async (levelEduId, levelValue) => {
    try {
      const newLevel = prompt("Edit Level Education:", levelValue);
      if (newLevel) {
        const docRef = doc(db, `/faculty/${Faculty}/LevelEdu/${levelEduId}`);
        await updateDoc(docRef, { level: newLevel });
        setShowLevelEdu((prevData) =>
          prevData.map((item) =>
            item.id === levelEduId ? { ...item, level: newLevel } : item
          )
        );
      }
    } catch (error) {
      console.error("Error editing level education:", error);
    }
  };

  const handleDeleteDepartment = async (departmentId, levelEduId) => {
    try {
      const docRef = doc(db, `/faculty/${Faculty}/LevelEdu/${levelEduId}/Department/${departmentId}`);
      await deleteDoc(docRef);
      setShowDepartment((prevData) => prevData.filter((item) => item.id !== departmentId));
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };
  
  const handleEditDepartment = async (departmentId, departName) => {
    try {
      const newDepartName = prompt("Edit Department Name:", departName);
      if (newDepartName) {
        const docRef = doc(db, `/faculty/${Faculty}/LevelEdu/${LevelEdu}/Department/${departmentId}`);
        await updateDoc(docRef, { DepartName: newDepartName });
        setShowDepartment((prevData) =>
          prevData.map((item) =>
            item.id === departmentId ? { ...item, DepartName: newDepartName } : item
          )
        );
      }
    } catch (error) {
      console.error("Error editing department:", error);
    }
  };
  
  // Define the desired level order
  const levelOrder = {
    "ปริญญาตรี": 1,
    "ปริญญามหาบัณฑิต": 2,
    "ปริญญาดุษฎีบัณฑิต": 3,
  };

  // Sort showLevelEdu whenever it’s updated
  const sortedShowLevelEdu = [...showLevelEdu].sort(
    (a, b) => (levelOrder[a.level] || Infinity) - (levelOrder[b.level] || Infinity)
  );

  useEffect(() => {
    fetchPost();
  }, []);

  return (
    <>
      <div class="bg-gradient-to-b from-green-500 to-white min-h-screen p-10">
        <div className="flex justify-center text-center mb-8">
          <h1 className="bg-green-400 p-6 w-3/5 rounded-lg shadow-lg text-3xl font-bold">
            แพลทฟอร์มระบบสารสนเทศสำหรับรายละเอียดของหลักสูตร (มคอ.2) ตามเกณฑ์มาตรฐาน AUN-QA
          </h1>
        </div>
        <div className="flex justify-center">
          <div className="h-full w-3/5 bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="flex w-full">
              <div className="bg-gray-100 w-60 p-4 flex flex-col items-center space-y-4 border-r border-gray-300">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg w-full shadow transition duration-200"
                  onClick={() => window.history.back()}
                >
                  ย้อนกลับ
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg w-full shadow transition duration-200"
                  onClick={() => {
                    logout(); // เรียกใช้ logout เมื่อคลิกปุ่ม
                    console.log("Logout button clicked");
                  }}
                >
                  ออกจากระบบ
                </button>
              </div>
              <div className="border-2 bg-white w-full">
                <div>
                  เพิ่มคณะ
                  <input
                    className="border border-black mb-1 ml-1"
                    type="text"
                    placeholder="Add"
                    onChange={(e) => setFaculty(e.target.value)}
                  />
                  <button
                    className="bg-black text-white"
                    type="submit"
                    onClick={AddData}
                  >
                    Add
                  </button>
                </div>
                <div className="">
                  <select
                    className="border border-black"
                    value={Faculty}
                    onChange={(e) => {
                      const selectedFaculty = e.target.value;

                      // Reset all dependent data when faculty changes
                      setFaculty(selectedFaculty);
                      setShowLevelEdu([]); // Reset levelEdu
                      setShowDepartment([]); // Reset department
                      setShowCourseYear([]); // Reset courseYear

                      // Fetch new data based on selected faculty
                      fetchPostEdu(selectedFaculty);
                    }}
                  >
                    <option value="">Select Faculty</option>
                    {show?.map((data) => (
                      <option key={data.id} value={data.id}>
                        {data.Faculty}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <table className="w-full mt-4 border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-slate-600 text-white text-left">
                        <th className="px-4 py-2 border border-gray-300">หลักสูตร</th>
                        <th className="px-4 py-2 border border-gray-300">หน่วยกิต</th>
                        <th className="px-4 py-2 border border-gray-300">ระยะเวลาศึกษา</th>
                        <th className="px-4 py-2 border border-gray-300">เกรดต่ำสุด</th>
                      </tr>
                    </thead>
                    <tbody>
                    {sortedShowLevelEdu.map((level,index) => (
                        <React.Fragment key={level.id}>
                          <tr key={index}
                          className="bg-slate-200 text-gray-700"
                          >
                            <td
                              className="px-4 py-2 font-semibold"
                              colSpan="4"
                            >
                              ระดับการศึกษา: {level.level}
                              <button
                                className="bg-white text-gray-800"
                                onClick={() => handleEditLevelEdu(level.id, level.level)}
                              >
                                Edit
                              </button>
                              <button
                                className="text-rose-600 bg-white border-white ml-2"
                                onClick={() => handleDeleteLevelEdu(level.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          {showDepartment?.map(
                            (department, deptIndex) =>
                              level.id === department.LevelEduId && (
                                <React.Fragment key={department.id}>
                                  <tr className="bg-yellow-100 text-gray-800" key={deptIndex}>
                                    <td className="px-4 py-2 font-semibold" colSpan="4">
                                      ภาควิชา: {department.DepartName}
                                      <button
                                        className="text-blue-600 bg-white border-white ml-2"
                                        onClick={() => handleEditDepartment(department.id, department.DepartName)}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="text-rose-600 bg-white border-white ml-2"
                                        onClick={() => handleDeleteDepartment(department.id, level.id)}
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                  {showCourseYear?.map(
                                    (courseyear, cyIndex) =>
                                      department.id ===
                                        courseyear.YearsCourseId && (
                                        <>
                                          <tr
                                            key={cyIndex}
                                            className="text-blue-700"
                                            colSpan="5"
                                          >
                                            <td className="bg-yellow-50 px-4 py-2 border border-gray-300">
                                              <Link
                                                className="text-blue-500 flex"
                                                to={{
                                                  pathname: "/info",
                                                  search: `?faculty=${Faculty}&levelEdu=${level.id}&department=${department.id}&courseYear=${courseyear.id}`,
                                                }}
                                                // onClick={() => console.log("pathlink check",`faculty=${Faculty}&levelEdu=${level.id}&department=${department.id}&courseYear=${courseyear.id}`)}
                                              >
                                                {courseyear.CourseYear}
                                              </Link>
                                            </td>
                                            <td className="px-4 py-2 border border-gray-300">
                                              {courseyear.Credits}
                                            </td>
                                            <td className="px-4 py-2 border border-gray-300">
                                              {courseyear.StudyDuration}
                                            </td>
                                            <td className="px-4 py-2 border border-gray-300">
                                              {courseyear.MinGrade}
                                            </td>
                                            <td>
                                            <button
                                              className="text-blue-600 bg-white border-white ml-2"
                                              onClick={() => handleEditCourseYear(courseyear.id, department.id)}
                                            >
                                              Edit
                                            </button>
                                            <button
                                              className="text-rose-600 bg-white border-white"
                                              onClick={() =>
                                                handleDeleteCourseYear(
                                                  courseyear.id,
                                                  department.id
                                                )
                                              }
                                            >
                                              Delete
                                            </button>
                                            </td>
                                          </tr>
                                        </>
                                      )
                                  )}
                                  <tr>
                                    <td colSpan="4">
                                      <span style={{ display: "inline" }}>
                                        เพิ่มปีการศึกษา
                                      </span>
                                      <button
                                        className="bg-blue-500 hover:bg-blue-700"
                                        style={{ display: "inline" }}
                                        onClick={() => {
                                          console.log(level.id);
                                          setIsAddingCourseYear((prevData) => ({
                                            ...prevData,
                                            [department.id]: true,
                                          }));
                                        }}
                                      >
                                        +
                                      </button>
                                      {isAddingCourseYear[department.id] && (
                                        <div>
                                          <input
                                            type="text"
                                            placeholder="เพิ่มปีการศึกษา"
                                            value={
                                              CourseYear[department.id] || ""
                                            }
                                            onChange={(e) =>
                                              setCourseYear((prevData) => ({
                                                ...prevData,
                                                [department.id]: e.target.value,
                                              }))
                                            }
                                          />
                                          <input
                                            type="text"
                                            placeholder="Add Credits"
                                            value={Credits[department.id] || ""}
                                            onChange={(e) =>
                                              setCredits((prevData) => ({
                                                ...prevData,
                                                [department.id]: e.target.value,
                                              }))
                                            }
                                          />
                                          <input
                                            type="text"
                                            placeholder="Add Study Duration"
                                            value={
                                              StudyDuration[department.id] || ""
                                            }
                                            onChange={(e) =>
                                              setStudyDuration((prevData) => ({
                                                ...prevData,
                                                [department.id]: e.target.value,
                                              }))
                                            }
                                          />
                                          <input
                                            type="text"
                                            placeholder="Add Min Grade"
                                            value={
                                              MinGrade[department.id] || ""
                                            }
                                            onChange={(e) =>
                                              setMinGrade((prevData) => ({
                                                ...prevData,
                                                [department.id]: e.target.value,
                                              }))
                                            }
                                          />
                                          <button
                                            className="bg-blue-500 hover:bg-blue-700"
                                            onClick={() => {
                                              console.log(LevelEdu);
                                              handleAddCourseYear(
                                                department.id,
                                                level.id
                                              );
                                            }}
                                          >
                                            Save
                                          </button>
                                          <button
                                            className="bg-red-500 hover:bg-red-700"
                                            onClick={() =>
                                              setIsAddingCourseYear((prevData) => ({
                                                ...prevData,
                                                [department.id]: false,
                                              }))
                                            }
                                          >
                                            Close
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                </React.Fragment>
                              )
                          )}
                          <tr>
                            <td colSpan="4">
                              <span style={{ display: "inline" }}>
                                เพิ่มภาควิชา
                              </span>
                              <button
                                className="bg-blue-500 hover:bg-blue-700"
                                style={{ display: "inline" }}
                                onClick={() =>
                                  setIsAddingDepartment((prevData) => ({
                                    ...prevData,
                                    [level.id]: true,
                                  }))
                                }
                              >
                                +
                              </button>
                              {isAddingDepartment[level.id] && (
                                <div>
                                  <input
                                    type="text"
                                    placeholder="เพิ่มภาควิชา"
                                    value={Department[level.id] || ""}
                                    onChange={(e) =>
                                      setDepartment((prevData) => ({
                                        ...prevData,
                                        [level.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <button
                                    className="bg-blue-500 hover:bg-blue-700"
                                    onClick={() =>
                                      handleAddDepartment(level.id)
                                    }
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="bg-red-500 hover:bg-red-700"
                                    onClick={() =>
                                      setIsAddingDepartment((prevData) => ({
                                        ...prevData,
                                        [level.id]: false,
                                      }))
                                    }
                                  >
                                    Close
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                      <tr>
                        <td colSpan="4">
                          <span style={{ display: "inline" }}>เพิ่มระดับการศึกษา</span>
                          <button
                            className="bg-blue-500 hover:bg-blue-700"
                            style={{ display: "inline" }}
                            onClick={() => setIsAddingLevel(true)}
                          >
                            +
                          </button>
                          {isAddingLevel && (
                            <div>
                              <input
                                type="text"
                                placeholder="เพิ่มระดับการศึกษา"
                                value={LevelEdu}
                                onChange={(e) => setLevelEdu(e.target.value)}
                              />
                              <button
                                className="bg-blue-500 hover:bg-blue-700"
                                onClick={handleAddLevel}
                              >
                                Save
                              </button>
                              <button
                                className="bg-red-500 hover:bg-red-700"
                                onClick={() => setIsAddingLevel(false)}
                              >
                                Close
                              </button>
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
      </div>
    </>
  );
}

export default AdminDashboardPage;

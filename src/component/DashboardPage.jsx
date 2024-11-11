import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import classes from "./AdminDashboardPage.module.css";

function DashboardPage() {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [levelEduData, setLevelEduData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [courseYearData, setCourseYearData] = useState([]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "faculty"));
        const facultyList = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setFaculties(facultyList);
      } catch (error) {
        console.error("Error fetching faculties: ", error);
      }
    };
    fetchFaculties();
  }, []);

  const fetchLevelEduData = async (facultyId) => {
    try {
      const querySnapshot = await getDocs(
        collection(db, `faculty/${facultyId}/LevelEdu`)
      );
      const newLevelEduData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setLevelEduData(newLevelEduData);
    } catch (error) {
      console.error("Error fetching level education data: ", error);
    }
  };

  const fetchDepartmentData = async (facultyId, levelEduId) => {
    try {
      const querySnapshot = await getDocs(
        collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department`)
      );
      const newDepartmentData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setDepartmentData((prevData) => [
        ...prevData,
        ...newDepartmentData.map((item) => ({
          ...item,
          LevelEduId: levelEduId,
        })),
      ]);
    } catch (error) {
      console.error("Error fetching department data: ", error);
    }
  };

  const fetchCourseYearData = async (facultyId, levelEduId, departmentId) => {
    try {
      const querySnapshot = await getDocs(
        collection(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear`
        )
      );
      const newCourseYearData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCourseYearData((prevData) => [
        ...prevData,
        ...newCourseYearData.map((item) => ({
          ...item,
          DepartmentId: departmentId,
        })),
      ]);
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
        await fetchCourseYearData(
          selectedFaculty,
          department.LevelEduId,
          department.id
        );
      });
    }
  }, [departmentData]);

  const levelOrder = {
    "ปริญญาตรี": 1,
    "ปริญญามหาบัณฑิต": 2,
    "ปริญญาดุษฎีบัณฑิต": 3,
  };

  const sortedLevelEduData = levelEduData.sort(
    (a, b) => (levelOrder[a.level] || Infinity) - (levelOrder[b.level] || Infinity)
  );

  return (
    <div class="bg-gradient-to-b from-green-500 to-white min-h-screen p-10">
      <div className="flex justify-center text-center mb-8">
        <h1 className="bg-green-400 p-6 w-3/5 rounded-lg shadow-lg text-3xl font-bold">
          แพลทฟอร์มระบบสารสนเทศสำหรับรายละเอียดของหลักสูตร (มคอ.2)
          ตามเกณฑ์มาตรฐาน AUN-QA
        </h1>
      </div>
      <div className="flex justify-center">
        <div className="h-full w-3/5 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex w-full">
            <div className="bg-gray-100 w-60 p-4 flex flex-col items-center space-y-4 border-r border-gray-300">
              <label htmlFor="facultySelect">เลือกคณะ: </label>
              <select
                id="facultySelect"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
              >
                <option value="">คณะ</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.Faculty}
                  </option>
                ))}
              </select>
            </div>
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
              {sortedLevelEduData.map((level) => (
                  <React.Fragment key={level.id}>
                    <tr className="bg-slate-200 text-gray-700">
                      <td colSpan="4" className="px-4 py-2 font-semibold">
                        ระดับการศึกษา: {level.level}
                      </td>
                    </tr>
                    {departmentData
                      .filter((dept) => dept.LevelEduId === level.id)
                      .map((department) => (
                        <React.Fragment key={department.id}>
                          <tr className="bg-yellow-100 text-gray-800">
                            <td colSpan="4" className="px-4 py-2 font-semibold">
                              ภาควิชา: {department.DepartName}
                            </td>
                          </tr>
                          {courseYearData
                            .filter((course) => course.DepartmentId === department.id)
                            .map((courseYear) => (
                              <tr key={courseYear.id} className="text-blue-700">
                                <td className="bg-yellow-50 px-4 py-2 border border-gray-300">
                                  <Link
                                    to={{
                                      pathname: "/infouser",
                                      search: `?faculty=${selectedFaculty}&levelEdu=${level.id}&department=${department.id}&courseYear=${courseYear.id}`,
                                    }}
                                    className="text-blue-500 hover:underline"
                                    onClick={() =>
                                      console.log(
                                        `faculty=${selectedFaculty}&levelEdu=${level.id}&department=${department.id}&courseYear=${courseYear.id}`
                                      )
                                    }
                                  >
                                    {courseYear.CourseYear}
                                  </Link>
                                </td>
                                <td className="px-4 py-2 border border-gray-300">
                                  {courseYear.Credits}
                                </td>
                                <td className="px-4 py-2 border border-gray-300">
                                  {courseYear.StudyDuration}
                                </td>
                                <td className="px-4 py-2 border border-gray-300">
                                  {courseYear.MinGrade}
                                </td>
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

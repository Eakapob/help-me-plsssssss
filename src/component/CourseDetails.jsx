import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { db } from "../firebase"; // นำเข้าการตั้งค่าของ Firebase
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

const CourseDetailsPage = () => {
  const { subjectCode } = useParams();
  const location = useLocation();
  const {
    facultyId,
    levelEduId,
    departmentId,
    courseYearId,
    parentType,
    parentId,
    grandParentId,
    greatGrandParentId,
    greatGreatGrandParentId,
    tableId,
    selectedSubjectId, // เพิ่มค่า selectedSubjectId
    subjectNameTH, // รับค่า subjectNameTH ที่ถูกส่งมา
    subjectNameENG, // รับค่า subjectNameENG ที่ถูกส่งมา
    closWithPLOs = [],
  } = location.state || {};

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false); // สถานะแก้ไข
  const [courseDescriptionTH, setCourseDescriptionTH] = useState("");
  const [courseDescriptionENG, setCourseDescriptionENG] = useState("");
  const [requiredSubjects, setRequiredSubjects] = useState("");
  const [conditions, setConditions] = useState("");
  const [gradeType, setGradeType] = useState("");
  //   const [selectedSubjectCLOs, setSelectedSubjectCLOs] = useState([]);

  const [newCLO, setNewCLO] = useState("");
  const [cloDescription, setCLODescription] = useState("");
  const [selectedPLO, setSelectedPLO] = useState("");
  const [allPLOs, setAllPLOs] = useState([]);
  const [clos, setClos] = useState([]);
  const [isAddingCLO, setIsAddingCLO] = useState(false);
  const [tableDataId, setTableDataId] = useState(""); // TableData ID for CLOs

  useEffect(() => {
    // console.log("check",tableId)
    if (selectedSubjectId && parentType) {
      fetchCLOs();
    }
  }, [
    selectedSubjectId,
    parentType,
    facultyId,
    levelEduId,
    departmentId,
    courseYearId,
    grandParentId,
    greatGrandParentId,
    tableDataId,
  ]);

  useEffect(() => {
    let docRef;

    if (parentType === "topic") {
      docRef = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/TableData/${tableId}`
      );
    } else if (parentType === "subtopic") {
      docRef = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/TableData/${tableId}`
      );
    } else if (parentType === "subinsubtopic") {
      docRef = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/TableData/${tableId}`
      );
    } else if (parentType === "subsubinsubtopic") {
      docRef = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGreatGrandParentId}/Subtopics/${greatGrandParentId}/Subinsubtopics/${grandParentId}/Subsubinsubtopics/${parentId}/TableData/${tableId}`
      );
    }

    // ดึงข้อมูล
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourseData(data);
          setCourseDescriptionTH(data.courseDescriptionTH || "");
          setCourseDescriptionENG(data.courseDescriptionENG || "");
          setRequiredSubjects(data.requiredSubjects || "");
          setConditions(data.conditions || "");
          setGradeType(data.gradeType || "");
        } else {
          console.error("No such document!");
        }
        setLoading(false); // ปิดสถานะ loading
      } catch (error) {
        console.error("Error fetching course details: ", error);
      }
    };

    fetchData();
  }, [
    parentType,
    parentId,
    tableId,
    facultyId,
    levelEduId,
    departmentId,
    courseYearId,
  ]);

  useEffect(() => {
    const fetchPLOsFromFirebase = async () => {
      const PLOsRef = collection(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`
      );
      const snapshot = await getDocs(PLOsRef);
      const ploData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllPLOs(ploData);
    };

    fetchPLOsFromFirebase();
  }, [facultyId, levelEduId, departmentId, courseYearId]);

  const [showPLODescriptions, setShowPLODescriptions] = useState(
    Array(closWithPLOs.length).fill(false) // สร้าง array ที่เก็บสถานะการแสดง PLO ของแต่ละ clo
  );

  const togglePLODescription = (index) => {
    const updatedShowPLODescriptions = [...showPLODescriptions];
    updatedShowPLODescriptions[index] = !updatedShowPLODescriptions[index]; // สลับสถานะของ clo นั้นๆ
    setShowPLODescriptions(updatedShowPLODescriptions); // อัพเดตสถานะ
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div class="bg-gradient-to-b from-green-500 to-white min-h-screen p-10">
      <div className="flex justify-center text-center mb-8">
        <h1 className="bg-green-400 p-6 w-3/5 rounded-lg shadow-lg text-3xl font-bold">
          Course Details
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
            </div>
            <div className="flex flex-col w-full">
              <div className="border border-gray-400 rounded-lg "></div>
              <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-4 mt-5 w-full">
                <div className="space-y-4">
                  <ul className="bg-gray-100 p-4 rounded-md shadow-md">
                    <li className="mb-2">
                      <strong>วิชา:</strong> {subjectCode} {subjectNameTH}{" "}
                      {subjectNameENG}
                    </li>
                    <li className="mb-2">
                      <strong>คำอธิบายหลักสูตร (TH):</strong>{" "}
                      {courseDescriptionTH}
                    </li>
                    <li className="mb-2">
                      <strong>คำอธิบายหลักสูตร (ENG):</strong>{" "}
                      {courseDescriptionENG}
                    </li>
                    <li className="mb-2">
                      <strong>วิชาบังคับ:</strong> {requiredSubjects}
                    </li>
                    <li className="mb-2">
                      <strong>เงื่อนไข:</strong> {conditions}
                    </li>
                    <li>
                      <strong>ประเภทเกรด:</strong> {gradeType}
                    </li>
                  </ul>
                </div>
                <div>
                  {/* List CLOs */}
                  <ul className="bg-lime-300 p-4 rounded-xl shadow-md space-y-4">
                    <h3 className="bg-lime-100 text-xl p-2 rounded-md">
                      CLO ของวิชา {subjectCode}
                    </h3>
                    {closWithPLOs
                      .filter((clo) => clo.tableDataId === tableId)
                      .sort((a, b) => parseInt(a.name) - parseInt(b.name))
                      .map((clo, index) => (
                        <li
                          key={index}
                          className="bg-white p-1 rounded-md shadow-md"
                        >
                          <strong>CLO: </strong> {clo.name} {clo.description}
                          <strong> (PLO:</strong>
                          <span
                            className="text-blue"
                            onClick={() => togglePLODescription(index)}
                            style={{
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                          >
                            {Array.isArray(clo.ploId) ? (
                              clo.ploId.map((ploId, ploIndex) => {
                                // หาข้อมูล PLO จาก allPLOs โดยใช้ ploId
                                const plo = allPLOs.find(
                                  (data) => data.id === ploId
                                );
                                return plo ? (
                                  <span key={ploIndex}>
                                    {plo.number}{" "}
                                    {ploIndex < clo.ploId.length - 1 && ", "}
                                  </span>
                                ) : null;
                              })
                            ) : (
                              <span>
                                {clo.ploId &&
                                  allPLOs.map((plo, ploIndex) => {
                                    if (plo.id === clo.ploId) {
                                      return (
                                        <span key={ploIndex}>{plo.number}</span>
                                      );
                                    }
                                    return null;
                                  })}
                              </span>
                            )}
                          </span>
                          <br />
                          {showPLODescriptions[index] && (
                            <div>
                              <strong>คำอธิบายPLO:</strong>{" "}
                              {Array.isArray(clo.ploId)
                                ? // ถ้า clo.ploId เป็น array ให้แสดงคำอธิบายของแต่ละ PLO
                                  clo.ploId.map((ploId, ploIndex) => {
                                    const plo = allPLOs.find(
                                      (data) => data.id === ploId
                                    );
                                    return plo ? (
                                      <div key={ploIndex}>
                                        <strong>{plo.number}:</strong>{" "}
                                        {plo.description}
                                      </div>
                                    ) : null;
                                  })
                                : // ถ้า clo.ploId เป็น string (PLO เดียว) ให้แสดงคำอธิบายของ PLO เดียว
                                  allPLOs.map((plo, ploIndex) => {
                                    if (plo.id === clo.ploId) {
                                      return (
                                        <div key={ploIndex}>
                                          <strong>{plo.number}:</strong>{" "}
                                          {plo.description}
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                            </div>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;

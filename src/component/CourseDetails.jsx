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
    tableId,
    selectedSubjectCode, // รับค่า selectedSubjectCode ที่ส่งมาจาก InfoPage
    closWithPLOs = [],
    selectedSubjectId, // เพิ่มค่า selectedSubjectId
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
          console.error("No such document!", docRef.path);
          setLoading(false);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div class="bg-gradient-to-b from-green-500 to-white h-screen">
      <div className="flex justify-center text-center">
        <h1 className="bg-green-400 text-white p-5 w-3/5">Info Page</h1>
      </div>
      <div className="flex justify-center">
        <div className="h-full border border-black flex w-3/5 bg-white">
          <div className="text-start border-black bg-white flex flex-col h-full items-center w-60">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
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
                    CLO ของวิชา {selectedSubjectId}
                  </h3>
                  {closWithPLOs
                    .filter((clo) => {
                      const isMatch = clo.tableDataId === tableId;
                      return isMatch;
                    })
                    .map((clo, index) => (
                      <li
                        key={index}
                        className="bg-white p-4 rounded-md shadow-md"
                      >
                        <strong>CLO:</strong> {clo.name}, <br />
                        <strong>คำอธิบาย:</strong> {clo.description}, <br />
                        <strong>PLO:</strong> {clo.ploNumber} -{" "}
                        {clo.ploDescription}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;

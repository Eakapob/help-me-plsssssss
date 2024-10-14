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
import * as XLSX from "xlsx";

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

  // useEffect(() => {
  //   const selectedData = localStorage.getItem("selectedData");
  //   if (selectedData) {
  //     const {
  //       facultyId,
  //       levelEduId,
  //       departmentId,
  //       courseYearId,
  //       parentType,
  //       parentId,
  //       grandParentId,
  //       greatGrandParentId,
  //       tableId,
  //       selectedSubjectCode,
  //       closWithPLOs,
  //     } = JSON.parse(selectedData);

  //     // Use these values as needed in your component
  //     console.log(facultyId, levelEduId, departmentId, courseYearId, parentType, parentId, grandParentId, greatGrandParentId, tableId, selectedSubjectCode, closWithPLOs);

  //     // Clear the local storage after use to prevent stale data
  //     localStorage.removeItem("selectedData");
  //   }
  // }, []);

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
    console.log("check", tableId);
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

  const handleUpdateTableDataCLO = async () => {
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

    try {
      await updateDoc(docRef, {
        courseDescriptionTH,
        courseDescriptionENG,
        requiredSubjects,
        conditions,
        gradeType,
      });
      setIsEditing(false); // ปิดโหมดแก้ไขเมื่ออัปเดตเสร็จสิ้น
      alert("ข้อมูลรายวิชาได้รับการอัปเดตเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error updating course details: ", error);
    }
  };

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

  const handleAddCLO = async () => {
    if (!newCLO || !cloDescription || !selectedPLO) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const newCLOData = {
      name: newCLO,
      description: cloDescription,
      ploId: selectedPLO,
      tableDataId: tableId,
    };

    let cloCollectionPath = "";
    if (parentType === "topic") {
      cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/CLOs`;
    } else if (parentType === "subtopic") {
      cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/CLOs`;
    } else if (parentType === "subinsubtopic") {
      cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/CLOs`;
    }

    try {
      const CLOCollectionRef = collection(db, cloCollectionPath);
      await addDoc(CLOCollectionRef, newCLOData);
      console.log("CLOCollectionRef", CLOCollectionRef);
      console.log("CLOCollectionRef", CLOCollectionRef);
      console.log("CLO added successfully:", newCLOData);

      // Clear the form fields
      setNewCLO("");
      setCLODescription("");
      setSelectedPLO("");
    } catch (error) {
      console.error("Error adding CLO: ", error);
      console.log("check", cloCollectionPath);
    }
  };

  const handleImportCLOWithTableDataId = (e, tableId) => {
    if (!tableId) {
      console.error("tableId is missing");
      return;
    }
    console.log("tableId being passed:", tableId);
    handleImportCLO(tableId, e);
  };

  const handleImportCLO = async (tableId, e) => {
    console.log("tableId inside handleImportCLO:", tableId); // ตรวจสอบว่า tableId มีค่า
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);

      let cloCollectionPath = "";
      if (parentType === "topic") {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/CLOs`;
      } else if (parentType === "subtopic") {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/CLOs`;
      } else if (parentType === "subinsubtopic") {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/CLOs`;
      }

      for (let row of rows) {
        const { CLOName, CLODescription, PLONumber } = row;
        const matchedPLO = allPLOs.find((plo) => plo.number === PLONumber);

        if (!matchedPLO) {
          console.error(`ไม่พบ PLO ที่ตรงกับหมายเลข ${PLONumber}`);
          continue;
        }

        const newCLO = {
          name: CLOName || "",
          description: CLODescription || "",
          ploId: matchedPLO.id,
          tableDataId: tableId, // ตรวจสอบว่า tableId ถูกใช้
        };

        console.log("newCLO being added:", newCLO);

        try {
          const CLOCollectionRef = collection(db, cloCollectionPath);
          await addDoc(CLOCollectionRef, newCLO);
          console.log("CLO imported successfully:", newCLO);
        } catch (error) {
          console.error("Error importing CLO: ", error);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

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
            <div className="border border-gray-400 rounded-lg"></div>
            <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-4 mt-5 w-full">
              {isEditing ? (
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="text-xl font-bold mb-4">
                    อัปเดตข้อมูลรายวิชา
                  </h3>
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label className="block font-bold">
                        คำอธิบายหลักสูตร (TH):
                      </label>
                      <textarea
                        value={courseDescriptionTH}
                        onChange={(e) => setCourseDescriptionTH(e.target.value)}
                        className="mt-0 p-1/2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                        placeholder="คำอธิบายรายวิชา (TH)"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">
                        คำอธิบายหลักสูตร (ENG):
                      </label>
                      <textarea
                        value={courseDescriptionENG}
                        onChange={(e) =>
                          setCourseDescriptionENG(e.target.value)
                        }
                        className="mt-0 p-1/2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                        placeholder="Course Description (ENG)"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">วิชาบังคับ:</label>
                      <input
                        type="text"
                        value={requiredSubjects}
                        onChange={(e) => setRequiredSubjects(e.target.value)}
                        className="mt-0 p-1/2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                        placeholder="วิชาบังคับ"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">เงื่อนไข:</label>
                      <input
                        type="text"
                        value={conditions}
                        onChange={(e) => setConditions(e.target.value)}
                        className="mt-0 p-1/2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                        placeholder="เงื่อนไข"
                      />
                    </div>
                    <div>
                      <label className="block font-bold">ประเภทเกรด:</label>
                      <input
                        type="text"
                        value={gradeType}
                        onChange={(e) => setGradeType(e.target.value)}
                        className="mt-0 p-1/2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                        placeholder="ประเภทของเกรด"
                      />
                    </div>
                  </div>
                  <button
                    className="mt-6 w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
                    onClick={handleUpdateTableDataCLO}
                  >
                    อัปเดตข้อมูลรายวิชา
                  </button>
                </div>
              ) : (
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
                  <button
                    className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    แก้ไขข้อมูล
                  </button>
                </div>
              )}
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

                {/* Button to toggle CLO form */}
                <button
                  className="mt-4 w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
                  onClick={() => setIsAddingCLO(!isAddingCLO)}
                >
                  {isAddingCLO ? "ปิดการเพิ่ม CLO" : "เปิดการเพิ่ม CLO"}
                </button>

                {/* CLO Form */}
                {isAddingCLO && (
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h3 className="text-xl font-bold mb-4">
                      เพิ่ม CLO สำหรับ {selectedSubjectId}
                    </h3>
                    <div className="flex flex-col space-y-4">
                      <div>
                        <label className="block font-bold">CLO ที่:</label>
                        <input
                          type="text"
                          value={newCLO}
                          onChange={(e) => setNewCLO(e.target.value)}
                          className="mt-0 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                          placeholder="CLO ที่"
                        />
                      </div>
                      <div>
                        <label className="block font-bold">คำบรรยาย CLO:</label>
                        <textarea
                          value={cloDescription}
                          onChange={(e) => setCLODescription(e.target.value)}
                          className="mt-0 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                          placeholder="คำบรรยาย CLO"
                        />
                      </div>
                      <div>
                        <label className="block font-bold">เลือก PLO:</label>
                        <select
                          value={selectedPLO}
                          onChange={(e) => setSelectedPLO(e.target.value)}
                          className="mt-0 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                        >
                          <option value="">เลือก PLO</option>
                          {allPLOs.map((plo) => (
                            <option key={plo.id} value={plo.id}>
                              {plo.number}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="mt-4 w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
                        onClick={handleAddCLO}
                      >
                        เพิ่ม CLO
                      </button>

                      {/* Import CLO */}
                      <div className="mt-6">
                        <h4 className="text-lg font-bold">
                          Import CLO จากไฟล์ Excel
                        </h4>
                        <input
                          type="file"
                          className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                          accept=".xlsx, .xls"
                          onChange={(e) =>
                            handleImportCLOWithTableDataId(e, tableId)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;

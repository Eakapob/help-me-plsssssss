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
  where,
  query,
  setDoc,
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
    greatGreatGrandParentId,
    tableId,
    // closWithPLOs = [],
    selectedSubjectId, // เพิ่มค่า selectedSubjectId
    subjectNameTH, // รับค่า subjectNameTH ที่ถูกส่งมา
    subjectNameENG, // รับค่า subjectNameENG ที่ถูกส่งมา
  } = location.state || {};

  const [closWithPLOs, setClosWithPLOs] = useState(
    location.state?.closWithPLOs || []
  );

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

  const [showPLODescriptions, setShowPLODescriptions] = useState(
    Array(closWithPLOs.length).fill(false) // สร้าง array ที่เก็บสถานะการแสดง PLO ของแต่ละ clo
  );

  const togglePLODescription = (index) => {
    const updatedShowPLODescriptions = [...showPLODescriptions];
    updatedShowPLODescriptions[index] = !updatedShowPLODescriptions[index]; // สลับสถานะของ clo นั้นๆ
    setShowPLODescriptions(updatedShowPLODescriptions); // อัพเดตสถานะ
  };

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
    greatGreatGrandParentId,
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
    } else if (parentType === "subsubinsubtopic") {
      docRef = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGreatGrandParentId}/Subtopics/${greatGrandParentId}/Subinsubtopics/${grandParentId}/Subsubinsubtopics/${parentId}/TableData/${tableId}`
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
    const isDuplicate = closWithPLOs.some(
      (existingCLO) => existingCLO.name === newCLO
    );

    if (isDuplicate) {
      alert("CLO ที่มีอยู่แล้วในระบบไม่สามารถเพิ่มได้");
      return; // หยุดการทำงานของฟังก์ชัน
    }

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
    } else if (parentType === "subsubinsubtopic") {
      cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGreatGrandParentId}/Subtopics/${greatGrandParentId}/Subinsubtopics/${grandParentId}/Subsubinsubtopics/${parentId}/CLOs`;
    }

    try {
      const CLOCollectionRef = collection(db, cloCollectionPath);
      const docRef = await addDoc(CLOCollectionRef, newCLOData); // get docRef from addDoc
      console.log("CLO added successfully:", newCLOData);

      // อัปเดต state โดยใช้ docRef.id
      setClosWithPLOs((prevClos) => [
        ...prevClos,
        { id: docRef.id, ...newCLOData }, // ใช้ docRef.id ที่ได้จาก addDoc
      ]);

      // Clear the form fields
      setNewCLO("");
      setCLODescription("");
      setSelectedPLO([]);
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
      } else if (parentType === "subsubinsubtopic") {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGreatGrandParentId}/Subtopics/${greatGrandParentId}/Subinsubtopics/${grandParentId}/Subsubinsubtopics/${parentId}/CLOs`;
      }

      // ทำการสร้าง matchedPLOs ที่นี่
      for (let row of rows) {
        const { CLOName, CLODescription, PLONumber } = row;
        console.log("PLONumber from row:", PLONumber);
        console.log("allPLOs:", allPLOs);

        // ตรวจสอบว่า PLONumber มีค่าและเป็น string หากไม่เป็น ให้ใช้ array ว่าง
        const ploNumbers =
          typeof PLONumber === "string"
            ? PLONumber.split(",").map((num) => parseInt(num.trim()))
            : [parseInt(PLONumber)].filter(Boolean); // กรณีที่เป็นตัวเลขเดี่ยว หรือไม่มีค่า ให้กรองเอาเฉพาะค่าที่เป็นจริง

        // หา PLO ที่ตรงกับแต่ละหมายเลขที่ระบุใน ploNumbers
        const matchedPLOs = allPLOs.filter((plo) =>
          ploNumbers.includes(parseInt(plo.number))
        );

        if (matchedPLOs.length === 0) {
          console.error(`ไม่พบ PLO ที่ตรงกับหมายเลข ${PLONumber}`);
          continue;
        }

        // ตรวจสอบ CLO ซ้ำ
        const CLOCollectionRef = collection(db, cloCollectionPath);
        const q = query(
          CLOCollectionRef,
          where("name", "==", CLOName),
          where("tableDataId", "==", tableId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log(`CLO ${CLOName} ที่มี tableDataId ${tableId} มีอยู่แล้ว`);
          continue; // ข้ามการเพิ่มถ้ามีข้อมูลซ้ำแล้ว
        }

        const newCLO = {
          name: CLOName || "",
          description: CLODescription || "",
          ploId: matchedPLOs.map((plo) => plo.id), // ใช้ matchedPLOs ที่นี่
          tableDataId: tableId,
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

  {
    console.log("closWithPLOs:", closWithPLOs);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div class="bg-gradient-to-b from-green-500 to-white min-h-screen p-10">
      <div className="flex justify-center text-center mb-8">
        <h1 className="bg-green-400 p-6 w-3/5 rounded-lg shadow-lg text-3xl font-bold">
          CourseDetail
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
                          onChange={(e) =>
                            setCourseDescriptionTH(e.target.value)
                          }
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
                      CLO ของวิชา {subjectCode} {subjectNameTH} {subjectNameENG}
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
                          <label className="block font-bold">
                            คำบรรยาย CLO:
                          </label>
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
                            multiple
                            value={selectedPLO}
                            onChange={(e) =>
                              setSelectedPLO(
                                Array.from(
                                  e.target.selectedOptions,
                                  (option) => option.value
                                )
                              )
                            }
                            className="mt-0 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                          >
                            <option value="">เลือก PLO</option>
                            {allPLOs
                              .sort((a, b) => a.number - b.number) // เรียงลำดับ PLO ตามตัวเลข
                              .map((plo) => (
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
    </div>
  );
};

export default CourseDetailsPage;

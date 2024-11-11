import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import * as XLSX from "xlsx";

const PLOPage = () => {
  const [selectedSubjectPLOs, setSelectedSubjectPLOs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectPLO, setSelectPLO] = useState(null);
  const [relatedCLOs, setRelatedCLOs] = useState([]);
  const [tableDataId, setTableDataId] = useState([]);

  const [closWithPLOs, setClosWithPLOs] = useState([]);
  const [data, setData] = useState({});

  const [newPLONumber, setNewPLONumber] = useState("");
  const [newPLODescription, setNewPLODescription] = useState("");
  const [cognitiveDomain, setCognitiveDomain] = useState("");
  const [psychomotorDomain, setPsychomotorDomain] = useState(false);
  const [affectiveDomain, setAffectiveDomain] = useState(false);

  const [showPLOSection, setShowPLOSection] = useState(false);

  const [editingPLOId, setEditingPLOId] = useState(null); // เก็บ PLO ที่กำลังถูกแก้ไข
  const [editablePLOData, setEditablePLOData] = useState({}); // เก็บค่าที่แก้ไข

  const togglePLOSectionVisibility = () => {
    setShowPLOSection((prevShow) => !prevShow);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectPLO(null);
  };

  const location = useLocation();
  const {
    facultyId,
    levelEduId,
    departmentId,
    courseYearId,
    // data,
    tableData,
    cloData,
  } = location.state || {}; // Destructure the passed state

  const [selectedSubjectCLOs, setSelectedSubjectCLOs] = useState([]);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    // ตรวจสอบว่ามีค่า facultyId, levelEduId, departmentId และ courseYearId หรือไม่
    if (facultyId && levelEduId && departmentId && courseYearId) {
      fetchPLOs();
    }
  }, [facultyId, levelEduId, departmentId, courseYearId]); // ทำงานใหม่เมื่อค่าเหล่านี้เปลี่ยน

  const fetchPLOs = async () => {
    try {
      const PLOCollectionRef = collection(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`
      );
      const PLOsSnapshot = await getDocs(PLOCollectionRef);
      const PLOs = PLOsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setData((prev) => ({ ...prev, PLO: PLOs }));
    } catch (error) {
      console.error("Error fetching PLOs: ", error);
    }
  };

  useEffect(() => {
    //console.log("updatedCLOs with PLO data:", closWithPLOs); // ตรวจสอบค่า
  }, [closWithPLOs]);

  const handleImportPLO = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);

      try {
        const PLOCollectionRef = collection(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`
        );

        // ดึงข้อมูล PLO ทั้งหมดที่มีอยู่แล้วจากฐานข้อมูล
        const PLOSnapshot = await getDocs(PLOCollectionRef);
        const existingPLOs = PLOSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // เพิ่มข้อมูลจาก Excel ทีละแถวโดยตรวจสอบค่าซ้ำก่อน
        for (let row of rows) {
          const {
            PLONumber,
            PLODescription,
            CognitiveDomain,
            PsychomotorDomain,
            AffectiveDomain,
          } = row;

          const newPLONumberInt = parseInt(PLONumber, 10);

          // ตรวจสอบค่าซ้ำ
          const isDuplicate = existingPLOs.some(
            (plo) => parseInt(plo.number, 10) === newPLONumberInt
          );

          if (isDuplicate) {
            console.warn(
              `Duplicate PLO number ${newPLONumberInt} detected. Skipping.`
            );
            continue;
          }

          const newPLO = {
            number: newPLONumberInt,
            description: PLODescription || "",
            cognitiveDomain: CognitiveDomain || "",
            psychomotorDomain:
              PsychomotorDomain === true ||
              PsychomotorDomain === "TRUE" ||
              PsychomotorDomain === "true",
            affectiveDomain:
              AffectiveDomain === true ||
              AffectiveDomain === "TRUE" ||
              AffectiveDomain === "true",
          };

          // เพิ่ม PLO ที่ไม่ซ้ำลงฐานข้อมูล
          await addDoc(PLOCollectionRef, newPLO);

          // เพิ่มข้อมูลใหม่ใน existingPLOs เพื่อป้องกันการเพิ่มซ้ำในลำดับถัดไป
          existingPLOs.push(newPLO);
        }

        // อัปเดตข้อมูล PLOs ใน state
        const updatedPLOsSnapshot = await getDocs(PLOCollectionRef);
        const updatedPLOs = updatedPLOsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData((prev) => ({ ...prev, PLO: updatedPLOs }));
      } catch (error) {
        console.error("Error importing PLOs: ", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const addPLO = async () => {
    if (!newPLONumber || !newPLODescription) {
      console.error("PLO number or description is missing.");
      return;
    }

    const newPLONumberInt = parseInt(newPLONumber, 10); // เปลี่ยนเป็น integer

    try {
      const PLOCollectionRef = collection(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`
      );

      // ตรวจสอบ PLO ที่มีอยู่แล้ว
      const PLOSnapshot = await getDocs(PLOCollectionRef);
      const existingPLOs = PLOSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const isDuplicate = existingPLOs.some(
        (plo) => parseInt(plo.number, 10) === newPLONumberInt
      );

      if (isDuplicate) {
        console.error("Duplicate PLO number detected.");
        return;
      }

      const newPLO = {
        number: newPLONumberInt,
        description: newPLODescription,
        cognitiveDomain,
        psychomotorDomain,
        affectiveDomain,
      };

      await addDoc(PLOCollectionRef, newPLO);

      setData((prev) => ({ ...prev, PLO: [...existingPLOs, newPLO] }));
      setNewPLONumber("");
      setNewPLODescription("");
      setCognitiveDomain("");
      setPsychomotorDomain(false);
      setAffectiveDomain(false);
    } catch (error) {
      console.error("Error adding PLO: ", error);
    }
  };

  const handlePLOClick = (plo) => {
    console.log("Selected PLO ID:", plo.id);

    // Ensure cloData is defined before using it
    if (!cloData || !Array.isArray(cloData)) {
      console.error("cloData is undefined or not an array");
      return; // Exit early if cloData is not available
    }

    const relatedCLOs2 = cloData.filter((clo) => clo.ploId === plo.id); // Filter CLOs by PLO ID
    console.log("Related CLOs:", relatedCLOs2);

    setIsModalOpen(true); // Open the modal
    setSelectPLO(plo); // Set the selected PLO
    setRelatedCLOs(relatedCLOs2); // Set the filtered CLOs for the modal
  };

  const getPloById = async (ploId) => {
    try {
      if (!ploId) {
        console.log("Invalid ploId:", ploId); // เพิ่มการ log
        return null;
      }

      const ploDocRef = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`,
        ploId
      );
      const ploDoc = await getDoc(ploDocRef);

      if (ploDoc.exists()) {
        //console.log("PLO found:", ploDoc.data()); // เพิ่มการ log เพื่อตรวจสอบข้อมูลที่ได้มา
        return ploDoc.data(); // ดึงข้อมูล PLO
      } else {
        console.log("PLO not found for ploId:", ploId);
        return null;
      }
    } catch (error) {
      console.error("Error fetching PLO:", error);
      return null;
    }
  };

  const handleSubjectClick = async (
    parentId,
    tableId,
    subjectCode,
    subjectNameTH,
    subjectNameENG,
    parentType = "topic",
    grandParentId = null,
    greatGrandParentId = null,
    greatGreatGrandParentId = null // เพิ่ม parameter สำหรับ greatGreatGrandParentId
  ) => {
    console.log("parentId:", parentId);
    console.log("tableId:", tableId);
    console.log("grandParentId:", grandParentId);
    console.log("greatGrandParentId:", greatGrandParentId);
    console.log("greatGreatGrandParentId:", greatGreatGrandParentId);
    console.log("parentType:", parentType);
    console.log(facultyId);
    console.log(levelEduId);
    console.log(departmentId);
    console.log(courseYearId);

    try {
      // setSelectedSubjectCode(subjectCode);
      // setSelectedSubjectId(parentId);
      // setSelectedParentType(parentType);
      // setSelectedParentId(parentId);
      // setSelectedGrandParentId(grandParentId);
      // setSelectedGreatGrandParentId(greatGrandParentId);
      // setSelectedGreatGreatGrandParentId(greatGreatGrandParentId); // เก็บ greatGreatGrandParentId
      setTableDataId(tableId); // เก็บ TableDataID ที่เกี่ยวข้อง

      let docRef;
      // สร้าง docRef ตาม parentType
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

      // ดึงข้อมูล TableData
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const ploIds = data.PLOs || [];

        // Map PLO IDs to their detailed information using allPLOs
        const ploDetails = ploIds.map((ploId) => {
          const plo = allPLOs.find((p) => p.id === ploId);
          return plo
            ? plo
            : {
                id: ploId,
                number: "Unknown",
                description: "No description available",
              };
        });

        setSelectedSubjectPLOs(ploDetails);

        // Fetch CLO data (ถ้าต้องการ)
        let cloPaths = [];
        if (parentType === "topic") {
          cloPaths = [
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/CLOs`,
          ];
        } else if (parentType === "subtopic") {
          cloPaths = [
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/CLOs`,
          ];
        } else if (parentType === "subinsubtopic") {
          cloPaths = [
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/CLOs`,
          ];
        } else if (parentType === "subsubinsubtopic") {
          cloPaths = [
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGreatGrandParentId}/Subtopics/${greatGrandParentId}/Subinsubtopics/${grandParentId}/Subsubinsubtopics/${parentId}/CLOs`,
          ];
        }

        // Fetch CLO data from the appropriate path (ถ้าต้องการ)
        const cloData = [];
        for (const path of cloPaths) {
          const cloCollection = collection(db, path);
          const cloSnapshot = await getDocs(cloCollection);

          if (!cloSnapshot.empty) {
            cloSnapshot.forEach((doc) => {
              cloData.push({ id: doc.id, ...doc.data() });
            });
          }
        }

        setSelectedSubjectCLOs(cloData);

        // สร้าง updatedCLOs ที่รวม PLOs
        const updatedCLOs = await Promise.all(
          cloData.map(async (clo) => {
            const plo = await getPloById(clo.ploId);
            return {
              ...clo,
              ploNumber: plo ? plo.number : "Unknown",
              ploDescription: plo ? plo.description : "Unknown",
            };
          })
        );

        navigate(`/course-details/${subjectCode}`, {
          state: {
            facultyId,
            levelEduId,
            departmentId,
            courseYearId,
            parentType,
            parentId,
            grandParentId,
            greatGrandParentId,
            greatGreatGrandParentId, // เพิ่ม greatGreatGrandParentId
            tableId,
            selectedSubjectCode: subjectCode,
            subjectNameTH, // เพิ่มตัวแปร subjectNameTH
            subjectNameENG, // เพิ่มตัวแปร subjectNameENG
            closWithPLOs: updatedCLOs,
          },
        });
      } else {
        console.log("No such document!");
        setSelectedSubjectPLOs([]);
        setSelectedSubjectCLOs([]);
      }
    } catch (error) {
      console.error("Error fetching PLOs and CLOs for subject: ", error);
      setSelectedSubjectPLOs([]);
      setSelectedSubjectCLOs([]);
    }
  };

  // ฟังก์ชันสำหรับเข้าสู่โหมดแก้ไข
  const handleEditClick = (plo) => {
    setEditingPLOId(plo.id);
    setEditablePLOData({ ...plo });
  };

  // ฟังก์ชันสำหรับบันทึกการแก้ไข
  const handleSaveClick = async () => {
    try {
      const PLODocRef = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`,
        editingPLOId
      );
      await updateDoc(PLODocRef, editablePLOData);
      // อัปเดตข้อมูลใน State
      setData((prev) => ({
        ...prev,
        PLO: prev.PLO.map((p) =>
          p.id === editingPLOId ? { ...p, ...editablePLOData } : p
        ),
      }));
      setEditingPLOId(null);
    } catch (error) {
      console.error("Error saving PLO: ", error);
    }
  };

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของ input
  const handleInputChange = (field, value) => {
    setEditablePLOData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeletePLO = async (plo) => {
    if (window.confirm(`Are you sure you want to delete PLO${plo.number}?`)) {
      try {
        const PLODocRef = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`,
          plo.id
        );
        await deleteDoc(PLODocRef);
        // ลบ PLO ออกจาก State
        setData((prev) => ({
          ...prev,
          PLO: prev.PLO.filter((p) => p.id !== plo.id),
        }));
      } catch (error) {
        console.error("Error deleting PLO: ", error);
      }
    }
  };

  useEffect(() => {
    const fetchPLOsForCLOs = async () => {
      const updatedCLOs = await Promise.all(
        selectedSubjectCLOs
          .filter((clo) => clo.tableDataId === tableDataId)
          .map(async (clo) => {
            const plo = await getPloById(clo.ploId);
            // console.log("CLO:", clo); // ตรวจสอบ CLO
            // console.log("PLO fetched:", plo); // ตรวจสอบ PLO ที่ถูกดึง

            return {
              ...clo,
              ploNumber: plo ? plo.number : "Unknown", // เพิ่มการตรวจสอบว่า PLO มีข้อมูลหรือไม่
              ploDescription: plo ? plo.description : "Unknown",
            };
          })
      );

      //console.log("Updated CLOs with PLO data:", updatedCLOs); // ตรวจสอบข้อมูลหลังการอัพเดต

      setClosWithPLOs(updatedCLOs);
    };

    fetchPLOsForCLOs();
  }, [selectedSubjectCLOs, tableDataId]);

  return (
    <div class="bg-gradient-to-b from-green-500 to-white min-h-screen p-10">
      <div className="flex justify-center text-center mb-8">
        <h1 className="bg-green-400 p-6 w-3/5 rounded-lg shadow-lg text-3xl font-bold">
          PLO Page
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
            <div>
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-slate-600 text-white">
                  <tr>
                    <th className="py-2 px-4 border border-gray-300">ลำดับ</th>
                    <th className="py-2 px-4 border border-gray-300">
                      ผลลัพธ์การเรียนรู้ที่คาดหวังของหลักสูตร (PLOs)
                    </th>
                    <th className="py-2 px-4 border border-gray-300">
                      Cognitive Domain
                    </th>
                    <th className="py-2 px-4 border border-gray-300">
                      Psychomotor Domain (Skills)
                    </th>
                    <th className="py-2 px-4 border border-gray-300">
                      Affective Domain (Attitude)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.PLO &&
                    data.PLO.sort((a, b) => a.number - b.number).map(
                      (plo, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-100 transition duration-150"
                        >
                          <td
                            className="py-2 px-4 text-center border border-gray-300 cursor-pointer"
                            onClick={() => {
                              if (editingPLOId !== plo.id) handlePLOClick(plo); // ให้ทำงานเฉพาะเมื่อไม่ได้อยู่ในโหมดการแก้ไข
                            }}
                          >
                            {editingPLOId === plo.id ? (
                              <input
                                type="number"
                                value={editablePLOData.number}
                                onChange={(e) =>
                                  handleInputChange("number", e.target.value)
                                }
                                className="w-full border rounded p-1"
                              />
                            ) : (
                              `PLO${plo.number}`
                            )}
                          </td>
                          <td
                            className="py-2 px-4 border border-gray-300 cursor-pointer"
                            onClick={() => {
                              if (editingPLOId !== plo.id) handlePLOClick(plo);
                            }}
                          >
                            {editingPLOId === plo.id ? (
                              <input
                                type="text"
                                value={editablePLOData.description}
                                onChange={(e) =>
                                  handleInputChange(
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded p-1"
                              />
                            ) : (
                              plo.description
                            )}
                          </td>
                          <td className="py-2 px-4 text-center border border-gray-300">
                            {editingPLOId === plo.id ? (
                              <input
                                type="text"
                                value={editablePLOData.cognitiveDomain}
                                onChange={(e) =>
                                  handleInputChange(
                                    "cognitiveDomain",
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded p-1"
                              />
                            ) : (
                              plo.cognitiveDomain
                            )}
                          </td>
                          <td className="py-2 px-4 text-center border border-gray-300">
                            {editingPLOId === plo.id ? (
                              <input
                                type="checkbox"
                                checked={editablePLOData.psychomotorDomain}
                                onChange={(e) =>
                                  handleInputChange(
                                    "psychomotorDomain",
                                    e.target.checked
                                  )
                                }
                              />
                            ) : plo.psychomotorDomain ? (
                              "✔"
                            ) : (
                              ""
                            )}
                          </td>
                          <td className="py-2 px-4 text-center border border-gray-300">
                            {editingPLOId === plo.id ? (
                              <input
                                type="checkbox"
                                checked={editablePLOData.affectiveDomain}
                                onChange={(e) =>
                                  handleInputChange(
                                    "affectiveDomain",
                                    e.target.checked
                                  )
                                }
                              />
                            ) : plo.affectiveDomain ? (
                              "✔"
                            ) : (
                              ""
                            )}
                          </td>
                          <td className="py-2 px-4 text-center border border-gray-300">
                            {editingPLOId === plo.id ? (
                              <>
                                <button
                                  className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded mr-2"
                                  onClick={handleSaveClick}
                                >
                                  Save
                                </button>
                                <button
                                  className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded"
                                  onClick={() => setEditingPLOId(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                className="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-2 rounded mr-2"
                                onClick={() => handleEditClick(plo)}
                              >
                                Edit
                              </button>
                            )}
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
                              onClick={() => handleDeletePLO(plo)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
              <div className="flex flex-col items-start space-y-4 mt-4">
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition duration-200"
                  onClick={togglePLOSectionVisibility}
                >
                  {showPLOSection ? "Add PLOs" : "Add PLOs"}
                </button>

                {showPLOSection && (
                  <>
                    <div className="flex flex-col mt-2">
                      <h3 className="font-semibold text-gray-700">
                        Add New PLO
                      </h3>
                      <input
                        type="text"
                        placeholder="PLO Number"
                        className="mt-2 p-2 border border-gray-300 rounded-lg"
                        value={newPLONumber}
                        onChange={(e) => setNewPLONumber(e.target.value)}
                      />
                      <textarea
                        placeholder="PLO Description"
                        className="mt-2 p-2 border border-gray-300 rounded-lg"
                        value={newPLODescription}
                        onChange={(e) => setNewPLODescription(e.target.value)}
                      />
                    </div>
                    <select
                      value={cognitiveDomain}
                      className="mt-2 p-2 border border-gray-300 rounded-lg"
                      onChange={(e) => setCognitiveDomain(e.target.value)}
                    >
                      <option value="">Select Cognitive Domain</option>
                      <option value="R">R</option>
                      <option value="U">U</option>
                      <option value="Ap">Ap</option>
                      <option value="An">An</option>
                      <option value="E">E</option>
                      <option value="C">C</option>
                    </select>
                    <div className="flex items-center mt-2">
                      <label className="mr-2">Psychomotor Domain (S)</label>
                      <input
                        type="checkbox"
                        checked={psychomotorDomain}
                        onChange={(e) => setPsychomotorDomain(e.target.checked)}
                      />
                    </div>
                    <div className="flex items-center mt-2">
                      <label className="mr-2">Affective Domain (At)</label>
                      <input
                        type="checkbox"
                        checked={affectiveDomain}
                        onChange={(e) => setAffectiveDomain(e.target.checked)}
                      />
                    </div>
                    <button
                      className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition duration-200"
                      onClick={addPLO}
                    >
                      Add PLO
                    </button>
                  </>
                )}

                <button
                  className="bg-purple-500 text-white py-2 px-4 rounded-lg shadow hover:bg-purple-600 transition duration-200"
                  onClick={() => fileInputRef.current.click()}
                >
                  Import PLO
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImportPLO}
                />
              </div>

              {/* Modal สำหรับแสดง CLO ที่เชื่อมโยงกับ PLO */}
              {isModalOpen && selectPLO && relatedCLOs && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold">
                      CLOs for PLO {selectPLO.number}
                    </h3>
                    {tableData
                      .filter((tableDataItem) =>
                        relatedCLOs.some(
                          (clo) => clo.tableDataId === tableDataItem.id
                        )
                      )
                      .map((tableDataItem) => (
                        <div key={tableDataItem.id} className="mb-4">
                          <h4
                            className="font-semibold cursor-pointer text-blue-500 underline"
                            onClick={() => {
                              console.log("check", tableDataItem);
                              handleSubjectClick(
                                tableDataItem.parentId, // Assuming this is the parentId
                                tableDataItem.id, // Assuming this is the tableId
                                tableDataItem.subjectCode,
                                tableDataItem.subjectNameTH,
                                tableDataItem.subjectNameENG,
                                tableDataItem.parentType,
                                tableDataItem.grandParentId,
                                tableDataItem.greatGrandParentId,
                                tableDataItem.greatGreatGrandParentId
                              );
                            }}
                          >
                            {tableDataItem.subjectCode}{" "}
                            {tableDataItem.subjectNameTH}
                          </h4>
                          <ul>
                            {relatedCLOs
                              .filter(
                                (clo) => clo.tableDataId === tableDataItem.id
                              )
                              .sort(
                                (a, b) => parseInt(a.name) - parseInt(b.name)
                              )
                              .map((clo) => (
                                <li key={clo.id} className="border-b py-2">
                                  <strong>CLO {clo.name}</strong>:{" "}
                                  {clo.description}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}

                    {tableData.filter((tableDataItem) =>
                      relatedCLOs.some(
                        (clo) => clo.tableDataId === tableDataItem.id
                      )
                    ).length === 0 && <p>ไม่มีวิชาที่มี CLO ที่เกี่ยวข้อง</p>}
                    <button
                      onClick={closeModal}
                      className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PLOPage;

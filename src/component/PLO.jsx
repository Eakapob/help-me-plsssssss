import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const PLO = () => {
  const [selectedSubjectPLOs, setSelectedSubjectPLOs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectPLO, setSelectPLO] = useState(null);
  const [relatedCLOs, setRelatedCLOs] = useState([]);
  const [tableDataId, setTableDataId] = useState([]);

  const [closWithPLOs, setClosWithPLOs] = useState([]);

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
    data,
    tableData,
    cloData,
  } = location.state || {}; // Destructure the passed state

  console.log(tableData);

  const [selectedSubjectCLOs, setSelectedSubjectCLOs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    //console.log("updatedCLOs with PLO data:", closWithPLOs); // ตรวจสอบค่า
  }, [closWithPLOs]);

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

        navigate(`/course-detailsuser/${subjectCode}`, {
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
        console.log();
        setSelectedSubjectPLOs([]);
        setSelectedSubjectCLOs([]);
      }
    } catch (error) {
      console.error("Error fetching PLOs and CLOs for subject: ", error);
      setSelectedSubjectPLOs([]);
      setSelectedSubjectCLOs([]);
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
                            onClick={() => handlePLOClick(plo)}
                          >
                            PLO{plo.number}
                          </td>
                          <td
                            className="py-2 px-4 border border-gray-300 cursor-pointer"
                            onClick={() => handlePLOClick(plo)}
                          >
                            {plo.description}
                          </td>
                          <td className="py-2 px-4 text-center border border-gray-300">
                            {plo.cognitiveDomain}
                          </td>
                          <td className="py-2 px-4 text-center border border-gray-300">
                            {plo.psychomotorDomain ? "✔" : ""}
                          </td>
                          <td className="py-2 px-4 text-center border border-gray-300">
                            {plo.affectiveDomain ? "✔" : ""}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
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

export default PLO;

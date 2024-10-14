import React, { useEffect, useState, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import classes from "./InfoPage.module.css";
import * as XLSX from "xlsx";
import { IconButton } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "./AuthContext"; // ตรวจสอบเส้นทาง AuthContext

function InfoPage() {
  const location = useLocation();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [editTopic, setEditTopic] = useState("");
  const [isAddingSubtopic, setIsAddingSubtopic] = useState(null);
  const [isAddingSubinsubtopic, setIsAddingSubinsubtopic] = useState(null);
  const [isAddingTable, setIsAddingTable] = useState({});
  const [tables, setTables] = useState({});
  const [selectedPLOs, setSelectedPLOs] = useState([]);
  const [newTableData, setNewTableData] = useState({});
  const [showTable, setShowTable] = useState({});

  const [newPLONumber, setNewPLONumber] = useState("");
  const [newPLODescription, setNewPLODescription] = useState("");
  const [cognitiveDomain, setCognitiveDomain] = useState("");
  const [psychomotorDomain, setPsychomotorDomain] = useState(false);
  const [affectiveDomain, setAffectiveDomain] = useState(false);

  const [allPLOs, setAllPLOs] = useState([]);

  const [newCLO, setNewCLO] = useState(""); // ชื่อของ CLO ใหม่
  const [cloDescription, setCLODescription] = useState(""); // คำบรรยายของ CLO
  const [selectedPLO, setSelectedPLO] = useState(""); // PLO ที่เลือก
  const [isAddingCLO, setIsAddingCLO] = useState(false); // เปิด/ปิดฟอร์มเพิ่ม CLO
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedParentType, setSelectedParentType] = useState("topic");
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedGrandParentId, setSelectedGrandParentId] = useState(null);
  const [selectedGreatGrandParentId, setSelectedGreatGrandParentId] =
    useState(null);
  const [tableDataId, setTableDataId] = useState(null); // ID ของ TableData ที่เกี่ยวข้อง

  const [selectedSubjectCLOs, setSelectedSubjectCLOs] = useState([]);
  const [selectedSubjectPLOs, setSelectedSubjectPLOs] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(null);

  const [courseDescriptionTH, setCourseDescriptionTH] = useState("");
  const [courseDescriptionENG, setCourseDescriptionENG] = useState("");
  const [requiredSubjects, setRequiredSubjects] = useState("");
  const [conditions, setConditions] = useState("");
  const [gradeType, setGradeType] = useState("");

  const [showPLOSection, setShowPLOSection] = useState(false);

  const [editingTable, setEditingTable] = useState(null);
  const [editValues, setEditValues] = useState({});

  const queryParams = new URLSearchParams(location.search);
  const facultyId = queryParams.get("faculty");
  const levelEduId = queryParams.get("levelEdu");
  const departmentId = queryParams.get("department");
  const courseYearId = queryParams.get("courseYear");

  const [faculty, setFaculty] = useState('');
  const [levelEdu, setLevelEdu] = useState('');
  const [department, setDepartment] = useState('');
  const [courseYear, setCourseYear] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // สร้าง references สำหรับ collection และ documents
        const facultyDocRef = doc(db, `faculty/${facultyId}`);
        const levelEduDocRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}`);
        const departmentDocRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}`);
        const courseYearDocRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}`);
        
        // ดึงข้อมูลจาก Firestore
        const facultyData = await getDoc(facultyDocRef);
        const levelEduData = await getDoc(levelEduDocRef);
        const departmentData = await getDoc(departmentDocRef);
        const courseYearData = await getDoc(courseYearDocRef);
        
        // อัปเดต state ด้วยข้อมูลที่ได้
        if (facultyData.exists()) {
          setFaculty(facultyData.data().Faculty);
        } else {
          console.log("No such document in faculty!");
        }
    
        if (levelEduData.exists()) {
          setLevelEdu(levelEduData.data().level);
        } else {
          console.log("No such document in levelEdu!");
        }
    
        if (departmentData.exists()) {
          setDepartment(departmentData.data().DepartName);
        } else {
          console.log("No such document in department!");
        }
    
        if (courseYearData.exists()) {
          setCourseYear(courseYearData.data().CourseYear);
        } else {
          console.log("No such document in courseYear!");
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [facultyId, levelEduId, departmentId, courseYearId]);

  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`);
        const snapshot = await getDocs(topicsCollection);
        const topicsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTopics(topicsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching topics: ", error);
        setLoading(false);
      }
    };

    fetchTopics();
  }, [facultyId, levelEduId, departmentId, courseYearId]);

  useEffect(() => {
    if (!facultyId || !levelEduId || !departmentId || !courseYearId) {
      console.error("One or more query parameters are missing.");
      setLoading(false);
      return;
    }

    const fetchPLOsall = async () => {
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
        setAllPLOs(PLOs);
      } catch (error) {
        console.error("Error fetching PLOs: ", error);
      }
    };

    const fetchData = async () => {
      try {
        const facultyDoc = await getDocs(
          collection(db, `faculty`),
          doc(db, `faculty/${facultyId}`)
        );
        const levelEduDoc = await getDocs(
          collection(db, `faculty/${facultyId}/LevelEdu`),
          doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}`)
        );
        const departmentDoc = await getDocs(
          collection(
            db,
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department`
          ),
          doc(
            db,
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}`
          )
        );
        const courseYearDoc = await getDocs(
          collection(
            db,
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear`
          ),
          doc(
            db,
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}`
          )
        );

        const topicsCollection = collection(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`
        );
        const topicsSnapshot = await getDocs(topicsCollection);

        const topicsWithSubtopics = await Promise.all(
          topicsSnapshot.docs.map(async (topicDoc) => {
            const subtopicsCollection = collection(
              db,
              `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics`
            );
            const subtopicsSnapshot = await getDocs(subtopicsCollection);
            const subtopics = subtopicsSnapshot.docs.map((subDoc) => ({
              ...subDoc.data(),
              id: subDoc.id,
            }));

            const subtopicsWithSubinsubtopics = await Promise.all(
              subtopics.map(async (subtopic) => {
                const subinsubtopicsCollection = collection(
                  db,
                  `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics`
                );
                const subinsubtopicsSnapshot = await getDocs(
                  subinsubtopicsCollection
                );
                const subinsubtopics = subinsubtopicsSnapshot.docs.map(
                  (subinsubtopicDoc) => ({
                    ...subinsubtopicDoc.data(),
                    id: subinsubtopicDoc.id,
                  })
                );

                // Fetch TableData for Subinsubtopics
                const subinsubtopicTableData = await Promise.all(
                  subinsubtopics.map(async (subinsubtopic) => {
                    const tableDataCollection = collection(
                      db,
                      `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics/${subinsubtopic.id}/TableData`
                    );
                    const tableDataSnapshot = await getDocs(
                      tableDataCollection
                    );
                    const tables = tableDataSnapshot.docs.map((doc) => ({
                      ...doc.data(),
                      id: doc.id,
                    }));
                    return { ...subinsubtopic, tables };
                  })
                );

                return { ...subtopic, subinsubtopics: subinsubtopicTableData };
              })
            );

            // Fetch TableData for Subtopics
            const subtopicTableData = await Promise.all(
              subtopicsWithSubinsubtopics.map(async (subtopic) => {
                const tableDataCollection = collection(
                  db,
                  `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/TableData`
                );
                const tableDataSnapshot = await getDocs(tableDataCollection);
                const tables = tableDataSnapshot.docs.map((doc) => ({
                  ...doc.data(),
                  id: doc.id,
                }));
                return { ...subtopic, tables };
              })
            );

            // Fetch TableData for Topics
            const tableDataCollection = collection(
              db,
              `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/TableData`
            );
            const tableDataSnapshot = await getDocs(tableDataCollection);
            const tables = tableDataSnapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));

            return {
              ...topicDoc.data(),
              id: topicDoc.id,
              subtopics: subtopicTableData,
              tables,
            };
          })
        );

        setData({
          faculty: facultyDoc.docs[0]?.data(),
          levelEdu: levelEduDoc.docs[0]?.data(),
          department: departmentDoc.docs[0]?.data(),
          courseYear: courseYearDoc.docs[0]?.data(),
        });

        setTopics(topicsWithSubtopics);
        fetchPLOs();

        setTopics(topicsWithSubtopics);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPLOsall();
    fetchData();
  }, [facultyId, levelEduId, departmentId, courseYearId]);

  const handleAddTopic = async (parentId = null) => {
    if (!newTopic) return;
    const path = parentId
      ? `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics`
      : `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`;
    const topicsCollection = collection(db, path);
    const docRef = await addDoc(topicsCollection, { name: newTopic });
    if (parentId) {
      setTopics(
        topics.map((topic) =>
          topic.id === parentId
            ? {
                ...topic,
                subtopics: [
                  ...(topic.subtopics || []),
                  { id: docRef.id, name: newTopic },
                ],
              }
            : topic
        )
      );
    } else {
      setTopics([...topics, { id: docRef.id, name: newTopic, subtopics: [] }]);
    }
    setNewTopic("");
  };

  const handleUpdateTopic = async (topicId, parentId = null) => {
    const path = parentId
      ? `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}`
      : `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}`;
    const topicDoc = doc(db, path);
    await updateDoc(topicDoc, { name: editTopic });
    if (parentId) {
      setTopics(
        topics.map((topic) =>
          topic.id === parentId
            ? {
                ...topic,
                subtopics: topic.subtopics.map((subtopic) =>
                  subtopic.id === topicId
                    ? { ...subtopic, name: editTopic }
                    : subtopic
                ),
              }
            : topic
        )
      );
    } else {
      setTopics(
        topics.map((topic) =>
          topic.id === topicId ? { ...topic, name: editTopic } : topic
        )
      );
    }
    setIsEditing(null);
    setEditTopic("");
  };

  const handleDeleteTopic = async (
    topicId,
    parentId = null,
    grandParentId = null
  ) => {
    let path;
    if (grandParentId) {
      // This is for subinsubtopic
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${topicId}`;
    } else if (parentId) {
      // This is for subtopic
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}`;
    } else {
      // This is for main topic
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}`;
    }

    const topicDoc = doc(db, path);
    await deleteDoc(topicDoc);

    if (grandParentId) {
      // Update state for subinsubtopic
      setTopics(
        topics.map((topic) =>
          topic.id === grandParentId
            ? {
                ...topic,
                subtopics: topic.subtopics.map((subtopic) =>
                  subtopic.id === parentId
                    ? {
                        ...subtopic,
                        subinsubtopics: subtopic.subinsubtopics.filter(
                          (subinsubtopic) => subinsubtopic.id !== topicId
                        ),
                      }
                    : subtopic
                ),
              }
            : topic
        )
      );
    } else if (parentId) {
      // Update state for subtopic
      setTopics(
        topics.map((topic) =>
          topic.id === parentId
            ? {
                ...topic,
                subtopics: topic.subtopics.filter(
                  (subtopic) => subtopic.id !== topicId
                ),
              }
            : topic
        )
      );
    } else {
      // Update state for main topic
      setTopics(topics.filter((topic) => topic.id !== topicId));
    }
  };

  const handleAddsubTopic = async (parentId, grandParentId = null) => {
    if (!newTopic) return;

    let path;
    if (grandParentId) {
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics`;
    } else {
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics`;
    }

    const subtopicsCollection = collection(db, path);
    const docRef = await addDoc(subtopicsCollection, { name: newTopic });

    if (grandParentId) {
      setTopics(
        updateNestedTopics(topics, grandParentId, parentId, {
          id: docRef.id,
          name: newTopic,
        })
      );
    } else {
      setTopics(
        updateNestedTopics(topics, parentId, { id: docRef.id, name: newTopic })
      );
    }

    setNewTopic("");
    setIsAddingSubtopic(null);
  };

  const updateNestedTopics = (
    topics,
    parentId,
    grandParentId = null,
    newSubtopic
  ) => {
    return topics.map((topic) => {
      if (topic.id === (grandParentId || parentId)) {
        if (grandParentId) {
          return {
            ...topic,
            subtopics: topic.subtopics.map((subtopic) =>
              subtopic.id === parentId
                ? {
                    ...subtopic,
                    subtopics: [...(subtopic.subtopics || []), newSubtopic],
                  }
                : subtopic
            ),
          };
        } else {
          return {
            ...topic,
            subtopics: [...(topic.subtopics || []), newSubtopic],
          };
        }
      } else if (topic.subtopic && topic.subtopic.length > 0) {
        return {
          ...topic,
          subtopic: updateNestedTopics(
            topic.subtopics,
            parentId,
            grandParentId,
            newSubtopic
          ),
        };
      } else {
        return topic;
      }
    });
  };

  const handleAddTableData = (
    topicId,
    parentId = null,
    grandParentId = null
  ) => {
    if (grandParentId) {
      setIsAddingTable({
        ...isAddingTable,
        [`${grandParentId}-${parentId}-${topicId}`]: true,
      });
      setNewTableData({
        ...newTableData,
        [`${grandParentId}-${parentId}-${topicId}`]: {
          subjectCode: "",
          subjectNameENG: "",
          subjectNameTH: "",
          credit: "",
        },
      });
    } else if (parentId) {
      setIsAddingTable({ ...isAddingTable, [`${parentId}-${topicId}`]: true });
      setNewTableData({
        ...newTableData,
        [`${parentId}-${topicId}`]: {
          subjectCode: "",
          subjectNameENG: "",
          subjectNameTH: "",
          credit: "",
        },
      });
    } else {
      setIsAddingTable({ ...isAddingTable, [topicId]: true });
      setNewTableData({
        ...newTableData,
        [topicId]: {
          subjectCode: "",
          subjectNameENG: "",
          subjectNameTH: "",
          credit: "",
        },
      });
    }
  };

  const handleTableInputChange = (tableId, e) => {
    const { name, value } = e.target;
    setNewTableData((prevData) => ({
      ...prevData,
      [tableId]: {
        ...prevData[tableId],
        [name]: value,
      },
    }));
  };

  const handleSaveTableData = async (
    topicId,
    parentId = null,
    grandParentId = null
  ) => {
    let tablePath;
    let key;

    if (grandParentId) {
      tablePath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${topicId}/TableData`;
      key = `${grandParentId}-${parentId}-${topicId}`;
    } else if (parentId) {
      tablePath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}/TableData`;
      key = `${parentId}-${topicId}`;
    } else {
      tablePath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}/TableData`;
      key = topicId;
    }

    const tableCollection = collection(db, tablePath);
    const docRef = await addDoc(tableCollection, newTableData[key]);
    setTables((prevTables) => ({
      ...prevTables,
      [key]: [
        ...(prevTables[key] || []),
        { ...newTableData[key], id: docRef.id },
      ],
    }));
    setIsAddingTable({ ...isAddingTable, [key]: false });
    setNewTableData((prevData) => ({
      ...prevData,
      [key]: {
        subjectCode: "",
        subjectNameENG: "",
        subjectNameTH: "",
        credit: "",
      },
    }));
  };

  const handleDeleteTableData = async (
    topicId,
    tableId,
    parentId = null,
    grandParentId = null
  ) => {
    let tableDoc;
    let key;

    if (grandParentId) {
      tableDoc = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${topicId}/TableData/${tableId}`
      );
      key = `${grandParentId}-${parentId}-${topicId}`;
    } else if (parentId) {
      tableDoc = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}/TableData/${tableId}`
      );
      key = `${parentId}-${topicId}`;
    } else {
      tableDoc = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}/TableData/${tableId}`
      );
      key = topicId;
    }

    await deleteDoc(tableDoc);
    setTables((prevTables) => ({
      ...prevTables,
      [key]: (prevTables[key] || []).filter((table) => table.id !== tableId),
    }));
  };

  const handleEditTableData = async (
    topicId,
    tableId,
    newData,
    parentId = null,
    grandParentId = null
  ) => {
    let tableDoc;
    let key;

    if (grandParentId) {
      tableDoc = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${topicId}/TableData/${tableId}`
      );
      key = `${grandParentId}-${parentId}-${topicId}`;
    } else if (parentId) {
      tableDoc = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}/TableData/${tableId}`
      );
      key = `${parentId}-${topicId}`;
    } else {
      tableDoc = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}/TableData/${tableId}`
      );
      key = topicId;
    }

    const tableSnapshot = await getDoc(tableDoc);
    const existingData = tableSnapshot.data();

    const updatedData = {
      ...existingData,
      ...newData,
    };

    await updateDoc(tableDoc, updatedData);
    setTables((prevTables) => ({
      ...prevTables,
      [key]: prevTables[key].map((table) =>
        table.id === tableId ? { ...table, ...updatedData } : table
      ),
    }));
  };

  const handleEditClick = (table) => {
    setEditingTable(table.id);
    setEditValues({
      subjectCode: table.subjectCode,
      subjectNameENG: table.subjectNameENG,
      subjectNameTH: table.subjectNameTH,
      credit: table.credit,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async (tableId) => {
    await handleEditTableData(topic.id, tableId, editValues);
    setEditingTable(null);
  };

  const handleCancelClick = () => {
    setEditingTable(null);
  };

  const toggleTableVisibility = (key) => {
    setShowTable((prevShowTable) => ({
      ...prevShowTable,
      [key]: !prevShowTable[key],
    }));
  };

  // ฟังก์ชันเพิ่ม PLO
  const addPLO = async () => {
    if (!newPLONumber || !newPLODescription) {
      console.error("PLO number or description is missing.");
      return;
    }

    const newPLO = {
      number: newPLONumber,
      description: newPLODescription,
      cognitiveDomain,
      psychomotorDomain,
      affectiveDomain,
    };

    try {
      const PLOCollectionRef = collection(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`
      );
      await addDoc(PLOCollectionRef, newPLO);

      const PLOSnapshot = await getDocs(PLOCollectionRef);
      const PLOs = PLOSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setData((prev) => ({ ...prev, PLO: PLOs }));

      setNewPLONumber("");
      setNewPLODescription("");
      setCognitiveDomain("");
      setPsychomotorDomain(false);
      setAffectiveDomain(false);
    } catch (error) {
      console.error("Error adding PLO: ", error);
    }
  };

  // ฟังก์ชันดึงข้อมูล PLO
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

  // ส่วนกดlink
  const handleSubjectClick = async (
  parentId,
  tableId,
  subjectCode,
  parentType = "topic",
  grandParentId = null,
  greatGrandParentId = null
) => {
  console.log("tableId:", tableId)
  try {
    setSelectedSubjectCode(subjectCode);
    setSelectedSubjectId(parentId);
    setSelectedParentType(parentType);
    setSelectedParentId(parentId);
    setSelectedGrandParentId(grandParentId);
    setSelectedGreatGrandParentId(greatGrandParentId);
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
      // Set course details
      setCourseDescriptionTH(data.courseDescriptionTH || "");
      setCourseDescriptionENG(data.courseDescriptionENG || "");
      setRequiredSubjects(data.requiredSubjects || "");
      setConditions(data.conditions || "");
      setGradeType(data.gradeType || "");

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
          tableId,
          selectedSubjectCode: subjectCode,
          closWithPLOs: updatedCLOs,
        },
      });

      // // Construct the URL
      // const url = `/course-details/${subjectCode}`;

      // // Open the new URL in a new tab
      // window.open(url, '_blank');

      // // Here you might need to handle the updatedCLOs data in the new page. 
      // // Since you can't pass state directly, you can store it in localStorage or sessionStorage:

      // localStorage.setItem("selectedData", JSON.stringify({
      //   facultyId,
      //   levelEduId,
      //   departmentId,
      //   courseYearId,
      //   parentType,
      //   parentId,
      //   grandParentId,
      //   greatGrandParentId,
      //   tableId,
      //   selectedSubjectCode: subjectCode,
      //   closWithPLOs: updatedCLOs,
      // }));

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


  const addCLO = async (
    newCLO,
    cloDescription,
    selectedPLO,
    tableDataId,
    selectedParentType,
    selectedSubjectId,
    selectedGrandParentId,
    selectedGreatGrandParentId
  ) => {
    try {
      let cloCollectionPath;
      if (selectedParentType === "topic") {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedSubjectId}/CLOs`;
      } else if (selectedParentType === "subtopic") {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGrandParentId}/Subtopics/${selectedSubjectId}/CLOs`;
      } else if (selectedParentType === "subinsubtopic") {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGreatGrandParentId}/Subtopics/${selectedGrandParentId}/Subinsubtopics/${selectedSubjectId}/CLOs`;
      }

      const cloCollection = collection(db, cloCollectionPath);
      await addDoc(cloCollection, {
        name: newCLO,
        description: cloDescription,
        ploId: selectedPLO,
        tableDataId: tableDataId,
      });

      console.log("CLO added successfully");
    } catch (error) {
      console.error("Error adding CLO: ", error);
    }
  };

  // Fetch CLO data
  const [cloData, setCloData] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Fetch CLO data
  useEffect(() => {
    const fetchAllCLOs = async () => {
      if (!facultyId || !levelEduId || !departmentId || !courseYearId) {
        console.warn("One of the required IDs is not defined");
        return; // ออกจากฟังก์ชันถ้าไม่มีค่า ID
      }

      try {
        // Define path for fetching Topics
        const topicsPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`;
        
        const topicCollection = collection(db, topicsPath);
        const topicSnapshot = await getDocs(topicCollection);
        
        let allCLOs = [];
        let allTableData = [];

        // Loop through all topics
        for (const topicDoc of topicSnapshot.docs) {
          const topicId = topicDoc.id;

          // Fetch TableData for each topic
          const tableDataCollection = collection(db, `${topicsPath}/${topicId}/TableData`);
          const tableDataSnapshot = await getDocs(tableDataCollection);
          const fetchedTableData = tableDataSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Fetch CLOs for each topic
          const cloCollection = collection(db, `${topicsPath}/${topicId}/CLOs`);
          const cloSnapshot = await getDocs(cloCollection);
          const fetchedCLOs = cloSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Fetch Subtopics for each topic
          const subtopicsCollection = collection(db, `${topicsPath}/${topicId}/Subtopics`);
          const subtopicSnapshot = await getDocs(subtopicsCollection);
          
          // Loop through all subtopics
          for (const subtopicDoc of subtopicSnapshot.docs) {
            const subtopicId = subtopicDoc.id;

            // Fetch TableData for each subtopic
            const subtopicTableDataCollection = collection(db, `${topicsPath}/${topicId}/Subtopics/${subtopicId}/TableData`);
            const subtopicTableDataSnapshot = await getDocs(subtopicTableDataCollection);
            const fetchedSubtopicTableData = subtopicTableDataSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Fetch CLOs for each subtopic
            const subtopicCloCollection = collection(db, `${topicsPath}/${topicId}/Subtopics/${subtopicId}/CLOs`);
            const subtopicCloSnapshot = await getDocs(subtopicCloCollection);
            const fetchedSubtopicCLOs = subtopicCloSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Fetch Subinsubtopics for each subtopic
            const subinsubtopicsCollection = collection(db, `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics`);
            const subinsubtopicSnapshot = await getDocs(subinsubtopicsCollection);
            
            // Loop through all subinsubtopics
            for (const subinsubtopicDoc of subinsubtopicSnapshot.docs) {
              const subinsubtopicId = subinsubtopicDoc.id;

              // Fetch TableData for each subinsubtopic
              const subinsubtopicTableDataCollection = collection(db, `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/TableData`);
              const subinsubtopicTableDataSnapshot = await getDocs(subinsubtopicTableDataCollection);
              const fetchedSubinsubtopicTableData = subinsubtopicTableDataSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));

              // Fetch CLOs for each subinsubtopic
              const subinsubtopicCloCollection = collection(db, `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/CLOs`);
              const subinsubtopicCloSnapshot = await getDocs(subinsubtopicCloCollection);
              const fetchedSubinsubtopicCLOs = subinsubtopicCloSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              // รวมข้อมูล CLOs และ TableData ของ Subinsubtopic
              allTableData.push(...fetchedSubinsubtopicTableData);
              allCLOs.push(...fetchedSubinsubtopicCLOs);
            }

            // รวมข้อมูล CLOs และ TableData ของ Subtopic
            allTableData.push(...fetchedSubtopicTableData);
            allCLOs.push(...fetchedSubtopicCLOs);
          }

          // รวมข้อมูล CLOs และ TableData ของ Topic
          allTableData.push(...fetchedTableData);
          allCLOs.push(...fetchedCLOs);
        }

        // แสดงข้อมูล CLOs และ TableData ที่ดึงมา
        // console.log("Fetched all Table Data:", allTableData);
        // console.log("Fetched all CLOs:", allCLOs);

        // ตั้งค่า state สำหรับข้อมูลที่ถูกดึงทั้งหมด
        setTableData(allTableData);
        setCloData(allCLOs);
      } catch (error) {
        console.error("Error fetching all data: ", error);
      }
    };

    fetchAllCLOs();
  }, [facultyId, levelEduId, departmentId, courseYearId]); // เพิ่ม dependencies

  useEffect(() => {
    const fetchCLOs = async () => {
      try {
        let cloCollectionPath;
        if (selectedParentType === "topic") {
          cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedSubjectId}/CLOs`;
        } else if (selectedParentType === "subtopic") {
          cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGrandParentId}/Subtopics/${selectedSubjectId}/CLOs`;
        } else if (selectedParentType === "subinsubtopic") {
          cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGreatGrandParentId}/Subtopics/${selectedGrandParentId}/Subinsubtopics/${selectedSubjectId}/CLOs`;
        }

        // console.log("CLO collection path:", cloCollectionPath);

        const cloCollection = collection(db, cloCollectionPath);
        const cloSnapshot = await getDocs(cloCollection);
        const fetchedCLOs = cloSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // console.log("Fetched CLOs:", fetchedCLOs); // ตรวจสอบข้อมูล CLOs ที่ถูกดึงมา

        setSelectedSubjectCLOs(fetchedCLOs);
      } catch (error) {
        console.error("Error fetching CLOs: ", error);
      }
    };

    fetchCLOs();
  }, [
    selectedParentType,
    selectedSubjectId,
    selectedGrandParentId,
    selectedGreatGrandParentId,
  ]);

  // const handleAddCLO = async () => {
  //   if (!newCLO || !cloDescription || !selectedPLO) {
  //     alert("กรุณากรอกข้อมูลให้ครบถ้วน");
  //     return;
  //   }

  //   await addCLO(
  //     newCLO,
  //     cloDescription,
  //     selectedPLO,
  //     tableDataId,
  //     selectedParentType,
  //     selectedSubjectId,
  //     selectedGrandParentId,
  //     selectedGreatGrandParentId
  //   );

  //   // Reset CLO form fields
  //   setNewCLO("");
  //   setCLODescription("");
  //   setSelectedPLO("");
  // };

  // const handleUpdateTableData = async () => {
  //   await updateTableData(
  //     tableDataId,
  //     selectedParentType,
  //     selectedSubjectId,
  //     selectedGrandParentId,
  //     selectedGreatGrandParentId,
  //     courseDescriptionTH,
  //     courseDescriptionENG,
  //     requiredSubjects,
  //     conditions,
  //     gradeType
  //   );

  //   // Reset course information form fields
  //   setCourseDescriptionTH("");
  //   setCourseDescriptionENG("");
  //   setRequiredSubjects("");
  //   setConditions("");
  //   setGradeType("");
  // };

  // const updateTableData = async (
  //   tableDataId,
  //   selectedParentType,
  //   selectedSubjectId,
  //   selectedGrandParentId,
  //   selectedGreatGrandParentId,
  //   courseDescriptionTH,
  //   courseDescriptionENG,
  //   requiredSubjects,
  //   conditions,
  //   gradeType
  // ) => {
  //   try {
  //     let docRef;
  //     if (selectedParentType === "topic") {
  //       docRef = doc(
  //         db,
  //         `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedSubjectId}/TableData/${tableDataId}`
  //       );
  //     } else if (selectedParentType === "subtopic") {
  //       docRef = doc(
  //         db,
  //         `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGrandParentId}/Subtopics/${selectedSubjectId}/TableData/${tableDataId}`
  //       );
  //     } else if (selectedParentType === "subinsubtopic") {
  //       docRef = doc(
  //         db,
  //         `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGreatGrandParentId}/Subtopics/${selectedGrandParentId}/Subinsubtopics/${selectedSubjectId}/TableData/${tableDataId}`
  //       );
  //     }

  //     await updateDoc(docRef, {
  //       courseDescriptionTH,
  //       courseDescriptionENG,
  //       requiredSubjects,
  //       conditions,
  //       gradeType,
  //     });

  //     console.log("TableData updated successfully");
  //   } catch (error) {
  //     console.error("Error updating TableData: ", error);
  //     console.log(
  //       selectedGreatGrandParentId,
  //       selectedGrandParentId,
  //       selectedSubjectId,
  //       tableDataId
  //     );
  //   }
  // };

  const togglePLOSectionVisibility = () => {
    setShowPLOSection((prevShow) => !prevShow);
  };

  const handleImportTableData = (
    event,
    topicId,
    parentId = null,
    grandParentId = null
  ) => {
    // console.log('topicId:', topicId);
    // console.log('parentId:', parentId);
    // console.log('grandParentId:', grandParentId);
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Assuming the first sheet contains the data
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Iterate over the rows of the Excel sheet
      for (const row of jsonData) {
        const tableData = {
          subjectCode: row["subjectCode"],
          subjectNameENG: row["subjectNameENG"],
          subjectNameTH: row["subjectNameTH"],
          credit: row["credit"],
          courseDescriptionTH: row["courseDescriptionTH"],
          courseDescriptionENG: row["courseDescriptionENG"],
          requiredSubjects: row["requiredSubjects"],
          conditions: row["conditions"],
          gradeType: row["gradeType"],
        };

        await saveImportedTableData(
          topicId,
          parentId,
          grandParentId,
          tableData
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const saveImportedTableData = async (
    topicId,
    parentId = null,
    grandParentId = null,
    tableData
  ) => {
    let tablePath;
    let key;

    if (grandParentId) {
      tablePath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${topicId}/TableData`;
      key = `${grandParentId}-${parentId}-${topicId}`;
    } else if (parentId) {
      tablePath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}/TableData`;
      key = `${parentId}-${topicId}`;
    } else {
      tablePath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}/TableData`;
      key = topicId;
    }

    const tableCollection = collection(db, tablePath);
    const docRef = await addDoc(tableCollection, tableData);
    setTables((prevTables) => ({
      ...prevTables,
      [key]: [...(prevTables[key] || []), { ...tableData, id: docRef.id }],
    }));
  };

  const getPloById = async (ploId) => {
    try {
      if (!ploId) {
        console.log("Invalid ploId:", ploId); // เพิ่มการ log
        return null;
      }
  
      const ploDocRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`, ploId);
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
  
  const [closWithPLOs, setClosWithPLOs] = useState([]);

  useEffect(() => {
    //console.log("updatedCLOs with PLO data:", closWithPLOs); // ตรวจสอบค่า
  }, [closWithPLOs]);

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
  

  const { logout } = useAuth();

  const handleImportPLO = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);

      for (let row of rows) {
        const {
          PLONumber,
          PLODescription,
          CognitiveDomain,
          PsychomotorDomain,
          AffectiveDomain,
        } = row;

        const newPLO = {
          number: PLONumber || "",
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

        try {
          const PLOCollectionRef = collection(
            db,
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`
          );
          await addDoc(PLOCollectionRef, newPLO);

          const PLOSnapshot = await getDocs(PLOCollectionRef);
          const PLOs = PLOSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setData((prev) => ({ ...prev, PLO: PLOs }));
        } catch (error) {
          console.error("Error importing PLO: ", error);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleEditClickCLO = () => {
    setIsEditing(!isEditing); // เปลี่ยนสถานะเมื่อคลิกปุ่มแก้ไข
  };
  
  // const handleUpdateTableDataCLO = () => {
  //   // ฟังก์ชันสำหรับอัปเดตข้อมูล
  //   setIsEditing(false); // ปิดฟอร์มหลังจากอัปเดตข้อมูลเสร็จ
  // };

  const handleImportCLOWithTableDataId = (e, tableDataId) => {
    handleImportCLO(tableDataId, e); // ส่ง tableDataId และ event ของ input file
  };

  const handleImportCLO = async (tableDataId, e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    console.log("facultyId:", facultyId);
    console.log("levelEduId:", levelEduId);
    console.log("departmentId:", departmentId);
    console.log("courseYearId:", courseYearId);
    // ดึงข้อมูล PLO จาก Firebase
    const fetchPLOsFromFirebase = async () => {
      const PLOsRef = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`);
      const snapshot = await getDocs(PLOsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };
  
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);
  
      // ดึง PLO ทั้งหมดจาก Firebase
      const allPLOs = await fetchPLOsFromFirebase();
  
      // กำหนดเส้นทางตาม parent type
      let cloCollectionPath = "";
      if (selectedParentType === "topic") {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedSubjectId}/CLOs`;
      } else if (selectedParentType === "subtopic") {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGrandParentId}/Subtopics/${selectedSubjectId}/CLOs`;
      } else if (selectedParentType === "subinsubtopic") {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGreatGrandParentId}/Subtopics/${selectedGrandParentId}/Subinsubtopics/${selectedSubjectId}/CLOs`;
      }
  
      for (let row of rows) {
        const { CLOName, CLODescription, PLONumber } = row;
        // หา ploId จาก PLONumber ในข้อมูลที่ดึงมาจาก Firebase
        console.log("PLONumber from Excel:", PLONumber);
        console.log("allPLOs from Firebase:", allPLOs);
        const matchedPLO = allPLOs.find((plo) => plo.number === PLONumber);
        console.log(matchedPLO)
        if (!matchedPLO) {
          console.error(`ไม่พบ PLO ที่ตรงกับหมายเลข ${PLONumber}`);
          continue; // ข้ามไปหากไม่พบ
        }
  
        const newCLO = {
          name: CLOName || "",
          description: CLODescription || "",
          ploId: matchedPLO.id, // ใช้ ploId จาก Firebase ที่ match กัน
          tableDataId: tableDataId,
        };
  
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectPLO, setSelectPLO] = useState(null);
  const [relatedCLOs, setRelatedCLOs] = useState([]);

  const handlePLOClick = (plo) => {
    console.log("Selected PLO ID:", plo.id); // ตรวจสอบค่า PLO ที่เลือก
  
    // กรอง CLOs ตาม TableData ที่เกี่ยวข้องกับ PLO ที่เลือก
    const relatedCLOs = cloData.filter((clo) => {
      console.log("CLO PLO ID:", clo.ploId); // แสดงค่า ploId ของ CLO เพื่อการตรวจสอบ
      return clo.ploId === plo.id; // กรอง CLO ที่มี ploId ตรงกับ PLO ที่เลือก
    });
  
    console.log("Filtered CLOs:", relatedCLOs); // แสดง CLOs ที่เกี่ยวข้อง
  
    setRelatedCLOs(relatedCLOs); // เก็บ CLOs ที่เกี่ยวข้องใน state
    setSelectPLO(plo); // เก็บ PLO ที่ถูกเลือก
    setIsModalOpen(true); // เปิด modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectPLO(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div class="bg-gradient-to-b from-green-500 to-white h-screen">
      <div className="flex justify-center text-center">
        <h1 className="bg-green-400 p-5 w-3/5">Info Page</h1>
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
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
              onClick={() => {
                logout(); // เรียกใช้ logout เมื่อคลิกปุ่ม
                console.log("Logout button clicked");
              }}
            >
              ออกจากระบบ
            </button>
          </div>
          <div className="flex flex-col w-full">
            <div className="border border-gray-400 rounded-lg">
              <div className="mt-0 ml-5 h-full">
                <h2 className="text-lg font-semibold text-gray-700">คณะ: {faculty}</h2>
                <h3 className="text-lg font-semibold text-gray-700">ระดับการศึกษา: {levelEdu}</h3>
                <h4 className="text-lg font-semibold text-gray-700">ภาควิชา: {department}</h4>
                <h5 className="text-lg font-semibold text-gray-700">หลักสูตรปี: {courseYear}</h5>
              </div>
            </div>
            <div className="mt-4">
              <div className="border border-gray-400 rounded-lg p-4 bg-gray-50">
                {topics
                  .sort((a, b) => a.name.localeCompare(b.name)) // Sort topics by name in ascending order
                  .map((topic) => (
                    <div className="ml-8" key={topic.id}>
                      {isEditing === topic.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editTopic}
                            onChange={(e) => setEditTopic(e.target.value)}
                          />
                          <button
                            className="bg-lime-500 text-white font-semibold px-3 py-1 rounded-md shadow-sm"
                            onClick={() => handleUpdateTopic(topic.id)}
                          >
                            Save
                          </button>
                          <button
                            className="bg-red-500 text-white font-semibold px-3 py-1 rounded-md shadow-sm"
                            onClick={() => setIsEditing(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mt-2">
                          {topic.name}
                          <button

                            className="ml-1 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-1 border border-blue-500 rounded-md"
                            onClick={() => {
                              setIsEditing(topic.id);
                              setEditTopic(topic.name);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-2 border border-red-500 rounded-md"
                            onClick={() => handleDeleteTopic(topic.id)}
                          >
                          <FontAwesomeIcon icon={faTrash} />
                          </button>
                          <button
                            className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-2 border border-green-500 rounded-md ml-1"
                            onClick={() =>
                              setIsAddingSubtopic(
                                isAddingSubtopic === topic.id ? null : topic.id
                              )
                            }
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                          <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 border border-blue-700 rounded ml-1 w-8"
                            onClick={() => toggleTableVisibility(topic.id)}
                          >
                            {showTable[topic.id] ? (
                              <span>&lt;</span> // ไอคอนเปิด
                            ) : (
                              <span>&gt;</span> // ไอคอนปิด
                            )}
                          </button>
                        </div>
                      )}

                      {isAddingSubtopic === topic.id && (
                        <div className="mt-2">
                          <input
                            className="p-2 border border-gray-300 rounded-md shadow-sm"
                            type="text"
                            placeholder="Subtopic Name"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                          />
                          <div className="mt-2 flex space-x-2">
                            <button
                              className="bg-lime-500 text-white font-semibold px-3 py-1 rounded-md shadow-sm"
                              onClick={() => handleAddTopic(topic.id)}
                            >
                              Save
                            </button>
                            <button
                              className="bg-red-500 text-white font-semibold px-3 py-1 rounded-md shadow-sm"
                              onClick={() => setIsAddingSubtopic(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {showTable[topic.id] && (
                        <table className="mt-3 w-3/4 border border-gray-300 rounded-md">
                          <thead>
                            <tr className="bg-slate-500 text-white">
                              <th className="border border-black ">
                                Subject Code
                              </th>
                              <th className="border border-black ">
                                Subject Name
                              </th>
                              <th className="border border-black ">
                                Credit
                              </th>
                              <th className="border border-black w-1 ">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {topics.map((topic) =>
                              topic.tables.map((table, idx) => (
                                <tr key={idx}>
                                  <td className="border border-black bg-yellow-100 ">
                                    {editingTable === table.id ? (
                                      <input
                                        type="text"
                                        name="subjectCode"
                                        value={editValues.subjectCode}
                                        onChange={handleInputChange}
                                        className="w-full p-1 border border-gray-300 rounded-md"
                                      />
                                    ) : (
                                      <span
                                        onClick={() =>
                                          handleSubjectClick(
                                            topic.id,
                                            table.id,
                                            table.subjectCode,
                                            "topic"
                                          )
                                        }
                                        className="cursor-pointer"
                                      >
                                        {table.subjectCode}
                                      </span>
                                    )}
                                  </td>
                                  <td className="border border-black bg-yellow-100 ">
                                    {editingTable === table.id ? (
                                      <input
                                        type="text"
                                        name="subjectNameENG"
                                        value={editValues.subjectNameENG}
                                        onChange={handleInputChange}
                                        className="w-full p-1 border border-gray-300 rounded-md"
                                      />
                                    ) : (
                                      table.subjectNameENG
                                    )}
                                  </td>
                                  <td className="border border-black bg-yellow-100 ">
                                    {editingTable === table.id ? (
                                      <input
                                        type="text"
                                        name="credit"
                                        value={editValues.credit}
                                        onChange={handleInputChange}
                                        className="w-full p-1 border border-gray-300 rounded-md"
                                      />
                                    ) : (
                                      table.credit
                                    )}
                                  </td>
                                  <td className="">
                                    {editingTable === table.id ? (
                                      <div className="flex space-x-2">
                                        <button
                                          className="bg-lime-500 text-white font-semibold px-3 py-1 rounded-md shadow-sm"
                                          onClick={() =>
                                            handleSaveClick(table.id)
                                          }
                                        >
                                          Save
                                        </button>
                                        <button
                                          className="bg-red-500 text-white font-semibold px-3 py-1 rounded-md shadow-sm"
                                          onClick={() => setEditingTable(null)}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex space-x-2">
                                        <button
                                          className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-2 border border-red-500 rounded-md"
                                          onClick={() =>
                                            handleDeleteTableData(
                                              topic.id,
                                              table.id
                                            )
                                          }
                                        >
                                          <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                        <button
                                          className="bg-blue-500 text-white font-semibold px-2 py-1 rounded-md shadow-sm"
                                          onClick={() => handleEditClick(table)}
                                        >
                                          Edit
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                          <button
                            className="bg-green-500 hover:bg-green-700"
                            onClick={() => handleAddTableData(topic.id)}
                          >
                            Add Table
                          </button>
                          <button
                            onClick={() =>
                              document
                                .getElementById(`fileInput-${topic.id}`)
                                .click()
                            }
                          >
                            Import
                          </button>
                          <input
                            type="file"
                            id={`fileInput-${topic.id}`}
                            style={{ display: "none" }}
                            onChange={(e) => handleImportTableData(e, topic.id)}
                          />
                        </table>
                      )}

                      {isAddingTable[topic.id] && (
                        <div>
                          <input
                            className="border border-black"
                            type="text"
                            name="subjectCode"
                            value={newTableData[topic.id]?.subjectCode || ""}
                            onChange={(e) =>
                              handleTableInputChange(topic.id, e)
                            }
                            placeholder="Subject Code"
                          />
                          <input
                            className="border border-black"
                            type="text"
                            name="subjectNameENG"
                            value={newTableData[topic.id]?.subjectNameENG || ""}
                            onChange={(e) =>
                              handleTableInputChange(topic.id, e)
                            }
                            placeholder="Subject NameENG"
                          />
                          <input
                            className="border border-black"
                            type="text"
                            name="subjectNameTH"
                            value={newTableData[topic.id]?.subjectNameTH || ""}
                            onChange={(e) =>
                              handleTableInputChange(topic.id, e)
                            }
                            placeholder="Subject NameTH"
                          />
                          <input
                            className="border border-black"
                            type="text"
                            name="credit"
                            value={newTableData[topic.id]?.credit || ""}
                            onChange={(e) =>
                              handleTableInputChange(topic.id, e)
                            }
                            placeholder="Credit"
                          />
                          <button onClick={() => handleSaveTableData(topic.id)}>
                            Save
                          </button>
                        </div>
                      )}

                      {topic.subtopics &&
                        topic.subtopics
                          .sort((a, b) => a.name.localeCompare(b.name)) // Sort subtopics by name in ascending order
                          .map((subtopic) => (
                            <div className="ml-8 mt-2" key={subtopic.id}>
                              {isEditing === subtopic.id ? (
                                <div>
                                  <input
                                    value={editTopic}
                                    onChange={(e) =>
                                      setEditTopic(e.target.value)
                                    }
                                  />
                                  <button
                                    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-1 border border-blue-500 hover:border-transparent rounded"
                                    onClick={() =>
                                      handleUpdateTopic(subtopic.id, topic.id)
                                    }
                                  >
                                    Save
                                  </button>
                                  <button
                                    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-1 border border-blue-500 hover:border-transparent rounded"
                                    onClick={() => {
                                      setIsEditing(null);
                                      setEditTopic("");
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  {subtopic.name}
                                  <button
                                    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-1 border border-blue-500 hover:border-transparent rounded ml-1"
                                    onClick={() => {
                                      setIsEditing(subtopic.id);
                                      setEditTopic(subtopic.name);
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    class="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-2 border border-red-500 rounded-md ml-2"
                                    onClick={() =>
                                      handleDeleteTopic(subtopic.id, topic.id)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                  <button
                                    class="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-1 border border-green-500 hover:border-transparent rounded ml-2 mr-1 w-8"
                                    onClick={() =>
                                      setIsAddingSubinsubtopic(subtopic.id)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faPlus} />
                                  </button>
                                  <button
                                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 border border-blue-700 rounded ml-1 w-8"
                                      onClick={() => toggleTableVisibility(`${topic.id}-${subtopic.id}`)}
                                    >
                                      {showTable[`${topic.id}-${subtopic.id}`] ? (
                                        <span>&lt;</span> // ไอคอนเปิด
                                      ) : (
                                        <span>&gt;</span> // ไอคอนปิด
                                      )}
                                    </button>
                                </div>
                              )}

                              {isAddingSubinsubtopic === subtopic.id && (
                                <div>
                                  <input
                                    className="border border-black"
                                    value={newTopic}
                                    onChange={(e) =>
                                      setNewTopic(e.target.value)
                                    }
                                  />
                                  <button
                                    class="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-1 border border-green-500 hover:border-transparent rounded"
                                    onClick={() => {
                                      handleAddsubTopic(subtopic.id, topic.id);
                                    }}
                                  >
                                    Add
                                  </button>
                                  <button
                                    className="border border-black"
                                    onClick={() =>
                                      setIsAddingSubinsubtopic(null)
                                    }
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                              {showTable[`${topic.id}-${subtopic.id}`] && (
                                <table className="mt-3 w-3/4 border border-gray-300 rounded-md">
                                  <thead>
                                    <tr className="bg-slate-500 text-white">
                                      <th className="border border-black">
                                        Subject Code
                                      </th>
                                      <th className="border border-black">
                                        Subject Name
                                      </th>
                                      <th className="border border-black">
                                        Credit
                                      </th>
                                      <th className="border border-black w-1">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {subtopic.tables.map((table) => (
                                      <tr key={table.id}>
                                        <td className="border border-black bg-yellow-100" style={{ height: '36.5px', width: '127.53px' }}>
                                          {editingTable === table.id ? (
                                            <input
                                              type="text"
                                              name="subjectCode"
                                              value={editValues.subjectCode}
                                              onChange={handleInputChange}
                                              className="w-full p-0 border border-gray-300 rounded-md"
                                              
                                            />
                                          ) : (
                                            <span
                                              className="cursor-pointer"
                                              onClick={() =>
                                                handleSubjectClick(
                                                  subtopic.id,
                                                  table.id,
                                                  table.subjectCode,
                                                  "subtopic",
                                                  topic.id
                                                )
                                              }
                                            >
                                              {table.subjectCode}
                                            </span>
                                          )}
                                        </td>
                                        <td className="border border-black bg-yellow-100">
                                          {editingTable === table.id ? (
                                            <input
                                              type="text"
                                              name="subjectNameENG"
                                              value={editValues.subjectNameENG}
                                              onChange={handleInputChange}
                                              className="w-full p-1 border border-gray-300 rounded-md"
                                            />
                                          ) : (
                                            table.subjectNameENG
                                          )}
                                        </td>
                                        <td className="border border-black bg-yellow-100">
                                          {editingTable === table.id ? (
                                            <input
                                              type="text"
                                              name="credit"
                                              value={editValues.credit}
                                              onChange={handleInputChange}
                                              className="w-full p-1 border border-gray-300 rounded-md"
                                            />
                                          ) : (
                                            table.credit
                                          )}
                                        </td>
                                        <td>
                                          {editingTable === table.id ? (
                                            <>
                                              <button
                                                className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-1 border border-green-500 hover:border-transparent rounded"
                                                onClick={() =>
                                                  handleSaveClick(
                                                    subtopic.id,
                                                    table.id,
                                                    topic.id
                                                  )
                                                }
                                              >
                                                Save
                                              </button>
                                              <button
                                                className="bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-1 px-1 border border-gray-500 hover:border-transparent rounded"
                                                onClick={handleCancelClick}
                                              >
                                                Cancel
                                              </button>
                                            </>
                                          ) : (
                                            <div className="mt-2 flex space-x-2">
                                              <button
                                                className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-1 border border-red-500 hover:border-transparent rounded"
                                                onClick={() =>
                                                  handleDeleteTableData(
                                                    subtopic.id,
                                                    table.id,
                                                    topic.id
                                                  )
                                                }
                                              >
                                                <FontAwesomeIcon icon={faTrash} />
                                              </button>
                                              <button
                                                className="bg-blue-500 text-white font-semibold px-2 py-1 rounded-md shadow-sm"
                                                onClick={() =>
                                                  handleEditClick(table)
                                                }
                                              >
                                                Edit
                                              </button>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <button
                                    className="bg-green-500 hover:bg-green-700"
                                    onClick={() =>
                                      handleAddTableData(subtopic.id, topic.id)
                                    }
                                  >
                                    Add Table
                                  </button>
                                  <button
                                    onClick={() =>
                                      document
                                        .getElementById(`fileInput-${topic.id}`)
                                        .click()
                                    }
                                  >
                                    Import
                                  </button>
                                  <input
                                    type="file"
                                    id={`fileInput-${topic.id}`}
                                    style={{ display: "none" }}
                                    onChange={(e) =>
                                      handleImportTableData(
                                        e,
                                        subtopic.id,
                                        topic.id
                                      )
                                    }
                                  />
                                </table>
                              )}
                              {isAddingTable[`${topic.id}-${subtopic.id}`] && (
                                <div>
                                  <input
                                    type="text"
                                    name="subjectCode"
                                    value={
                                      newTableData[`${topic.id}-${subtopic.id}`]
                                        ?.subjectCode || ""
                                    }
                                    onChange={(e) =>
                                      handleTableInputChange(
                                        `${topic.id}-${subtopic.id}`,
                                        e
                                      )
                                    }
                                    placeholder="Subject Code"
                                  />
                                  <input
                                    className="border border-black"
                                    type="text"
                                    name="subjectNameENG"
                                    value={
                                      newTableData[`${topic.id}-${subtopic.id}`]
                                        ?.subjectNameENG || ""
                                    }
                                    onChange={(e) =>
                                      handleTableInputChange(
                                        `${topic.id}-${subtopic.id}`,
                                        e
                                      )
                                    }
                                    placeholder="Subject NameENG"
                                  />
                                  <input
                                    className="border border-black"
                                    type="text"
                                    name="subjectNameTH"
                                    value={
                                      newTableData[`${topic.id}-${subtopic.id}`]
                                        ?.subjectNameTH || ""
                                    }
                                    onChange={(e) =>
                                      handleTableInputChange(
                                        `${topic.id}-${subtopic.id}`,
                                        e
                                      )
                                    }
                                    placeholder="Subject NameTH"
                                  />
                                  <input
                                    type="text"
                                    name="credit"
                                    value={
                                      newTableData[`${topic.id}-${subtopic.id}`]
                                        ?.credit || ""
                                    }
                                    onChange={(e) =>
                                      handleTableInputChange(
                                        `${topic.id}-${subtopic.id}`,
                                        e
                                      )
                                    }
                                    placeholder="Credit"
                                  />
                                  <button
                                    onClick={() =>
                                      handleSaveTableData(subtopic.id, topic.id)
                                    }
                                  >
                                    Save
                                  </button>
                                </div>
                              )}

                              {subtopic.subinsubtopics &&
                                subtopic.subinsubtopics
                                  .sort((a, b) => a.name.localeCompare(b.name)) // Sort subinsubtopics by name in ascending order
                                  .map((subinsubtopic) => (
                                    // console.log('subtopic:', subtopic);
                                    <div
                                      className="ml-8 mt-2"
                                      key={subinsubtopic.id}
                                    >
                                      {isEditing === subinsubtopic.id ? (
                                        <div>
                                          <input
                                            value={editTopic}
                                            onChange={(e) =>
                                              setEditTopic(e.target.value)
                                            }
                                          />
                                          <button
                                            class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-1 border border-blue-500 hover:border-transparent rounded"
                                            onClick={() =>
                                              handleUpdateTopic(
                                                subinsubtopic.id,
                                                subtopic.id
                                              )
                                            }
                                          >
                                            Save
                                          </button>
                                          <button
                                            class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-1 border border-blue-500 hover:border-transparent rounded"
                                            onClick={() => {
                                              setIsEditing(null);
                                              setEditTopic("");
                                            }}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <div>
                                          {subinsubtopic.name}
                                          <button
                                            class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-1 border border-blue-500 hover:border-transparent rounded ml-1"
                                            onClick={() => {
                                              setIsEditing(subinsubtopic.id);
                                              setEditTopic(subinsubtopic.name);
                                            }}
                                          >
                                            Edit
                                          </button>
                                          <button
                                            class="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-1 border border-red-500 hover:border-transparent rounded ml-2 w-8"
                                            onClick={() =>
                                              handleDeleteTopic(
                                                subinsubtopic.id,
                                                subtopic.id,
                                                topic.id
                                              )
                                            }
                                          >
                                            <FontAwesomeIcon icon={faTrash} />
                                          </button>
                                          <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 border border-blue-700 rounded ml-2 w-8"
                                            onClick={() => toggleTableVisibility(`${topic.id}-${subtopic.id}-${subinsubtopic.id}`)}
                                          >
                                            {showTable[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`] ? (
                                              <span>&lt;</span> // ไอคอนเปิด
                                            ) : (
                                              <span>&gt;</span> // ไอคอนปิด
                                            )}
                                          </button>
                                          {showTable[
                                            `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                          ] && (
                                            <table className="mt-3 border border-gray-300 rounded-md">
                                              <thead>
                                                <tr className="bg-slate-500 text-white">
                                                  <th className="border border-black">
                                                    Subject Code
                                                  </th>
                                                  <th className="border border-black">
                                                    Subject Name
                                                  </th>
                                                  <th className="border border-black">
                                                    Credit
                                                  </th>
                                                  <th className="border border-black w-1">
                                                    Actions
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {subinsubtopic.tables.map(
                                                  (table, idx) => (
                                                    <tr key={idx}>
                                                      <td className="border border-black bg-yellow-100">
                                                        {editingTable ===
                                                        table.id ? (
                                                          <input
                                                            type="text"
                                                            name="subjectCode"
                                                            value={
                                                              editValues.subjectCode
                                                            }
                                                            onChange={
                                                              handleInputChange
                                                            }
                                                          />
                                                        ) : (
                                                          <span
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                              handleSubjectClick(
                                                                subinsubtopic.id,
                                                                table.id,
                                                                table.subjectCode,
                                                                "subinsubtopic",
                                                                subtopic.id,
                                                                topic.id
                                                              )
                                                            }
                                                          >
                                                            {table.subjectCode}
                                                          </span>
                                                        )}
                                                      </td>
                                                      <td className="border border-black bg-yellow-100">
                                                        {editingTable ===
                                                        table.id ? (
                                                          <input
                                                            type="text"
                                                            name="subjectNameENG"
                                                            value={
                                                              editValues.subjectNameENG
                                                            }
                                                            onChange={
                                                              handleInputChange
                                                            }
                                                          />
                                                        ) : (
                                                          table.subjectNameENG
                                                        )}
                                                      </td>
                                                      <td className="border border-black bg-yellow-100">
                                                        {editingTable ===
                                                        table.id ? (
                                                          <input
                                                            type="text"
                                                            name="credit"
                                                            value={
                                                              editValues.credit
                                                            }
                                                            onChange={
                                                              handleInputChange
                                                            }
                                                          />
                                                        ) : (
                                                          table.credit
                                                        )}
                                                      </td>
                                                      <td>
                                                        {editingTable ===
                                                        table.id ? (
                                                          <>
                                                            <button
                                                              className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-1 border border-green-500 hover:border-transparent rounded"
                                                              onClick={() =>
                                                                handleSaveClick(
                                                                  subtopic.id,
                                                                  table.id,
                                                                  topic.id
                                                                )
                                                              }
                                                            >
                                                              Save
                                                            </button>
                                                            <button
                                                              className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-1 border border-red-500 hover:border-transparent rounded"
                                                              onClick={
                                                                handleCancelClick
                                                              }
                                                            >
                                                              Cancel
                                                            </button>
                                                          </>
                                                        ) : (
                                                          <div className="mt-2 flex space-x-2">
                                                            <button
                                                              className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-1 border border-red-500 hover:border-transparent rounded"
                                                              onClick={() =>
                                                                handleDeleteTableData(
                                                                  subtopic.id,
                                                                  table.id,
                                                                  topic.id
                                                                )
                                                              }
                                                            >
                                                              <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                            <button
                                                              className="bg-blue-500 text-white font-semibold px-2 py-1 rounded-md shadow-sm"
                                                              onClick={() =>
                                                                handleEditClick(
                                                                  table
                                                                )
                                                              }
                                                            >
                                                              Edit
                                                            </button>
                                                          </div>
                                                        )}
                                                      </td>
                                                    </tr>
                                                  )
                                                )}
                                              </tbody>
                                              <button
                                                className="bg-green-500 hover:bg-green-700"
                                                onClick={() =>
                                                  handleAddTableData(
                                                    subinsubtopic.id,
                                                    subtopic.id,
                                                    topic.id
                                                  )
                                                }
                                              >
                                                Add Table
                                              </button>
                                              <button
                                                onClick={() =>
                                                  document
                                                    .getElementById(
                                                      `fileInput-${topic.id}`
                                                    )
                                                    .click()
                                                }
                                              >
                                                Import
                                              </button>
                                              <input
                                                type="file"
                                                id={`fileInput-${topic.id}`}
                                                style={{ display: "none" }}
                                                onChange={(e) =>
                                                  handleImportTableData(
                                                    e,
                                                    subinsubtopic.id,
                                                    subtopic.id,
                                                    topic.id
                                                  )
                                                }
                                              />
                                            </table>
                                          )}
                                          {isAddingTable[
                                            `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                          ] && (
                                            <div>
                                              <input
                                                type="text"
                                                name="subjectCode"
                                                value={
                                                  newTableData[
                                                    `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                                  ]?.subjectCode || ""
                                                }
                                                onChange={(e) =>
                                                  handleTableInputChange(
                                                    `${topic.id}-${subtopic.id}-${subinsubtopic.id}`,
                                                    e
                                                  )
                                                }
                                                placeholder="Subject Code"
                                              />
                                              <input
                                                className="border border-black"
                                                type="text"
                                                name="subjectNameENG"
                                                value={
                                                  newTableData[
                                                    `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                                  ]?.subjectNameENG || ""
                                                }
                                                onChange={(e) =>
                                                  handleTableInputChange(
                                                    `${topic.id}-${subtopic.id}-${subinsubtopic.id}`,
                                                    e
                                                  )
                                                }
                                                placeholder="Subject NameENG"
                                              />
                                              <input
                                                className="border border-black"
                                                type="text"
                                                name="subjectNameTH"
                                                value={
                                                  newTableData[
                                                    `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                                  ]?.subjectNameTH || ""
                                                }
                                                onChange={(e) =>
                                                  handleTableInputChange(
                                                    `${topic.id}-${subtopic.id}-${subinsubtopic.id}`,
                                                    e
                                                  )
                                                }
                                                placeholder="Subject NameTH"
                                              />
                                              <input
                                                type="text"
                                                name="credit"
                                                value={
                                                  newTableData[
                                                    `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                                  ]?.credit || ""
                                                }
                                                onChange={(e) =>
                                                  handleTableInputChange(
                                                    `${topic.id}-${subtopic.id}-${subinsubtopic.id}`,
                                                    e
                                                  )
                                                }
                                                placeholder="Credit"
                                              />
                                              <button
                                                class="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-1 border border-green-500 hover:border-transparent rounded"
                                                onClick={() =>
                                                  handleSaveTableData(
                                                    subinsubtopic.id,
                                                    subtopic.id,
                                                    topic.id
                                                  )
                                                }
                                              >
                                                Save
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                            </div>
                          ))}
                    </div>
                  ))}
                <input
                  className="border border-black"
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                />
                <button
                  class="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-1 border border-green-500 hover:border-transparent rounded"
                  onClick={() => handleAddTopic()}
                >
                  Add Topic
                </button>
                 <div>
              {/* {selectedSubjectCode && (
                    <div className="bg-lime-300">
                      
                      <h3
                        ref={h3Ref}
                        className={`bg-lime-100 text-xl mt-4 p-2 ${
                          isFlashing ? "animate-flash" : ""
                        }`}
                      >                      
                        รายละเอียดหลักสูตรของวิชา {selectedSubjectCode}
                      </h3>
                      <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-4 mt-5">
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
                                  type="text"
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
                                  type="text"
                                  value={courseDescriptionENG}
                                  onChange={(e) =>
                                    setCourseDescriptionENG(e.target.value)
                                  }
                                  className="mt-0 p-1/2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                                  placeholder="Course Description (ENG)"
                                />
                              </div>
                              <div>
                                <label className="block font-bold">
                                  วิชาบังคับ:
                                </label>
                                <input
                                  type="text"
                                  value={requiredSubjects}
                                  onChange={(e) =>
                                    setRequiredSubjects(e.target.value)
                                  }
                                  className="mt-0 p-1/2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                                  placeholder="วิชาบังคับ"
                                />
                              </div>
                              <div>
                                <label className="block font-bold">
                                  เงื่อนไข:
                                </label>
                                <input
                                  type="text"
                                  value={conditions}
                                  onChange={(e) =>
                                    setConditions(e.target.value)
                                  }
                                  className="mt-0 p-1/2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                                  placeholder="เงื่อนไข"
                                />
                              </div>
                              <div>
                                <label className="block font-bold">
                                  ประเภทเกรด:
                                </label>
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
                                <strong>วิชาบังคับ:</strong>{" "}
                                {requiredSubjects}
                              </li>
                              <li className="mb-2">
                                <strong>เงื่อนไข:</strong> {conditions}
                              </li>
                              <li>
                                <strong>ประเภทเกรด:</strong> {gradeType}
                              </li>
                            </ul>
                          </div>
                        )}

                        <button
                          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
                          onClick={handleEditClickCLO}
                        >
                          {isEditing ? "ยกเลิก" : "แก้ไข"}
                        </button>
                      </div>

                      <ul className="bg-lime-300 p-4 rounded-xl shadow-md space-y-4">
                        <h3 className="bg-lime-100 text-xl p-2 rounded-md">
                          CLO ของวิชา {selectedSubjectCode}
                        </h3>
                        {closWithPLOs
                          .filter((clo) => clo.tableDataId === tableDataId)
                          .map((clo, index) => {
                            //console.log("Rendering CLO:", clo); // ตรวจสอบการเรนเดอร์ CLO
                            return (
                              <li
                                key={index}
                                className="bg-white p-4 rounded-md shadow-md"
                              >
                                <strong>CLO:</strong> {clo.name}, <br />
                                <strong>คำอธิบาย:</strong> {clo.description}, <br />
                                <strong>PLO:</strong> {clo.ploNumber} - {clo.ploDescription}
                              </li>
                            );
                          })}
                      </ul>
                      <button
                        className="mt-4 w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
                        onClick={() => setIsAddingCLO(!isAddingCLO)}
                      >
                        {isAddingCLO ? "ปิดการเพิ่ม CLO" : "เปิดการเพิ่ม CLO"}
                      </button>
                    </div>
                  )}
                  {isAddingCLO && (
                    <div className="bg-gray-100 p-4 rounded-md">
                      <h3 className="text-xl font-bold mb-4">
                        เพิ่ม CLO สำหรับ {selectedSubjectCode}
                      </h3>
                      <div className="flex flex-col space-y-4">
                        <div>
                          <label className="block font-bold">CLO ที่:</label>
                          <input
                            type="text"
                            value={newCLO}
                            onChange={(e) => setNewCLO(e.target.value)}
                            className="mt-0 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
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
                            className="mt-0 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                            placeholder="คำบรรยาย CLO"
                          />
                        </div>
                        <div>
                          <label className="block font-bold">เลือก PLO:</label>
                          <select
                            value={selectedPLO}
                            onChange={(e) => setSelectedPLO(e.target.value)}
                            className="mt-0 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
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
                        <div className="mt-6">
                          <h4 className="text-lg font-bold">
                            Import CLO จากไฟล์ Excel
                          </h4>
                          <input
                            type="file"
                            className="mt-2 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                            onChange={(e) =>
                              handleImportCLOWithTableDataId(e, tableDataId)
                            } // ส่ง tableDataId ที่ต้องการ
                          />
                        </div>
                      </div>
                    </div>
                  )} */}
                  <div>
                    <h2 className="text-center">
                      <span className="bg-green-500 text-white">PLOs</span>
                    </h2>
                    <table>
                      <thead>
                        <tr className="bg-slate-500 border-black border-gray-200 text-white">
                          <th className="border border-black">ลำดับ</th>
                          <th className="border border-black">
                            ผลลัพธ์การเรียนรู้ที่คาดหวังของหลักสูตร (PLOs)
                          </th>
                          <th className="border border-black">
                            Cognitive Domain{" "}
                          </th>
                          <th className="border border-black">
                            Psychomotor Domain (Skills)
                          </th>
                          <th className="border border-black">
                            Affective Domain (Attitude)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.PLO &&
                          data.PLO.sort((a, b) => a.number - b.number).map(
                            (plo, index) => (
                              <tr key={index}>
                                <td
                                  className="text-center border border-black cursor-pointer"
                                  onClick={() => handlePLOClick(plo)}
                                >
                                  PLO{plo.number}
                                </td>
                                <td
                                  className="border border-black cursor-pointer"
                                  onClick={() => handlePLOClick(plo)}
                                >
                                  {plo.description}
                                </td>
                                <td className="text-center border border-black">
                                  {plo.cognitiveDomain}
                                </td>
                                <td className="text-center border border-black">
                                  {plo.psychomotorDomain ? "✔" : ""}
                                </td>
                                <td className="text-center border border-black">
                                  {plo.affectiveDomain ? "✔" : ""}
                                </td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                    {/* Modal สำหรับแสดง CLO ที่เชื่อมโยงกับ PLO */}
                    {isModalOpen && selectPLO && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                          <h3 className="text-xl font-bold">CLOs for PLO {selectPLO.number}</h3>
                          {tableData.filter(tableDataItem => 
                            relatedCLOs.some(clo => clo.tableDataId === tableDataItem.id) // กรองเฉพาะ TableData ที่มี CLO
                          ).map((tableDataItem) => (
                            <div key={tableDataItem.id} className="mb-4">
                              <h4 className="font-semibold">{tableDataItem.subjectNameTH}</h4> 
                              <ul>
                                {relatedCLOs.filter((clo) => clo.tableDataId === tableDataItem.id) // ใช้ relatedCLOs ในการกรอง CLOs ตาม TableData ID
                                  .map((clo) => (
                                    <li key={clo.id} className="border-b py-2">
                                      <strong>{clo.name}</strong>: {clo.description}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ))}
                          {tableData.filter(tableDataItem => 
                            relatedCLOs.some(clo => clo.tableDataId === tableDataItem.id) // ตรวจสอบการกรองให้แน่ใจว่าไม่มีวิชาที่ไม่มี CLO
                          ).length === 0 && (
                            <p>ไม่มีวิชาที่มี CLO ที่เกี่ยวข้อง</p>
                          )}
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
                  <div>
                    <button
                      className="border border-black"
                      onClick={togglePLOSectionVisibility}
                    >
                      {showPLOSection ? "Hide Add PLOs" : "Show Add PLOs"}
                    </button>

                    {showPLOSection && (
                      <>
                        <div className="flex flex-col">
                          <h3>Add New PLO</h3>
                          <input
                            type="text"
                            placeholder="PLO Number"
                            value={newPLONumber}
                            onChange={(e) => setNewPLONumber(e.target.value)}
                          />
                          <textarea
                            className=""
                            type="text"
                            placeholder="PLO Description"
                            value={newPLODescription}
                            onChange={(e) =>
                              setNewPLODescription(e.target.value)
                            }
                          />
                        </div>
                        <select
                          value={cognitiveDomain}
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
                        <div>
                          <label>
                            Psychomotor Domain (S)
                            <input
                              type="checkbox"
                              checked={psychomotorDomain}
                              onChange={(e) =>
                                setPsychomotorDomain(e.target.checked)
                              }
                            />
                          </label>
                        </div>
                        <div>
                          <label>
                            Affective Domain (At)
                            <input
                              type="checkbox"
                              checked={affectiveDomain}
                              onChange={(e) =>
                                setAffectiveDomain(e.target.checked)
                              }
                            />
                          </label>
                        </div>
                        <button
                          className="border border-black"
                          onClick={addPLO}
                        >
                          Add PLO
                        </button>
                      </>
                    )}
                    <div>
                      <button
                        className="border border-black"
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoPage;

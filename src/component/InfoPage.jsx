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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
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
  const [isAddingSubsubinsubtopic, setIsAddingSubsubinsubtopic] =
    useState(null);
  const [isAddingTable, setIsAddingTable] = useState({});
  const [tables, setTables] = useState({});
  const [selectedPLOs, setSelectedPLOs] = useState([]);
  const [newTableData, setNewTableData] = useState({});
  const [showTable, setShowTable] = useState({});

  const [allPLOs, setAllPLOs] = useState([]);

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

  const [showPLOSection, setShowPLOSection] = useState(false);

  const [editingTable, setEditingTable] = useState(null);
  const [editValues, setEditValues] = useState({
    subjectCode: "",
    subjectNameENG: "",
    subjectNameTH: "",
    credit: "",
  });

  const queryParams = new URLSearchParams(location.search);
  const facultyId = queryParams.get("faculty");
  const levelEduId = queryParams.get("levelEdu");
  const departmentId = queryParams.get("department");
  const courseYearId = queryParams.get("courseYear");

  const [faculty, setFaculty] = useState("");
  const [levelEdu, setLevelEdu] = useState("");
  const [department, setDepartment] = useState("");
  const [courseYear, setCourseYear] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // สร้าง references สำหรับ collection และ documents
        const facultyDocRef = doc(db, `faculty/${facultyId}`);
        const levelEduDocRef = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}`
        );
        const departmentDocRef = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}`
        );
        const courseYearDocRef = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}`
        );

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
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [facultyId, levelEduId, departmentId, courseYearId]);

  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsCollection = collection(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`
        );
        const snapshot = await getDocs(topicsCollection);
        const topicsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
        // Fetching faculty, levelEdu, department, courseYear as before
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
    
        // Fetching Topics and Subtopics as before
        const topicsCollection = collection(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`
        );
        const topicsSnapshot = await getDocs(topicsCollection);
    
        const topicsWithSubtopics = await Promise.all(
          topicsSnapshot.docs.map(async (topicDoc) => {
            // Fetching Subtopics
            const subtopicsCollection = collection(
              db,
              `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics`
            );
            const subtopicsSnapshot = await getDocs(subtopicsCollection);
            const subtopics = subtopicsSnapshot.docs.map((subDoc) => ({
              ...subDoc.data(),
              id: subDoc.id,
            }));
    
            // Fetch Subinsubtopics and TableData for Subinsubtopics
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
                    const tableDataSnapshot = await getDocs(tableDataCollection);
                    const tables = tableDataSnapshot.docs.map((doc) => ({
                      ...doc.data(),
                      id: doc.id,
                    }));
    
                    // Fetch Subsubinsubtopics and TableData for Subsubinsubtopics
                    const subsubinsubtopicsCollection = collection(
                      db,
                      `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics/${subinsubtopic.id}/Subsubinsubtopics`
                    );
                    const subsubinsubtopicsSnapshot = await getDocs(
                      subsubinsubtopicsCollection
                    );
                    const subsubinsubtopics = subsubinsubtopicsSnapshot.docs.map(
                      (subsubinsubtopicDoc) => ({
                        ...subsubinsubtopicDoc.data(),
                        id: subsubinsubtopicDoc.id,
                      })
                    );
    
                    // Fetch TableData for Subsubinsubtopics
                    const subsubinsubtopicTableData = await Promise.all(
                      subsubinsubtopics.map(async (subsubinsubtopic) => {
                        const tableDataCollection = collection(
                          db,
                          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics/${subinsubtopic.id}/Subsubinsubtopics/${subsubinsubtopic.id}/TableData`
                        );
                        const tableDataSnapshot = await getDocs(tableDataCollection);
                        const tables = tableDataSnapshot.docs.map((doc) => ({
                          ...doc.data(),
                          id: doc.id,
                        }));
                        return { ...subsubinsubtopic, tables };
                      })
                    );
    
                    return {
                      ...subinsubtopic,
                      tables, // TableData for subinsubtopic
                      subsubinsubtopics: subsubinsubtopicTableData,
                    };
                  })
                );
    
                return {
                  ...subtopic,
                  subinsubtopics: subinsubtopicTableData,
                };
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
    
        // Set state with fetched data
        setData({
          faculty: facultyDoc.docs[0]?.data(),
          levelEdu: levelEduDoc.docs[0]?.data(),
          department: departmentDoc.docs[0]?.data(),
          courseYear: courseYearDoc.docs[0]?.data(),
        });
    
        setTopics(topicsWithSubtopics);
        fetchPLOs();
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

  const handleUpdateTopic = async (
    topicId,
    parentId = null,
    grandParentId = null,
    greatGrandParentId = null
  ) => {
    let path;

    // Determine the correct path based on the hierarchy
    if (greatGrandParentId) {
      // Update Subsubinsubtopic
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/Subsubinsubtopics/${topicId}`;
    } else if (grandParentId) {
      // Update Subinsubtopic
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${topicId}`;
    } else if (parentId) {
      // Update Subtopic
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}`;
    } else {
      // Update Topic
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}`;
    }

    const topicDoc = doc(db, path);
    await updateDoc(topicDoc, { name: editTopic });

    // Update state based on the hierarchy
    if (greatGrandParentId) {
      setTopics(
        topics.map((topic) =>
          topic.id === greatGrandParentId
            ? {
                ...topic,
                subtopics: topic.subtopics.map((subtopic) =>
                  subtopic.id === grandParentId
                    ? {
                        ...subtopic,
                        subinsubtopics: subtopic.subinsubtopics.map(
                          (subinsubtopic) =>
                            subinsubtopic.id === parentId
                              ? {
                                  ...subinsubtopic,
                                  subsubinsubtopics:
                                    subinsubtopic.subsubinsubtopics.map(
                                      (subsubinsubtopic) =>
                                        subsubinsubtopic.id === topicId
                                          ? {
                                              ...subsubinsubtopic,
                                              name: editTopic,
                                            }
                                          : subsubinsubtopic
                                    ),
                                }
                              : subinsubtopic
                        ),
                      }
                    : subtopic
                ),
              }
            : topic
        )
      );
    } else if (grandParentId) {
      setTopics(
        topics.map((topic) =>
          topic.id === grandParentId
            ? {
                ...topic,
                subtopics: topic.subtopics.map((subtopic) =>
                  subtopic.id === parentId
                    ? {
                        ...subtopic,
                        subinsubtopics: subtopic.subinsubtopics.map(
                          (subinsubtopic) =>
                            subinsubtopic.id === topicId
                              ? { ...subinsubtopic, name: editTopic }
                              : subinsubtopic
                        ),
                      }
                    : subtopic
                ),
              }
            : topic
        )
      );
    } else if (parentId) {
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
    grandParentId = null,
    greatGrandParentId = null
  ) => {
    let path;
    
    if (greatGrandParentId) {
      // This is for subsubinsubtopic
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/Subsubinsubtopics/${topicId}`;
    } else if (grandParentId) {
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
  
    if (greatGrandParentId) {
      // Update state for subsubinsubtopic
      setTopics(
        topics.map((topic) =>
          topic.id === greatGrandParentId
            ? {
                ...topic,
                subtopics: topic.subtopics.map((subtopic) =>
                  subtopic.id === grandParentId
                    ? {
                        ...subtopic,
                        subinsubtopics: subtopic.subinsubtopics.map((subinsubtopic) =>
                          subinsubtopic.id === parentId
                            ? {
                                ...subinsubtopic,
                                subsubinsubtopics: subinsubtopic.subsubinsubtopics.filter(
                                  (subsubinsubtopic) => subsubinsubtopic.id !== topicId
                                ),
                              }
                            : subinsubtopic
                        ),
                      }
                    : subtopic
                ),
              }
            : topic
        )
      );
    } else if (grandParentId) {
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
  

  const handleAddsubTopic = async (
    parentId,
    grandParentId = null,
    subinsubtopicId = null
  ) => {
    if (!newTopic) return;
    console.log("check path add", parentId, grandParentId, subinsubtopicId);
    let path;
    if (subinsubtopicId && grandParentId) {
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${subinsubtopicId}/Subsubinsubtopics`;
    } else if (grandParentId) {
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics`;
    } else {
      path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics`;
    }

    const subtopicsCollection = collection(db, path);
    const docRef = await addDoc(subtopicsCollection, { name: newTopic });

    if (subinsubtopicId && grandParentId) {
      setTopics(
        updateNestedTopics(topics, grandParentId, parentId, subinsubtopicId, {
          id: docRef.id,
          name: newTopic,
        })
      );
    }
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
    grandParentId,
    parentId,
    subinsubtopicId = null,
    newSubsubinsubtopic
  ) => {
    return topics.map((topic) => {
      if (topic.id === grandParentId) {
        return {
          ...topic,
          subtopics: topic.subtopics.map((subtopic) =>
            subtopic.id === parentId
              ? {
                  ...subtopic,
                  subinsubtopics: subtopic.subinsubtopics.map((subinsubtopic) =>
                    subinsubtopic.id === subinsubtopicId
                      ? {
                          ...subinsubtopic,
                          subsubinsubtopics: [
                            ...(subinsubtopic.subsubinsubtopics || []),
                            newSubsubinsubtopic,
                          ],
                        }
                      : subinsubtopic
                  ),
                }
              : subtopic
          ),
        };
      } else if (topic.id === parentId) {
        return {
          ...topic,
          subtopics: [
            ...(topic.subtopics || []),
            newSubsubinsubtopic, // For the case where parentId is the direct match
          ],
        };
      }
      return topic;
    });
  };

  const handleAddTableData = (
    topicId,
    parentId = null,
    grandParentId = null,
    greatGrandParentId = null // Add a parameter for subsubinsub
  ) => {
    console.log("check Add",topicId,parentId,grandParentId,greatGrandParentId)
    if (greatGrandParentId) {
      // Handle subsubinsub path
      setIsAddingTable({
        ...isAddingTable,
        [`${greatGrandParentId}-${grandParentId}-${parentId}-${topicId}`]: true,
      });
      setNewTableData({
        ...newTableData,
        [`${greatGrandParentId}-${grandParentId}-${parentId}-${topicId}`]: {
          subjectCode: "",
          subjectNameENG: "",
          subjectNameTH: "",
          credit: "",
        },
      });
    } else if (grandParentId) {
      // Handle subinsub path
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
      // Handle subtopic path
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
      // Handle topic path
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

  const handleCloseTable = (topicId, parentId = null, grandParentId = null, greatGrandParentId = null) => {
    if (greatGrandParentId) {
      setIsAddingTable({
        ...isAddingTable,
        [`${greatGrandParentId}-${grandParentId}-${parentId}-${topicId}`]: false,
      });
    } else if (grandParentId) {
      setIsAddingTable({
        ...isAddingTable,
        [`${grandParentId}-${parentId}-${topicId}`]: false,
      });
    } else if (parentId) {
      setIsAddingTable({ ...isAddingTable, [`${parentId}-${topicId}`]: false });
    } else {
      setIsAddingTable({ ...isAddingTable, [topicId]: false });
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
    grandParentId = null,
    greatGrandParentId = null
  ) => {
    let tablePath;
    let key;
  
    if (greatGrandParentId) {
      tablePath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/Subsubinsubtopics/${topicId}/TableData`;
      key = `${greatGrandParentId}-${grandParentId}-${parentId}-${topicId}`;
    } else if (grandParentId) {
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
    grandParentId = null,
    greatGrandParentId = null
  ) => {
    let tableDoc;
    let key;
  
    if (greatGrandParentId) {
      tableDoc = doc(
        db,
        `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/Subsubinsubtopics/${topicId}/TableData/${tableId}`
      );
      key = `${greatGrandParentId}-${grandParentId}-${parentId}-${topicId}`;
    } else if (grandParentId) {
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
  

  const handleEditClick = (table) => {
    console.log("Selected table for editing:", table);
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

  const handleSaveClick = async (
    tableId,
    topicId,
    parentId = null,
    grandParentId = null,
    greatGrandParentId = null
  ) => {
    try {
      const newData = {
        subjectCode: editValues.subjectCode,
        subjectNameENG: editValues.subjectNameENG,
        subjectNameTH: editValues.subjectNameTH,
        credit: editValues.credit,
      };
  
      let tableDoc;
  
      if (greatGrandParentId) {
        tableDoc = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/Subsubinsubtopics/${topicId}/TableData/${tableId}`
        );
      } else if (grandParentId) {
        tableDoc = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${topicId}/TableData/${tableId}`
        );
      } else if (parentId) {
        tableDoc = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}/TableData/${tableId}`
        );
      } else {
        tableDoc = doc(
          db,
          `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}/TableData/${tableId}`
        );
      }
  
      // Update the document in Firestore
      await updateDoc(tableDoc, newData);
  
      // Update local state to reflect the new data
      setTableData((prevData) => {
        const updatedData = prevData.map((table) =>
          table.id === tableId ? { ...table, ...newData } : table
        );
        console.log("Updated table data:", updatedData); // Log updated table data
        return updatedData; // Return updated data
      });
  
      console.log("Table data updated successfully for table ID:", tableId);
      setEditingTable(null); // Reset editing state
  
      // Reset editValues after save
      setEditValues({
        subjectCode: "",
        subjectNameENG: "",
        subjectNameTH: "",
        credit: "",
      });
    } catch (error) {
      console.error("Error saving table data:", error);
    }
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

  const [selectedGreatGreatGrandParentId, setSelectedGreatGreatGrandParentId] = useState(null);

  // ส่วนกดlink
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
    console.log(
      "tableId:",
      tableId,
      "subjectNameTH:",
      subjectNameTH,
      "subjectNameENG:",
      subjectNameENG
    );
    try {
      setSelectedSubjectCode(subjectCode);
      setSelectedSubjectId(parentId);
      setSelectedParentType(parentType);
      setSelectedParentId(parentId);
      setSelectedGrandParentId(grandParentId);
      setSelectedGreatGrandParentId(greatGrandParentId);
      setSelectedGreatGreatGrandParentId(greatGreatGrandParentId); // เก็บ greatGreatGrandParentId
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
        const topicsPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`;
  
        const topicCollection = collection(db, topicsPath);
        const topicSnapshot = await getDocs(topicCollection);
  
        let allCLOs = [];
        let allTableData = [];
  
        for (const topicDoc of topicSnapshot.docs) {
          const topicId = topicDoc.id;
  
          const tableDataCollection = collection(
            db,
            `${topicsPath}/${topicId}/TableData`
          );
          const tableDataSnapshot = await getDocs(tableDataCollection);
          const fetchedTableData = tableDataSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            parentTypeP: "topic",
            parentIdP: topicId, // Add parentId for reference
            grandParentIdP: null, // Add grandParentId for reference
            greatGrandParentId: null, // Add greatGrandParentId
            greatGreatGrandParentId: null
          }));
  
          const cloCollection = collection(db, `${topicsPath}/${topicId}/CLOs`);
          const cloSnapshot = await getDocs(cloCollection);
          const fetchedCLOs = cloSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          const subtopicsCollection = collection(
            db,
            `${topicsPath}/${topicId}/Subtopics`
          );
          const subtopicSnapshot = await getDocs(subtopicsCollection);
  
          for (const subtopicDoc of subtopicSnapshot.docs) {
            const subtopicId = subtopicDoc.id;
  
            const subtopicTableDataCollection = collection(
              db,
              `${topicsPath}/${topicId}/Subtopics/${subtopicId}/TableData`
            );
            const subtopicTableDataSnapshot = await getDocs(
              subtopicTableDataCollection
            );
            const fetchedSubtopicTableData = subtopicTableDataSnapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
                parentTypeP: "subtopic",
                parentIdP: subtopicId,  // Add parentId
                grandParentIdP: topicId, // Add grandParentId for reference
                greatGrandParentId: null, // Add greatGrandParentId
                greatGreatGrandParentId: null
              })
            );
  
            const subtopicCloCollection = collection(
              db,
              `${topicsPath}/${topicId}/Subtopics/${subtopicId}/CLOs`
            );
            const subtopicCloSnapshot = await getDocs(subtopicCloCollection);
            const fetchedSubtopicCLOs = subtopicCloSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
  
            const subinsubtopicsCollection = collection(
              db,
              `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics`
            );
            const subinsubtopicSnapshot = await getDocs(
              subinsubtopicsCollection
            );
  
            for (const subinsubtopicDoc of subinsubtopicSnapshot.docs) {
              const subinsubtopicId = subinsubtopicDoc.id;
  
              const subinsubtopicTableDataCollection = collection(
                db,
                `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/TableData`
              );
              const subinsubtopicTableDataSnapshot = await getDocs(
                subinsubtopicTableDataCollection
              );
              const fetchedSubinsubtopicTableData =
                subinsubtopicTableDataSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                  parentType: "subinsubtopic",
                  parentId: subinsubtopicId,  // Add parentId
                  grandParentId: subtopicId,  // Add grandParentId
                  greatGrandParentId: topicId, // Add greatGrandParentId
                  greatGreatGrandParentId: null
                }));
  
              const subinsubtopicCloCollection = collection(
                db,
                `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/CLOs`
              );
              const subinsubtopicCloSnapshot = await getDocs(
                subinsubtopicCloCollection
              );
              const fetchedSubinsubtopicCLOs = subinsubtopicCloSnapshot.docs.map(
                (doc) => ({
                  id: doc.id,
                  ...doc.data(),
                })
              );
  
              // เพิ่ม fetch สำหรับ subsubinsubtopics
              const subsubinsubtopicsCollection = collection(
                db,
                `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/Subsubinsubtopics`
              );
              const subsubinsubtopicSnapshot = await getDocs(
                subsubinsubtopicsCollection
              );
  
              for (const subsubinsubtopicDoc of subsubinsubtopicSnapshot.docs) {
                const subsubinsubtopicId = subsubinsubtopicDoc.id;
  
                // Fetch TableData for subsubinsubtopics
                const subsubinsubtopicTableDataCollection = collection(
                  db,
                  `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/Subsubinsubtopics/${subsubinsubtopicId}/TableData`
                );
                const subsubinsubtopicTableDataSnapshot = await getDocs(
                  subsubinsubtopicTableDataCollection
                );
                const fetchedSubsubinsubtopicTableData =
                  subsubinsubtopicTableDataSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    parentType: "subsubinsubtopic",
                    parentId: subsubinsubtopicId,  // Add parentId
                    grandParentId: subinsubtopicId,  // Add grandParentId
                    greatGrandParentId: subtopicId, // Add greatGrandParentId
                    greatGreatGrandParentId: topicId

                  }));
  
                // Fetch CLOs for subsubinsubtopics
                const subsubinsubtopicCloCollection = collection(
                  db,
                  `${topicsPath}/${topicId}/Subtopics/${subtopicId}/Subinsubtopics/${subinsubtopicId}/Subsubinsubtopics/${subsubinsubtopicId}/CLOs`
                );
                const subsubinsubtopicCloSnapshot = await getDocs(
                  subsubinsubtopicCloCollection
                );
                const fetchedSubsubinsubtopicCLOs =
                  subsubinsubtopicCloSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                  }));
  
                allTableData.push(...fetchedSubsubinsubtopicTableData);
                allCLOs.push(...fetchedSubsubinsubtopicCLOs);
              }
  
              allTableData.push(...fetchedSubinsubtopicTableData);
              allCLOs.push(...fetchedSubinsubtopicCLOs);
            }
  
            allTableData.push(...fetchedSubtopicTableData);
            allCLOs.push(...fetchedSubtopicCLOs);
          }
  
          allTableData.push(...fetchedTableData);
          allCLOs.push(...fetchedCLOs);
        }
  
        setTableData(allTableData);
        // console.log(allTableData)
        setCloData(allCLOs);
      } catch (error) {
        console.error("Error fetching all data: ", error);
      }
    };
  
    fetchAllCLOs();
  }, [facultyId, levelEduId, departmentId, courseYearId]);
   // เพิ่ม dependencies

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

  const togglePLOSectionVisibility = () => {
    setShowPLOSection((prevShow) => !prevShow);
  };

  const handleImportTableData = (
    event,
    topicId,
    parentId = null,
    grandParentId = null,
    greatGrandParentId = null // เพิ่ม parameter สำหรับ greatGrandParentId
  ) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
  
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
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
          greatGrandParentId, // ส่ง greatGrandParentId เข้าไปด้วย
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
    greatGrandParentId = null, // เพิ่ม parameter สำหรับ greatGrandParentId
    tableData
  ) => {
    let tablePath;
    let key;
  
    if (greatGrandParentId) {
      // Path สำหรับ subsubinsubtopics
      tablePath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/Subsubinsubtopics/${topicId}/TableData`;
      key = `${greatGrandParentId}-${grandParentId}-${parentId}-${topicId}`;
    } else if (grandParentId) {
      // Path สำหรับ subinsubtopics
      tablePath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${topicId}/TableData`;
      key = `${grandParentId}-${parentId}-${topicId}`;
    } else if (parentId) {
      // Path สำหรับ subtopics
      tablePath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}/TableData`;
      key = `${parentId}-${topicId}`;
    } else {
      // Path สำหรับ topics
      tablePath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}/TableData`;
      key = topicId;
    }
  
    // บันทึกข้อมูลลงใน Firestore
    const tableCollection = collection(db, tablePath);
    const docRef = await addDoc(tableCollection, tableData);
  
    // อัปเดต state ของ tables เพื่อให้สามารถแสดงผลได้ถูกต้อง
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
            const ploIds = Array.isArray(clo.ploId) ? clo.ploId : [clo.ploId];
            console.log("กำลังดึง PLO สำหรับ CLO:", clo);

            const ploDataList = await Promise.all(
              ploIds.map(async (id) => {
                const plo = await getPloById(id);
                // console.log("PLO ที่ดึงมา:", plo);
                return plo ? plo : { number: "Unknown", description: "Unknown" };
              })
            );

            // console.log("PLO Data List สำหรับ CLO:", ploDataList);
            // const plo = await getPloById(clo.ploId);
            // console.log("PLO fetched:", plo);

            return {
              ...clo,
              ploData: ploDataList, // เก็บข้อมูล PLO หลายตัวในรูปแบบ array

              // ...clo,
              // ploNumber: plo ? plo.number : "Unknown", // เพิ่มการตรวจสอบว่า PLO มีข้อมูลหรือไม่
              // ploDescription: plo ? plo.description : "Unknown",
            };
          })
      );

      //console.log("Updated CLOs with PLO data:", updatedCLOs); // ตรวจสอบข้อมูลหลังการอัพเดต

      setClosWithPLOs(updatedCLOs);
    };

    fetchPLOsForCLOs();
  }, [selectedSubjectCLOs, tableDataId]);

  const { logout } = useAuth();

  const goToPLOPage = () => {
    // Pass only serializable data like objects or arrays, not functions
    console.log("check",facultyId,
      levelEduId,
      departmentId,
      courseYearId,)
    navigate("/plos", {
      state: {
        facultyId,
        levelEduId,
        departmentId,
        courseYearId,
        // data,
        tableData,
        cloData
      }
    });
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div class="bg-gradient-to-b from-green-500 to-white min-h-screen p-10">
      <div className="flex justify-center text-center mb-8">
        <h1 className="bg-green-400 p-6 w-3/5 rounded-lg shadow-lg text-3xl font-bold">
          Info Page
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
            <div className="flex flex-col w-full p-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 shadow-sm bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">คณะ: {faculty}</h2>
                <h3 className="text-xl font-semibold text-gray-800">ระดับการศึกษา: {levelEdu}</h3>
                <h4 className="text-xl font-semibold text-gray-800">ภาควิชา: {department}</h4>
                <h5 className="text-xl font-semibold text-gray-800">หลักสูตรปี: {courseYear}</h5>
              </div>

                <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-md space-y-4">
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
                                  isAddingSubtopic === topic.id
                                    ? null
                                    : topic.id
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
                                <span>...</span> // ไอคอนเปิด
                              ) : (
                                <span>...</span> // ไอคอนปิด
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
                                  รหัสวิชา
                                </th>
                                <th className="border border-black ">
                                  ชื่อวิชา
                                </th>
                                <th className="border border-black ">
                                  หน่วยกิต
                                </th>
                                <th className="border border-black w-1 ">
                                  ลบ/แก้ไข
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {topics.map((topic) =>
                                topic.tables
                                  .sort((a, b) =>
                                    a.subjectCode.localeCompare(b.subjectCode)
                                  )
                                  .map((table, idx) => (
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
                                                table.subjectNameTH,
                                                table.subjectNameENG,
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
                                                handleSaveClick(
                                                  table.id,
                                                  topic.id
                                                )
                                              }
                                            >
                                              Save
                                            </button>
                                            <button
                                              className="bg-red-500 text-white font-semibold px-3 py-1 rounded-md shadow-sm"
                                              onClick={() =>
                                                setEditingTable(null)
                                              }
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
                              onChange={(e) =>
                                handleImportTableData(e, topic.id)
                              }
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
                              value={
                                newTableData[topic.id]?.subjectNameENG || ""
                              }
                              onChange={(e) =>
                                handleTableInputChange(topic.id, e)
                              }
                              placeholder="Subject NameENG"
                            />
                            <input
                              className="border border-black"
                              type="text"
                              name="subjectNameTH"
                              value={
                                newTableData[topic.id]?.subjectNameTH || ""
                              }
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
                            <button
                              onClick={() => handleSaveTableData(topic.id)}
                            >
                              Save
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-1 rounded"
                              onClick={() =>
                                handleCloseTable(
                                  topic.id
                                )
                              }
                            >
                              Close
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
                                      onClick={() =>
                                        toggleTableVisibility(
                                          `${topic.id}-${subtopic.id}`
                                        )
                                      }
                                    >
                                      {showTable[
                                        `${topic.id}-${subtopic.id}`
                                      ] ? (
                                        <span>...</span> // ไอคอนเปิด
                                      ) : (
                                        <span>...</span> // ไอคอนปิด
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
                                        handleAddsubTopic(
                                          subtopic.id,
                                          topic.id
                                        );
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
                                          รหัสวิชา
                                        </th>
                                        <th className="border border-black">
                                          ชื่อวิชา
                                        </th>
                                        <th className="border border-black">
                                          หน่วยกิต
                                        </th>
                                        <th className="border border-black w-1">
                                          ลบ/แก้ไข
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {subtopic.tables
                                        .sort((a, b) =>
                                          a.subjectCode.localeCompare(
                                            b.subjectCode
                                          )
                                        )
                                        .map((table) => (
                                          <tr key={table.id}>
                                            <td
                                              className="border border-black bg-yellow-100"
                                              style={{
                                                height: "36.5px",
                                                width: "127.53px",
                                              }}
                                            >
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
                                                      table.subjectNameTH,
                                                      table.subjectNameENG,
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
                                                  value={
                                                    editValues.subjectNameENG
                                                  }
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
                                                        table.id,
                                                        topic.id,
                                                        parentId
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
                                                    <FontAwesomeIcon
                                                      icon={faTrash}
                                                    />
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
                                        handleAddTableData(
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
                                          subtopic.id,
                                          topic.id
                                        )
                                      }
                                    />
                                  </table>
                                )}
                                {isAddingTable[
                                  `${topic.id}-${subtopic.id}`
                                ] && (
                                  <div>
                                    <input
                                      type="text"
                                      name="subjectCode"
                                      value={
                                        newTableData[
                                          `${topic.id}-${subtopic.id}`
                                        ]?.subjectCode || ""
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
                                        newTableData[
                                          `${topic.id}-${subtopic.id}`
                                        ]?.subjectNameENG || ""
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
                                        newTableData[
                                          `${topic.id}-${subtopic.id}`
                                        ]?.subjectNameTH || ""
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
                                        newTableData[
                                          `${topic.id}-${subtopic.id}`
                                        ]?.credit || ""
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
                                        handleSaveTableData(
                                          subtopic.id,
                                          topic.id
                                        )
                                      }
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-1 rounded"
                                      onClick={() =>
                                        handleCloseTable(
                                          subtopic.id,
                                          topic.id
                                        )
                                      }
                                    >
                                      Close
                                    </button>
                                  </div>
                                )}
                                {subtopic.subinsubtopics &&
                                  subtopic.subinsubtopics
                                    .sort((a, b) =>
                                      a.name.localeCompare(b.name)
                                    ) // Sort subinsubtopics by name in ascending order
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
                                                  subtopic.id,
                                                  topic.id
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
                                                setEditTopic(
                                                  subinsubtopic.name
                                                );
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
                                              class="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-1 border border-green-500 hover:border-transparent rounded ml-2 mr-1 w-8"
                                              onClick={() =>
                                                setIsAddingSubsubinsubtopic(
                                                  subinsubtopic.id
                                                )
                                              }
                                            >
                                              <FontAwesomeIcon icon={faPlus} />
                                            </button>
                                            <button
                                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 border border-blue-700 rounded ml-2 w-8"
                                              onClick={() =>
                                                toggleTableVisibility(
                                                  `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                                )
                                              }
                                            >
                                              {showTable[
                                                `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                              ] ? (
                                                <span>...</span> // ไอคอนเปิด
                                              ) : (
                                                <span>...</span> // ไอคอนปิด
                                              )}
                                            </button>
                                          </div>
                                        )}
                                        {isAddingSubsubinsubtopic ===
                                          subinsubtopic.id && (
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
                                                handleAddsubTopic(
                                                  subinsubtopic.id,
                                                  subtopic.id,
                                                  topic.id,
                                                );
                                              }}
                                            >
                                              Add
                                            </button>
                                            <button
                                              className="border border-black"
                                              onClick={() =>
                                                setIsAddingSubsubinsubtopic(
                                                  null
                                                )
                                              }
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        )}
                                        {showTable[
                                          `${topic.id}-${subtopic.id}-${subinsubtopic.id}`
                                        ] && (
                                          <table className="mt-3 border border-gray-300 rounded-md">
                                            <thead>
                                              <tr className="bg-slate-500 text-white">
                                                <th className="border border-black">
                                                  รหัสวิชา
                                                </th>
                                                <th className="border border-black">
                                                  ชื่อวิชา
                                                </th>
                                                <th className="border border-black">
                                                  หน่วยกิต
                                                </th>
                                                <th className="border border-black w-1">
                                                  Actions
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                            {subinsubtopic.tables && Array.isArray(subinsubtopic.tables) &&
                                            subinsubtopic.tables
                                                .sort((a, b) =>
                                                  a.subjectCode.localeCompare(
                                                    b.subjectCode
                                                  )
                                                )
                                                .map((table, idx) => (
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
                                                              table.subjectNameTH,
                                                              table.subjectNameENG,
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
                                                                table.id,
                                                                topic.id,
                                                                parentId,
                                                                grandParentId
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
                                                                subinsubtopic.id,
                                                                table.id,
                                                                subtopic.id,
                                                                topic.id
                                                              )
                                                            }
                                                          >
                                                            <FontAwesomeIcon
                                                              icon={faTrash}
                                                            />
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
                                                ))}
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
                                            <button
                                              className="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-1 rounded"
                                              onClick={() =>
                                                handleCloseTable(
                                                  subinsubtopic.id,
                                                  subtopic.id,
                                                  topic.id
                                                )
                                              }
                                            >
                                              Close
                                            </button>
                                          </div>
                                        )}
                                        {subinsubtopic.subsubinsubtopics &&
                                          subinsubtopic.subsubinsubtopics
                                            .sort((a, b) =>
                                              a.name.localeCompare(b.name)
                                            )
                                            .map((subsubinsubtopic) => (
                                              <div
                                                className="ml-8 mt-2"
                                                key={subsubinsubtopic.id}
                                              >
                                                {isEditing ===
                                                subsubinsubtopic.id ? (
                                                  <div>
                                                    <input
                                                      value={editTopic}
                                                      onChange={(e) =>
                                                        setEditTopic(
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                    <button
                                                      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-1 border border-blue-500 hover:border-transparent rounded"
                                                      onClick={() =>
                                                        handleUpdateTopic(
                                                          subsubinsubtopic.id,
                                                          subinsubtopic.id,
                                                          subtopic.id,
                                                          topic.id
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
                                                    {subsubinsubtopic.name}
                                                    <button
                                                      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-1 border border-blue-500 hover:border-transparent rounded ml-1"
                                                      onClick={() => {
                                                        setIsEditing(
                                                          subsubinsubtopic.id
                                                        );
                                                        setEditTopic(
                                                          subsubinsubtopic.name
                                                        );
                                                      }}
                                                    >
                                                      Edit
                                                    </button>
                                                    <button
                                                      class="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-1 border border-red-500 hover:border-transparent rounded ml-2 w-8"
                                                      onClick={() =>
                                                        handleDeleteTopic(
                                                          subsubinsubtopic.id,
                                                          subinsubtopic.id,
                                                          subtopic.id,
                                                          topic.id
                                                        )
                                                      }
                                                    >
                                                      <FontAwesomeIcon
                                                        icon={faTrash}
                                                      />
                                                    </button>
                                                    <button
                                                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 border border-blue-700 rounded ml-2 w-8"
                                                      onClick={() =>
                                                        toggleTableVisibility(
                                                          `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`
                                                        )
                                                      }
                                                    >
                                                      {showTable[
                                                        `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`
                                                      ] ? (
                                                        <span>...</span> // ไอคอนเปิด
                                                      ) : (
                                                        <span>...</span> // ไอคอนปิด
                                                      )}
                                                    </button>
                                                  </div>
                                                )}
                                                {showTable[
                                                  `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`
                                                ] && (
                                                  <table className="mt-3 border border-gray-300 rounded-md">
                                                    <thead>
                                                      <tr className="bg-slate-500 text-white">
                                                        <th className="border border-black">
                                                          รหัสวิชา
                                                        </th>
                                                        <th className="border border-black">
                                                          ชื่อวิชา
                                                        </th>
                                                        <th className="border border-black">
                                                          หน่วยกิต
                                                        </th>
                                                        <th className="border border-black w-1">
                                                          ลบ/แก้ไข
                                                        </th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {subsubinsubtopic.tables
                                                        .sort((a, b) =>
                                                          a.subjectCode.localeCompare(
                                                            b.subjectCode
                                                          )
                                                        )
                                                        .map((table, idx) => (
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
                                                                      subsubinsubtopic.id,
                                                                      table.id,
                                                                      table.subjectCode,
                                                                      table.subjectNameTH,
                                                                      table.subjectNameENG,
                                                                      "subsubinsubtopic",
                                                                      subinsubtopic.id,
                                                                      subtopic.id,
                                                                      topic.id
                                                                    )
                                                                  }
                                                                >
                                                                  {
                                                                    table.subjectCode
                                                                  }
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
                                                                        table.id,
                                                                        topic.id,
                                                                        parentId,
                                                                        grandParentId,
                                                                        greatGrandParentId
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
                                                                        subsubinsubtopic.id,
                                                                        subinsubtopic.id,
                                                                        table.id,
                                                                        subtopic.id,
                                                                        topic.id
                                                                      )
                                                                    }
                                                                  >
                                                                    <FontAwesomeIcon
                                                                      icon={
                                                                        faTrash
                                                                      }
                                                                    />
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
                                                        ))}
                                                    </tbody>
                                                    <button
                                                      className="bg-green-500 hover:bg-green-700"
                                                      onClick={() =>
                                                        handleAddTableData(
                                                          subsubinsubtopic.id,
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
                                                      style={{
                                                        display: "none",
                                                      }}
                                                      onChange={(e) =>
                                                        handleImportTableData(
                                                          e,
                                                          subsubinsubtopic.id,
                                                          subinsubtopic.id,
                                                          subtopic.id,
                                                          topic.id
                                                        )
                                                      }
                                                    />
                                                  </table>
                                                )}
                                                {isAddingTable[
                                                  `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`
                                                ] && (
                                                  <div>
                                                    <input
                                                      type="text"
                                                      name="subjectCode"
                                                      value={
                                                        newTableData[
                                                          `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`
                                                        ]?.subjectCode || ""
                                                      }
                                                      onChange={(e) =>
                                                        handleTableInputChange(
                                                          `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`,
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
                                                          `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`
                                                        ]?.subjectNameENG || ""
                                                      }
                                                      onChange={(e) =>
                                                        handleTableInputChange(
                                                          `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`,
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
                                                          `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`
                                                        ]?.subjectNameTH || ""
                                                      }
                                                      onChange={(e) =>
                                                        handleTableInputChange(
                                                          `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`,
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
                                                          `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`
                                                        ]?.credit || ""
                                                      }
                                                      onChange={(e) =>
                                                        handleTableInputChange(
                                                          `${topic.id}-${subtopic.id}-${subinsubtopic.id}-${subsubinsubtopic.id}`,
                                                          e
                                                        )
                                                      }
                                                      placeholder="Credit"
                                                    />
                                                    <button
                                                      class="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-1 border border-green-500 hover:border-transparent rounded"
                                                      onClick={() =>
                                                        handleSaveTableData(
                                                          subsubinsubtopic.id,
                                                          subinsubtopic.id,
                                                          subtopic.id,
                                                          topic.id
                                                        )
                                                      }
                                                    >
                                                      Save
                                                    </button>
                                                    <button
                                                      className="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-1 rounded"
                                                      onClick={() =>
                                                        handleCloseTable(
                                                          subsubinsubtopic.id,
                                                          subinsubtopic.id,
                                                          subtopic.id,
                                                          topic.id
                                                        )
                                                      }
                                                    >
                                                      Close
                                                  </button>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
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
                  <button
                      onClick={goToPLOPage}
                      className="bg-blue-500 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 items-center justify-center"
                    >
                      ดู PLOs
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
{/**/}
export default InfoPage;

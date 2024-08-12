import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import classes from './InfoPage.module.css'

function InfoPage() {
  const location = useLocation();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editTopic, setEditTopic] = useState('');
  const [isAddingSubtopic, setIsAddingSubtopic] = useState(null);
  const [isAddingSubinsubtopic, setIsAddingSubinsubtopic] = useState(null);
  const [isAddingTable, setIsAddingTable] = useState({});
  const [tables, setTables] = useState({});
  const [selectedPLOs, setSelectedPLOs] = useState([]);
  const [newTableData, setNewTableData] = useState({});
  const [showTable, setShowTable] = useState({});

  const [newPLONumber, setNewPLONumber] = useState('');
  const [newPLODescription, setNewPLODescription] = useState('');
  const [cognitiveDomain, setCognitiveDomain] = useState('');
  const [psychomotorDomain, setPsychomotorDomain] = useState(false);
  const [affectiveDomain, setAffectiveDomain] = useState(false);

  const [allPLOs, setAllPLOs] = useState([]);

  const [newCLO, setNewCLO] = useState(''); // ชื่อของ CLO ใหม่
  const [cloDescription, setCLODescription] = useState(''); // คำบรรยายของ CLO
  const [selectedPLO, setSelectedPLO] = useState(''); // PLO ที่เลือก
  const [isAddingCLO, setIsAddingCLO] = useState(false); // เปิด/ปิดฟอร์มเพิ่ม CLO
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedParentType, setSelectedParentType] = useState('topic');
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedGrandParentId, setSelectedGrandParentId] = useState(null);
  const [selectedGreatGrandParentId, setSelectedGreatGrandParentId] = useState(null);
  const [tableDataId, setTableDataId] = useState(null); // ID ของ TableData ที่เกี่ยวข้อง

  const [selectedSubjectCLOs, setSelectedSubjectCLOs] = useState([]);
  const [selectedSubjectPLOs, setSelectedSubjectPLOs] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(null);

  const [courseDescriptionTH, setCourseDescriptionTH] = useState('');
  const [courseDescriptionENG, setCourseDescriptionENG] = useState('');
  const [requiredSubjects, setRequiredSubjects] = useState('');
  const [conditions, setConditions] = useState('');
  const [gradeType, setGradeType] = useState('');

  const [showPLOSection, setShowPLOSection] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const facultyId = queryParams.get('faculty');
  const levelEduId = queryParams.get('levelEdu');
  const departmentId = queryParams.get('department');
  const courseYearId = queryParams.get('courseYear');

  useEffect(() => {
    if (!facultyId || !levelEduId || !departmentId || !courseYearId) {
      console.error('One or more query parameters are missing.');
      setLoading(false);
      return;
    }

    const fetchPLOsall = async () => {
    try {
      const PLOCollectionRef = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`);
      const PLOsSnapshot = await getDocs(PLOCollectionRef);
      const PLOs = PLOsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setAllPLOs(PLOs);
    } catch (error) {
      console.error('Error fetching PLOs: ', error);
    }
    };


    const fetchData = async () => {
      try {
        const facultyDoc = await getDocs(collection(db, `faculty`), doc(db, `faculty/${facultyId}`));
        const levelEduDoc = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu`), doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}`));
        const departmentDoc = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department`), doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}`));
        const courseYearDoc = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear`), doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}`));
        
        const topicsCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`);
        const topicsSnapshot = await getDocs(topicsCollection);

        const topicsWithSubtopics = await Promise.all(
          topicsSnapshot.docs.map(async (topicDoc) => {
            const subtopicsCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics`);
            const subtopicsSnapshot = await getDocs(subtopicsCollection);
            const subtopics = subtopicsSnapshot.docs.map(subDoc => ({ ...subDoc.data(), id: subDoc.id }));
  
            const subtopicsWithSubinsubtopics = await Promise.all(
              subtopics.map(async (subtopic) => {
                const subinsubtopicsCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics`);
                const subinsubtopicsSnapshot = await getDocs(subinsubtopicsCollection);
                const subinsubtopics = subinsubtopicsSnapshot.docs.map(subinsubtopicDoc => ({ ...subinsubtopicDoc.data(), id: subinsubtopicDoc.id }));
  
                // Fetch TableData for Subinsubtopics
                const subinsubtopicTableData = await Promise.all(
                  subinsubtopics.map(async (subinsubtopic) => {
                    const tableDataCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/Subinsubtopics/${subinsubtopic.id}/TableData`);
                    const tableDataSnapshot = await getDocs(tableDataCollection);
                    const tables = tableDataSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                    return { ...subinsubtopic, tables };
                  })
                );
  
                return { ...subtopic, subinsubtopics: subinsubtopicTableData };
              })
            );
  
            // Fetch TableData for Subtopics
            const subtopicTableData = await Promise.all(
              subtopicsWithSubinsubtopics.map(async (subtopic) => {
                const tableDataCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/Subtopics/${subtopic.id}/TableData`);
                const tableDataSnapshot = await getDocs(tableDataCollection);
                const tables = tableDataSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                return { ...subtopic, tables };
              })
            );
  
            // Fetch TableData for Topics
            const tableDataCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicDoc.id}/TableData`);
            const tableDataSnapshot = await getDocs(tableDataCollection);
            const tables = tableDataSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  
            return { ...topicDoc.data(), id: topicDoc.id, subtopics: subtopicTableData, tables };
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
        console.error('Error fetching data: ', error);
      } finally {
        setLoading(false);
      }
    };

    

    fetchPLOsall();
    fetchData();
  }, [facultyId, levelEduId, departmentId, courseYearId]);

  const handleAddTopic = async (parentId = null) => {
    if (!newTopic) return;
    const path = parentId ? `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics` : `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`;
    const topicsCollection = collection(db, path);
    const docRef = await addDoc(topicsCollection, { name: newTopic });
    if (parentId) {
      setTopics(topics.map(topic => topic.id === parentId ? { ...topic, subtopics: [...(topic.subtopics || []), { id: docRef.id, name: newTopic }] } : topic));
    } else {
      setTopics([...topics, { id: docRef.id, name: newTopic, subtopics: [] }]);
    }
    setNewTopic('');
  };

  const handleUpdateTopic = async (topicId, parentId = null) => {
    const path = parentId ? `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}` : `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}`;
    const topicDoc = doc(db, path);
    await updateDoc(topicDoc, { name: editTopic });
    if (parentId) {
      setTopics(topics.map(topic => topic.id === parentId ? { ...topic, subtopics: topic.subtopics.map(subtopic => subtopic.id === topicId ? { ...subtopic, name: editTopic } : subtopic) } : topic));
    } else {
      setTopics(topics.map(topic => topic.id === topicId ? { ...topic, name: editTopic } : topic));
    }
    setIsEditing(null);
    setEditTopic('');
  };

  const handleDeleteTopic = async (topicId, parentId = null, grandParentId = null) => {
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
      setTopics(topics.map(topic => topic.id === grandParentId ? {
        ...topic,
        subtopics: topic.subtopics.map(subtopic => subtopic.id === parentId ? {
          ...subtopic,
          subinsubtopics: subtopic.subinsubtopics.filter(subinsubtopic => subinsubtopic.id !== topicId)
        } : subtopic)
      } : topic));
    } else if (parentId) {
      // Update state for subtopic
      setTopics(topics.map(topic => topic.id === parentId ? {
        ...topic,
        subtopics: topic.subtopics.filter(subtopic => subtopic.id !== topicId)
      } : topic));
    } else {
      // Update state for main topic
      setTopics(topics.filter(topic => topic.id !== topicId));
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
      setTopics(updateNestedTopics(topics, grandParentId, parentId, { id: docRef.id, name: newTopic }));
    } else {
      setTopics(updateNestedTopics(topics, parentId, { id: docRef.id, name: newTopic }));
    }
  
    setNewTopic('');
    setIsAddingSubtopic(null);
  };
  
  const updateNestedTopics = (topics, parentId, grandParentId = null, newSubtopic) => {
    return topics.map(topic => {
      if (topic.id === (grandParentId || parentId)) {
        if (grandParentId) {
          return {
            ...topic,
            subtopics: topic.subtopics.map(subtopic => 
              subtopic.id === parentId 
              ? { ...subtopic, subtopics: [...(subtopic.subtopics || []), newSubtopic] } 
              : subtopic
            )
          };
        } else {
          return {
            ...topic,
            subtopics: [...(topic.subtopics || []), newSubtopic]
          };
        }
      } else if (topic.subtopic && topic.subtopic.length > 0) {
        return {
          ...topic,
          subtopic: updateNestedTopics(topic.subtopics, parentId, grandParentId, newSubtopic)
        }
      } else {
        return topic;
      }
    });
  };

  const handleAddTableData = (topicId, parentId = null, grandParentId = null) => {
    if (grandParentId) {
      setIsAddingTable({ ...isAddingTable, [`${grandParentId}-${parentId}-${topicId}`]: true });
      setNewTableData({ ...newTableData, [`${grandParentId}-${parentId}-${topicId}`]: { subjectCode: '', subjectName: '', credit: '' } });
    } else if (parentId) {
      setIsAddingTable({ ...isAddingTable, [`${parentId}-${topicId}`]: true });
      setNewTableData({ ...newTableData, [`${parentId}-${topicId}`]: { subjectCode: '', subjectName: '', credit: '' } });
    } else {
      setIsAddingTable({ ...isAddingTable, [topicId]: true });
      setNewTableData({ ...newTableData, [topicId]: { subjectCode: '', subjectName: '', credit: '' } });
    }
  };

  const handleTableInputChange = (tableId, event) => {
    const { name, value } = event.target;
    setNewTableData((prevData) => ({
      ...prevData,
      [tableId]: {
        ...prevData[tableId],
        [name]: value,
      },
    }));
  };

  const handleSaveTableData = async (topicId, parentId = null, grandParentId = null) => {
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
      [key]: [...(prevTables[key] || []), { ...newTableData[key], id: docRef.id }],
    }));
    setIsAddingTable({ ...isAddingTable, [key]: false });
    setNewTableData((prevData) => ({
      ...prevData,
      [key]: { subjectCode: '', subjectName: '', credit: '' },
    }));
  };

  const handleDeleteTableData = async (topicId, tableId, parentId = null, grandParentId = null) => {
    let tableDoc;
    let key;

    if (grandParentId) {
      tableDoc = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${topicId}/TableData/${tableId}`);
      key = `${grandParentId}-${parentId}-${topicId}`;
    } else if (parentId) {
      tableDoc = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}/TableData/${tableId}`);
      key = `${parentId}-${topicId}`;
    } else {
      tableDoc = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}/TableData/${tableId}`);
      key = topicId;
    }

    await deleteDoc(tableDoc);
    setTables((prevTables) => ({
      ...prevTables,
      [key]: prevTables[key].filter((table) => table.id !== tableId),
    }));
  };

  const handleEditTableData = async (topicId, tableId, newData, parentId = null, grandParentId = null) => {
    let tableDoc;
    let key;

    if (grandParentId) {
      tableDoc = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${topicId}/TableData/${tableId}`);
      key = `${grandParentId}-${parentId}-${topicId}`;
    } else if (parentId) {
      tableDoc = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}/TableData/${tableId}`);
      key = `${parentId}-${topicId}`;
    } else {
      tableDoc = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}/TableData/${tableId}`);
      key = topicId;
    }

    await updateDoc(tableDoc, newData);
    setTables((prevTables) => ({
      ...prevTables,
      [key]: prevTables[key].map((table) => (table.id === tableId ? { ...table, ...newData } : table)),
    }));
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
      console.error('PLO number or description is missing.');
      return;
    }

    const newPLO = { 
      number: newPLONumber, 
      description: newPLODescription,
      cognitiveDomain,
      psychomotorDomain,
      affectiveDomain 
    };
    
    try {
      const PLOCollectionRef = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`);
      await addDoc(PLOCollectionRef, newPLO);

      const PLOSnapshot = await getDocs(PLOCollectionRef);
      const PLOs = PLOSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setData(prev => ({ ...prev, PLO: PLOs }));

      setNewPLONumber('');
      setNewPLODescription('');
      setCognitiveDomain('');
      setPsychomotorDomain(false);
      setAffectiveDomain(false);
    } catch (error) {
      console.error('Error adding PLO: ', error);
    }
  };

  // ฟังก์ชันดึงข้อมูล PLO
  const fetchPLOs = async () => {
    try {
      const PLOCollectionRef = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/PLO`);
      const PLOsSnapshot = await getDocs(PLOCollectionRef);
      const PLOs = PLOsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setData(prev => ({ ...prev, PLO: PLOs }));
    } catch (error) {
      console.error('Error fetching PLOs: ', error);
    }
  };



  const handleAddPLOToSubject = async (topicId, tableId, parentType = 'topic', parentId = null, grandParentId = null) => {
    try {
      let tableDataDocRef;
      if (parentType === 'topic') {
        tableDataDocRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}/TableData/${tableId}`);
      } else if (parentType === 'subtopic') {
        tableDataDocRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${topicId}/TableData/${tableId}`);
      } else if (parentType === 'subinsubtopic') {
        tableDataDocRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/Subinsubtopics/${topicId}/TableData/${tableId}`);
      }
  
      await updateDoc(tableDataDocRef, {
        PLOs: arrayUnion(selectedPLOs[tableId])
      });
      console.log('PLO added to subject');
    } catch (error) {
      console.error('Error adding PLO to subject:', error);
    }
  };

  const handleSubjectClick = async (parentId, tableId, subjectCode, parentType = 'topic', grandParentId = null, greatGrandParentId = null) => {
    try {
      setSelectedSubjectCode(subjectCode);
      setSelectedSubjectId(parentId);
      setSelectedParentType(parentType);
      setSelectedParentId(parentId);
      setSelectedGrandParentId(grandParentId);
      setSelectedGreatGrandParentId(greatGrandParentId);
      setTableDataId(tableId); // เก็บ TableDataID ที่เกี่ยวข้อง
      
      let docRef;
      if (parentType === 'topic') {
        docRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/TableData/${tableId}`);
      } else if (parentType === 'subtopic') {
        docRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/TableData/${tableId}`);
      } else if (parentType === 'subinsubtopic') {
        docRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/TableData/${tableId}`);
      }
  
      // ดึงข้อมูล TableData
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const ploIds = data.PLOs || [];
        // const cloCollectionPath = `${docRef.path}/CLOs`;
        
        // Map PLO IDs to their detailed information using allPLOs
        const ploDetails = ploIds.map(ploId => {
          const plo = allPLOs.find(p => p.id === ploId);
          return plo ? plo : { id: ploId, number: "Unknown", description: "No description available" };
        });
        
        setSelectedSubjectPLOs(ploDetails);
        // Set course details
        setCourseDescriptionTH(data.courseDescriptionTH || '');
        setCourseDescriptionENG(data.courseDescriptionENG || '');
        setRequiredSubjects(data.requiredSubjects || '');
        setConditions(data.conditions || '');
        setGradeType(data.gradeType || '');
  
        // Define CLO paths based on parent type
        let cloPaths = [];
        if (parentType === 'topic') {
          cloPaths = [
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/CLOs`
          ];
        } else if (parentType === 'subtopic') {
          cloPaths = [
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${grandParentId}/Subtopics/${parentId}/CLOs`
          ];
        } else if (parentType === 'subinsubtopic') {
          cloPaths = [
            `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${greatGrandParentId}/Subtopics/${grandParentId}/Subinsubtopics/${parentId}/CLOs`
          ];
        }

        // Fetch CLO data from the appropriate path
        const cloData = [];
        for (const path of cloPaths) {
          const cloCollection = collection(db, path);
          const cloSnapshot = await getDocs(cloCollection);
          
          if (!cloSnapshot.empty) {
            cloSnapshot.forEach(doc => {
              cloData.push({ id: doc.id, ...doc.data() });
            });
          }
        }
        
        setSelectedSubjectCLOs(cloData);
      } else {
        console.log('No such document!');
        setSelectedSubjectPLOs([]);
        setSelectedSubjectCLOs([]);
      }
    } catch (error) {
      console.error('Error fetching PLOs and CLOs for subject: ', error);
      setSelectedSubjectPLOs([]);
      setSelectedSubjectCLOs([]);
    }
    
    // เปิดฟอร์มเพิ่ม CLO
    setIsAddingCLO(true);
  };

  const addCLO = async (newCLO, cloDescription, selectedPLO, tableDataId, selectedParentType, selectedSubjectId, selectedGrandParentId, selectedGreatGrandParentId) => {
    try {
      let cloCollectionPath;
      if (selectedParentType === 'topic') {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedSubjectId}/CLOs`;
      } else if (selectedParentType === 'subtopic') {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGrandParentId}/Subtopics/${selectedSubjectId}/CLOs`;
      } else if (selectedParentType === 'subinsubtopic') {
        cloCollectionPath = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGreatGrandParentId}/Subtopics/${selectedGrandParentId}/Subinsubtopics/${selectedSubjectId}/CLOs`;
      }

      const cloCollection = collection(db, cloCollectionPath);
      await addDoc(cloCollection, {
        name: newCLO,
        description: cloDescription,
        ploId: selectedPLO,
        tableDataId: tableDataId
      });

      console.log('CLO added successfully');
    } catch (error) {
      console.error('Error adding CLO: ', error);
    }
  };

  const handleAddCLO = async () => {
    if (!newCLO || !cloDescription || !selectedPLO) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    await addCLO(newCLO, cloDescription, selectedPLO, tableDataId, selectedParentType, selectedSubjectId, selectedGrandParentId, selectedGreatGrandParentId);

    // Reset CLO form fields
    setNewCLO('');
    setCLODescription('');
    setSelectedPLO('');
  };

  const handleUpdateTableData = async () => {
    await updateTableData(tableDataId, selectedParentType, selectedSubjectId, selectedGrandParentId, selectedGreatGrandParentId, courseDescriptionTH, courseDescriptionENG, requiredSubjects, conditions, gradeType);

    // Reset course information form fields
    setCourseDescriptionTH('');
    setCourseDescriptionENG('');
    setRequiredSubjects('');
    setConditions('');
    setGradeType('');
  };
  
  const updateTableData = async (tableDataId, selectedParentType, selectedSubjectId, selectedGrandParentId, selectedGreatGrandParentId, courseDescriptionTH, courseDescriptionENG, requiredSubjects, conditions, gradeType) => {
    try {
      let docRef;
      if (selectedParentType === 'topic') {
        docRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedSubjectId}/TableData/${tableDataId}`);
      } else if (selectedParentType === 'subtopic') {
        docRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGrandParentId}/Subtopics/${selectedSubjectId}/TableData/${tableDataId}`);
      } else if (selectedParentType === 'subinsubtopic') {
        docRef = doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${selectedGreatGrandParentId}/Subtopics/${selectedGrandParentId}/Subinsubtopics/${selectedSubjectId}/TableData/${tableDataId}`);
      }
  
      await updateDoc(docRef, {
        courseDescriptionTH,
        courseDescriptionENG,
        requiredSubjects,
        conditions,
        gradeType
      });
  
      console.log('TableData updated successfully');
    } catch (error) {
      console.error('Error updating TableData: ', error);
    }
  };

  const togglePLOSectionVisibility = () => {
    setShowPLOSection((prevShow) => !prevShow);
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className='flex justify-center text-center'><h1 className='bg-green-400 text-white p-5 w-1/2'>Info Page</h1></div>
      <div className='flex justify-center'>
        <div className='h-full border border-black flex w-1/2'>
          <div className='text-start border-black bg-white flex flex-col h-full items-center w-60'>
            <button className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full' onClick={() => window.history.back()}>ย้อนกลับ</button>
            <button className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full' onClick={() => {
              //Implement logout logic here
              console.log("Logout button clicked");
            }}>ออกจากระบบ</button>
          </div>
          <div className='flex flex-col w-full'>
            <div className='mt-0 h-full'>
              <h2 className=''>คณะ: {data.faculty?.Faculty}</h2>
              <h3 className=''>ระดับการศึกษา: {data.levelEdu?.level}</h3>
              <h4 className=''>ภาควิชา: {data.department?.DepartName}</h4>
              <h5 className=''>หลักสูตรปี: {data.courseYear?.CourseYear}</h5>
            </div>
            <div className=''>
              <div className='border border-black'>
                {topics.map(topic => (
                  <div className='ml-10' key={topic.id}>
                    {isEditing === topic.id ? (
                      <>
                        <input
                          type='text'
                          value={editTopic}
                          onChange={(e) => setEditTopic(e.target.value)}
                        />
                        <button onClick={() => handleUpdateTopic(topic.id)}>Save</button>
                        <button onClick={() => setIsEditing(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        {topic.name}
                        <button className='border border-black' onClick={() => {
                          setIsEditing(topic.id);
                          setEditTopic(topic.name);
                        }}>Edit</button>
                        <button className='border border-black' onClick={() => handleDeleteTopic(topic.id)}>Delete</button>
                      </>
                    )}

                    <button className='border border-black' onClick={() => setIsAddingSubtopic(isAddingSubtopic === topic.id ? null : topic.id)}>Add Subtopic</button>

                    {isAddingSubtopic === topic.id && (
                      <div>
                        <input className='border border-black'
                          type='text'
                          placeholder='Subtopic Name'
                          value={newTopic}
                          onChange={(e) => setNewTopic(e.target.value)}
                        />
                        <button className='border border-black' onClick={() => handleAddTopic(topic.id)}>Save</button>
                        <button className='border border-black' onClick={() => setIsAddingSubtopic(null)}>Cancel</button>
                      </div>
                    )}

                    <button className='border border-black' onClick={() => toggleTableVisibility(topic.id)}>
                      {showTable[topic.id] ? 'Hide Table' : 'Show Table'}
                    </button>

                    {showTable[topic.id] && (
                      <table>
                        <thead>
                          <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                            <th className='border border-black' >Subject Code</th>
                            <th className='border border-black' >Subject Name</th>
                            <th className='border border-black' >Credit</th>
                            <th className='border border-black' >Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                        {topics.map((topic) => (
                          topic.tables.map((table, idx) => (
                            <tr key={idx}>
                              <td className='border border-black bg-yellow-100 cursor-pointer' onClick={() => handleSubjectClick(topic.id, table.id, table.subjectCode, 'topic')}>{table.subjectCode}</td>
                              <td className='border border-black bg-yellow-100'>{table.subjectName}</td>
                              <td className='border border-black bg-yellow-100'>{table.credit}</td>
                              <td>
                                <button className='border border-black' onClick={() => handleDeleteTableData(topic.id, table.id)}>Delete</button>
                                <button className='border border-black' onClick={() => handleEditTableData(topic.id, table.id, { subjectCode: 'new value', subjectName: 'new value', credit: 'new value' })}>Edit</button>
                              </td>
                            </tr>
                          ))
                        ))}
                        </tbody>
                        <button className='bg-blue-500 hover:bg-blue-700' onClick={() => handleAddTableData(topic.id)}>Add Table</button>
                      </table>
                    )}

                    {isAddingTable[topic.id] && (
                      <div>
                        <input
                          className='border border-black'
                          type="text"
                          name="subjectCode"
                          value={newTableData[topic.id]?.subjectCode || ''}
                          onChange={(e) => handleTableInputChange(topic.id, e)}
                          placeholder="Subject Code"
                        />
                        <input
                          className='border border-black'
                          type="text"
                          name="subjectName"
                          value={newTableData[topic.id]?.subjectName || ''}
                          onChange={(e) => handleTableInputChange(topic.id, e)}
                          placeholder="Subject Name"
                        />
                        <input
                          className='border border-black'
                          type="text"
                          name="credit"
                          value={newTableData[topic.id]?.credit || ''}
                          onChange={(e) => handleTableInputChange(topic.id, e)}
                          placeholder="Credit"
                        />
                        <button onClick={() => handleSaveTableData(topic.id)}>Save</button>
                      </div>
                    )}

                    {topic.subtopics && topic.subtopics.map(subtopic => (
                      <div className='ml-16' key={subtopic.id}>
                        {isEditing === subtopic.id ? (
                          <div>
                            <input value={editTopic} onChange={e => setEditTopic(e.target.value)} />
                            <button className='border border-black' onClick={() => handleUpdateTopic(subtopic.id, topic.id)}>Save</button>
                            <button className='border border-black' onClick={() => { setIsEditing(null); setEditTopic(''); }}>Cancel</button>
                          </div>
                        ) : (
                          <div>
                            <h3>{subtopic.name}</h3>
                            <button className='border border-black' onClick={() => {setIsEditing(subtopic.id); setEditTopic(subtopic.name); }}>Edit</button>
                            <button className='border border-black' onClick={() => handleDeleteTopic(subtopic.id, topic.id)}>Delete</button>
                            <button className='border border-black' onClick={() => setIsAddingSubinsubtopic(subtopic.id)}>Add Subinsubtopic</button>
                            <button className='border border-black' onClick={() => toggleTableVisibility(`${topic.id}-${subtopic.id}`)}>
                              {showTable[`${topic.id}-${subtopic.id}`] ? 'Hide Table' : 'Show Table'}
                            </button>
                          </div>
                        )}
                        
                        {isAddingSubinsubtopic === subtopic.id && (
                          <div>
                            <input className='border border-black' value={newTopic} onChange={e => setNewTopic(e.target.value)} />
                            <button className='border border-black' onClick={() => {handleAddsubTopic(subtopic.id, topic.id)}}>Add</button>
                            <button className='border border-black' onClick={() => setIsAddingSubinsubtopic(null)}>Cancel</button>
                          </div>
                        )}
                        {showTable[`${topic.id}-${subtopic.id}`] && (
                          <table>
                            <thead>
                              <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                                <th className='border border-black'>Subject Code</th>
                                <th className='border border-black'>Subject Name</th>
                                <th className='border border-black'>Credit</th>
                                <th className='border border-black'>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subtopic.tables.map((table, idx) => (
                                <tr key={idx}>
                                  <td className='border border-black bg-yellow-100 cursor-pointer' onClick={() => handleSubjectClick(subtopic.id, table.id, table.subjectCode, 'subtopic', topic.id)}>{table.subjectCode}</td>
                                  <td className='border border-black bg-yellow-100'>{table.subjectName}</td>
                                  <td className='border border-black bg-yellow-100'>{table.credit}</td>
                                  <td>
                                    <button className='border border-black' onClick={() => handleDeleteTableData(subtopic.id, table.id, topic.id)}>Delete</button>
                                    <button className='border border-black' onClick={() => handleEditTableData(subtopic.id, table.id, { subjectCode: 'new value', subjectName: 'new value', credit: 'new value' }, topic.id)}>Edit</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <button className='bg-blue-500 hover:bg-blue-700' onClick={() => handleAddTableData(subtopic.id, topic.id)}>Add Table</button>
                          </table>
                        )}
                        {isAddingTable[`${topic.id}-${subtopic.id}`] && (
                          <div>
                            <input
                              type="text"
                              name="subjectCode"
                              value={newTableData[`${topic.id}-${subtopic.id}`]?.subjectCode || ''}
                              onChange={(e) => handleTableInputChange(`${topic.id}-${subtopic.id}`, e)}
                              placeholder="Subject Code"
                            />
                            <input
                              type="text"
                              name="subjectName"
                              value={newTableData[`${topic.id}-${subtopic.id}`]?.subjectName || ''}
                              onChange={(e) => handleTableInputChange(`${topic.id}-${subtopic.id}`, e)}
                              placeholder="Subject Name"
                            />
                            <input
                              type="text"
                              name="credit"
                              value={newTableData[`${topic.id}-${subtopic.id}`]?.credit || ''}
                              onChange={(e) => handleTableInputChange(`${topic.id}-${subtopic.id}`, e)}
                              placeholder="Credit"
                            />
                            <button onClick={() => handleSaveTableData(subtopic.id, topic.id)}>Save</button>
                          </div>
                        )}
                      
                        {subtopic.subinsubtopics && subtopic.subinsubtopics.map(subinsubtopic => {
                          // console.log('subtopic:', subtopic);
                          return(
                          <div className='ml-16' key={subinsubtopic.id}>

                            {isEditing === subinsubtopic.id ? (
                              <div>
                                <input value={editTopic} onChange={e => setEditTopic(e.target.value)} />
                                <button className='border border-black' onClick={() => handleUpdateTopic(subinsubtopic.id, subtopic.id)}>Save</button>
                                <button onClick={() => { setIsEditing(null); setEditTopic(''); }}>Cancel</button>
                              </div>
                            ) : (
                              <div>
                                <h4>{subinsubtopic.name}</h4>
                                <button className='border border-black' onClick={() => { setIsEditing(subinsubtopic.id); setEditTopic(subinsubtopic.name); }}>Edit</button>
                                <button className='border border-black' onClick={() => handleDeleteTopic(subinsubtopic.id, subtopic.id, topic.id)}>Delete</button>
                                <button className='border border-black' onClick={() => {console.log('run'),toggleTableVisibility(`${topic.id}-${subtopic.id}-${subinsubtopic.id}`)}}>
                                  {showTable[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`] ? 'Hide Table' : 'Show Table'}
                                </button>

                                {showTable[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`] && (
                                  <table>
                                    <thead>
                                      <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                                        <th className='border border-black'>Subject Code</th>
                                        <th className='border border-black'>Subject Name</th>
                                        <th className='border border-black'>Credit</th>
                                        <th className='border border-black'>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {subinsubtopic.tables.map((table, idx) => (
                                          <tr key={idx}>
                                            <td className='border border-black bg-yellow-100 cursor-pointer' onClick={() => handleSubjectClick(subinsubtopic.id, table.id, table.subjectCode, 'subinsubtopic', subtopic.id, topic.id)}>{table.subjectCode}</td>
                                            <td className='border border-black bg-yellow-100'>{table.subjectName}</td>
                                            <td className='border border-black bg-yellow-100'>{table.credit}</td>
                                            <td>
                                              <button className='border border-black' onClick={() => handleDeleteTableData(subinsubtopic.id, table.id, subtopic.id, topic.id)}>Delete</button>
                                              <button className='border border-black' onClick={() => handleEditTableData(subinsubtopic.id, table.id, { subjectCode: 'new value', subjectName: 'new value', credit: 'new value' }, subtopic.id, topic.id)}>Edit</button>
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                    <button className='bg-blue-500 hover:bg-blue-700' onClick={() => handleAddTableData(subinsubtopic.id, subtopic.id, topic.id)}>Add Table</button>
                                  </table>
                                )}
                                {isAddingTable[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`] && (
                                  <div>
                                    <input
                                      type="text"
                                      name="subjectCode"
                                      value={newTableData[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`]?.subjectCode || ''}
                                      onChange={(e) => handleTableInputChange(`${topic.id}-${subtopic.id}-${subinsubtopic.id}`, e)}
                                      placeholder="Subject Code"
                                    />
                                    <input
                                      type="text"
                                      name="subjectName"
                                      value={newTableData[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`]?.subjectName || ''}
                                      onChange={(e) => handleTableInputChange(`${topic.id}-${subtopic.id}-${subinsubtopic.id}`, e)}
                                      placeholder="Subject Name"
                                    />
                                    <input
                                      type="text"
                                      name="credit"
                                      value={newTableData[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`]?.credit || ''}
                                      onChange={(e) => handleTableInputChange(`${topic.id}-${subtopic.id}-${subinsubtopic.id}`, e)}
                                      placeholder="Credit"
                                    />
                                    <button onClick={() => handleSaveTableData(subinsubtopic.id, subtopic.id, topic.id)}>Save</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          );

                        })}
                      </div>
                    ))}
                  </div>
                ))}
                  <input className='border border-black'
                  type='text'
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  />
                  <button className='border border-black' onClick={() => handleAddTopic()}>Add Topic</button>
                  <div>
                    {/* <h3>PLOs select</h3> */}
                    {selectedSubjectCode && (
                      <div className='bg-lime-200'>
                        {/* <h3>PLOs for {selectedSubjectCode}</h3>
                        <ul>
                          {selectedSubjectPLOs.map((plo, index) => (
                            <li key={index}>
                              <strong>Number:</strong> {plo.number}, <strong>Description:</strong> {plo.description}
                            </li>
                          ))}
                        </ul> */}
                        <h3>Course Details for {selectedSubjectCode}</h3>
                          <ul>
                            <li><strong>Course Description (TH):</strong> {courseDescriptionTH}</li>
                            <li><strong>Course Description (ENG):</strong> {courseDescriptionENG}</li>
                            <li><strong>Required Subjects:</strong> {requiredSubjects}</li>
                            <li><strong>Conditions:</strong> {conditions}</li>
                            <li><strong>Grade Type:</strong> {gradeType}</li>
                          </ul>

                        <div>
                          <h3>อัปเดตข้อมูลรายวิชา</h3>
                          <input
                            type='text'
                            value={courseDescriptionTH}
                            onChange={(e) => setCourseDescriptionTH(e.target.value)}
                            placeholder='คำอธิบายรายวิชา (TH)'
                          />
                          <input
                            type='text'
                            value={courseDescriptionENG}
                            onChange={(e) => setCourseDescriptionENG(e.target.value)}
                            placeholder='Course Description (ENG)'
                          />
                          <input
                            type='text'
                            value={requiredSubjects}
                            onChange={(e) => setRequiredSubjects(e.target.value)}
                            placeholder='วิชาบังคับ'
                          />
                          <input
                            type='text'
                            value={conditions}
                            onChange={(e) => setConditions(e.target.value)}
                            placeholder='เงื่อนไข'
                          />
                          <input
                            type='text'
                            value={gradeType}
                            onChange={(e) => setGradeType(e.target.value)}
                            placeholder='ประเภทของเกรด'
                          />
                          <button className='border border-black' onClick={handleUpdateTableData}>อัปเดตข้อมูลรายวิชา</button>
                        </div>

                        <h3>CLOs for {selectedSubjectCode}</h3>
                        <ul className='bg-green-400'>
                        {selectedSubjectCLOs
                          .filter(clo => clo.tableDataId === tableDataId)
                          .map((clo, index) => (
                            <li key={index}>
                              <strong>Name:</strong> {clo.name}, <strong>Description:</strong> {clo.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {isAddingCLO && (
                      <div className='bg-green-400'>
                        <h3>เพิ่ม CLO สำหรับ {selectedSubjectCode}</h3>
                        <input
                          type='text'
                          value={newCLO}
                          onChange={(e) => setNewCLO(e.target.value)}
                          placeholder='ชื่อ CLO'
                        />
                        <textarea
                          value={cloDescription}
                          onChange={(e) => setCLODescription(e.target.value)}
                          placeholder='คำบรรยาย CLO'
                        />
                        <select
                          value={selectedPLO}
                          onChange={(e) => setSelectedPLO(e.target.value)}
                        >
                          <option value=''>เลือก PLO</option>
                          {allPLOs.map((plo) => (
                            <option key={plo.id} value={plo.id}>{plo.number}</option>
                          ))}
                        </select>
                        <button onClick={handleAddCLO}>เพิ่ม CLO</button>
                      </div>
                    )}
                    <div>
                      <table>
                        <thead>
                          <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                            <th className='border border-black'>ลำดับ</th>
                            <th className='border border-black'>ผลลัพธ์การเรียนรู้ที่คาดหวังของหลักสูตร (PLOs)</th>
                            <th className='border border-black'>Cognitive Domain (Knowledge) (Bloom’s Taxonomy (Revised))</th>
                            <th className='border border-black'>Psychomotor Domain (Skills)</th>
                            <th className='border border-black'>Affective Domain (Attitude)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.PLO && data.PLO.map((plo, index) => (
                            <tr key={index}>
                              <td className='border border-black'>{plo.number}</td> 
                              <td className='border border-black'>{plo.description}</td>
                              <td className='border border-black'>{plo.cognitiveDomain}</td>
                              <td className='border border-black'>{plo.psychomotorDomain ? '✔' : ''}</td>
                              <td className='border border-black'>{plo.affectiveDomain ? '✔' : ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div>
                    <h2 className='text-center'>
                      <span className="bg-green-500 text-white">PLOs</span>
                    </h2>
                      <button className='border border-black' onClick={togglePLOSectionVisibility}>
                        {showPLOSection ? 'Hide PLOs' : 'Show PLOs'}
                      </button>

                      {showPLOSection && (
                        <>
                          {data.PLO && data.PLO.map((plo, index) => (
                            <div key={index} className='border border-black bg-slate-200'>
                              <strong>{plo.number}:</strong> 
                              <p className='w-full max-w-lg overflow-hidden text-ellipsis whitespace-normal h-auto'>{plo.description}</p>
                            </div>
                          ))}

                          <h3>Add New PLO</h3>
                          <input
                            type="text"
                            placeholder="PLO Number"
                            value={newPLONumber}
                            onChange={(e) => setNewPLONumber(e.target.value)}
                          />
                          <input
                            className=''
                            type="text"
                            placeholder="PLO Description"
                            value={newPLODescription}
                            onChange={(e) => setNewPLODescription(e.target.value)}
                          />
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
                                onChange={(e) => setPsychomotorDomain(e.target.checked)}
                              />
                            </label>
                          </div>
                          <div>
                            <label>
                              Affective Domain (At)
                              <input
                                type="checkbox"
                                checked={affectiveDomain}
                                onChange={(e) => setAffectiveDomain(e.target.checked)}
                              />
                            </label>
                          </div>
                          <button className='border border-black' onClick={addPLO}>Add PLO</button>
                        </>
                      )}
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

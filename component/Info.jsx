import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

function Info() {
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
  
  const togglePLOSectionVisibility = () => {
    setShowPLOSection((prevShow) => !prevShow);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div class="bg-gradient-to-b from-green-500 to-white h-screen">
      <div className='flex justify-center text-center'><h1 className='bg-green-400 text-white p-5 w-3/5'>Info Page</h1></div>
      <div className='flex justify-center'>
        <div className='h-full border border-black flex w-3/5 bg-white'>
          <div className='text-start border-black bg-white flex flex-col h-full items-center w-60'>
            <button className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full' onClick={() => window.history.back()}>ย้อนกลับ</button>
            
          </div>
          <div className='flex flex-col w-full'>
            <div className='mt-0 h-full'>
              <h2 className=''>คณะ: {data.faculty?.Faculty}</h2>
              <h3 className=''>ระดับการศึกษา: {data.levelEdu?.level}</h3>
              <h4 className=''>ภาควิชา: {data.department?.DepartName}</h4>
              <h5 className=''>หลักสูตรปี: {data.courseYear?.CourseYear}</h5>
            </div>
            <div className=''>
              <h3>หัวข้อ:</h3>
              <div className='border border-black'>
                {topics
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort topics by name in ascending order
                .map(topic => (
                  <div className='ml-8' key={topic.id}>
                    {isEditing === topic.id ? (
                      <>
                      </>
                    ) : (
                      <>
                        {topic.name}
                      </>
                    )}
                    {isAddingSubtopic === topic.id && (
                      <div>
                      </div>
                    )}

                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 border border-blue-700 rounded ml-1" onClick={() => toggleTableVisibility(topic.id)}>
                      {showTable[topic.id] ? 'Hide Table' : 'Show Table'}
                    </button>

                    {showTable[topic.id] && (
                      <table>
                        <thead>
                        <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                            <th className='border border-black' >Subject Code</th>
                            <th className='border border-black' >Subject Name</th>
                            <th className='border border-black' >Credit</th>
                          </tr>
                        </thead>
                        <tbody>
                        {topics.map((topic) => (
                          topic.tables.map((table, idx) => (
                            <tr key={idx}>
                              <td className='border border-black bg-yellow-100 cursor-pointer' onClick={() => handleSubjectClick(topic.id, table.id, table.subjectCode, 'topic')}>{table.subjectCode}</td>
                              <td className='border border-black bg-yellow-100'>{table.subjectNameENG}</td>
                              <td className='border border-black bg-yellow-100'>{table.credit}</td>
                            </tr>
                          ))
                        ))}
                        </tbody>
                      </table>
                    )}

                    {isAddingTable[topic.id] && (
                      <div>
                      </div>
                    )}

                    {topic.subtopics && topic.subtopics
                      .sort((a, b) => a.name.localeCompare(b.name)) // Sort subtopics by name in ascending order
                      .map(subtopic => (
                      <div className='ml-8' key={subtopic.id}>
                        {isEditing === subtopic.id ? (
                          <div>
                          </div>
                        ) : (
                          <div>
                            {subtopic.name}
                            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 border border-blue-700 rounded ml-1" onClick={() => toggleTableVisibility(`${topic.id}-${subtopic.id}`)}>
                              {showTable[`${topic.id}-${subtopic.id}`] ? 'Hide Table' : 'Show Table'}
                            </button>
                          </div>
                        )}
                        
                        {isAddingSubinsubtopic === subtopic.id && (
                          <div>
                          </div>
                        )}
                        {showTable[`${topic.id}-${subtopic.id}`] && (
                          <table>
                            <thead>
                              <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                                <th className='border border-black'>Subject Code</th>
                                <th className='border border-black'>Subject Name</th>
                                <th className='border border-black'>Credit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subtopic.tables.map((table, idx) => (
                                <tr key={idx}>
                                  <td className='border border-black bg-yellow-100 cursor-pointer' onClick={() => handleSubjectClick(subtopic.id, table.id, table.subjectCode, 'subtopic', topic.id)}>{table.subjectCode}</td>
                                  <td className='border border-black bg-yellow-100'>{table.subjectNameENG}</td>
                                  <td className='border border-black bg-yellow-100'>{table.credit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {isAddingTable[`${topic.id}-${subtopic.id}`] && (
                          <div>
                          </div>
                        )}
                      
                        {subtopic.subinsubtopics && subtopic.subinsubtopics
                          .sort((a, b) => a.name.localeCompare(b.name)) // Sort subinsubtopics by name in ascending order
                          .map(subinsubtopic => (
                          <div className='ml-8' key={subinsubtopic.id}>

                            {isEditing === subinsubtopic.id ? (
                              <div>
                              </div>
                            ) : (
                              <div>
                                {subinsubtopic.name}
                                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 border border-blue-700 rounded ml-1" onClick={() => {console.log('run'),toggleTableVisibility(`${topic.id}-${subtopic.id}-${subinsubtopic.id}`)}}>
                                  {showTable[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`] ? 'Hide Table' : 'Show Table'}
                                </button>

                                {showTable[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`] && (
                                  <table>
                                    <thead>
                                      <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                                        <th className='border border-black'>Subject Code</th>
                                        <th className='border border-black'>Subject Name</th>
                                        <th className='border border-black'>Credit</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {subinsubtopic.tables.map((table, idx) => (
                                          <tr key={idx}>
                                            <td className='border border-black bg-yellow-100 cursor-pointer' onClick={() => handleSubjectClick(subinsubtopic.id, table.id, table.subjectCode, 'subinsubtopic', subtopic.id, topic.id)}>{table.subjectCode}</td>
                                            <td className='border border-black bg-yellow-100'>{table.subjectNameENG}</td>
                                            <td className='border border-black bg-yellow-100'>{table.credit}</td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                )}
                                {isAddingTable[`${topic.id}-${subtopic.id}-${subinsubtopic.id}`] && (
                                  <div>
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
                  <div>
                    {selectedSubjectCode && (
                      <div className='bg-lime-300'>
                        <h3 className='bg-lime-100'>Course Details for {selectedSubjectCode}</h3>
                          <ul>
                            <li><strong>Course Description (TH):</strong> {courseDescriptionTH}</li>
                            <li><strong>Course Description (ENG):</strong> {courseDescriptionENG}</li>
                            <li><strong>Required Subjects:</strong> {requiredSubjects}</li>
                            <li><strong>Conditions:</strong> {conditions}</li>
                            <li><strong>Grade Type:</strong> {gradeType}</li>
                          </ul>
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
                      </div>
                    )}
                    </div>
                  </div>
                  <div>
                  <h2 className='text-center'>
                    <span className="bg-green-500 text-white">PLOs</span>
                  </h2>
                  <table>
                        <thead>
                          <tr className='bg-slate-500 border-black border-gray-200 text-white'>
                            <th className='border border-black'>ลำดับ</th>
                            <th className='border border-black'>ผลลัพธ์การเรียนรู้ที่คาดหวังของหลักสูตร (PLOs)</th>
                            <th className='border border-black'>Cognitive Domain </th>
                            <th className='border border-black'>Psychomotor Domain (Skills)</th>
                            <th className='border border-black'>Affective Domain (Attitude)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.PLO && data.PLO
                            .sort((a,b) => a.number - b.number)
                            .map((plo, index) => (
                            <tr key={index}>
                              <td className='text-center border border-black'>{plo.number}</td> 
                              <td className='border border-black'>{plo.description}</td>
                              <td className='text-center border border-black'>{plo.cognitiveDomain}</td>
                              <td className='text-center border border-black'>{plo.psychomotorDomain ? '✔' : ''}</td>
                              <td className='text-center border border-black'>{plo.affectiveDomain ? '✔' : ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded" onClick={togglePLOSectionVisibility}>
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
                        </>
                      )}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

export default Info;

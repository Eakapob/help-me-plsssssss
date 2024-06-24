import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

function InfoPage() {
  const location = useLocation();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editTopic, setEditTopic] = useState('');
  const [isAddingSubtopic, setIsAddingSubtopic] = useState(null);

  const [tables, setTables] = useState({});
  const [newTableData, setNewTableData] = useState({});
  const [isAddingTable, setIsAddingTable] = useState({});

  const [showTable, setShowTable] = useState({});

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

    const fetchData = async () => {
      try {
        const facultyDoc = await getDocs(collection(db, `faculty`), doc(db, `faculty/${facultyId}`));
        const levelEduDoc = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu`), doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}`));
        const departmentDoc = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department`), doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}`));
        const courseYearDoc = await getDocs(collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear`), doc(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}`));
        const topicsCollection = collection(db, `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics`);
        const topicsSnapshot = await getDocs(topicsCollection);

        setData({
          faculty: facultyDoc.docs[0]?.data(),
          levelEdu: levelEduDoc.docs[0]?.data(),
          department: departmentDoc.docs[0]?.data(),
          courseYear: courseYearDoc.docs[0]?.data(),
        });

        setTopics(topicsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error('Error fetching data: ', error);
      } finally {
        setLoading(false);
      }
    };

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

  const handleDeleteTopic = async (topicId, parentId = null) => {
    const path = parentId ? `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}` : `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}`;
    const topicDoc = doc(db, path);
    await deleteDoc(topicDoc);
    if (parentId) {
      setTopics(topics.map(topic => topic.id === parentId ? { ...topic, subtopics: topic.subtopics.filter(subtopic => subtopic.id !== topicId) } : topic));
    } else {
      setTopics(topics.filter(topic => topic.id !== topicId));
    }
  };

  const handleShowTable = (topicId) => {
    setShowTable((prev) => ({
      ...prev,
      [topicId]: true,
    }));
  };

  const handleAddTableData = async (topicId, parentId = null) => {
    if (!newTableData[topicId]?.subjectCode || !newTableData[topicId]?.subjectName || !newTableData[topicId]?.credit) return;
  
    const path = parentId 
      ? `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${parentId}/Subtopics/${topicId}/Table` 
      : `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}/Table`;
  
    const tableCollection = collection(db, path);
    const docRef = await addDoc(tableCollection, { ...newTableData[topicId] });
  
    setTables(prev => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), { id: docRef.id, ...newTableData[topicId] }]
    }));
  
    setNewTableData(prev => ({
      ...prev,
      [topicId]: { subjectCode: '', subjectName: '', credit: '' } // Reset all fields
    }));
    setIsAddingTable(prev => ({
      ...prev,
      [topicId]: false
    }));
  };

  const handleDeleteTableData = async (tableId, topicId) => {
    const path = `faculty/${facultyId}/LevelEdu/${levelEduId}/Department/${departmentId}/CourseYear/${courseYearId}/Topics/${topicId}/Table/${tableId}`;
    const tableDoc = doc(db, path);
    await deleteDoc(tableDoc);
    setTables(prev => ({
      ...prev,
      [topicId]: prev[topicId].filter(table => table.id !== tableId)
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Info Page</h1>
      <h2>คณะ: {data.faculty?.Faculty}</h2>
      <h3>ระดับการศึกษา: {data.levelEdu?.level}</h3>
      <h4>ภาควิชา: {data.department?.DepartName}</h4>
      <h5>หลักสูตรปี: {data.courseYear?.CourseYear}</h5>

      <div>
        <h3>หัวข้อ:</h3>
        <ul>
          {topics.map(topic => (
            <li key={topic.id}>
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
                  <button onClick={() => {
                    setIsEditing(topic.id);
                    setEditTopic(topic.name);
                  }}>Edit</button>
                  <button onClick={() => handleDeleteTopic(topic.id)}>Delete</button>
                </>
              )}

              <button onClick={() => setIsAddingSubtopic(isAddingSubtopic === topic.id ? null : topic.id)}>Add Subtopic</button>
              <button onClick={() => handleShowTable(topic.id)}>Show Table</button>

              {showTable[topic.id] && (
                <div>
                  <h4>ตาราง:</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Credit</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tables[topic.id]?.map((table) => (
                        <tr key={table.id}>
                          <td>{table.subjectCode}</td>
                          <td>{table.subjectName}</td>
                          <td>{table.credit}</td>
                          <td>
                            <button onClick={() => handleDeleteTableData(table.id, topic.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {isAddingTable[topic.id] ? (
                    <div>
                      <input
                        type='text'
                        placeholder='Subject Code'
                        value={newTableData[topic.id]?.subjectCode || ''}
                        onChange={(e) =>
                          setNewTableData((prev) => ({
                            ...prev,
                            [topic.id]: { ...prev[topic.id], subjectCode: e.target.value },
                          }))
                        }
                      />
                      <input
                        type='text'
                        placeholder='Subject Name'
                        value={newTableData[topic.id]?.subjectName || ''}
                        onChange={(e) =>
                          setNewTableData((prev) => ({
                            ...prev,
                            [topic.id]: { ...prev[topic.id], subjectName: e.target.value },
                          }))
                        }
                      />
                      <input
                        type='text'
                        placeholder='Credit'
                        value={newTableData[topic.id]?.credit || ''}
                        onChange={(e) =>
                          setNewTableData((prev) => ({
                            ...prev,
                            [topic.id]: { ...prev[topic.id], credit: e.target.value },
                          }))
                        }
                      />
                      <button onClick={() => handleAddTableData(topic.id)}>Save</button>
                      <button
                        onClick={() => setIsAddingTable((prev) => ({ ...prev, [topic.id]: false }))}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setIsAddingTable((prev) => ({ ...prev, [topic.id]: true }))}>
                      Add Table Data
                    </button>
                  )}
                </div>
              )}

              {isAddingSubtopic === topic.id && (
                <div>
                  <input
                    type='text'
                    placeholder='Subtopic Name'
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                  />
                  <button onClick={() => handleAddTopic(topic.id)}>Save</button>
                  <button onClick={() => setIsAddingSubtopic(null)}>Cancel</button>
                </div>
              )}

              {topic.subtopics && topic.subtopics.length > 0 && (
                <ul>
                  {topic.subtopics.map(subtopic => (
                    <li key={subtopic.id}>
                      {isEditing === subtopic.id ? (
                        <>
                          <input
                            type='text'
                            value={editTopic}
                            onChange={(e) => setEditTopic(e.target.value)}
                          />
                          <button onClick={() => handleUpdateTopic(subtopic.id, topic.id)}>Save</button>
                          <button onClick={() => setIsEditing(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          {subtopic.name}
                          <button onClick={() => {
                            setIsEditing(subtopic.id);
                            setEditTopic(subtopic.name);
                          }}>Edit</button>
                          <button onClick={() => handleDeleteTopic(subtopic.id, topic.id)}>Delete</button>
                        </>
                      )}
                      <button onClick={() => handleShowTable(subtopic.id)}>Show Table</button>
                      {showTable[subtopic.id] && (
                        <div>
                          <h4>ตาราง:</h4>
                          <table>
                            <thead>
                              <tr>
                                <th>Subject Code</th>
                                <th>Subject Name</th>
                                <th>Credit</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tables[subtopic.id]?.map((table) => (
                                <tr key={table.id}>
                                  <td>{table.subjectCode}</td>
                                  <td>{table.subjectName}</td>
                                  <td>{table.credit}</td>
                                  <td>
                                    <button onClick={() => handleDeleteTableData(table.id, subtopic.id)}>Delete</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {isAddingTable[subtopic.id] ? (
                            <div>
                              <input
                                type='text'
                                placeholder='Subject Code'
                                value={newTableData[subtopic.id]?.subjectCode || ''}
                                onChange={(e) =>
                                  setNewTableData((prev) => ({
                                    ...prev,
                                    [subtopic.id]: { ...prev[subtopic.id], subjectCode: e.target.value },
                                  }))
                                }
                              />
                              <input
                                type='text'
                                placeholder='Subject Name'
                                value={newTableData[subtopic.id]?.subjectName || ''}
                                onChange={(e) =>
                                  setNewTableData((prev) => ({
                                    ...prev,
                                    [subtopic.id]: { ...prev[subtopic.id], subjectName: e.target.value },
                                  }))
                                }
                              />
                              <input
                                type='text'
                                placeholder='Credit'
                                value={newTableData[subtopic.id]?.credit || ''}
                                onChange={(e) =>
                                  setNewTableData((prev) => ({
                                    ...prev,
                                    [subtopic.id]: { ...prev[subtopic.id], credit: e.target.value },
                                  }))
                                }
                              />
                              <button onClick={() => handleAddTableData(subtopic.id)}>Save</button>
                              <button
                                onClick={() => setIsAddingTable((prev) => ({ ...prev, [subtopic.id]: false }))}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setIsAddingTable((prev) => ({ ...prev, [subtopic.id]: true }))}>
                              Add Table Data
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <input
          type='text'
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
        />
        <button onClick={() => handleAddTopic()}>Add Topic</button>
      </div>
    </div>
  );
}

export default InfoPage;

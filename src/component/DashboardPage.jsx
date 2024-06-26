import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "faculty"));
      const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setData(newData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className='flex justify-center text-center'><h1 className='bg-green-400 text-white p-5 w-1/2'>Dashboard</h1></div>
      <div className='text-center border-2 flex justify-center h-full'>
        <div className='mt-0 p-20 w-1/2 bg-green-200 flex flex-col h-full'>
          <p>Admin page <Link className='bg-blue-500 hover:bg-blue-700 text-white rounded' to="/admin">Admin</Link></p>
          <h2>ข้อมูลจาก Firebase:</h2>
          <ul>
            {data.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

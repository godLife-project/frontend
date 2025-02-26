import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

function Home() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        setLoading(true);
        axiosInstance.get("/categories/topMenu")
          .then((response) => {
            setCategories(response.data);
            setError(null);
          })
          .catch((error) => {
            console.error("Error fetching categories:", error);
            setError(error);
          })
          .finally(() => {
            setLoading(false);
          });
    }, []);
    
    return (
        <div>
            {loading ? '로딩 중...' : 
             error ? `에러 발생: ${error.message}` : 
             categories.length > 0 && <pre>{JSON.stringify(categories, null, 2)}</pre>}
        </div>
    );
}

export default Home;
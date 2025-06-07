import { useState, useEffect, useCallback } from 'react';

export const useFetchData = (initialUrl = '', customErrorMessage = 'Failed to fetch data') => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (url = initialUrl) => {
        setLoading(true);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setData(result);
        } catch (error) {
            setError(customErrorMessage);
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [initialUrl, customErrorMessage]);

    useEffect(() => {
        if (initialUrl) fetchData(initialUrl);
    }, [initialUrl, fetchData]);
    
    return { data, loading, error, fetchData };
};

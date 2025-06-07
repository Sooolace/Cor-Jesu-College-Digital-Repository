// Topics.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Topics = () => {
    const [topics, setTopics] = useState([]); // Renamed from authors to topics
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/projects'); // Update this to your actual endpoint for topics
                setTopics(response.data); // Set the topics state with the data received
            } catch (err) {
                setError('Error fetching data');
                console.error(err);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Topics</h1> {/* Changed title to Topics */}
            <ul>
                {topics.map((topic) => (
                    <li key={topic.topic_id}>
                        {topic.name} - Research Area ID: {topic.research_area_id} {/* Displaying topic name and research_area_id */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Topics;

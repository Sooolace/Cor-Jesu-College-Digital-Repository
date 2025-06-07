import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/activitylog.css';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState(null); // State to store delete status

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get('/api/activitylog/activity-log');
                setLogs(response.data);
            } catch (err) {
                setError('Failed to fetch activity log');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const handleRemoveDuplicates = async () => {
        try {
            const response = await axios.post('/api/activitylog/remove-duplicates');
            setDeleteStatus(response.data); // Show success message
            // Re-fetch the logs after deletion to update the view
            const updatedLogs = await axios.get('/api/activitylog/activity-log');
            setLogs(updatedLogs.data);
        } catch (err) {
            setDeleteStatus('Failed to remove duplicates');
        }
    };

    const handleTruncate = async () => {
        try {
            const response = await axios.post('/api/activitylog/truncate');
            setDeleteStatus(response.data); // Show success message
            // Re-fetch the logs to update the view (it will be empty now)
            setLogs([]);
        } catch (err) {
            setDeleteStatus('Failed to truncate activity log');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="activity-log-container">
            <h1>Activity Log</h1>
            <button onClick={handleRemoveDuplicates}>Remove Duplicates</button>
            <button onClick={handleTruncate}>Truncate Activity Log</button>
            {deleteStatus && <div>{deleteStatus}</div>} {/* Display delete status */}
            <table className="activity-log-table">
                <thead>
                    <tr>
                        <th>User Role</th>
                        <th>User ID</th>
                        <th>IP Address</th>
                        <th>Activity</th>
                        <th>Additional Info</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.user_role}</td>
                            <td>{log.user_id}</td>
                            <td>{log.ip_address}</td>
                            <td>{log.activity}</td>
                            <td>{JSON.stringify(log.additional_info)}</td>
                            <td>{log.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ActivityLog;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/activitylog.css';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState(null);

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
            setDeleteStatus(response.data);
            const updatedLogs = await axios.get('/api/activitylog/activity-log');
            setLogs(updatedLogs.data);
        } catch (err) {
            setDeleteStatus('Failed to remove duplicates');
        }
    };

    const handleTruncate = async () => {
        try {
            const response = await axios.post('/api/activitylog/truncate');
            setDeleteStatus(response.data);
            setLogs([]);
        } catch (err) {
            setDeleteStatus('Failed to truncate activity log');
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="activity-log-container">
            <h1>Activity Log</h1>
            <div className="activity-log-actions">
                <button onClick={handleRemoveDuplicates}>Remove Duplicates</button>
                <button onClick={handleTruncate}>Truncate Activity Log</button>
            </div>
            {deleteStatus && <div className="status-message">{deleteStatus}</div>}
            <div className="table-container">
                <table className="activity-log-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User ID</th>
                            <th>Action</th>
                            <th>Additional Info</th>
                            <th>Country</th>
                            <th>City</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>IP Hash</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td>{log.id}</td>
                                <td>{log.user_id || 'Guest'}</td>
                                <td>{log.action}</td>
                                <td>{log.additional_info}</td>
                                <td>{log.country || 'Unknown'}</td>
                                <td>{log.city || 'Unknown'}</td>
                                <td>{log.latitude ? log.latitude.toFixed(4) : 'N/A'}</td>
                                <td>{log.longitude ? log.longitude.toFixed(4) : 'N/A'}</td>
                                <td>{log.ip_hash}</td>
                                <td>{formatTimestamp(log.timestamp)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityLog;

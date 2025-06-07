import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../pages/user/styles/departments.css'; 
import Breadcrumb from '../../components/BreadCrumb';

function Departments() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/categories');
                if (!response.ok) {
                    throw new Error('Failed to fetch departments');
                }
                const data = await response.json();
                
                // Log each department to see what fields are available
                console.log('All departments:', data);
                if (data && data.length > 0) {
                    console.log('First department example:', data[0]);
                    // List all keys in the first department object
                    console.log('Department fields:', Object.keys(data[0]));
                }
                
                setDepartments(data);
            } catch (error) {
                console.error('Error fetching departments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    return (
        <>
        <div className="breadcrumb-container">
            <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Departments', link: '/departments' }]} />
        </div>
        <div className="home-page">
            {/* Main content */}
            <div className="centered-content departments-container">
            <div className="text-center mb-4">
            <h3 className="display-8">Departments</h3>
            </div>
            <div className="author-underline"></div>
                <div className="departments-grid-container">
                    {loading ? (
                        <div>Loading departments...</div>
                    ) : departments.length === 0 ? (
                        <div>No departments found</div>
                    ) : (
                        departments.map((department) => {
                            console.log(`Department ${department.category_id}:`, department);
                            return (
                                <div className="departments-grid-item" key={department.category_id}>
                                    <a href={`/departments/${department.category_id}`} className="department-link">
                                        <div className="department-image-container">
                                            {department.image_url ? (
                                                <img 
                                                    src={department.image_url} 
                                                    alt={department.name} 
                                                    className="department-image"
                                                    onError={(e) => {
                                                        console.error(`Failed to load image for ${department.name}:`, e.target.src);
                                                        // Use department acronym from name (extract letters in parentheses)
                                                        const acronymMatch = department.name.match(/\(([^)]+)\)/);
                                                        const acronym = acronymMatch ? acronymMatch[1] : department.name.charAt(0);
                                                        e.target.src = `https://via.placeholder.com/150?text=${acronym}`;
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                            ) : (
                                                <div className="placeholder-image">
                                                    {department.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <p>{department.name}</p>
                                    </a>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
        </>
    );
}

export default React.memo(Departments);

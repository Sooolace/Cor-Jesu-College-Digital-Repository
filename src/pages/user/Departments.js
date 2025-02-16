import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../pages/user/styles/departments.css'; 
import Breadcrumb from '../../components/BreadCrumb';

function Departments() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('/api/categories');
                if (!response.ok) {
                    throw new Error('Failed to fetch departments');
                }
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };

        fetchDepartments();
    }, []);

    return (
        <>
        <div className="breadcrumb-container">
            <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Departments', link: '/search' }]} />
        </div>
        <div className="home-page">
            {/* Main content */}
            <div className="centered-content departments-container">
            <div className="text-center mb-4">
            <h3 className="display-8">Departments</h3>
            </div>
            <div className="author-underline"></div>
                <div className="departments-grid-container">
                    {departments.map((department) => (
                        <div className="departments-grid-item" key={department.category_id}>
                            <a href={`/departments/${department.category_id}`} className="department-link">
                                <img 
                                    src={`http://localhost:5000${department.image_url}`} 
                                    alt={department.name} 
                                    className="department-image" 
                                />
                                <p>{department.name}</p>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </>
    );
}

export default React.memo(Departments);

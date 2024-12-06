import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../pages/user/styles/departments.css'; 
import CCIS from '../../assets/CCIS.png';
import CJC from '../../assets/GRAD_SCHOOL.png';
import CABE from '../../assets/CABE.png';
import COE from '../../assets/COE.png';
import CHS from '../../assets/CHS.png';
import CEDAS from '../../assets/CEDAS.png';
import Breadcrumb from '../../components/BreadCrumb';

function Departments() {
    const navigate = useNavigate();

    useEffect(() => {
        // Cache the departments on first load or if not cached
        const cachedDepartments = localStorage.getItem('departments');
        if (!cachedDepartments) {
            const departmentsData = [
                { id: 'ccis', name: 'College of Computing and Information Sciences', image: CCIS },
                { id: 'cjc', name: 'Graduate School', image: CJC },
                { id: 'cabe', name: 'College of Accountancy, Business, and Entrepreneurship', image: CABE },
                { id: 'coe', name: 'College of Engineering', image: COE },
                { id: 'chs', name: 'College of Health Sciences', image: CHS },
                { id: 'cedas', name: 'College of Education Arts and Sciences', image: CEDAS },
            ];
            // Cache this data in localStorage
            localStorage.setItem('departments', JSON.stringify(departmentsData));
        }
    }, []);

    const departments = JSON.parse(localStorage.getItem('departments')) || [];

    return (
        <>
        <div className="breadcrumb-container">
            <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Departments', link: '/search' }]} />
        </div>
        <div className="home-page">
            {/* Main content */}
            <div className="centered-content departments-container">
                <h3>Research Departments</h3>
                <div className="author-underline"></div>

                <div className="departments-grid-container">
                    {departments.map((department) => (
                        <div className="departments-grid-item" key={department.id}>
                            <a href={`/departments/${department.id}`} className="department-link">
                                <img 
                                    src={department.image} 
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

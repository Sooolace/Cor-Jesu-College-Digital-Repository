import React from 'react';
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
                    <div className="departments-grid-item">
                        <a href="/departments/ccis" className="department-link">
                            <img src={CCIS} alt="College of Computing and Information Sciences" className="department-image" />
                            <p>College of Computing and Information Sciences</p>
                        </a>
                    </div>
                    <div className="departments-grid-item">
                        <a href="/departments/cjc" className="department-link">
                            <img src={CJC} alt="Graduate School" className="department-image" />
                            <p>Graduate School</p>
                        </a>
                    </div>
                    <div className="departments-grid-item">
                        <a href="/departments/cabe" className="department-link">
                            <img src={CABE} alt="College of Accountancy, Business, and Entrepreneurship" className="department-image" />
                            <p>College of Accountancy, Business, and Entrepreneurship</p>
                        </a>
                    </div>
                    <div className="departments-grid-item">
                        <a href="/departments/coe" className="department-link">
                            <img src={COE} alt="College of Engineering" className="department-image" />
                            <p>College of Engineering</p>
                        </a>
                    </div>
                    <div className="departments-grid-item">
                        <a href="/departments/chs" className="department-link">
                            <img src={CHS} alt="College of Health Sciences" className="department-image" />
                            <p>College of Health Sciences</p>
                        </a>
                    </div>
                    <div className="departments-grid-item">
                        <a href="/departments/cedas" className="department-link">
                            <img src={CEDAS} alt="College of Education Arts and Sciences" className="department-image" />
                            <p>College of Education Arts and Sciences</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default Departments;

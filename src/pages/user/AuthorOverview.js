import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Table, Spinner, Alert, Form, Button, Dropdown } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './styles/authoroverview.css';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';


function AuthorOverview() {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterYears, setFilterYears] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorks, setFilteredWorks] = useState([]); // Initialize as empty array

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchClick = () => {
    const filtered = works.filter((work) =>
      work.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWorks(filtered);
    setTotalCount(filtered.length);
    setCurrentPage(1);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };
  
  
  // Fetch author details and works
  useEffect(() => {
    const fetchAuthorDetails = async () => {
      try {
        const authorUrl = `/api/authors/name/${encodeURIComponent(authorId)}`;
        const authorResponse = await fetch(authorUrl);
        if (!authorResponse.ok) throw new Error(`HTTP error! status: ${authorResponse.status}`);
        const authorData = await authorResponse.json();
        setAuthor(authorData);
  
        const worksUrl = `/api/authors/${authorData.author_id}/works`;
        const worksResponse = await fetch(worksUrl);
        if (!worksResponse.ok) throw new Error(`HTTP error! status: ${worksResponse.status}`);
        const worksData = await worksResponse.json();
  
        // Define formattedWorks within this function
        const formattedWorks = worksData.map((work) => ({
          ...work,
          description: work.abstract,
          year: new Date(work.publication_date).getFullYear(),
        }));
  
        // Use formattedWorks here
        setWorks(formattedWorks);
        setFilteredWorks(formattedWorks);
        setTotalCount(formattedWorks.length);
  
        const stats = formattedWorks.reduce((acc, work) => {
          acc[work.year] = (acc[work.year] || 0) + 1;
          return acc;
        }, {});
        setStatistics(stats);
      } catch (error) {
        setError('Failed to load author details');
      } finally {
        setLoading(false);
      }
    };
  
    fetchAuthorDetails();
  }, [authorId]);
  

  const handleApplyFilter = () => {
    const newFilteredWorks = filterYears.length > 0
      ? works.filter((work) => filterYears.includes(work.year.toString()))
      : works;

    setFilteredWorks(newFilteredWorks);
    setTotalCount(newFilteredWorks.length);
    setCurrentPage(1);
  };

  const handleYearCheckboxChange = (year) => {
    setFilterYears((prevYears) =>
      prevYears.includes(year)
        ? prevYears.filter((item) => item !== year)
        : [...prevYears, year]
    );
  };
  const prepareStatisticsData = () => {
    return Object.entries(statistics).map(([year, count]) => ({
      year: parseInt(year),
      count,
    }));
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastWork = currentPage * itemsPerPage;
  const indexOfFirstWork = indexOfLastWork - itemsPerPage;
  const currentWorks = filteredWorks.slice(indexOfFirstWork, indexOfLastWork);
  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/' },
            { label: 'Authors', link: '/authors' },
            { label: author?.name || 'Loading...', link: `/Departments/Authors` },
          ]}
        />
      </div>

      <div className="author-overview-container container mt-4">
        {error && <Alert variant="danger">{error}</Alert>}


        {author && (
          <div className="row">
            {/* Sidebar - Filter Section */}
            <div className="col-md-3 a-filter-container">


            <Form>
  {/* Search Functionality */}
  <div className="filter-title">
  SEARCH
  </div>
  <div className="filter-underline"></div>
  <div className="search-container mb-3 d-flex">
  {/* Search Input */}
  <input
    type="text"
    placeholder={`Enter project title here`}
    value={searchTerm}
    onChange={handleSearchChange}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();  // Prevent page refresh
        handleSearchClick();
      }
    }}
    className="form-control"
    style={{
      borderRadius: '5px',
      border: '1px solid #ccc',
      outline: 'none',
      flex: 1,
    }}
  />

  {/* Search Button */}
  <Button 
    onClick={handleSearchClick} 
    className="btn btn-primary ml-2"
    style={{
      backgroundColor: '#a33307',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
    }}
  >
    <i className="fas fa-search"></i>
  </Button>
</div>


  {/* Filter by Year */}
  <div className="filter-title">
  FILTER
  </div>  <div className="filter-underline"></div>
  <div
    className="dropdown-container d-flex align-items-center justify-content-between flex-wrap"
    style={{ gap: '10px' }}
  >
    <Dropdown>
      <Dropdown.Toggle
        id="dropdown-custom-components"
        style={{
          backgroundColor: '#a33307',
          width: '220px',
          color: '#f8f9fa',
          border: 'none',
          borderRadius: '5px',
          outline: 'none',
        }}
      >
        Select Year
      </Dropdown.Toggle>

      <Dropdown.Menu
              style={{
                width: '220px',
                paddingLeft: '10px',
                paddingRight: '10px',

              }}>
        {Object.keys(statistics).map((year) => (
          <Form.Check
            key={year}
            type="checkbox"
            label={year}
            checked={filterYears.includes(year)}
            onChange={() => handleYearCheckboxChange(year)}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>

    <Button
      style={{
        backgroundColor: '#a33307',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
      }}
      className="ml-2 mt-2 mt-md-0 btn-filter"
      onClick={handleApplyFilter}
    >
      Filter
    </Button>
  </div>

  <div className="statistics-section mt-4">
  <div className="filter-title">
 YEARLY CONTRIBUTION
  </div>    <div className="filter-underline"></div>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={prepareStatisticsData()}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884ff" />
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* Display Total Works */}
  <div className="total-works mt-2 mb-4 d-flex justify-content-center align-items-center">
    <h6>
      <strong>Total Works:</strong> {filteredWorks.length}
    </h6>
  </div>
</Form>

            </div>

            {/* Main Content - Works as Cards */}
            <div className="col-md-9 content-container">
              <h4>Works by {author.name}</h4>
              <div className="author-underline mb-4"></div>
              {loading && (
          <div className="text-center mt-4">
            <Spinner animation="border" role="status" />
            <span className="visually-hidden">Loading...</span>
            <p>Loading author details...</p>
          </div>
        )}

{currentWorks.length > 0 && currentWorks.map((work) => (
  <div key={work.project_id} className="search-result-item mb-4">
    <div className="d-flex align-items-start" style={{ flexWrap: 'nowrap' }}>
      {work.cover_image ? (
        <img
          src={work.cover_image}
          alt="Cover"
          style={{
            maxWidth: '80px', // Limit max width
            height: '120px',  // Set a fixed height
            objectFit: 'cover', // Ensure the image covers the area without stretching
            marginRight: '20px',
          }}
        />
      ) : (
        <div
          style={{
            width: '100px',
            height: '150px',
            backgroundColor: '#f4f4f4',
            marginRight: '20px',
          }}
        ></div>
      )}
      <div style={{ flex: 1 }}>
        <Link to={`/DocumentOverview/${work.project_id}`} className="title-link" style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
          {work.title}
        </Link>
        <div style={{ fontSize: '12px', color: '#6c757d' }}>
          {new Date(work.publication_date).toLocaleDateString() || 'N/A'}
        </div>
        <div style={{ marginTop: '10px', color: '#333' }}>
          <p
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3, // Limits to 3 lines of text
              marginBottom: '0px',
            }}
          >
            {work.description || 'No abstract available.'}
          </p>
        </div>
      </div>
    </div>
  </div>
))}
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={(newPage) => setCurrentPage(newPage)}
            />

            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AuthorOverview;

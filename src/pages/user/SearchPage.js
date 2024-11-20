import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../../components/Searchbar';
import SubjectFilter from '../../components/SubjectFilter/SubjectFilter';
import Breadcrumb from '../../components/BreadCrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faUser, faCalendar, faTags } from '@fortawesome/free-solid-svg-icons';
import './styles/filter.css';

function SearchPage() {
  const location = useLocation();
  const { query: initialQuery, option: initialOption } = location.state || { query: '', option: 'title' };

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [typedQuery, setTypedQuery] = useState(initialQuery);
  const [searchOption, setSearchOption] = useState(initialOption);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const debounceTimer = useRef(null);

  // Fetch authors
  const fetchAuthors = async (projectId) => {
    try {
      const response = await axios.get(`/api/project_authors/${projectId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching authors:', error);
      return [];
    }
  };

  // Fetch project keywords
  const fetchKeywords = async (projectId) => {
    try {
      const response = await axios.get(`/api/project_keywords/${projectId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching keywords:', error);
      return [];
    }
  };

  // Fetch projects
  const fetchProjects = async (query = '', option = 'title', page = 1) => {
    try {
      if (!query) {
        setFilteredData([]); // If no query, clear filtered data and exit
        return;
      }

      let params = { query, option, page, itemsPerPage };

      const response = await axios.get('/api/projects', { params });
      const projects = response.data || [];

      const projectsWithDetails = await Promise.all(
        projects.map(async (project) => {
          const authors = await fetchAuthors(project.project_id);
          const keywords = await fetchKeywords(project.project_id);
          return { ...project, authors, keywords }; // Adding authors and keywords to the project
        })
      );

      setFilteredData(projectsWithDetails);
      setCurrentPage(page);  // Keep the current page
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    // Trigger fetchProjects when searchQuery or searchOption changes
    fetchProjects(searchQuery, searchOption, currentPage);
  }, [searchQuery, searchOption]);

  const handleSearchChange = (query) => {
    clearTimeout(debounceTimer.current);
    setTypedQuery(query); // Set typed query immediately
  };

  const handleOptionChange = (option) => {
    setSearchOption(option);
    setCurrentPage(1);  // Reset to first page when option changes
    fetchProjects(searchQuery, option, 1); // Refetch with new option, but page reset
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchQuery(typedQuery); // Update searchQuery when the button is clicked
    setCurrentPage(1); // Reset to page 1 on new search
    fetchProjects(typedQuery, searchOption, 1); // Trigger search manually
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="search-page-container">
      <div className="filter-sidebar">
        <form className="fsearch-bar" onSubmit={handleSearchSubmit}>
          <SearchBar
            query={typedQuery}
            onChange={handleSearchChange}
            selectedOption={searchOption}
            onOptionChange={handleOptionChange}
            onSearch={handleSearchSubmit} // Ensure onSearch is for button click
          />
        </form>
        <h4>Filter by Category</h4>
        <SubjectFilter
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          onApply={() => fetchProjects(searchQuery, searchOption, 1)}
        />
      </div>

      <div className="results-content">
        <div className="breadcrumb-recent-container">
            <h3>{searchQuery ? `Search Results for "${searchQuery}"` : ''}</h3>
          <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Search', link: '/search' }]} />
        </div>

        <div className="results-list-container">
          {searchQuery && currentItems.length > 0 ? (
            currentItems.map((project) => (
              <div key={project.project_id} className="research-card">
                <Link to={`/DocumentOverview/${project.project_id}`} className="title-link">
                  <h4>{project.title}</h4>
                </Link>

                {/* Authors Section */}
                <p className="category">
                  <FontAwesomeIcon icon={faUser} />{' '}
                  {Array.isArray(project.authors) && project.authors.length > 0 ? (
                    project.authors.map((author, index) => (
                      <span key={author.author_id || index}>
                        <Link to={`/AuthorOverview/${author.author_id}`} className="author-link">
                          {author.name}
                        </Link>
                        {index < project.authors.length - 1 && ', '}
                      </span>
                    ))
                  ) : (
                    'No authors listed'
                  )}
                </p>

                {/* Date and Keywords Section */}
                <p className="category">
                  <FontAwesomeIcon icon={faCalendar} /> {new Date(project.created_at).toLocaleDateString()} &bull;
                  {/* Keywords */}
                  <FontAwesomeIcon icon={faTags} />{' '}
                  {Array.isArray(project.keywords) && project.keywords.length > 0 ? (
                    project.keywords.map((keyword, index) => (
                      <span key={keyword.keyword_id || index}>
                        <Link to={`/KeywordOverview/${keyword.keyword_id}`} className="keyword-link">
                          {keyword.keyword} {/* Using 'keyword' field for the name */}
                        </Link>
                        {index < project.keywords.length - 1 && ', '}
                      </span>
                    ))
                  ) : (
                    'No keywords listed'
                  )}
                </p>

                {/* Abstract */}
                <div className="abstract-container">
                  {project.abstract || 'No abstract available.'}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results-message">No search results to display</div>
          )}
        </div>

        {searchQuery && currentItems.length > 0 && (
          <div className="pagination">
            {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`pagination-button ${page === currentPage ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;

import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../../components/Searchbar';
import SubjectFilter from '../../components/SubjectFilter/SubjectFilter'; // Import the SubjectFilter component
import Breadcrumb from '../../components/BreadCrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTags } from '@fortawesome/free-solid-svg-icons';
import './styles/filter.css';

function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber); // Update the current page state
  };

  const { query: initialQuery, option: initialOption } = location.state || { query: '', option: 'allfield' };

  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [typedQuery, setTypedQuery] = useState(initialQuery || '');
  const [searchOption, setSearchOption] = useState(initialOption);
  const [filteredData, setFilteredData] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // To store the total count of search results
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedCategories, setSelectedCategories] = useState([]); // Added state for selected categories
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch projects based on search query, option, selected categories, and page number
  const fetchProjects = async (query = '', option = 'allfields', page = 1, categories = []) => {
    setLoading(true); // Start loading
    try {
      console.log('Fetching projects with params:', { query, option, page, categories });
  
      let endpoint = '/api/search/allprojs';
      const params = { page, itemsPerPage };
  
      if (query && query !== '') {
        switch (option) {
          case 'title':
            endpoint = '/api/search/search/title';
            break;
          case 'author':
            endpoint = '/api/search/search/author';
            break;
          case 'keywords':
            endpoint = '/api/search/search/keywords';
            break;
          case 'abstract':
            endpoint = '/api/search/search/abstract';
            break;
          case 'allfields':
            endpoint = '/api/search/search/allfields';
            break;
          default:
            endpoint = '/api/search/allfields';
        }
        params.query = query; // Attach the query to params for search cases
      }
  
      if (categories.length > 0) {
        params.categories = categories; // Add categories to the params
      }
  
      const response = await axios.get(endpoint, { params });
      setFilteredData(response.data.data || []);
      setTotalCount(response.data.totalCount); // Update total count with the response
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };
  

  // On page load, if there's no search query, fetch all projects
  useEffect(() => {
    if (searchQuery === '') {
      // Fetch all projects when there is no search query
      fetchProjects('', searchOption, currentPage, selectedCategories);
    } else {
      fetchProjects(searchQuery, searchOption, currentPage, selectedCategories);
    }
  }, [searchQuery, searchOption, currentPage, selectedCategories]); // Add selectedCategories to the dependency list

  const handleSearchChange = (query) => {
    setTypedQuery(query); // Update typedQuery without triggering search
  };

  const handleOptionChange = (option) => {
    setSearchOption(option);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchQuery(typedQuery); // Update searchQuery and trigger search
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handleClearData = () => {
    setFilteredData([]); // Clear the filteredData state
    setSearchQuery(''); // Optionally clear the search query as well
    setCurrentPage(1); // Optionally reset to the first page
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Search', link: '/search' }]} />
      </div>

      <div className="search-page-container">
        <div className="centered-content">
          <div className="search-results-wrapper">
            {/* Filters and Search Bar Section */}
            <div className="filters-container">
              <div className="search-bar-wrapper">
                <SearchBar
                  query={typedQuery}
                  onChange={handleSearchChange} // Update typedQuery
                  selectedOption={searchOption}
                  onOptionChange={handleOptionChange}
                  onSearch={handleSearchSubmit} // Explicit search only on submit
                />
              </div>

              {/* Subject Filter Section */}
              <div className="subject-filter-wrapper">
                <SubjectFilter
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  onApply={() => fetchProjects(searchQuery, searchOption, currentPage, selectedCategories)} // Pass selectedCategories
                />
              </div>
            </div>

            {/* Results Section */}
            <div className="results-list-container">
              {filteredData.length > 0 ? (
                <>
                  {/* Results Count */}
                  <div className="results-count">
                    <p>
                      {`Found ${totalCount} results for '${searchQuery}'. Showing ${indexOfFirstItem + 1} to ${Math.min(indexOfLastItem, totalCount)}.`}
                    </p>
                  </div>

                  {/* Display Results */}
                  {filteredData.map((project) => (
                    <div key={project.project_id} className="research-card">
                      <Link to={`/DocumentOverview/${project.project_id}`} className="title-link">
                        <h4>{project.title}</h4>
                      </Link>

                      {/* Authors Section */}
                      <p className="category">
                        <FontAwesomeIcon icon={faUser} />{' '}
                        {Array.isArray(project.authors) ? (
                          project.authors.map((author, index) => (
                            <span key={author.author_id || index}>
                              <Link to={`/AuthorOverview/${author.author_id}`} className="author-link">
                                {author.name}
                              </Link>
                              {index < project.authors.length - 1 && ', '}
                            </span>
                          ))
                        ) : project.authors ? (
                          project.authors.split(', ').map((authorName, index) => (
                            <span key={index}>
                              <Link to={`/AuthorOverview/${authorName}`} className="author-link">
                                {authorName}
                              </Link>
                              {index < project.authors.split(', ').length - 1 && ', '}
                            </span>
                          ))
                        ) : (
                          'No authors listed'
                        )}
                      </p>

                      {/* Keywords Section */}
                      <p className="category">
                        <FontAwesomeIcon icon={faTags} />{' '}
                        {Array.isArray(project.keywords) ? (
                          project.keywords.map((keyword, index) => (
                            <span key={keyword.keyword_id || index}>
                              <Link to={`/KeywordOverview/${encodeURIComponent(keyword.keyword_id)}`} className="keyword-link">
                                {keyword.keyword}
                              </Link>
                              {index < project.keywords.length - 1 && ', '}
                            </span>
                          ))
                        ) : project.keywords ? (
                          project.keywords.split(', ').map((keyword, index) => (
                            <span key={index}>
                              <Link to={`/KeywordOverview/${encodeURIComponent(keyword)}`} className="keyword-link">
                                {keyword}
                              </Link>
                              {index < project.keywords.split(', ').length - 1 && ', '}
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
                  ))}

                  {/* Pagination */}
                  <div className="pagination">
                    {currentPage > 1 && (
                      <button onClick={() => paginate(currentPage - 1)} className="pagination-button">
                        Previous
                      </button>
                    )}

                    {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    {currentPage < Math.ceil(totalCount / itemsPerPage) && (
                      <button onClick={() => paginate(currentPage + 1)} className="pagination-button">
                        Next
                      </button>
                    )}
                  </div>
                </>
              ) : loading ? (
                <div>Loading...</div>
              ) : (
                <div>No results found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchPage;

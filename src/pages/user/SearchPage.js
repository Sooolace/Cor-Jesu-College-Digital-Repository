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
  const [selectedResearchAreas, setSelectedResearchAreas] = useState([]); // Added state for research areas
  const [selectedTopics, setSelectedTopics] = useState([]); // Added state for topics
  const [loading, setLoading] = useState(false); // Loading state

  // Function to check cache before API call
  const checkCacheAndFetch = async (query, option, page, categories, researchAreas, topics) => {
    const cacheKey = `${query}-${option}-${categories.join(',')}-${researchAreas.join(',')}-${topics.join(',')}-${page}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      setFilteredData(parsedData.data);
      setTotalCount(parsedData.totalCount);
      setLoading(false);
    } else {
      fetchProjects(query, option, page, categories, researchAreas, topics);
    }
  };

  const fetchProjects = async (query = '', option = 'allfields', page = 1, categories = [], researchAreas = [], topics = []) => {
    setLoading(true);
    try {
      const endpointMap = {
        title: '/api/search/search/title',
        author: '/api/search/search/author',
        keywords: '/api/search/search/keywords',
        abstract: '/api/search/search/abstract',
        category: '/api/search/search/allprojs',
      };

      const endpoint = query && option in endpointMap ? endpointMap[option] : '/api/search/allprojs';

      // Create a params object with repeated array parameters for categories, researchAreas, and topics
      const params = {
        page,
        itemsPerPage,
        ...(query && { query }),
        ...(categories.length > 0 && { categories }),
        ...(researchAreas.length > 0 && { researchAreas }),
        ...(topics.length > 0 && { topics }),
      };

      const response = await axios.get(endpoint, { params });

      const dataToCache = {
        data: response.data.data || [],
        totalCount: response.data.totalCount,
      };

      // Cache the response with a key based on the search parameters
      const cacheKey = `${query}-${option}-${categories.join(',')}-${researchAreas.join(',')}-${topics.join(',')}-${page}`;
      localStorage.setItem(cacheKey, JSON.stringify(dataToCache));

      setFilteredData(response.data.data || []);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const [searchTrigger, setSearchTrigger] = useState(0); // Counter to trigger search explicitly

  useEffect(() => {
    console.log("Fetching projects with filters:", { searchQuery, selectedCategories, selectedResearchAreas, selectedTopics });
    checkCacheAndFetch(searchQuery, searchOption, currentPage, selectedCategories, selectedResearchAreas, selectedTopics);
  }, [searchTrigger, currentPage]); // Trigger fetch only on explicit search or page change

  const handleSearchChange = (query) => {
    setTypedQuery(query); // Update typedQuery without triggering search
  };

  const handleOptionChange = (option) => {
    setSearchOption(option); // Only update the selected option
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchQuery(typedQuery); // Update the query
    setCurrentPage(1); // Reset to page 1 on new search
    setSearchTrigger((prev) => prev + 1); // Increment the trigger counter to fetch data
  };

  const handleApplyFilters = (categories, researchAreas, topics) => {
    console.log("Applying Filters:", { categories, researchAreas, topics });
    setSelectedCategories(categories);
    setSelectedResearchAreas(researchAreas);
    setSelectedTopics(topics);
    setSearchTrigger((prev) => prev + 1); // Trigger a search
  };

  // Clear all filters and reset search
  const handleClearFilters = () => {
    setSelectedCategories([]); // Clear selected categories
    setSelectedResearchAreas([]); // Clear selected research areas
    setSelectedTopics([]); // Clear selected topics
    setSearchQuery(''); // Clear search query
    setTypedQuery(''); // Clear typed query
    setCurrentPage(1); // Reset to page 1
    setSearchTrigger((prev) => prev + 1); // Trigger the fetchProjects with cleared data
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
                  selectedCategories={selectedCategories} // Pass selected categories to SubjectFilter
                  setSelectedCategories={setSelectedCategories} // Pass the function to update categories
                  selectedResearchAreas={selectedResearchAreas} // Pass selected research areas to SubjectFilter
                  setSelectedResearchAreas={setSelectedResearchAreas} // Pass the function to update research areas
                  selectedTopics={selectedTopics} // Pass selected topics to SubjectFilter
                  setSelectedTopics={setSelectedTopics} // Pass the function to update topics
                  onApply={handleApplyFilters} // Pass handleApplyFilters function to apply selected filters
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
                      {`Found `}
                      <b>{totalCount}</b>
                      {` results for '`}<b>{searchQuery}</b>{`'. Showing page `}
                      <b>{indexOfFirstItem + 1}</b>
                      {` to `}
                      <b>{Math.min(indexOfLastItem, totalCount)}</b>
                      {`.`}
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

import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../../components/Searchbar';
import SubjectFilter from '../../components/SubjectFilter/SubjectFilter';
import Breadcrumb from '../../components/BreadCrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTags } from '@fortawesome/free-solid-svg-icons';
import './styles/filter.css';
import PaginationComponent from '../../components/PaginationComponent';
import AuthorFilter from '../../components/AuthorFilter';

function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const { query: initialQuery, option: initialOption } = location.state || { query: '', option: 'allfield' };

  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [typedQuery, setTypedQuery] = useState(initialQuery || '');
  const [searchOption, setSearchOption] = useState(initialOption);
  const [filteredData, setFilteredData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedAuthors, setSelectedAuthors] = useState([]);
<<<<<<< HEAD
=======

>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedResearchAreas, setSelectedResearchAreas] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / itemsPerPage); // Calculate total pages

  // Function to fetch data from API
<<<<<<< HEAD
  const fetchProjects = async (query = '', option = 'allfields', page = 1, categories = [], researchAreas = [], topics = [], authors = []) => {
=======
  const fetchProjects = async (query = '', option = 'allfields', page = 1, categories = [], researchAreas = [], topics = []) => {
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
    setLoading(true);
    try {
      const endpointMap = {
        allfields: '/api/search/allfields',
        title: '/api/search/search/title',
        author: '/api/search/search/author',
        keywords: '/api/search/search/keywords',
        abstract: '/api/search/search/abstract',
        category: '/api/search/allprojs',
      };

      const endpoint = query && option in endpointMap ? endpointMap[option] : '/api/search/allprojs';

      const params = {
        page,
        itemsPerPage,
        ...(query && { query }),
        ...(categories.length > 0 && { categories }),
        ...(researchAreas.length > 0 && { researchAreas }),
        ...(topics.length > 0 && { topics }),
<<<<<<< HEAD
        ...(authors.length > 0 && { authors }), // Include authors in params if any are selected
=======
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
      };

      const response = await axios.get(endpoint, { params });

      setFilteredData(response.data.data || []);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    console.log('Fetching projects with filters:', {
      searchQuery,
      selectedCategories,
      selectedResearchAreas,
<<<<<<< HEAD
      selectedTopics,
      selectedAuthors, // Include selected authors
    });

    fetchProjects(
      searchQuery,
      searchOption,
      currentPage,
      selectedCategories,
      selectedResearchAreas,
      selectedTopics,
      selectedAuthors // Pass selected authors to the API call
    );
  }, [searchTrigger, currentPage, selectedAuthors]); // Add selectedAuthors to the dependency array
=======
      selectedTopics
    });

    fetchProjects(searchQuery, searchOption, currentPage, selectedCategories, selectedResearchAreas, selectedTopics);
  }, [searchTrigger, currentPage]);
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137

  const handleSearchChange = (query) => {
    setTypedQuery(query);
  };

  const handleOptionChange = (option) => {
    setSearchOption(option);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchQuery(typedQuery);
    setCurrentPage(1);
    setSearchTrigger((prev) => prev + 1);
  };

  const handleApplyFilters = (categories, researchAreas, topics) => {
    console.log('Applying Filters:', { categories, researchAreas, topics });
    setSelectedCategories(categories);
    setSelectedResearchAreas(researchAreas);
    setSelectedTopics(topics);
    setSearchTrigger((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedResearchAreas([]);
    setSelectedTopics([]);
    setSearchQuery('');
    setTypedQuery('');
    setCurrentPage(1);
    setSearchTrigger((prev) => prev + 1);
  };
<<<<<<< HEAD

  const handleApplyAuthorFilters = (authors) => {
    console.log('Selected Authors:', authors);
    setSelectedAuthors(authors); // Update the selected authors state
    setSearchTrigger((prev) => prev + 1); // Trigger a search update
=======
  const handleApplyAuthorFilters = (authors) => {
    console.log('Selected Authors:', authors);
    // Implement further filtering logic here
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
  };

  // Cleanup effect to ensure no localStorage or cache references
  useEffect(() => {
    return () => {
      console.log('Cleaning up component state.');
      setSelectedCategories([]);
      setSelectedResearchAreas([]);
      setSelectedTopics([]);
      setSearchQuery('');
      setTypedQuery('');
      setCurrentPage(1);
      setFilteredData([]);
      setTotalCount(0);
    };
  }, []);

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
            
            {/* Search Bar */}
            <div className="filters-container">
              <div className="search-bar-wrapper">
                <SearchBar
                  query={typedQuery}
                  onChange={handleSearchChange}
                  selectedOption={searchOption}
                  onOptionChange={handleOptionChange}
                  onSearch={handleSearchSubmit}
                />
              </div>

              {/* Subject Filter */}
              <div className="subject-filter-wrapper">
                <SubjectFilter
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedResearchAreas={selectedResearchAreas}
                  setSelectedResearchAreas={setSelectedResearchAreas}
                  selectedTopics={selectedTopics}
                  setSelectedTopics={setSelectedTopics}
                  onApply={handleApplyFilters}
                />
              </div>
<<<<<<< HEAD

              {/* Author Filter */}
              <div className="author-filter-wrapper">
                <AuthorFilter
                  selectedAuthors={selectedAuthors}
                  setSelectedAuthors={setSelectedAuthors}
                  onApply={handleApplyAuthorFilters}
                />
              </div>
=======
      {/* Author Filter */}
      <div className="author-filter-wrapper">
        <AuthorFilter
          selectedAuthors={selectedAuthors}
          setSelectedAuthors={setSelectedAuthors}
          onApply={handleApplyAuthorFilters}
        />
      </div>
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137

            </div>

            {/* Search Results */}
            <div className="results-list-container">
              {filteredData.length > 0 ? (
                <>
                  {/* Search Result Information */}
                  <div className="results-count">
                    <p>
                      {`Found `}
                      <b>{totalCount}</b>
                      {` results for '`}
                      <b>{searchQuery}</b>
                      {`'. Showing page `}<b>{indexOfFirstItem + 1}</b> {` to `}<b>{Math.min(indexOfLastItem, totalCount)}</b>.
                    </p>
                  </div>

                  {/* Mapping through search results */}
                  {filteredData.map((project) => (
                    <div key={project.project_id} className="research-card">
                      <Link to={`/DocumentOverview/${project.project_id}`} className="title-link">
                        <h4>{project.title}</h4>
                      </Link>

                      {/* Display Authors */}
                      <p className="category">
                        <FontAwesomeIcon icon={faUser} />
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

                      {/* Display Keywords */}
                      <p className="category">
                        <FontAwesomeIcon icon={faTags} />
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

                      {/* Abstract Container */}
                      <div className="abstract-container">
                        {project.abstract || 'No abstract available.'}
                      </div>
                    </div>
                  ))}

                  {/* Pagination Component */}
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}  // Correctly passing totalPages
                    handlePageChange={newPage => setCurrentPage(newPage)}
                  />
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

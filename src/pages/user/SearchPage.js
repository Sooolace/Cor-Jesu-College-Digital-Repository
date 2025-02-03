import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../../components/Searchbar';
import SubjectFilter from '../../components/SubjectFilter/SubjectFilter';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';
import AuthorFilter from '../../components/UniqueAuthorFilter';
import KeywordFilter from '../../components/KeywordFilter';
import './styles/filter.css';
import { FaTag } from 'react-icons/fa'; // Import a valid icon

function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { query: initialQuery, option: initialOption, page: initialPage, authors: initialAuthors, categories: initialCategories, researchAreas: initialResearchAreas, topics: initialTopics, keywords: initialKeywords } = location.state || { query: '', option: 'allfields', page: 1, authors: [], categories: [], researchAreas: [], topics: [], keywords: [] };

  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [typedQuery, setTypedQuery] = useState(initialQuery || '');
  const [searchOption, setSearchOption] = useState(initialOption);
  const [filteredData, setFilteredData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 5;
  const [selectedAuthors, setSelectedAuthors] = useState(initialAuthors);
  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [selectedResearchAreas, setSelectedResearchAreas] = useState(initialResearchAreas);
  const [selectedTopics, setSelectedTopics] = useState(initialTopics);
  const [selectedKeywords, setSelectedKeywords] = useState(initialKeywords);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / itemsPerPage); // Calculate total pages

  // Function to fetch data from API
  const fetchProjects = async (query = '', option = 'allfields', page = 1, categories = [], researchAreas = [], topics = [], authors = [], keywords = []) => {
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
        ...(authors.length > 0 && { authors }), // Include authors in params if any are selected
        ...(keywords.length > 0 && { keywords }), // Include keywords in params if any are selected
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
      selectedTopics,
      selectedAuthors, // Include selected authors
      selectedKeywords, // Include selected keywords
    });

    fetchProjects(
      searchQuery,
      searchOption,
      currentPage,
      selectedCategories,
      selectedResearchAreas,
      selectedTopics,
      selectedAuthors, // Pass selected authors to the API call
      selectedKeywords // Pass selected keywords to the API call
    );
  }, [searchTrigger, currentPage]); // Remove selectedAuthors from the dependency array

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
    navigate('/search', { state: { query: typedQuery, option: searchOption, page: 1, authors: selectedAuthors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords: selectedKeywords } });
  };

  const handleApplyFilters = (categories, researchAreas, topics) => {
    console.log('Applying Filters:', { categories, researchAreas, topics });
    setSelectedCategories(categories);
    setSelectedResearchAreas(researchAreas);
    setSelectedTopics(topics);
    setSearchTrigger((prev) => prev + 1);
    navigate('/search', { state: { query: searchQuery, option: searchOption, page: 1, authors: selectedAuthors, categories, researchAreas, topics, keywords: selectedKeywords } });
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

  const handleApplyAuthorFilters = (authors) => {
    console.log('Selected Authors:', authors);
    setSelectedAuthors(authors); // Update the selected authors state
    setSearchTrigger((prev) => prev + 1); // Trigger a search update
    navigate('/search', { state: { query: searchQuery, option: searchOption, page: 1, authors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords: selectedKeywords } });
  };

  const handleApplyKeywordFilters = (keywords) => {
    console.log('Selected Keywords:', keywords);
    setSelectedKeywords(keywords); // Update the selected keywords state
    setSearchTrigger((prev) => prev + 1); // Trigger a search update
    navigate('/search', { state: { query: searchQuery, option: searchOption, page: 1, authors: selectedAuthors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords } });
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

  const MemoizedSearchBar = useMemo(() => (
    <SearchBar
      query={typedQuery}
      onChange={handleSearchChange}
      selectedOption={searchOption}
      onOptionChange={handleOptionChange}
      onSearch={handleSearchSubmit}
    />
  ), [typedQuery, searchOption]);

  const MemoizedSubjectFilter = useMemo(() => (
    <SubjectFilter
      selectedCategories={selectedCategories}
      setSelectedCategories={setSelectedCategories}
      selectedResearchAreas={selectedResearchAreas}
      setSelectedResearchAreas={setSelectedResearchAreas}
      selectedTopics={selectedTopics}
      setSelectedTopics={setSelectedTopics}
      onApply={handleApplyFilters}
    />
  ), [selectedCategories, selectedResearchAreas, selectedTopics]);

  const MemoizedAuthorFilter = useMemo(() => (
    <AuthorFilter
      selectedAuthors={selectedAuthors}
      setSelectedAuthors={setSelectedAuthors}
      onApply={handleApplyAuthorFilters}
    />
  ), [selectedAuthors]);

  const MemoizedKeywordFilter = useMemo(() => (
    <KeywordFilter
      selectedKeywords={selectedKeywords}
      setSelectedKeywords={setSelectedKeywords}
      onApply={handleApplyKeywordFilters}
    />
  ), [selectedKeywords]);

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Search', link: '/search' }]} />
      </div>
      <div className="search-page-container">
        <div className="centered-content">
          <div className="search-results-wrapper">
            
            {/* Filters Container */}
            <div className="filters-container" style={{ width: '380px' }}>
              {/* Search Bar */}
              <div className="search-bar-wrapper">
                {MemoizedSearchBar}
              </div>

              {/* Subject Filter */}
              <div className="filter-section subject-filter-wrapper">
                {MemoizedSubjectFilter}
              </div>

              {/* Author Filter */}
              <div className="filter-section">
                {MemoizedAuthorFilter}
              </div>

              {/* Keyword Filter */}
              <div className="filter-section">
                {MemoizedKeywordFilter}
              </div>
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
                      <Link to={`/DocumentOverview/${project.project_id}`} className="title-link" state={{ fromSearch: true }}>
                        <h4 style={{ color: '#007bff' }}>{project.title}</h4>
                      </Link>
                      {project.cover_image && (
                        <img
                          src={project.cover_image}
                          alt="Cover"
                          style={{
                            maxWidth: '80px', // Limit max width
                            height: '120px',  // Set a fixed height
                            objectFit: 'cover', // Ensure the image covers the area without stretching
                            marginRight: '20px',
                          }}
                        />
                      )}
                      {/* Display Authors */}
                      <p className="category">
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

                      {/* Abstract Container */}
                      <div className="abstract-container" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>
                        {project.abstract || 'No abstract available.'}
                      </div>

                      {/* Display Keywords */}
                      <p className="category">
                        {Array.isArray(project.keywords) ? (
                          project.keywords.map((keyword, index) => (
                            <span key={keyword.keyword_id || index}>
                              {index === 0 && <FaTag />} {/* Add icon next to the first keyword */}
                              <Link to={`/KeywordOverview/${encodeURIComponent(keyword.keyword_id)}`} className="keyword-link">
                                {keyword.keyword}
                              </Link>
                              {index < project.keywords.length - 1 && ', '}
                            </span>
                          ))
                        ) : project.keywords ? (
                          project.keywords.split(', ').map((keyword, index) => (
                            <span key={index}>
                              {index === 0 && <FaTag />} {/* Add icon next to the first keyword */}
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
                    </div>
                  ))}

                  {/* Pagination Component */}
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}  // Correctly passing totalPages
                    handlePageChange={newPage => {
                      setCurrentPage(newPage);
                      navigate('/search', { state: { query: searchQuery, option: searchOption, page: newPage, authors: selectedAuthors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords: selectedKeywords } });
                    }}
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

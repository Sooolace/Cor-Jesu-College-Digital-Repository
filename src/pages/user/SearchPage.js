import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../../components/Searchbar';
import SubjectFilter from '../../components/SubjectFilter/SubjectFilter';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';
import AuthorFilter from '../../components/UniqueAuthorFilter';
import KeywordFilter from '../../components/KeywordFilter';
import YearRangeFilter from '../../components/YearRangeFilter'; // Import YearRangeFilter
import './styles/filter.css';
import { FaTag } from 'react-icons/fa'; // Import a valid icon

function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Load initial state from localStorage if available
  const storedState = JSON.parse(localStorage.getItem('searchState')) || {};
  const { query: initialQuery, option: initialOption, page: initialPage, authors: initialAuthors, categories: initialCategories, researchAreas: initialResearchAreas, topics: initialTopics, keywords: initialKeywords, years: initialYears, totalCount: initialTotalCount, filteredData: initialFilteredData } = storedState;

  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [typedQuery, setTypedQuery] = useState(initialQuery || '');
  const [searchOption, setSearchOption] = useState(initialOption);
  const [filteredData, setFilteredData] = useState(initialFilteredData || []);
  const [totalCount, setTotalCount] = useState(initialTotalCount || 0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 5;
  const [selectedAuthors, setSelectedAuthors] = useState(initialAuthors || []);
  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [selectedResearchAreas, setSelectedResearchAreas] = useState(initialResearchAreas);
  const [selectedTopics, setSelectedTopics] = useState(initialTopics);
  const [selectedKeywords, setSelectedKeywords] = useState(initialKeywords || []);
  const [selectedYears, setSelectedYears] = useState([1900, new Date().getFullYear()]); // Add state for selected years
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / itemsPerPage); // Calculate total pages

  // Function to fetch data from API
  const fetchProjects = async (query = '', option = 'allfields', page = 1, categories = [], researchAreas = [], topics = [], authors = [], keywords = [], years = []) => {
    setLoading(true);
    try {
      let endpoint;
      let params;

      // Check if this is an advanced search
      if (location.state?.advancedSearch) {
        endpoint = '/api/search/advanced';
        params = {
          page,
          itemsPerPage,
          searchFields: location.state.searchParams.searchFields,
          dateRange: location.state.searchParams.dateRange,
          ...(categories.length > 0 && { categories }),
          ...(researchAreas.length > 0 && { researchAreas }),
          ...(topics.length > 0 && { topics }),
          ...(authors.length > 0 && { authors }),
          ...(keywords.length > 0 && { keywords }),
          ...(years.length === 2 && { fromYear: years[0], toYear: years[1] })
        };
      } else {
        const endpointMap = {
          allfields: '/api/search/allfields',
          title: '/api/search/search/title',
          author: '/api/search/search/author',
          keywords: '/api/search/search/keywords',
          abstract: '/api/search/search/abstract',
          category: '/api/search/allprojs',
        };

        endpoint = query && option in endpointMap ? endpointMap[option] : '/api/search/allprojs';

        params = {
          page,
          itemsPerPage,
          ...(query && { query }),
          ...(categories.length > 0 && { categories }),
          ...(researchAreas.length > 0 && { researchAreas }),
          ...(topics.length > 0 && { topics }),
          ...(authors.length > 0 && { authors }),
          ...(keywords.length > 0 && { keywords }),
          ...(years.length === 2 && { fromYear: years[0], toYear: years[1] })
        };
      }

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
      selectedYears, // Include selected years
    });

    fetchProjects(
      searchQuery,
      searchOption,
      currentPage,
      selectedCategories,
      selectedResearchAreas,
      selectedTopics,
      selectedAuthors, // Pass selected authors to the API call
      selectedKeywords, // Pass selected keywords to the API call
      selectedYears // Pass selected years to the API call
    );
  }, [searchTrigger, currentPage]); // Remove selectedAuthors from the dependency array

  useEffect(() => {
    // Save current state to localStorage
    const stateToStore = {
      query: searchQuery,
      option: searchOption,
      page: currentPage,
      authors: selectedAuthors,
      categories: selectedCategories,
      researchAreas: selectedResearchAreas,
      topics: selectedTopics,
      keywords: selectedKeywords,
      years: selectedYears,
      totalCount,
      filteredData,
    };
    localStorage.setItem('searchState', JSON.stringify(stateToStore));
  }, [searchQuery, searchOption, currentPage, selectedAuthors, selectedCategories, selectedResearchAreas, selectedTopics, selectedKeywords, selectedYears, totalCount, filteredData]);

  const handleSearchChange = (query) => {
    setTypedQuery(query);
    setSearchQuery(query);
  };

  const handleOptionChange = (option) => {
    setSearchOption(option);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setSearchTrigger((prev) => prev + 1);
    navigate('/search', { 
      state: { 
        query: typedQuery, 
        option: searchOption, 
        page: 1, 
        authors: selectedAuthors, 
        categories: selectedCategories, 
        researchAreas: selectedResearchAreas, 
        topics: selectedTopics, 
        keywords: selectedKeywords, 
        years: selectedYears 
      } 
    });
  };

  const handleApplyFilters = (categories, researchAreas, topics) => {
    console.log('Applying Filters:', { categories, researchAreas, topics });
    setSelectedCategories(categories);
    setSelectedResearchAreas(researchAreas);
    setSelectedTopics(topics);
    setSearchTrigger((prev) => prev + 1);
    navigate('/search', { state: { query: searchQuery, option: searchOption, page: 1, authors: selectedAuthors, categories, researchAreas, topics, keywords: selectedKeywords, years: selectedYears } });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedResearchAreas([]);
    setSelectedTopics([]);
    setSearchQuery('');
    setTypedQuery('');
    setCurrentPage(1);
    setSearchTrigger((prev) => prev + 1);
    localStorage.removeItem('searchState'); // Clear localStorage
  };

  const handleApplyAuthorFilters = (authors) => {
    console.log('Selected Authors:', authors);
    setSelectedAuthors(authors); // Update the selected authors state
    setSearchTrigger((prev) => prev + 1); // Trigger a search update
    navigate('/search', { state: { query: searchQuery, option: searchOption, page: 1, authors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords: selectedKeywords, years: selectedYears } });
  };

  const handleApplyKeywordFilters = (keywords) => {
    console.log('Selected Keywords:', keywords);
    setSelectedKeywords(keywords); // Update the selected keywords state
    setSearchTrigger((prev) => prev + 1); // Trigger a search update
    navigate('/search', { state: { query: searchQuery, option: searchOption, page: 1, authors: selectedAuthors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords, years: selectedYears } });
  };

  const handleApplyYearFilters = (years) => {
    console.log('Selected Years:', years);
    setSelectedYears(years); // Update the selected years state
    setSearchTrigger((prev) => prev + 1); // Trigger a search update
    navigate('/search', { state: { query: searchQuery, option: searchOption, page: 1, authors: selectedAuthors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords: selectedKeywords, years } });
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

  const MemoizedYearRangeFilter = useMemo(() => (
    <YearRangeFilter
      onApply={handleApplyYearFilters}
    />
  ), []);

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

              {/* Year Range Filter */}
              <div className="filter-section">
                {MemoizedYearRangeFilter}
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

                      {/* Add publication date in italic and adjust margins to make it closer to the author */}
                      <p className="publication-date" style={{ marginTop: '-10px' }}>
                        {project.publication_date ? <i>{new Date(project.publication_date).toLocaleDateString()}</i> : <i>Publication date not available</i>}
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
                      navigate('/search', { state: { query: searchQuery, option: searchOption, page: newPage, authors: selectedAuthors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords: selectedKeywords, years: selectedYears } });
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

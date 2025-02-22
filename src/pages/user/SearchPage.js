import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../../components/Searchbar';
import SubjectFilter from '../../components/SubjectFilter/SubjectFilter';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';
import AuthorFilter from '../../components/UniqueAuthorFilter';
import KeywordFilter from '../../components/KeywordFilter';
import YearRangeFilter from '../../components/YearRangeFilter';
import './styles/filter.css';
import { FaTag } from 'react-icons/fa';

function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state || {};
  
  const initialState = {
    query: locationState.query || '',
    option: locationState.option || 'allfields',
    page: locationState.page || 1,
    authors: locationState.authors || [],
    categories: locationState.categories || [],
    researchAreas: locationState.researchAreas || [],
    topics: locationState.topics || [],
    keywords: locationState.keywords || [],
    years: locationState.years || [1900, new Date().getFullYear()],
  };

  const [inputValue, setInputValue] = useState(initialState.query);
  const [searchQuery, setSearchQuery] = useState(initialState.query);
  const [searchOption, setSearchOption] = useState(initialState.option);
  const [filteredData, setFilteredData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const itemsPerPage = 5;
  const [selectedAuthors, setSelectedAuthors] = useState(initialState.authors);
  const [selectedCategories, setSelectedCategories] = useState(initialState.categories);
  const [selectedResearchAreas, setSelectedResearchAreas] = useState(initialState.researchAreas);
  const [selectedTopics, setSelectedTopics] = useState(initialState.topics);
  const [selectedKeywords, setSelectedKeywords] = useState(initialState.keywords);
  const [selectedYears, setSelectedYears] = useState(initialState.years);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const fetchProjects = async (query = '', option = 'allfields', page = 1, categories = [], researchAreas = [], topics = [], authors = [], keywords = [], years = []) => {
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
        ...(authors.length > 0 && { authors }),
        ...(keywords.length > 0 && { keywords }),
        ...(years.length === 2 && { fromYear: years[0], toYear: years[1] }),
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

  useEffect(() => {
    setLoading(true);
    fetchProjects(
      initialState.query,
      initialState.option,
      initialState.page,
      initialState.categories,
      initialState.researchAreas,
      initialState.topics,
      initialState.authors,
      initialState.keywords,
      initialState.years
    );
  }, []);

  useEffect(() => {
    if (location.state) {
      const query = location.state.query || '';
      setInputValue(query);
      setSearchQuery(query);
      setCurrentPage(location.state.page || 1);
      setSearchOption(location.state.option || searchOption);
      fetchProjects(
        query,
        location.state.option || searchOption,
        location.state.page || 1,
        location.state.categories || selectedCategories,
        location.state.researchAreas || selectedResearchAreas,
        location.state.topics || selectedTopics,
        location.state.authors || selectedAuthors,
        location.state.keywords || selectedKeywords,
        location.state.years || selectedYears
      );
    }
  }, [location.state]);

  const handleSearchChange = useCallback((query) => {
    setInputValue(query);
  }, []);

  const handleOptionChange = useCallback((option) => {
    setSearchOption(option);
  }, []);

  const handleSearchSubmit = useCallback((event) => {
    if (event) {
      event.preventDefault();
    }
    navigate('/search', { 
      state: { 
        query: inputValue, 
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
  }, [inputValue, searchOption, selectedAuthors, selectedCategories, selectedResearchAreas, selectedTopics, selectedKeywords, selectedYears, navigate]);

  const handleClearSearch = useCallback(() => {
    setInputValue('');
    navigate('/search', { 
      state: { 
        query: '', 
        option: searchOption,
        page: 1
      } 
    });
  }, [searchOption, navigate]);

  const handleApplyFilters = useCallback((categories, researchAreas, topics) => {
    console.log('Applying Filters:', { categories, researchAreas, topics });
    setSelectedCategories(categories);
    setSelectedResearchAreas(researchAreas);
    setSelectedTopics(topics);
    navigate('/search', { state: { query: searchQuery, option: searchOption, page: 1, authors: selectedAuthors, categories, researchAreas, topics, keywords: selectedKeywords, years: selectedYears } });
  }, [searchQuery, searchOption, selectedAuthors, selectedKeywords, selectedYears, navigate]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedResearchAreas([]);
    setSelectedTopics([]);
    setInputValue('');
    navigate('/search', { state: { query: '', option: 'allfields', page: 1 } });
  }, [navigate]);

  const handleApplyAuthorFilters = useCallback((authors) => {
    console.log('Selected Authors:', authors);
    setSelectedAuthors(authors);
    navigate('/search', { state: { query: searchQuery, option: searchOption, page: 1, authors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords: selectedKeywords, years: selectedYears } });
  }, [searchQuery, searchOption, selectedCategories, selectedResearchAreas, selectedTopics, selectedKeywords, selectedYears, navigate]);

  const handleApplyKeywordFilters = useCallback((keywords) => {
    console.log('Selected Keywords:', keywords);
    setSelectedKeywords(keywords);
    navigate('/search', { state: { query: searchQuery, option: searchOption, page: 1, authors: selectedAuthors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords, years: selectedYears } });
  }, [searchQuery, searchOption, selectedAuthors, selectedCategories, selectedResearchAreas, selectedTopics, selectedYears, navigate]);

  const handleApplyYearFilters = useCallback((years) => {
    console.log('Selected Years:', years);
    setSelectedYears(years);
    navigate('/search', { state: { query: searchQuery, option: searchOption, page: 1, authors: selectedAuthors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords: selectedKeywords, years } });
  }, [searchQuery, searchOption, selectedAuthors, selectedCategories, selectedResearchAreas, selectedTopics, selectedKeywords, navigate]);

  useEffect(() => {
    return () => {
      console.log('Cleaning up component state.');
      setSelectedCategories([]);
      setSelectedResearchAreas([]);
      setSelectedTopics([]);
      setSearchQuery('');
      setCurrentPage(1);
      setFilteredData([]);
      setTotalCount(0);
    };
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const MemoizedSearchBar = useMemo(() => (
    <SearchBar
      query={inputValue}
      onChange={handleSearchChange}
      selectedOption={searchOption}
      onOptionChange={handleOptionChange}
      onSearch={handleSearchSubmit}
      onClear={handleClearSearch}
    />
  ), [inputValue, searchOption, handleSearchChange, handleOptionChange, handleSearchSubmit, handleClearSearch]);

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
      selectedYears={selectedYears}
      setSelectedYears={setSelectedYears}
      onApply={handleApplyYearFilters}
    />
  ), [selectedYears, handleApplyYearFilters]);

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Search', link: '/search' }]} />
      </div>
      <div className="search-page-container">
        <div className="centered-content">
          <div className="search-results-wrapper">
            <div className="sidebar">
              {/* Filters Container */}
              <div className="filters-container">
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
                            maxWidth: '80px',
                            height: '120px',
                            objectFit: 'cover',
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
                              {index === 0 && <FaTag />}
                              <Link to={`/KeywordOverview/${encodeURIComponent(keyword.keyword_id)}`} className="keyword-link">
                                {keyword.keyword}
                              </Link>
                              {index < project.keywords.length - 1 && ', '}
                            </span>
                          ))
                        ) : project.keywords ? (
                          project.keywords.split(', ').map((keyword, index) => (
                            <span key={index}>
                              {index === 0 && <FaTag />}
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
                    totalPages={totalPages}
                    handlePageChange={newPage => {
                      setCurrentPage(newPage);
                      navigate('/search', { state: { query: searchQuery, option: searchOption, page: newPage, authors: selectedAuthors, categories: selectedCategories, researchAreas: selectedResearchAreas, topics: selectedTopics, keywords: selectedKeywords, years: selectedYears } });
                    }}
                  />
                </>
              ) : !loading && (
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '200px',
                  fontSize: '1.2em',
                  color: '#666'
                }}>
                  No results                  No results found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchPage;
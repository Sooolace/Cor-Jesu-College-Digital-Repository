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
import { FaTag, FaFilter, FaTimes, FaChevronDown, FaChevronUp, FaSpinner } from 'react-icons/fa';

function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state || {};
  
  const initialState = {
    query: locationState.query || '',
    option: locationState.option || 'allfields',
    page: locationState.page || 1,
    authors: Array.isArray(locationState.authors) ? locationState.authors : [],
    categories: Array.isArray(locationState.categories) ? locationState.categories : [],
    researchAreas: Array.isArray(locationState.researchAreas) ? locationState.researchAreas : [],
    topics: Array.isArray(locationState.topics) ? locationState.topics : [],
    keywords: Array.isArray(locationState.keywords) ? locationState.keywords : [],
    years: Array.isArray(locationState.yearRange) ? locationState.yearRange : 
           Array.isArray(locationState.years) ? locationState.years : 
           [1900, new Date().getFullYear()],
    advancedSearchInputs: Array.isArray(locationState.advancedSearchInputs) ? locationState.advancedSearchInputs : [],
  };

  const [inputValue, setInputValue] = useState(initialState.query);
  const [searchQuery, setSearchQuery] = useState(initialState.query);
  const [searchOption, setSearchOption] = useState(initialState.option);
  const [filteredData, setFilteredData] = useState(() => {
    try {
      const cached = sessionStorage.getItem('searchResults');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error parsing cached search results:', error);
      return [];
    }
  });
  const [totalCount, setTotalCount] = useState(() => {
    try {
      const cached = sessionStorage.getItem('searchTotalCount');
      return cached ? parseInt(cached) : 0;
    } catch (error) {
      console.error('Error parsing cached total count:', error);
      return 0;
    }
  });
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const itemsPerPage = 5;
  const [selectedAuthors, setSelectedAuthors] = useState(() => {
    try {
      const cached = sessionStorage.getItem('selectedAuthors');
      return cached ? JSON.parse(cached) : initialState.authors;
    } catch (error) {
      console.error('Error parsing cached authors:', error);
      return initialState.authors;
    }
  });
  const [selectedCategories, setSelectedCategories] = useState(() => {
    try {
      const cached = sessionStorage.getItem('selectedCategories');
      return cached ? JSON.parse(cached) : initialState.categories;
    } catch (error) {
      console.error('Error parsing cached categories:', error);
      return initialState.categories;
    }
  });
  const [selectedResearchAreas, setSelectedResearchAreas] = useState(() => {
    try {
      const cached = sessionStorage.getItem('selectedResearchAreas');
      return cached ? JSON.parse(cached) : initialState.researchAreas;
    } catch (error) {
      console.error('Error parsing cached research areas:', error);
      return initialState.researchAreas;
    }
  });
  const [selectedTopics, setSelectedTopics] = useState(() => {
    try {
      const cached = sessionStorage.getItem('selectedTopics');
      return cached ? JSON.parse(cached) : initialState.topics;
    } catch (error) {
      console.error('Error parsing cached topics:', error);
      return initialState.topics;
    }
  });
  const [selectedKeywords, setSelectedKeywords] = useState(() => {
    try {
      const cached = sessionStorage.getItem('selectedKeywords');
      return cached ? JSON.parse(cached) : initialState.keywords;
    } catch (error) {
      console.error('Error parsing cached keywords:', error);
      return initialState.keywords;
    }
  });
  const [selectedYears, setSelectedYears] = useState(() => {
    try {
      const cached = sessionStorage.getItem('selectedYears');
      return cached ? JSON.parse(cached) : initialState.years;
    } catch (error) {
      console.error('Error parsing cached years:', error);
      return initialState.years;
    }
  });
  // Initialize loading to false if we have cached data
  const [loading, setLoading] = useState(() => {
    const hasCache = sessionStorage.getItem('searchResults') && 
                    sessionStorage.getItem('searchTotalCount');
    return !hasCache;
  });

  // Add new state for mobile filter toggle
  const [showFilters, setShowFilters] = useState(true);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const fetchProjects = async (query = '', option = 'allfields', page = 1, categories = [], researchAreas = [], topics = [], authors = [], keywords = [], years = [], advancedSearchInputs = []) => {
    // Only show loading if we're fetching new data
    const isFetchingNew = !sessionStorage.getItem('searchResults') || 
                         query !== searchQuery || 
                         page !== currentPage;
    if (isFetchingNew) {
      setLoading(true);
    }
    
    try {
      // Extract IDs if the filter items are objects
      const categoryIds = categories.map(cat => 
        typeof cat === 'object' && cat !== null ? cat.category_id : cat
      );
      
      const researchAreaIds = researchAreas.map(area => 
        typeof area === 'object' && area !== null ? area.research_area_id : area
      );
      
      const topicIds = topics.map(topic => 
        typeof topic === 'object' && topic !== null ? topic.topic_id : topic
      );
      
      const authorIds = authors.map(author => 
        typeof author === 'object' && author !== null ? author.author_id : author
      );
      
      const keywordIds = keywords.map(keyword => 
        typeof keyword === 'object' && keyword !== null ? keyword.keyword_id : keyword
      );
      
      let endpoint;
      let params;

      // Always include year range in params
      const yearRange = {
        startDate: years[0] || selectedYears[0],
        endDate: years[1] || selectedYears[1]
      };

      // Check if this is an advanced search
      if (location.state?.advancedSearch) {
        endpoint = '/api/search/advanced';
        
        // Prepare advanced search parameters
        const searchFields = location.state.advancedSearchInputs || [];
        
        // Serialize search fields to avoid complex nested objects in query params
        const serializedSearchFields = JSON.stringify(searchFields);
        
        params = {
          page,
          itemsPerPage,
          searchFields: serializedSearchFields,
          dateRange: JSON.stringify(yearRange)
        };
        
        // Add filter IDs if any
        if (categoryIds.length > 0) params.categories = categoryIds;
        if (researchAreaIds.length > 0) params.researchAreas = researchAreaIds;
        if (topicIds.length > 0) params.topics = topicIds;
        if (authorIds.length > 0) params.authors = authorIds;
        if (keywordIds.length > 0) params.keywords = keywordIds;
      } else {
        const endpointMap = {
          allfields: '/api/search/allfields',
          title: '/api/search/search/title',
          author: '/api/search/search/author',
          keywords: '/api/search/search/keywords',
          abstract: '/api/search/search/abstract',
          category: '/api/search/allprojs',
        };

        // If query is empty and no filters are applied, show all projects within year range
        if (!query.trim() && 
            categoryIds.length === 0 && 
            researchAreaIds.length === 0 && 
            topicIds.length === 0 && 
            authorIds.length === 0 && 
            keywordIds.length === 0 && 
            advancedSearchInputs.length === 0) {
          endpoint = '/api/search/allprojs';
          params = {
            page,
            itemsPerPage,
            fromYear: yearRange.startDate,
            toYear: yearRange.endDate
          };
        } else {
          endpoint = query && option in endpointMap ? endpointMap[option] : '/api/search/allprojs';
          params = {
            page,
            itemsPerPage,
            ...(query && { query }),
            ...(categoryIds.length > 0 && { categories: categoryIds }),
            ...(researchAreaIds.length > 0 && { researchAreas: researchAreaIds }),
            ...(topicIds.length > 0 && { topics: topicIds }),
            ...(authorIds.length > 0 && { authors: authorIds }),
            ...(keywordIds.length > 0 && { keywords: keywordIds }),
            fromYear: yearRange.startDate,
            toYear: yearRange.endDate,
            ...(advancedSearchInputs.length > 0 && { advancedSearchInputs }),
          };
        }
      }

      const response = await axios.get(endpoint, { params });

      const data = response.data.data || [];
      const count = response.data.totalCount;
      
      setFilteredData(data);
      setTotalCount(count);
      
      // Cache the results with error handling
      try {
        sessionStorage.setItem('searchResults', JSON.stringify(data));
        sessionStorage.setItem('searchTotalCount', count.toString());
      } catch (error) {
        // Error caching search results
      }
    } catch (error) {
      // Error fetching projects
      setFilteredData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we have cached data that matches current parameters, don't fetch
    const cachedResults = sessionStorage.getItem('searchResults');
    const cachedCount = sessionStorage.getItem('searchTotalCount');
    
    if (cachedResults && cachedCount && !location.state) {
      setFilteredData(JSON.parse(cachedResults));
      setTotalCount(parseInt(cachedCount));
      return;
    }

    // Only fetch if we don't have matching cached data
    fetchProjects(
      initialState.query,
      initialState.option,
      initialState.page,
      initialState.categories,
      initialState.researchAreas,
      initialState.topics,
      initialState.authors,
      initialState.keywords,
      initialState.years,
      initialState.advancedSearchInputs
    );
  }, [location.state]);

  useEffect(() => {
    if (location.state) {
      const query = location.state.query || '';
      const years = location.state.yearRange || location.state.years || selectedYears;
      
      // Update state without triggering loading
      setInputValue(query);
      setSearchQuery(query);
      setCurrentPage(location.state.page || 1);
      setSearchOption(location.state.option || searchOption);
      setSelectedYears(years);
      
      // Check if we have cached results for these exact parameters
      const cachedResults = sessionStorage.getItem('searchResults');
      const cachedCount = sessionStorage.getItem('searchTotalCount');
      
      if (cachedResults && cachedCount) {
        setFilteredData(JSON.parse(cachedResults));
        setTotalCount(parseInt(cachedCount));
      } else {
        fetchProjects(
          query,
          location.state.option || searchOption,
          location.state.page || 1,
          location.state.categories || selectedCategories,
          location.state.researchAreas || selectedResearchAreas,
          location.state.topics || selectedTopics,
          location.state.authors || selectedAuthors,
          location.state.keywords || selectedKeywords,
          years,
          location.state.advancedSearchInputs || initialState.advancedSearchInputs
        );
      }
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
    
    // Extract IDs for the navigation state
    const categoryIds = selectedCategories.map(cat => 
      typeof cat === 'object' && cat !== null ? cat.category_id : cat
    );
    const researchAreaIds = selectedResearchAreas.map(area => 
      typeof area === 'object' && area !== null ? area.research_area_id : area
    );
    const topicIds = selectedTopics.map(topic => 
      typeof topic === 'object' && topic !== null ? topic.topic_id : topic
    );
    const authorIds = selectedAuthors.map(author => 
      typeof author === 'object' && author !== null ? author.author_id : author
    );
    const keywordIds = selectedKeywords.map(keyword => 
      typeof keyword === 'object' && keyword !== null ? keyword.keyword_id : keyword
    );
    
    navigate('/search', { 
      state: { 
        query: inputValue, 
        option: searchOption, 
        page: 1, 
        authors: authorIds, 
        categories: categoryIds, 
        researchAreas: researchAreaIds, 
        topics: topicIds, 
        keywords: keywordIds, 
        years: selectedYears,
        advancedSearchInputs: initialState.advancedSearchInputs
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

  const handleApplyFilters = useCallback((filterData) => {
    // Update session storage for filters
    try {
      // console.log('Applying Filters (full data):', JSON.stringify(filterData));
      
      // Store the complete objects for display
      setSelectedCategories(filterData.categories || []);
      setSelectedResearchAreas(filterData.researchAreas || []);
      setSelectedTopics(filterData.topics || []);
      
      // Cache filter selections with error handling
      sessionStorage.setItem('selectedCategories', JSON.stringify(filterData.categories || []));
      sessionStorage.setItem('selectedResearchAreas', JSON.stringify(filterData.researchAreas || []));
      sessionStorage.setItem('selectedTopics', JSON.stringify(filterData.topics || []));
    } catch (error) {
      // Error caching filter selections
    }
    
    // Extract IDs for the navigation state (these will be passed to the API)
    const categoryIds = (filterData.categories || []).map(cat => typeof cat === 'object' && cat !== null ? cat.category_id : cat);
    const researchAreaIds = (filterData.researchAreas || []).map(area => typeof area === 'object' && area !== null ? area.research_area_id : area);
    const topicIds = (filterData.topics || []).map(topic => typeof topic === 'object' && topic !== null ? topic.topic_id : topic);
    
    navigate('/search', { 
      state: { 
        query: searchQuery, 
        option: searchOption, 
        page: 1, 
        authors: selectedAuthors, 
        categories: categoryIds,  // Use IDs for the API
        researchAreas: researchAreaIds,  // Use IDs for the API
        topics: topicIds,  // Use IDs for the API
        keywords: selectedKeywords, 
        years: selectedYears 
      } 
    });
  }, [searchQuery, searchOption, selectedAuthors, selectedKeywords, selectedYears, navigate]);

  const handleClearFilters = useCallback(() => {
    // Clear all filters from state and sessionStorage
    setSelectedCategories([]);
    setSelectedResearchAreas([]);
    setSelectedTopics([]);
    setSelectedAuthors([]);
    setSelectedKeywords([]);
    setSelectedYears([1900, new Date().getFullYear()]);
    setInputValue('');
    
    // Clear all cached data with error handling
    try {
      sessionStorage.removeItem('selectedCategories');
      sessionStorage.removeItem('selectedResearchAreas');
      sessionStorage.removeItem('selectedTopics');
      sessionStorage.removeItem('selectedAuthors');
      sessionStorage.removeItem('selectedKeywords');
      sessionStorage.removeItem('selectedYears');
    } catch (error) {
      // Error clearing cached data
    }
    
    navigate('/search', { state: { query: '', option: 'allfields', page: 1 } });
  }, [navigate]);

  const handleApplyAuthorFilters = useCallback((authors) => {
    try {
      // console.log('Selected Authors:', authors);
      setSelectedAuthors(authors);
      sessionStorage.setItem('selectedAuthors', JSON.stringify(authors));
    } catch (error) {
      // Error caching authors
    }
    
    // Extract IDs for navigation
    const authorIds = authors.map(author => 
      typeof author === 'object' && author !== null ? author.author_id : author
    );
    const categoryIds = selectedCategories.map(cat => 
      typeof cat === 'object' && cat !== null ? cat.category_id : cat
    );
    const researchAreaIds = selectedResearchAreas.map(area => 
      typeof area === 'object' && area !== null ? area.research_area_id : area
    );
    const topicIds = selectedTopics.map(topic => 
      typeof topic === 'object' && topic !== null ? topic.topic_id : topic
    );
    const keywordIds = selectedKeywords.map(keyword => 
      typeof keyword === 'object' && keyword !== null ? keyword.keyword_id : keyword
    );
    
    navigate('/search', { 
      state: { 
        query: searchQuery, 
        option: searchOption, 
        page: 1, 
        authors: authorIds, 
        categories: categoryIds, 
        researchAreas: researchAreaIds, 
        topics: topicIds, 
        keywords: keywordIds, 
        years: selectedYears 
      } 
    });
  }, [searchQuery, searchOption, selectedCategories, selectedResearchAreas, selectedTopics, selectedKeywords, selectedYears, navigate]);

  const handleApplyKeywordFilters = useCallback((keywords) => {
    try {
      // console.log('Selected Keywords:', keywords);
      setSelectedKeywords(keywords);
      sessionStorage.setItem('selectedKeywords', JSON.stringify(keywords));
    } catch (error) {
      // Error caching keywords
    }
    
    // Extract IDs for navigation
    const keywordIds = keywords.map(keyword => 
      typeof keyword === 'object' && keyword !== null ? keyword.keyword_id : keyword
    );
    const categoryIds = selectedCategories.map(cat => 
      typeof cat === 'object' && cat !== null ? cat.category_id : cat
    );
    const researchAreaIds = selectedResearchAreas.map(area => 
      typeof area === 'object' && area !== null ? area.research_area_id : area
    );
    const topicIds = selectedTopics.map(topic => 
      typeof topic === 'object' && topic !== null ? topic.topic_id : topic
    );
    const authorIds = selectedAuthors.map(author => 
      typeof author === 'object' && author !== null ? author.author_id : author
    );
    
    navigate('/search', { 
      state: { 
        query: searchQuery, 
        option: searchOption, 
        page: 1, 
        authors: authorIds, 
        categories: categoryIds, 
        researchAreas: researchAreaIds, 
        topics: topicIds, 
        keywords: keywordIds, 
        years: selectedYears 
      } 
    });
  }, [searchQuery, searchOption, selectedAuthors, selectedCategories, selectedResearchAreas, selectedTopics, selectedYears, navigate]);

  const handleApplyYearFilters = useCallback((years) => {
    try {
      // console.log('Selected Years:', years);
      setSelectedYears(years);
      sessionStorage.setItem('selectedYears', JSON.stringify(years));
    } catch (error) {
      // Error caching years
    }
    
    // Extract IDs for navigation
    const categoryIds = selectedCategories.map(cat => 
      typeof cat === 'object' && cat !== null ? cat.category_id : cat
    );
    const researchAreaIds = selectedResearchAreas.map(area => 
      typeof area === 'object' && area !== null ? area.research_area_id : area
    );
    const topicIds = selectedTopics.map(topic => 
      typeof topic === 'object' && topic !== null ? topic.topic_id : topic
    );
    const authorIds = selectedAuthors.map(author => 
      typeof author === 'object' && author !== null ? author.author_id : author
    );
    const keywordIds = selectedKeywords.map(keyword => 
      typeof keyword === 'object' && keyword !== null ? keyword.keyword_id : keyword
    );
    
    navigate('/search', { 
      state: { 
        query: searchQuery, 
        option: searchOption, 
        page: 1, 
        authors: authorIds, 
        categories: categoryIds, 
        researchAreas: researchAreaIds, 
        topics: topicIds, 
        keywords: keywordIds, 
        years: years 
      } 
    });
  }, [searchQuery, searchOption, selectedAuthors, selectedCategories, selectedResearchAreas, selectedTopics, selectedKeywords, navigate]);

  // Remove cleanup effect to maintain cache between navigations

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
      className="search-page-searchbar"
    />
  ), [inputValue, searchOption, handleSearchChange, handleOptionChange, handleSearchSubmit, handleClearSearch]);

  const MemoizedSubjectFilter = useMemo(() => (
    <SubjectFilter
      selectedCategories={selectedCategories}
      setSelectedCategories={setSelectedCategories}
      onApply={handleApplyFilters}
    />
  ), [selectedCategories, handleApplyFilters]);

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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    
    // Extract IDs for the navigation state
    const categoryIds = selectedCategories.map(cat => 
      typeof cat === 'object' && cat !== null ? cat.category_id : cat
    );
    const researchAreaIds = selectedResearchAreas.map(area => 
      typeof area === 'object' && area !== null ? area.research_area_id : area
    );
    const topicIds = selectedTopics.map(topic => 
      typeof topic === 'object' && topic !== null ? topic.topic_id : topic
    );
    const authorIds = selectedAuthors.map(author => 
      typeof author === 'object' && author !== null ? author.author_id : author
    );
    const keywordIds = selectedKeywords.map(keyword => 
      typeof keyword === 'object' && keyword !== null ? keyword.keyword_id : keyword
    );
    
    // Check if this is an advanced search
    if (location.state?.advancedSearch) {
      // Preserve all advanced search parameters when changing page
      navigate('/search', { 
        state: { 
          ...location.state,
          page: newPage
        } 
      });
    } else {
      // For regular search
      navigate('/search', { 
        state: { 
          query: searchQuery, 
          option: searchOption, 
          page: newPage, 
          authors: authorIds, 
          categories: categoryIds, 
          researchAreas: researchAreaIds, 
          topics: topicIds, 
          keywords: keywordIds, 
          years: selectedYears,
          advancedSearchInputs: initialState.advancedSearchInputs
        } 
      });
    }
  };

  // Add toggle function for mobile filters
  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Search', link: '/search' }]} />
      </div>
      <div className="search-page-container">
        <div className="centered-content">
          <div className="search-results-wrapper">
            {/* Filters Container */}
            <div className={`filters-container ${!showFilters ? 'collapsed' : ''}`}>
              {/* Search Bar */}
              <div className="search-bar-wrapper">
                {MemoizedSearchBar}
              </div>

              {/* Clear All Filters Button */}
              <div className="clear-filters-wrapper">
                <button
                  onClick={handleClearFilters}
                  className="clear-all-filters-button"
                  style={{
                    backgroundColor: '#a33307',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontWeight: '400',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#c03f08';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#a33307';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <FaTimes size={12} /> Clear All Filters
                </button>
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
              {loading ? (
                <div className="loading-message">
                  <FaSpinner className="spinner" />
                  <span>Searching...</span>
                </div>
              ) : filteredData.length > 0 ? (
                <>
                  {/* Search Result Information */}
                  <div className="results-count">
                    <p>
                      {`Found `}
                      <b>{totalCount}</b>
                      {` results`}
                      {searchQuery ? ` for '${searchQuery}'` : ''}
                      {`. Showing page `}<b>{indexOfFirstItem + 1}</b> {` to `}<b>{Math.min(indexOfLastItem, totalCount)}</b>.
                    </p>
                  </div>

                  {/* Mapping through search results */}
                  {filteredData.map((project) => (
                    <div key={project.project_id} className="research-card">
                      <Link to={`/DocumentOverview/${project.project_id}`} className="title-link" state={{ fromSearch: true }}>
                        <h4>{project.title}</h4>
                      </Link>
                      {project.cover_image && (
                        <img
                          src={project.cover_image}
                          alt="Cover"
                          className="research-card-image"
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

                      {/* Publication date */}
                      <p className="publication-date">
                        {project.publication_date ? <i>{new Date(project.publication_date).toLocaleDateString()}</i> : <i>Publication date not available</i>}
                      </p>

                      {/* Abstract Container */}
                      <div className="abstract-container">
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
                    handlePageChange={handlePageChange}
                  />
                </>
              ) : (
                <div className="no-results-message">
                  {searchQuery || selectedAuthors.length > 0 || selectedCategories.length > 0 || 
                   selectedResearchAreas.length > 0 || selectedTopics.length > 0 || 
                   selectedKeywords.length > 0 ? (
                    <>
                      <p>No results found for your search criteria.</p>
                      <p className="suggestion-text">Try:</p>
                      <ul className="suggestion-list">
                        <li>Using different keywords</li>
                        <li>Removing some filters</li>
                        <li>Checking your spelling</li>
                        <li>Using more general terms</li>
                      </ul>
                    </>
                  ) : (
                    <p>Start your search by entering keywords or using the filters above.</p>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button 
              className="filter-toggle-button"
              onClick={toggleFilters}
            >
              <FaFilter />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchPage;
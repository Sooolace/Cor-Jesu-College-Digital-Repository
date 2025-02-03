import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/Searchbar';
import Featured from '../../components/Featured';
import MostViewed from '../../components/MostViewed';
import RecentSubmissions from '../../components/RecentSubmission';
import HorizontalImageBanner from '../../components/HorizontalImageBanner';
import './styles/homepage.css';
import './styles/transition.css'; // Import the new CSS file for transitions

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOption, setSearchOption] = useState('');

  const handleSearch = () => {
    navigate('/search', { state: { query: searchQuery, option: searchOption } });
  };

  useEffect(() => {
    document.title = 'CJC Digital Repository';
  }, []);

  const MemoizedHorizontalImageBanner = useMemo(() => <HorizontalImageBanner />, []);
  const MemoizedSearchBar = useMemo(() => (
    <SearchBar 
      query={searchQuery}
      onChange={setSearchQuery}
      selectedOption={searchOption}
      onOptionChange={setSearchOption}
      onSearch={handleSearch} 
    />
  ), [searchQuery, searchOption]);

  const MemoizedFeatured = useMemo(() => <Featured />, []);
  const MemoizedRecentSubmissions = useMemo(() => <RecentSubmissions />, []);
  const MemoizedMostViewed = useMemo(() => <MostViewed />, []);

  const recentSubmissionsRef = useRef(null);
  const mostViewedRef = useRef(null);
  const [recentSubmissionsInView, setRecentSubmissionsInView] = useState(false);
  const [mostViewedInView, setMostViewedInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (recentSubmissionsRef.current && !recentSubmissionsInView) {
        const rect = recentSubmissionsRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight) {
          setRecentSubmissionsInView(true);
        }
      }
      if (mostViewedRef.current && !mostViewedInView) {
        const rect = mostViewedRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight) {
          setMostViewedInView(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [recentSubmissionsInView, mostViewedInView]);

  return (
    <>
      <div className="home-page">
        <div className="centered-content">
          <div className="horizontal-banner-container transition-split"> {/* Add transition-split class */}
            {MemoizedHorizontalImageBanner}
          </div>
          <section className="search-bar">
            {MemoizedSearchBar}
          </section>
          <section className="featured-section transition-top-to-bottom"> {/* Update transition class */}
            {MemoizedFeatured}
          </section>
          <div className="two-column-section">
            <section
              ref={recentSubmissionsRef}
              className={`recent-submissions ${recentSubmissionsInView ? 'transition-left-to-right' : 'hidden'}`}
            >
              {MemoizedRecentSubmissions}
            </section>
            <section
              ref={mostViewedRef}
              className={`most-viewed ${mostViewedInView ? 'transition-right-to-left' : 'hidden'}`}
            >
              {MemoizedMostViewed}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

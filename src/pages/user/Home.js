import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/Searchbar';
import Featured from '../../components/Featured';
import MostViewed from '../../components/MostViewed';
import RecentSubmissions from '../../components/RecentSubmission';
import HorizontalImageBanner from '../../components/HorizontalImageBanner';
import './styles/homepage.css'
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

  return (
    <div className="home-page">
      <div className="centered-content">
      <HorizontalImageBanner />

        <section className="search-bar">
          <SearchBar 
            query={searchQuery}
            onChange={setSearchQuery}
            selectedOption={searchOption}
            onOptionChange={setSearchOption}
            onSearch={handleSearch} 
          />
        </section>

        <section className="featured">
          <Featured />
        </section>
        <div className="two-column-section">
          <section className="recent-submissions">
            <RecentSubmissions />
          </section>
          <section className="most-viewed">
            <MostViewed />
          </section>
        </div>
      </div>
    </div>
  );
}

export default Home;

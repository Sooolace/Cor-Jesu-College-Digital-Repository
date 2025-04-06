import React, { useState, useEffect, useRef } from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Marker
} from 'react-simple-maps';
import { Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import './styles/ReactWorldMap.css';

// Updated GeoJSON URL
const geoUrl = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

// Dummy data for demonstration
const dummyPublications = [
  { id: 1, title: "Research on Climate Change", location: { lat: 14.5995, lng: 120.9842 }, count: 15 }, // Manila
  { id: 2, title: "Urban Development Studies", location: { lat: 10.3157, lng: 123.8854 }, count: 8 }, // Cebu
  { id: 3, title: "Marine Conservation", location: { lat: 7.1907, lng: 125.4553 }, count: 12 }, // Davao
  { id: 4, title: "Education Research", location: { lat: -31.9505, lng: 115.8605 }, count: 5 }, // Perth
  { id: 5, title: "Sustainable Agriculture", location: { lat: 37.7749, lng: -122.4194 }, count: 10 }, // San Francisco
  { id: 6, title: "Cultural Heritage", location: { lat: 51.5074, lng: -0.1278 }, count: 7 }, // London
  { id: 7, title: "Technology Innovations", location: { lat: 35.6762, lng: 139.6503 }, count: 14 }, // Tokyo
];

const INITIAL_POSITION = [0, 20];
const MAP_SCALE = 150;

const ReactWorldMap = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);
  const isDragging = useRef(false);
  const lastMousePosition = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchPublicationLocations = async () => {
      try {
        setLoading(true);
        // For now, we'll use the dummy data instead of making an API call
        // When your backend is ready, uncomment the API call below
        // const response = await axios.get('/api/publications/locations');
        // setPublications(response.data);
        
        // Using dummy data
        setPublications(dummyPublications);
        
        // Simulate loading to show the spinner briefly
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error in world map component:', error);
        setPublications(dummyPublications);
        setLoading(false);
      }
    };

    fetchPublicationLocations();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    
    const mapElement = mapRef.current;
    
    // Handle mouse down - start dragging
    const handleMouseDown = (e) => {
      isDragging.current = true;
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      mapElement.style.cursor = 'grabbing';
    };
    
    // Handle mouse move - update position while dragging
    const handleMouseMove = (e) => {
      if (!isDragging.current || !lastMousePosition.current) return;
      
      const deltaX = e.clientX - lastMousePosition.current.x;
      const deltaY = e.clientY - lastMousePosition.current.y;
      
      setTranslate(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    
    // Handle mouse up - end dragging and snap back to center
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        mapElement.style.cursor = 'grab';
        
        // Animate back to center horizontally
        setTimeout(() => {
          setTranslate(prev => ({
            x: 0,
            y: prev.y
          }));
        }, 800);
      }
    };
    
    // Add event listeners with passive option for touch events
    mapElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Add touch support with passive listeners
    mapElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        lastMousePosition.current = { 
          x: e.touches[0].clientX, 
          y: e.touches[0].clientY 
        };
      }
    }, { passive: true });
    
    window.addEventListener('touchmove', (e) => {
      if (isDragging.current && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - lastMousePosition.current.x;
        const deltaY = e.touches[0].clientY - lastMousePosition.current.y;
        
        setTranslate(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        lastMousePosition.current = { 
          x: e.touches[0].clientX, 
          y: e.touches[0].clientY 
        };
      }
    }, { passive: true });
    
    window.addEventListener('touchend', () => {
      if (isDragging.current) {
        isDragging.current = false;
        
        // Animate back to center horizontally
        setTimeout(() => {
          setTranslate(prev => ({
            x: 0,
            y: prev.y
          }));
        }, 800);
      }
    }, { passive: true });
    
    // Cleanup event listeners
    return () => {
      mapElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      mapElement.removeEventListener('touchstart', handleMouseDown);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  const handleMarkerClick = (publication) => {
    setSelectedLocation(publication);
  };

  const getMarkerSize = (count) => {
    // Scale marker size based on publication count
    const minSize = 5;
    const maxSize = 15;
    const scale = Math.min(count / 5, 3); // Cap at 3x for readability
    return minSize + (maxSize - minSize) * scale / 3;
  };

  return (
    <Container className="world-map-container">
      <h2 className="section-title">Global Research Reader</h2>
      <p className="section-description">
        Explore our research publications from around the world. Click on markers to read about studies in each location.
      </p>
      
      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" variant="primary" />
          <p>Loading global research data...</p>
        </div>
      ) : (
        <Row>
          <Col lg={8} className="map-col">
            <div className="map-wrapper" ref={mapRef} style={{ cursor: 'grab' }}>
              <ComposableMap 
                projection="geoMercator"
                projectionConfig={{ 
                  scale: MAP_SCALE,
                  center: INITIAL_POSITION
                }}
                style={{ 
                  width: "100%", 
                  height: "auto",
                  touchAction: "pan-y"
                }}
                data-testid="world-map"
              >
                <g transform={`translate(${translate.x}, ${translate.y})`}>
                  {/* Ocean background */}
                  <rect x="-8000" y="-8000" width="16000" height="16000" fill="#cde1f9" />
                  
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map(geo => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#ddc9a3"
                          stroke="#a38f6d"
                          strokeWidth={0.5}
                          className="country-geography"
                        />
                      ))
                    }
                  </Geographies>
                  
                  {publications.map((pub) => (
                    <Marker
                      key={pub.id}
                      coordinates={[pub.location.lng, pub.location.lat]}
                      onClick={() => handleMarkerClick(pub)}
                    >
                      <circle
                        r={getMarkerSize(pub.count)}
                        fill="#a33307"
                        stroke="#fff"
                        strokeWidth={1}
                        className="location-marker"
                      />
                    </Marker>
                  ))}
                </g>
              </ComposableMap>
            </div>
          </Col>
          
          <Col lg={4} className="info-col">
            <Card className="location-info-card">
              <Card.Body>
                <Card.Title className="info-title">
                  {selectedLocation 
                    ? selectedLocation.title 
                    : "Research Publication Reader"}
                </Card.Title>
                <div className="info-underline"></div>
                
                {selectedLocation ? (
                  <div className="location-details">
                    <p><strong>Location:</strong> {selectedLocation.location.lat.toFixed(2)}, {selectedLocation.location.lng.toFixed(2)}</p>
                    <p><strong>Publications:</strong> {selectedLocation.count}</p>
                    <p className="prompt-text">Click on a different marker to view details</p>
                  </div>
                ) : (
                  <div className="location-prompt">
                    <p>Click on any marker to read about research publications from that location.</p>
                    <p>The size of each marker indicates the number of available publications to read.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ReactWorldMap;

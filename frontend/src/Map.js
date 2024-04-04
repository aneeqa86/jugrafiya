import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, ScaleControl, Popup, Marker, useMap } from 'react-leaflet';
import { FeatureGroup, GeoJSON } from 'react-leaflet'; 
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';

// Custom hook to fetch GeoJSON data from a URL
const useGeoJsonData = (url) => {
  const [data, setData] = useState(null);

 // Fetch data when URL changes
  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.log(error));
  }, [url]);

  return data;
};

// Fetch data when URL changes
const EditControlComponent = ({ onMarkerCreated }) => (
  <FeatureGroup>
    <EditControl
      position='topleft'
      draw={{
        rectangle: false,
        circle: false,
        circlemarker: false,
        polyline: false,
        polygon: false,
        marker: true, // Only marker creation is enabled
      }}
      edit={{
        remove: false,
        edit: false,
      }}
      onCreated={onMarkerCreated} // This calls the prop function when a marker is created
    />
  </FeatureGroup>
);

// Component for rendering GeoJSON data
const GeoJSONComponent = ({ data, onFeatureClick, style }) => {
  return data ? (
    <GeoJSON
      data={data}
      onEachFeature={onFeatureClick}
      style={style}
    />
  ) : null;
};

// Map component
const Map = () => {
    const position = [30.38, 69.35]; // Center position for the map
    // Fetch GeoJSON data for provinces and schools
    const geoJsonData = useGeoJsonData('http://localhost:8000/api/pakistan/geojson/');
    const schoolsData = useGeoJsonData('http://localhost:8000/api/schools/');
    // State variables
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [totalSchools, setTotalSchools] = useState(0);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [markerData, setMarkerData] = useState({ name: '', address: '', province: '' });
    const mapRef = useRef(null);

    // Default style for GeoJSON features
    const defaultStyle = {
        weight: 2,
        opacity: 1,
        color: 'black',
        fillOpacity: 0,
    };

    let lastSelectedLayer = null;  // Variable to store the last selected layer
    
    const provinces = geoJsonData ? Array.from(new Set(geoJsonData.features.map(feature => feature.properties.province))) : [];
    
    const updateTotalSchools = () => {
        if (schoolsData) {
            setTotalSchools(schoolsData.features.length);
        }
    };

    useEffect(() => {
        updateTotalSchools();
    }, [schoolsData]);   

    // Event handler for clicking on a GeoJSON feature
    const onFeatureClick = (feature, layer) => {
        layer.on('click', function () {
            if (mapRef.current) {
                const map = mapRef.current;
                map.fitBounds(layer.getBounds());
                
                if (lastSelectedLayer) {
                    lastSelectedLayer.setStyle(defaultStyle);
                }
                // Update selected province
                const selectedProvinceName = feature.properties.province;
                setSelectedProvince(feature.properties.province);
                
                // Update total schools count based on the selected province
                if (schoolsData) {
                    const selectedProvince = geoJsonData.features.find(feature => feature.properties.province === selectedProvinceName);
                    if (selectedProvince) {
                        const provinceGid = selectedProvince.properties.gid;
                        console.log(schoolsData)     
                        const schoolsInProvince = schoolsData.features.filter(school => school.properties.province_gid === provinceGid);
                        setTotalSchools(schoolsInProvince.length);
                    }else {
                        setTotalSchools(0);
                    }
                }
            }
        });
    };
    // Event handler for creating a new marker
    const handleMarkerCreated = (e) => {
        const { lat, lng } = e.layer.getLatLng();
        setMarkerPosition([lat, lng]);
     
    };
    // Event handler for submitting marker form
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        // Prepare school data for submission
        const schoolData = {
            name: markerData.name,
            address: markerData.address,
            province: markerData.province,
            location: {
                type: 'Point',
                coordinates: [markerPosition[1], markerPosition[0]] 
            }
        };
        try { // Send POST request to save school data
            const response = await fetch('http://localhost:8000/api/schools/', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify(schoolData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            
            const result = await response.json();
            console.log('Successfully saved:', result);
            alert('School information successfully saved!');
            
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save school information.');
            
        }
    };
    // Component for searching provinces
    const ProvinceSearch = () => {
        const [inputValue, setInputValue] = useState("");
        const map = useMap();

        useEffect(() => {
            const zoomToFeature = (provinceName) => {
                const feature = geoJsonData.features.find(feature => feature.properties.province.toLowerCase() === provinceName.toLowerCase());
                if (feature) {
                    const layer = L.geoJSON(feature);
                    map.fitBounds(layer.getBounds());
                    setSelectedProvince(provinceName);
                }
            };

            const handleSelect = (e) => {
                const selectedValue = e.target.value;
                zoomToFeature(selectedValue);
                setInputValue(""); 
            };

           
            if (provinces.includes(inputValue)) {
                zoomToFeature(inputValue);
                setInputValue(""); 
            }
        }, [inputValue, geoJsonData, map, provinces]);

        return (
            <div className="province-search-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Search province..."
                />
                {inputValue && (
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {provinces.filter(province => province.toLowerCase().includes(inputValue.toLowerCase()))
                            .map((province, index) => (
                                <li key={index} onClick={() => setInputValue(province)} style={{ cursor: 'pointer', padding: '5px' }}>
                                    {province}
                                </li>
                            ))
                        }
                    </ul>
                )}
            </div>
        );
    };

    // Render map and components
    return (
        <div style={{ display: 'flex' }}>
            <MapContainer
                id="map"
                center={position}
                zoom={6}
                scrollWheelZoom={false}
                ref={mapRef}
                whenCreated={mapInstance => { mapRef.current = mapInstance; }}>

                <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: US National Park Service'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}" />
                
                <ScaleControl imperial={false} />

                <EditControlComponent onMarkerCreated={handleMarkerCreated} />

                <GeoJSONComponent
                    data={geoJsonData}
                    onFeatureClick={onFeatureClick}
                    style={defaultStyle}
                />
        
               <GeoJSONComponent
                    data={schoolsData}
                />

                {schoolsData && schoolsData.features.map((school, index) => (
                    <Marker
                        key={index}
                        position={[school.geometry.coordinates[1], school.geometry.coordinates[0]]}>
                        <Popup>
                            <div>
                                <h3>{school.properties.name}</h3>
                                <p>{school.properties.address}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {markerPosition && (
                    <Marker position={markerPosition}>
                        <Popup>
                            <form onSubmit={handleFormSubmit}>
                                <div>Latitude: {markerPosition[0]}</div>
                                <div>Longitude: {markerPosition[1]}</div>
                                <input type="text" placeholder="School Name" onChange={e => setMarkerData({ ...markerData, name: e.target.value })} required />
                                <input type="text" placeholder="School Address" onChange={e => setMarkerData({ ...markerData, address: e.target.value })} required />
                                <select onChange={e => setMarkerData({ ...markerData, province: e.target.value })} required>
                                    <option value="">Select Province</option>
                                    {provinces.map((province, idx) => (
                                        <option key={idx} value={province}>{province}</option>
                                    ))}
                                </select>
                                <button type="submit">Submit</button>
                            </form>
                        </Popup>
                    </Marker>
                )}
                
                <ProvinceSearch />

            </MapContainer>

            <div id="stats">
                {selectedProvince ? (
                    <h3>Selected Province: {selectedProvince}, Schools: {totalSchools}</h3>
                ) : (
                    <h3>Total Schools: {totalSchools}</h3>
                )}
            </div>
        </div>
    );
}

export default Map;

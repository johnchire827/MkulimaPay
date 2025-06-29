import React from 'react';
import { Box } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Green icon for last location
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SupplyChainMap = ({ locations, center, zoom, onLocationSelect }) => {
  // Filter locations with valid coordinates
  const validLocations = locations.filter(loc => loc.coordinates);
  
  // Create polyline points
  const polylinePoints = validLocations.map(loc => [
    loc.coordinates.lat, 
    loc.coordinates.lng
  ]);

  return (
    <Box h="500px" borderRadius="xl" overflow="hidden">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw connecting lines between locations */}
        {validLocations.length > 1 && (
          <Polyline 
            positions={polylinePoints} 
            color="#3182CE" 
            weight={3}
            dashArray="5, 5"
          />
        )}
        
        {/* Create markers for each location */}
        {validLocations.map((loc, index) => {
          const isLast = index === validLocations.length - 1;
          return (
            <Marker
              key={index}
              position={[loc.coordinates.lat, loc.coordinates.lng]}
              icon={isLast ? greenIcon : undefined}
              eventHandlers={{
                click: () => onLocationSelect(loc)
              }}
            >
              <Popup>
                <Box>
                  <Text fontWeight="bold">{loc.name}</Text>
                  <Text fontSize="sm" textTransform="capitalize">{loc.type}</Text>
                  <Text fontSize="sm">{loc.address}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(loc.date).toLocaleDateString()}
                  </Text>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default SupplyChainMap;
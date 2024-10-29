'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, X, List, Map as MapIcon } from 'lucide-react';

// Define the Pin type
interface Pin {
  id: string;
  lat: number;
  lng: number;
  remark: string;
  address: string;
}

const customIcon = L.icon({
  iconUrl:
    'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function MapEvents({
  onMapClick,
}: {
  onMapClick: (e: L.LeafletMouseEvent) => void;
}) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

export default function Component() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [newPin, setNewPin] = useState<Pin | null>(null);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [isMobile, setIsMobile] = useState(false);

  const bangaloreCoords: [number, number] = [12.9716, 77.5946];

  useEffect(() => {
    const storedPins = localStorage.getItem('mapPins');
    if (storedPins) {
      setPins(JSON.parse(storedPins));
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (pins.length > 0) {
      localStorage.setItem('mapPins', JSON.stringify(pins));
    }
  }, [pins]);

  const handleMapClick = useCallback(async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    let address = 'Fetching address...';

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      address = data.display_name;
    } catch (error) {
      console.error('Error fetching address:', error);
      address = 'Address not available';
    }

    setNewPin({
      id: Date.now().toString(),
      lat,
      lng,
      remark: '',
      address,
    });
  }, []);

  const handleRemarkChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (newPin) {
        setNewPin((prev) =>
          prev ? { ...prev, remark: e.target.value } : null
        );
      }
    },
    [newPin]
  );

  const handlePinSubmit = useCallback(() => {
    if (newPin) {
      setPins((prevPins) => [...prevPins, newPin]);
      setNewPin(null);
    }
  }, [newPin]);

  const handlePinClick = useCallback(
    (pin: Pin) => {
      if (mapRef) {
        mapRef.flyTo([pin.lat, pin.lng], 15, {
          duration: 1.5,
        });
      }
      if (isMobile) {
        setViewMode('map');
      }
    },
    [mapRef, isMobile]
  );

  const handlePinDelete = useCallback((id: string) => {
    setPins((prevPins) => {
      const updatedPins = prevPins.filter((pin) => pin.id !== id);
      if (updatedPins.length === 0) {
        localStorage.removeItem('mapPins');
      } else {
        localStorage.setItem('mapPins', JSON.stringify(updatedPins));
      }
      return updatedPins;
    });
  }, []);

  const filteredPins = useMemo(
    () =>
      pins.filter(
        (pin) =>
          pin.remark.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pin.address.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [pins, searchTerm]
  );

  const renderPinCard = (pin: Pin) => (
    <Card
      key={pin.id}
      className="mb-4 hover:shadow-md transition-shadow duration-200 bg-gray-800 text-white"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div
            className="flex items-start flex-1 cursor-pointer"
            onClick={() => handlePinClick(pin)}
          >
            <MapPin className="mr-3 h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold">{pin.remark || 'No remark'}</p>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {pin.address}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="medium"
            onClick={() => handlePinDelete(pin.id)}
            className="ml-2 text-gray-400 hover:text-red-500"
          >
            <X size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white">
      <div
        className={`${
          isMobile ? (viewMode === 'map' ? 'h-0' : 'h-3/4') : 'flex-1'
        } relative`}
      >
        <MapContainer
          center={bangaloreCoords}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          ref={setMapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            className="dark:bg-gray-800"
          />
          <MapEvents onMapClick={handleMapClick} />
          {pins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={customIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold">{pin.remark || 'No remark'}</p>
                  <p className="text-sm text-gray-400 mt-1">{pin.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          {newPin && (
            <Marker position={[newPin.lat, newPin.lng]} icon={customIcon}>
              <Popup>
                <div className="w-64 p-2 bg-gray-800">
                  <Textarea
                    value={newPin.remark}
                    onChange={handleRemarkChange}
                    placeholder="Enter your remark"
                    className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-700 text-white"
                  />
                  <p className="text-sm text-gray-400 mb-2">
                    <strong>Address:</strong> {newPin.address}
                  </p>
                  <Button
                    onClick={handlePinSubmit}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Save Pin
                  </Button>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <Card
        className={`${
          isMobile ? (viewMode === 'list' ? 'h-full' : 'h-1/4') : 'w-1/3'
        } md:m-4 overflow-hidden shadow-lg bg-gray-800`}
      >
        <CardContent className="p-4 md:p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#fff]">
              Saved Pins
            </h2>
            {isMobile && (
              <Button
                variant="outline"
                size="small"
                onClick={() =>
                  setViewMode(viewMode === 'list' ? 'map' : 'list')
                }
                className="md:hidden"
              >
                {viewMode === 'list' ? <MapIcon /> : <List />}
              </Button>
            )}
          </div>
          <Input
            type="text"
            placeholder="Search pins..."
            className="mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ScrollArea className="flex-1">
            {filteredPins.map(renderPinCard)}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

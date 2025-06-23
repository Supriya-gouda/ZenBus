import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Filter, Star, Wifi, Zap, Snowflake } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { busService } from '../../services/busService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LocationSelect from '../../components/UI/LocationSelect';
import Badge from '../../components/UI/Badge';

const SearchBuses = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchBuses, searchResults } = useBooking();
  
  const [searchForm, setSearchForm] = useState({
    source: location.state?.source || '',
    destination: location.state?.destination || '',
    date: location.state?.date || new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('departure');
  const [filterBy, setFilterBy] = useState('all');
  const [locations, setLocations] = useState([]);

  const handleSearch = async () => {
    if (!searchForm.source || !searchForm.destination || !searchForm.date) {
      return;
    }

    setLoading(true);
    await searchBuses(searchForm);
    setLoading(false);
  };

  // Fetch available locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const result = await busService.getLocations();
        if (result.success) {
          setLocations(result.locations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  // Auto-search when navigating from Home page
  useEffect(() => {
    if (location.state && location.state.source && location.state.destination && location.state.date) {
      handleSearch();
    }
  }, [searchForm.source, searchForm.destination, searchForm.date]);

  const handleBookBus = (bus) => {
    navigate('/seat-selection', { state: { bus, searchData: searchForm } });
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'ac': return <Snowflake className="w-4 h-4" />;
      case 'charging point': return <Zap className="w-4 h-4" />;
      default: return null;
    }
  };

  const sortedResults = [...searchResults].sort((a, b) => {
    switch (sortBy) {
      case 'fare':
        return a.fare - b.fare;
      case 'duration':
        return a.duration.localeCompare(b.duration);
      case 'rating':
        return b.rating - a.rating;
      default:
        return a.departureTime.localeCompare(b.departureTime);
    }
  });

  const filteredResults = sortedResults.filter(bus => {
    switch (filterBy) {
      case 'ac':
        return bus.busType.toLowerCase().includes('ac');
      case 'sleeper':
        return bus.busType.toLowerCase().includes('sleeper');
      case 'seater':
        return bus.busType.toLowerCase().includes('seater');
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Form */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <LocationSelect
              label="From"
              placeholder="Select departure city"
              value={searchForm.source}
              onChange={(value) => setSearchForm({ ...searchForm, source: value })}
              locations={locations}
            />
            <LocationSelect
              label="To"
              placeholder="Select destination city"
              value={searchForm.destination}
              onChange={(value) => setSearchForm({ ...searchForm, destination: value })}
              locations={locations}
            />
            <Input
              label="Journey Date"
              type="date"
              icon={Calendar}
              min={new Date().toISOString().split('T')[0]}
              value={searchForm.date}
              onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
            />
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                className="w-full"
                loading={loading}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </Card>

        {searchResults.length > 0 && (
          <>
            {/* Filters and Sort */}
            <Card className="mb-6" padding="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="departure">Departure Time</option>
                    <option value="fare">Price</option>
                    <option value="duration">Duration</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Filter by:</span>
                  <div className="flex space-x-2">
                    {['all', 'ac', 'sleeper', 'seater'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setFilterBy(filter)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                          filterBy === filter
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Search Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredResults.length} buses found for {searchForm.source} → {searchForm.destination}
                </h2>
                <p className="text-sm text-gray-600">
                  {searchForm.date && !isNaN(new Date(searchForm.date)) ?
                    new Date(searchForm.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Invalid Date'
                  }
                </p>
              </div>

              {filteredResults.map((bus) => (
                <Card key={bus.id} className="hover:shadow-lg transition-shadow duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{bus.operator}</h3>
                          <p className="text-sm text-gray-600">{bus.busNumber} • {bus.busType}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span className="text-sm font-medium">{bus.rating}</span>
                          <span className="text-sm text-gray-500">({bus.reviews})</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{bus.departureTime}</div>
                          <div className="text-sm text-gray-600">Departure</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">{bus.duration}</div>
                          <div className="flex items-center justify-center">
                            <div className="h-px bg-gray-300 flex-1"></div>
                            <div className="px-2 text-xs text-gray-500">→</div>
                            <div className="h-px bg-gray-300 flex-1"></div>
                          </div>
                        </div>
                        <div className="text-right md:text-center">
                          <div className="text-2xl font-bold text-gray-900">{bus.arrivalTime}</div>
                          <div className="text-sm text-gray-600">Arrival</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {bus.amenities.map((amenity, index) => (
                          <Badge key={index} variant="primary" className="flex items-center space-x-1">
                            {getAmenityIcon(amenity)}
                            <span>{amenity}</span>
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{bus.availableSeats} seats available</span>
                        <span>Window seats available</span>
                      </div>
                    </div>

                    <div className="lg:ml-8 mt-6 lg:mt-0 flex flex-col items-end space-y-4">
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">₹{bus.fare}</div>
                        <div className="text-sm text-gray-600">per seat</div>
                      </div>
                      
                      <Button 
                        onClick={() => handleBookBus(bus)}
                        size="lg"
                        className="w-full lg:w-auto"
                      >
                        Select Seats
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {searchResults.length === 0 && !loading && (
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No buses found</h3>
              <p className="text-gray-600 mb-6">
                Try searching with different cities or dates to find available buses.
              </p>
              <Button onClick={() => setSearchForm({ source: '', destination: '', date: '' })}>
                New Search
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchBuses;
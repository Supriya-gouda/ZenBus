import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Shield, Clock, Star, Users, Bus } from 'lucide-react';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LocationSelect from '../components/UI/LocationSelect';
import Card from '../components/UI/Card';
import { useAuth } from '../context/AuthContext';
import { busService } from '../services/busService';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    source: '',
    destination: '',
    date: new Date().toISOString().split('T')[0] // Default to today
  });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/search', { state: searchForm });
    } else {
      navigate('/login', { state: { redirect: '/search', searchData: searchForm } });
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Your safety is our priority with verified operators and secure payments'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your travel needs'
    },
    {
      icon: Star,
      title: 'Best Prices',
      description: 'Competitive pricing with no hidden charges and instant refunds'
    },
    {
      icon: Users,
      title: 'Trusted by Millions',
      description: 'Join millions of satisfied customers who trust us for their journeys'
    }
  ];

  const popularRoutes = [
    { from: 'Mumbai', to: 'Pune', price: '₹450' },
    { from: 'Delhi', to: 'Jaipur', price: '₹650' },
    { from: 'Bangalore', to: 'Chennai', price: '₹800' },
    { from: 'Hyderabad', to: 'Vijayawada', price: '₹550' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden min-h-[600px] flex items-center" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(220, 38, 38, 0.7)), url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-red-900/30 to-black/40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Peaceful Journey Starts Here
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto leading-relaxed">
              Experience ZenBus - Book comfortable, safe, and peaceful bus travel across the country with just a few clicks
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm">
            <form onSubmit={handleSearchSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LocationSelect
                  label="From"
                  placeholder="Select departure city"
                  value={searchForm.source}
                  onChange={(value) => setSearchForm({ ...searchForm, source: value })}
                  locations={locations}
                  required
                />
                <LocationSelect
                  label="To"
                  placeholder="Select destination city"
                  value={searchForm.destination}
                  onChange={(value) => setSearchForm({ ...searchForm, destination: value })}
                  locations={locations}
                  required
                />
                <Input
                  label="Journey Date"
                  type="date"
                  icon={Calendar}
                  min={new Date().toISOString().split('T')[0]}
                  value={searchForm.date}
                  onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="text-center">
                <Button type="submit" size="lg" className="px-12">
                  <Search className="w-5 h-5 mr-2" />
                  Search Buses
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ZenBus?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience peaceful and efficient travel with our premium bus booking service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center" hover>
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Routes
            </h2>
            <p className="text-xl text-gray-600">
              Book tickets for the most traveled routes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRoutes.map((route, index) => (
              <Card key={index} className="text-center" hover>
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900">{route.from}</span>
                    <Bus className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-gray-900">{route.to}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600 mb-4">
                  {route.price}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchForm({
                      source: route.from,
                      destination: route.to,
                      date: new Date().toISOString().split('T')[0]
                    });
                    if (user) {
                      navigate('/search', { 
                        state: {
                          source: route.from,
                          destination: route.to,
                          date: new Date().toISOString().split('T')[0]
                        }
                      });
                    } else {
                      navigate('/login');
                    }
                  }}
                >
                  Book Now
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Join thousands of satisfied travelers who trust ZenBus for their peaceful bus travel experience
          </p>
          <div className="space-x-4">
            {!user ? (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/register')}
                >
                  Sign Up Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-red-600"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/booking-confirmation')}
              >
                View Demo Booking Confirmation
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
import React, { useState } from 'react';
import axios from 'axios';
import "react-datepicker/dist/react-datepicker.css";
import { FaExchangeAlt, FaClock, FaUsers, FaDollarSign, FaPlane, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import styled from '@emotion/styled';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h1 {
    background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 2.5rem;
    margin-bottom: 10px;
  }

  p {
    color: #666;
    font-size: 1.1rem;
  }
`;

const SearchForm = styled.form`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;

  &:focus {
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
    outline: none;
  }

  &:hover {
    border-color: #1a73e8;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 40px;
`;

const FlightCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: all 0.2s;
  overflow: hidden;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1a73e8, #0d47a1);
  }
`;

const FlightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;

  .airline-logo {
    width: 50px;
    height: 50px;
    background: #f8f9fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a73e8;
  }

  .airline-info {
    flex: 1;
    h3 {
      margin: 0;
      color: #1a73e8;
      font-size: 1.2rem;
    }
    .flight-number {
      color: #666;
      font-size: 0.9rem;
    }
  }

  .price-tag {
    background: #e3f2fd;
    padding: 10px 15px;
    border-radius: 8px;
    color: #1a73e8;
    font-weight: 600;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

const FlightDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;

  .station {
    text-align: center;
    
    .time {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 5px;
    }
    
    .airport {
      color: #666;
      font-size: 0.9rem;
    }
  }

  .flight-path {
    display: flex;
    align-items: center;
    color: #1a73e8;
    position: relative;
    padding: 0 20px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      border-top: 2px dashed #1a73e8;
      top: 50%;
      transform: translateY(-50%);
    }

    svg {
      background: #f8f9fa;
      padding: 5px;
      position: relative;
      z-index: 1;
    }
  }
`;

const FlightInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;

  .info-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    
    svg {
      color: #1a73e8;
    }

    .label {
      color: #666;
      font-size: 0.9rem;
    }

    .value {
      color: #2c3e50;
      font-weight: 500;
    }
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  transition: all 0.2s;
  cursor: pointer;

  &:focus {
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
    outline: none;
  }

  &:hover {
    border-color: #1a73e8;
  }
`;

const PassengerGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const PassengerSelect = styled.div`
  label {
    display: block;
    margin-bottom: 8px;
    color: #1a73e8;
    font-size: 14px;
    font-weight: 600;
  }
  
  select {
    width: 100%;
    padding: 10px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s;
    cursor: pointer;

    &:focus {
      border-color: #1a73e8;
      box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
      outline: none;
    }

    &:hover {
      border-color: #1a73e8;
    }
  }
`;

const SortingControls = styled.div`
  margin-bottom: 25px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;

  label {
    color: #1a73e8;
    font-weight: 600;
  }
`;

const SortSelect = styled.select`
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
    outline: none;
  }

  &:hover {
    border-color: #1a73e8;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  background: #ffebee;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #d32f2f;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 20px;
  margin-top: 40px;
  color: #666;
  font-size: 0.9rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  a {
    color: #1a73e8;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SelectButton = styled.button`
  background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3);
  }

  svg {
    font-size: 16px;
  }
`;

const FormCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    color: #1a73e8;
    font-size: 14px;
    font-weight: 600;
  }

  input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.2s;

    &:focus {
      border-color: #1a73e8;
      box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
      outline: none;
    }

    &:hover {
      border-color: #1a73e8;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

const BackButton = styled(Button)`
  background: #f8f9fa;
  color: #1a73e8;
  border: 2px solid #1a73e8;

  &:hover {
    background: #e3f2fd;
  }
`;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/passenger-details" element={<PassengerDetails />} />
      </Routes>
    </Router>
  );
}

function HomePage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cabinClass, setCabinClass] = useState('economy');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const searchFlights = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!from || !to || !date) {
      setError('Please fill in all fields');
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError('Please select a future date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedDate = formatDate(date);
      console.log('Formatted Date:', formattedDate);

      // First, search for departure airport
      const fromAirportOptions = {
        method: 'GET',
        url: 'https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport',
        params: { 
          query: from,
          locale: 'en-US'
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-rapidapi-ua': 'RapidAPI-Playground',
          'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
          'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
        }
      };

      // Search for arrival airport
      const toAirportOptions = {
        ...fromAirportOptions,
        params: { 
          query: to,
          locale: 'en-US'
        }
      };

      const [fromResponse, toResponse] = await Promise.all([
        axios.request(fromAirportOptions),
        axios.request(toAirportOptions)
      ]);

      console.log('From Airport:', fromResponse.data);
      console.log('To Airport:', toResponse.data);

      if (!fromResponse.data.data?.length || !toResponse.data.data?.length) {
        setError('Could not find one or both airports. Please check the airport codes.');
        return;
      }

      // Find the exact airport match or use the first result
      const fromAirport = fromResponse.data.data.find(
        a => a.skyId.toUpperCase() === from.toUpperCase()
      ) || fromResponse.data.data[0];

      const toAirport = toResponse.data.data.find(
        a => a.skyId.toUpperCase() === to.toUpperCase()
      ) || toResponse.data.data[0];

      console.log('Selected fromAirport:', fromAirport);
      console.log('Selected toAirport:', toAirport);

      // Now search for flights with the correct airport IDs
      const flightOptions = {
        method: 'GET',
        url: 'https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights',
        params: {
          originSkyId: fromAirport.skyId,
          destinationSkyId: toAirport.skyId,
          originEntityId: fromAirport.navigation.entityId,
          destinationEntityId: toAirport.navigation.entityId,
          date: formattedDate,
          adults: adults.toString(),
          children: children.toString(),
          infants: infants.toString(),
          cabinClass: cabinClass,
          currency: 'USD',
          countryCode: 'US',
          market: 'en-US',
          locale: 'en-US'
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-rapidapi-ua': 'RapidAPI-Playground',
          'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
          'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
        }
      };

      console.log('Flight search parameters:', {
        originSkyId: fromAirport.skyId,
        destinationSkyId: toAirport.skyId,
        originEntityId: fromAirport.navigation.entityId,
        destinationEntityId: toAirport.navigation.entityId,
        date: formattedDate
      });

      const flightResponse = await axios.request(flightOptions);
      console.log('Flight API Response:', flightResponse.data);
      
      if (!flightResponse.data || flightResponse.data.status === false) {
        console.error('Flight search failed:', flightResponse.data);
        setError(
          flightResponse.data?.message 
            ? (Array.isArray(flightResponse.data.message) 
                ? flightResponse.data.message.map(msg => {
                    const key = Object.keys(msg)[0];
                    return `${key}: ${msg[key]}`;
                  }).join('. ')
                : flightResponse.data.message)
            : 'No flights found for this route.'
        );
        return;
      }

      if (flightResponse.data.data?.itineraries && Array.isArray(flightResponse.data.data.itineraries)) {
        const flights = flightResponse.data.data.itineraries;
        console.log('Processing flights:', flights);

        setFlights(flights.map((itinerary, index) => {
          console.log(`Processing itinerary ${index}:`, itinerary);

          // Get the first leg of the itinerary
          const leg = itinerary.legs?.[0];
          if (!leg) {
            console.log(`No leg found for itinerary ${index}`);
            return null;
          }

          // Get carrier information with better error handling
          const carrier = leg.carriers?.marketing?.[0] || leg.carriers?.operating?.[0];
          if (!carrier) {
            console.log(`No carrier found for itinerary ${index}`);
          }

          // More robust flight number extraction
          const airlineCode = carrier?.alternateId || carrier?.code || '';
          const flightId = leg.id?.split('--')?.[1]?.split('-')?.[0] || 
                          leg.flightNumber || 
                          carrier?.flightNumber || 
                          '';
          const flightNumber = (airlineCode && flightId) 
            ? `${airlineCode} ${flightId}`.trim()
            : 'N/A';

          // More robust time extraction
          const departureTime = leg.departure || leg.departureTime || leg.departureDateTime || 'N/A';
          const arrivalTime = leg.arrival || leg.arrivalTime || leg.arrivalDateTime || 'N/A';

          // Format the times for display
          const formatFlightTime = (timeString) => {
            if (timeString === 'N/A') return 'N/A';
            try {
              const date = new Date(timeString);
              return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
            } catch (e) {
              console.error('Error formatting time:', e);
              return timeString;
            }
          };

          const formattedDeparture = formatFlightTime(departureTime);
          const formattedArrival = formatFlightTime(arrivalTime);

          // Validate duration
          const durationInMinutes = parseInt(leg.durationInMinutes) || 0;
          const duration = durationInMinutes > 0
            ? `${Math.floor(durationInMinutes/60)}h ${durationInMinutes%60}m`
            : 'N/A';

          // Calculate total price based on passengers
          let basePriceAmount = null;
          let priceCurrency = 'USD';

          if (itinerary.price) {
            if (typeof itinerary.price === 'object') {
              basePriceAmount = itinerary.price.raw || 
                           itinerary.price.amount || 
                           itinerary.price.value || 
                           itinerary.price.formatted?.replace(/[^0-9.]/g, '');
              priceCurrency = itinerary.price.currency || 'USD';
            } else {
              basePriceAmount = itinerary.price;
            }
          }

          // Calculate total price for all passengers
          const totalPrice = basePriceAmount !== null
            ? (
                (parseFloat(basePriceAmount) * adults) + // Adult price
                (parseFloat(basePriceAmount) * 0.75 * children) + // Child price (25% discount)
                (parseFloat(basePriceAmount) * 0.1 * infants) // Infant price (90% discount)
              ).toFixed(2)
            : null;

          return {
            airline: carrier?.name || 'N/A',
            flightNumber: flightNumber,
            departureTime: formattedDeparture,
            arrivalTime: formattedArrival,
            duration: duration,
            passengers: {
              adults,
              children,
              infants,
              total: adults + children + infants
            },
            price: totalPrice !== null
              ? `${priceCurrency} ${totalPrice}`
              : 'N/A',
            departure: `${fromAirport.presentation.title} (${fromAirport.skyId})`,
            arrival: `${toAirport.presentation.title} (${toAirport.skyId})`
          };
        }).filter(Boolean)); // Remove any null entries
      } else {
        console.log('No itineraries found in response:', flightResponse.data);
        setError('No flights found for this route. Try different airports or dates.');
      }
    } catch (error) {
      console.error('API Error:', error);
      if (error.response?.status === 404) {
        setError('Invalid airport codes. Please check and try again.');
      } else if (error.response?.data?.message) {
        setError(Array.isArray(error.response.data.message) 
          ? error.response.data.message.join('. ')
          : error.response.data.message);
      } else {
        setError('Failed to fetch flights. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const sortFlights = (flights) => {
    return [...flights].sort((a, b) => {
      switch (sortCriteria) {
        case 'price':
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
          return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
        case 'duration':
          const durationA = a.duration.includes('N/A') ? Infinity : 
            parseInt(a.duration.match(/\d+h/)[0]) * 60 + parseInt(a.duration.match(/\d+m/)[0]);
          const durationB = b.duration.includes('N/A') ? Infinity : 
            parseInt(b.duration.match(/\d+h/)[0]) * 60 + parseInt(b.duration.match(/\d+m/)[0]);
          return sortOrder === 'asc' ? durationA - durationB : durationB - durationA;
        case 'departure':
          const timeA = new Date(a.departureTime);
          const timeB = new Date(b.departureTime);
          return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        default:
          return 0;
      }
    });
  };

  const handleSelectFlight = (flight) => {
    navigate('/passenger-details', { state: { selectedFlight: flight } });
  };

  return (
    <Container>
      <Header>
        <h1>Flight Spotter</h1>
        <p>Enter airport codes (e.g., JFK for New York, LAX for Los Angeles)</p>
      </Header>

      <SearchForm onSubmit={searchFlights}>
        <InputGroup>
          <div>
            <Input
              type="text"
              placeholder="From (e.g., JFK, LAX)"
              value={from}
              onChange={(e) => setFrom(e.target.value.toUpperCase())}
              required
              maxLength="3"
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FaExchangeAlt
              onClick={switchLocations}
              style={{ cursor: 'pointer', fontSize: '20px' }}
            />
          </div>

          <div>
            <Input
              type="text"
              placeholder="To (e.g., LAX, SFO)"
              value={to}
              onChange={(e) => setTo(e.target.value.toUpperCase())}
              required
              maxLength="3"
            />
          </div>

          <div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <Select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
              required
            >
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </Select>
          </div>
        </InputGroup>

        <PassengerGroup>
          <PassengerSelect>
            <label>Adults (12+ years)</label>
            <select
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value))}
              required
            >
              {[...Array(9)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </PassengerSelect>

          <PassengerSelect>
            <label>Children (2-11 years)</label>
            <select
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value))}
            >
              {[...Array(9)].map((_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </PassengerSelect>

          <PassengerSelect>
            <label>Infants (0-2 years)</label>
            <select
              value={infants}
              onChange={(e) => setInfants(parseInt(e.target.value))}
            >
              {[...Array(9)].map((_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </PassengerSelect>
        </PassengerGroup>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner />
              Searching...
            </>
          ) : (
            'Search Flights'
          )}
        </Button>
      </SearchForm>

      <ResultsContainer>
        {flights.length > 0 && (
          <SortingControls>
            <label>Sort by:</label>
            <SortSelect value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value)}>
              <option value="price">Price</option>
              <option value="duration">Duration</option>
              <option value="departure">Departure Time</option>
            </SortSelect>
            <SortSelect value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </SortSelect>
          </SortingControls>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {flights.length > 0 ? (
          sortFlights(flights).map((flight, index) => (
            <FlightCard key={index}>
              <FlightHeader>
                <div className="airline-logo">
                  <FaPlane size={24} />
                </div>
                <div className="airline-info">
                  <h3>{flight.airline}</h3>
                  <span className="flight-number">Flight {flight.flightNumber}</span>
                </div>
                <div className="price-tag">
                  <FaDollarSign />
                  {flight.price}
                </div>
              </FlightHeader>

              <FlightDetails>
                <div className="station">
                  <div className="time">
                    {new Date(flight.departureTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                  <div className="airport">{flight.departure}</div>
                </div>
                <div className="flight-path">
                  <FaPlane />
                </div>
                <div className="station">
                  <div className="time">
                    {new Date(flight.arrivalTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                  <div className="airport">{flight.arrival}</div>
                </div>
              </FlightDetails>

              <FlightInfo>
                <div className="info-item">
                  <FaClock />
                  <div>
                    <div className="label">Duration</div>
                    <div className="value">{flight.duration}</div>
                  </div>
                </div>
                <div className="info-item">
                  <FaUsers />
                  <div>
                    <div className="label">Passengers</div>
                    <div className="value">
                      {flight.passengers.total} ({flight.passengers.adults} Adults
                      {flight.passengers.children > 0 ? `, ${flight.passengers.children} Children` : ''}
                      {flight.passengers.infants > 0 ? `, ${flight.passengers.infants} Infants` : ''})
                    </div>
                  </div>
                </div>
              </FlightInfo>

              <SelectButton onClick={() => handleSelectFlight(flight)}>
                Select Flight <FaArrowRight />
              </SelectButton>
            </FlightCard>
          ))
        ) : !error && !loading && (
          <div style={{ textAlign: 'center', color: '#666' }}>
            Enter airport codes and search for flights
          </div>
        )}
      </ResultsContainer>

      <Footer>
        © {new Date().getFullYear()} Flight Spotter. Developed by{' '}
        <a href="https://github.com/samruddhamohite" target="_blank" rel="noopener noreferrer">
          Samruddha Mohire
        </a>
      </Footer>
    </Container>
  );
}

function PassengerDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedFlight = location.state?.selectedFlight;
  const [passengerForms, setPassengerForms] = useState(
    Array(selectedFlight?.passengers.total).fill({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
      passportNumber: '',
      passportExpiry: ''
    })
  );

  if (!selectedFlight) {
    navigate('/');
    return null;
  }

  const handleInputChange = (index, field, value) => {
    const newForms = [...passengerForms];
    newForms[index] = { ...newForms[index], [field]: value };
    setPassengerForms(newForms);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the passenger details to your backend
    console.log('Passenger Details:', passengerForms);
    console.log('Selected Flight:', selectedFlight);
    // For now, we'll just show an alert
    alert('Booking successful! (This is a demo)');
    navigate('/');
  };

  return (
    <Container>
      <Header>
        <h1>Passenger Details</h1>
        <p>Fill in the details for your flight from {selectedFlight.departure} to {selectedFlight.arrival}</p>
      </Header>

      <form onSubmit={handleSubmit}>
        {passengerForms.map((passenger, index) => (
          <FormCard key={index}>
            <h2 style={{ marginBottom: '20px', color: '#1a73e8' }}>
              Passenger {index + 1}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormGroup>
                <label>First Name</label>
                <input
                  type="text"
                  required
                  value={passenger.firstName}
                  onChange={(e) => handleInputChange(index, 'firstName', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <label>Last Name</label>
                <input
                  type="text"
                  required
                  value={passenger.lastName}
                  onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={passenger.email}
                  onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <label>Phone</label>
                <input
                  type="tel"
                  required
                  value={passenger.phone}
                  onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <label>Date of Birth</label>
                <input
                  type="date"
                  required
                  value={passenger.dateOfBirth}
                  onChange={(e) => handleInputChange(index, 'dateOfBirth', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <label>Nationality</label>
                <input
                  type="text"
                  required
                  value={passenger.nationality}
                  onChange={(e) => handleInputChange(index, 'nationality', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <label>Passport Number</label>
                <input
                  type="text"
                  required
                  value={passenger.passportNumber}
                  onChange={(e) => handleInputChange(index, 'passportNumber', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <label>Passport Expiry Date</label>
                <input
                  type="date"
                  required
                  value={passenger.passportExpiry}
                  onChange={(e) => handleInputChange(index, 'passportExpiry', e.target.value)}
                />
              </FormGroup>
            </div>
          </FormCard>
        ))}

        <ButtonGroup>
          <BackButton type="button" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Flights
          </BackButton>
          <Button type="submit">
            Confirm Booking <FaArrowRight />
          </Button>
        </ButtonGroup>
      </form>

      <Footer>
        © {new Date().getFullYear()} Flight Spotter. Developed by{' '}
        <a href="https://github.com/samruddhamohite" target="_blank" rel="noopener noreferrer">
          Samruddha Mohire
        </a>
      </Footer>
    </Container>
  );
}

export default App;

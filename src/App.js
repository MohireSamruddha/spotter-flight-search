import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaExchangeAlt } from 'react-icons/fa';
import styled from '@emotion/styled';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const SearchForm = styled.form`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  background: #1a73e8;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  
  &:hover {
    background: #1557b0;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 40px;
`;

const FlightCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  align-items: center;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
`;

const PassengerGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
`;

const PassengerSelect = styled.div`
  label {
    display: block;
    margin-bottom: 5px;
    color: #666;
    font-size: 14px;
  }
  select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
`;

function App() {
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
          'X-RapidAPI-Key': '16723e6023msha66ce3d1751bf7fp16e5b2jsn53092387d788',
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
          'X-RapidAPI-Key': '16723e6023msha66ce3d1751bf7fp16e5b2jsn53092387d788',
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

  return (
    <Container>
      <Header>
        <h1>Flight Search</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>
          Enter airport codes (e.g., JFK for New York, LAX for Los Angeles)
        </p>
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
          {loading ? 'Searching...' : 'Search Flights'}
        </Button>
      </SearchForm>

      <ResultsContainer>
        {error && (
          <div style={{ 
            color: 'red', 
            background: '#fff', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}
        
        {flights.length > 0 ? (
          flights.map((flight, index) => (
            <FlightCard key={index}>
              <div>
                <strong>Route:</strong> {flight.departure} → {flight.arrival}
              </div>
              <div>
                <strong>Airline:</strong> {flight.airline}
              </div>
              <div>
                <strong>Flight:</strong> {flight.flightNumber}
              </div>
              <div>
                <strong>Departure:</strong> {flight.departureTime}
              </div>
              <div>
                <strong>Arrival:</strong> {flight.arrivalTime}
              </div>
              <div>
                <strong>Duration:</strong> {flight.duration}
              </div>
              <div>
                <strong>Passengers:</strong> {flight.passengers.total} ({flight.passengers.adults} Adults
                {flight.passengers.children > 0 ? `, ${flight.passengers.children} Children` : ''}
                {flight.passengers.infants > 0 ? `, ${flight.passengers.infants} Infants` : ''})
              </div>
              <div>
                <strong>Price:</strong> {flight.price}
              </div>
            </FlightCard>
          ))
        ) : !error && !loading && (
          <div style={{ textAlign: 'center', color: '#666' }}>
            Enter airport codes and search for flights
          </div>
        )}
      </ResultsContainer>
    </Container>
  );
}

export default App;

// client/src/components/user/UserHomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function UserHomePage() {
  const [events, setEvents] = useState([]);
  const [filterSport, setFilterSport] = useState('');
  const navigate = useNavigate();
  const [registrationError, setRegistrationError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [navigate]);

  const filteredEvents = filterSport
    ? events.filter(event =>
        event.sportName.toLowerCase().includes(filterSport.toLowerCase())
      )
    : events;

  const handleRegister = async (eventId, isTeamBased) => {
    setIsRegistering(true);
    setRegistrationError('');

    if (isTeamBased) {
      const teamName = prompt('Enter your team name:');
      if (!teamName) {
        setIsRegistering(false);
        setRegistrationError('Team name is required for team events.');
        return;
      }
      const teamMembersString = prompt('Enter the names of your team members, separated by commas:');
      if (!teamMembersString) {
        setIsRegistering(false);
        setRegistrationError('Team members are required for team events.');
        return;
      }
      const teamMembers = teamMembersString.split(',').map(member => member.trim());

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ teamName, teamMembers }),
        });

        if (response.ok) {
          alert('Successfully registered for the event!');
        } else {
          const errorData = await response.json();
          setRegistrationError(errorData.message || 'Registration failed.');
        }
      } catch (error) {
        console.error('Error registering for event:', error);
        setRegistrationError('Failed to register for the event.');
      } finally {
        setIsRegistering(false);
      }
    } else {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          alert('Successfully registered for the event!');
        } else {
          const errorData = await response.json();
          setRegistrationError(errorData.message || 'Registration failed.');
        }
      } catch (error) {
        console.error('Error registering for event:', error);
        setRegistrationError('Failed to register for the event.');
      } finally {
        setIsRegistering(false);
      }
    }
  };

  return (
    <div>
      <h2>Available Competitions</h2>
      <div className="filter-container">
        <label htmlFor="filterSport">Filter by Sport:</label>
        <input
          type="text"
          id="filterSport"
          value={filterSport}
          onChange={(e) => setFilterSport(e.target.value)}
          placeholder="Enter sport name"
        />
      </div>
      {registrationError && <p className="error">{registrationError}</p>}
      <div className="event-grid">
        {filteredEvents.map(event => (
          <div key={event._id} className="event-card">
            <h3>
              <Link to={`/events/${event._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {event.eventName} ({event.sportName})
              </Link>
            </h3>
            <p>Date: {new Date(event.date).toLocaleDateString()}</p>
            {event.entryFee && <p>Entry Fee: ${event.entryFee}</p>}
            {event.prize && <p>Prize: {event.prize}</p>}
            {event.ageGroup && <p>Age Group: {event.ageGroup}</p>}
            <button
              onClick={() => handleRegister(event._id, event.isTeamBased)}
              disabled={isRegistering}
            >
              {isRegistering ? 'Registering...' : 'Register'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserHomePage;
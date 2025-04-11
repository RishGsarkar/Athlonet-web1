// client/src/components/user/UserRegisteredEventsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserRegisteredEventsPage() {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/user/registered-events', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRegisteredEvents(data);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/');
          setError('Failed to fetch registered events. Please log in again.');
        }
      } catch (error) {
        console.error('Error fetching registered events:', error);
        setError('Failed to connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredEvents();
  }, [navigate]);

  if (loading) {
    return <div>Loading your registered events...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2>Your Registered Events</h2>
      {registeredEvents.length === 0 ? (
        <p>You haven't registered for any events yet.</p>
      ) : (
        <div className="event-grid">
          {registeredEvents.map(event => (
            <div key={event._id} className="event-card">
              <h3>{event.eventName} ({event.sportName})</h3>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              {event.entryFee && <p>Entry Fee: ${event.entryFee}</p>}
              {event.prize && <p>Prize: {event.prize}</p>}
              {event.ageGroup && <p>Age Group: {event.ageGroup}</p>}
              {event.additionalNote && <p>Note: {event.additionalNote}</p>}
              <p>Team Based: {event.isTeamBased ? 'Yes' : 'No'}</p>
              {event.isTeamBased && event.participantsPerTeam && (
                <p>Participants Per Team: {event.participantsPerTeam}</p>
              )}
              {/* You might want to add a way to unregister later */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserRegisteredEventsPage;
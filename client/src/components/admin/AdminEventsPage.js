import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAdminEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/events', {
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
          setError('Failed to fetch events. Please log in again as admin.');
        }
      } catch (error) {
        console.error('Error fetching admin events:', error);
        setError('Failed to connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminEvents();
  }, [navigate]);

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setIsDeleting(true);
      setDeleteError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Remove the deleted event from the local state
          setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
        } else {
          const errorData = await response.json();
          setDeleteError(errorData.message || 'Failed to delete event.');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        setDeleteError('Failed to connect to the server.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2>All Events</h2>
      {deleteError && <p className="error">{deleteError}</p>}
      {events.length === 0 ? (
        <p>No events have been created yet.</p>
      ) : (
        <div className="event-grid">
          {events.map(event => (
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
              <div style={{ marginTop: '10px' }}>
                <Link to={`/admin/events/edit/${event._id}`}>Edit</Link>
                <button onClick={() => handleDelete(event._id)} style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white' }} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminEventsPage;
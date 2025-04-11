import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sportName: '',
    eventName: '',
    date: '',
    entryFee: '',
    prize: '',
    ageGroup: '',
    additionalNote: '',
    isTeamBased: false,
    participantsPerTeam: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
        } else if (response.status === 404) {
          setError('Event not found.');
        } else {
          setError('Failed to fetch event details.');
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccessMessage('Event updated successfully!');
        // Optionally, navigate back to the admin events page
        // navigate('/admin/events');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update event.');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading event details for editing...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2>Edit Event</h2>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        {/* Form fields - similar to CreateEventPage, pre-filled with formData */}
        <div>
          <label htmlFor="sportName">Sport Name:</label>
          <input type="text" id="sportName" name="sportName" value={formData.sportName} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="eventName">Event Name:</label>
          <input type="text" id="eventName" name="eventName" value={formData.eventName} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="date">Date:</label>
          <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="entryFee">Entry Fee:</label>
          <input type="number" id="entryFee" name="entryFee" value={formData.entryFee} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="prize">Prize:</label>
          <input type="text" id="prize" name="prize" value={formData.prize} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="ageGroup">Age Group:</label>
          <input type="text" id="ageGroup" name="ageGroup" value={formData.ageGroup} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="additionalNote">Additional Note:</label>
          <textarea id="additionalNote" name="additionalNote" value={formData.additionalNote} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="isTeamBased">Is Team Based?</label>
          <input type="checkbox" id="isTeamBased" name="isTeamBased" checked={formData.isTeamBased} onChange={handleChange} />
        </div>
        {formData.isTeamBased && (
          <div>
            <label htmlFor="participantsPerTeam">Participants Per Team:</label>
            <input
              type="number"
              id="participantsPerTeam"
              name="participantsPerTeam"
              value={formData.participantsPerTeam}
              onChange={handleChange}
            />
          </div>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Event'}
        </button>
      </form>
    </div>
  );
}

export default EditEventPage;
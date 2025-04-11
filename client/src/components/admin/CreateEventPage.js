import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateEventPage() {
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
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await fetch('http://localhost:5000/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccessMessage('Event created successfully!');
        setFormData({ // Reset the form
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
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create event.');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Create New Event</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
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
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default CreateEventPage;
import React from 'react';
import { Link } from 'react-router-dom';

function AdminHomePage() {
  return (
    <div>
      <h2>Admin Homepage</h2>
      <Link to="/admin/events/create">Create a new event</Link>
      <br />
      <Link to="/admin/events">View all events</Link>
      {/* We might add some admin overview here later */}
    </div>
  );
}

export default AdminHomePage;
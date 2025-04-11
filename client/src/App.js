import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import UserHomePage from './components/user/UserHomePage';
import UserRegisteredEventsPage from './components/user/UserRegisteredEventsPage';
import AdminHomePage from './components/admin/AdminHomePage';
import AdminEventsPage from './components/admin/AdminEventsPage';
import CreateEventPage from './components/admin/CreateEventPage';
import EditEventPage from './components/admin/EditEventPage'; // Import EditEventPage
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div>
        <h1>Athlonet</h1>
        <Routes>
          <Route exact path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/user/home"
            element={
              <PrivateRoute role="user">
                <UserHomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/registered"
            element={
              <PrivateRoute role="user">
                <UserRegisteredEventsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/home"
            element={
              <PrivateRoute role="admin">
                <AdminHomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <PrivateRoute role="admin">
                <AdminEventsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events/create"
            element={
              <PrivateRoute role="admin">
                <CreateEventPage />
              </PrivateRoute>
            }
          />
          <Route // Add the new route for editing events
            path="/admin/events/edit/:eventId"
            element={
              <PrivateRoute role="admin">
                <EditEventPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
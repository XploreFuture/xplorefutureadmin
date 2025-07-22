import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AddInstitution from './pages/AddInstitution';
import Navbar from './components/Navbar';
import EditInstitution from './pages/EditInstitution';
import AddAdForm from './pages/AddAdForm'; 
import AddCourseDetail from './pages/AddCourseDetails';
import AddEntranceExamDetails from './pages/AddEntranceExamDetails';
import PageViews from './pages/PageViews';
import UserList from './pages/UserList';
import ManageReports from './pages/ManageReports';
import Dashboard from './pages/Dashboard';
import CollegeListForAdmin from './pages/CollegeListAdmin';
import AuthorPage from './pages/AuthorPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isAuthenticated = localStorage.getItem('accessToken');
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Router>
        <div className="App">
          <Navbar/>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
                    <Route path="/add-institution" element={<AddInstitution />} />
                    <Route path="/:type/:name/edit" element={<EditInstitution />} />
          <Route path="/add-ad" element={<AddAdForm />} />
          <Route path="/add-course-detail" element={<AddCourseDetail />} />
                    <Route path="/add-entrance-exam-details" element={<AddEntranceExamDetails />} />
                    <Route path="/pageviews" element={<PageViews />} />
                    <Route path="/userlist" element={<UserList />} />
                    <Route path="/managereports" element={<ManageReports />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/author/:userId" element={<AuthorPage />} />
                    <Route path="/collegelist" element={<CollegeListForAdmin />} />

            
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />

                    <Route path="*" element={<h1>404 - Not Found</h1>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
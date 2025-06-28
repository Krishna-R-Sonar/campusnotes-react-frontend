// campusnotes-react-frontend/src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import AuthControls from './AuthControls';
import CNXToken from './CNXToken';

export default function Layout() {
  return (
    <div>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">CampusNotes</Link>
          <div className="flex items-center gap-4">
            <Link to="/marketplace" className="hover:text-blue-600">Marketplace</Link>
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <Link to="/upload" className="hover:text-blue-600">Upload</Link>
            <Link to="/subscribe" className="hover:text-blue-600">Subscribe</Link>
            <CNXToken />
            <AuthControls />
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import { Menu } from 'lucide-react';

export default function Shell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — starts below status bar */}
      <div
        style={{ paddingTop: 'var(--sat, 0px)' }}
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none lg:pointer-events-auto'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar — sits below the status bar */}
        <header className="flex items-center gap-4 bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded-md text-gray-500 hover:text-gray-700">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-gray-900">School Management</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

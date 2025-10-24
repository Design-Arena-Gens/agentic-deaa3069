'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout, getUser } from '@/lib/auth';
import {
  HomeIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();
  const user = getUser();

  if (!user) return null;

  const patientLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/appointments', label: 'Appointments', icon: CalendarIcon },
    { href: '/prescriptions', label: 'Prescriptions', icon: DocumentTextIcon },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ];

  const doctorLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/schedule', label: 'Schedule', icon: CalendarIcon },
    { href: '/patients', label: 'Patients', icon: UserGroupIcon },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ];

  const links = user.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">HealthCare</h1>
        <p className="text-sm text-gray-600 mt-1">{user.role.toUpperCase()}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-600">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

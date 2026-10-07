import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';

export default function AdminGuard({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = no user
  const location = useLocation();

  useEffect(() => {
    // Cek user saat mount
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    // Dengarkan perubahan auth
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kuning-100">
        <div className="text-benhur-700 font-bold">Memuat...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
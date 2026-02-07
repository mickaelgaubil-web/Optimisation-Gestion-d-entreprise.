import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav style={{
      backgroundColor: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--color-primary)',
          textDecoration: 'none'
        }}>
          <BarChart3 size={32} />
          <span>OptiGest</span>
        </Link>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              <Link to="/dashboard" style={{
                padding: '0.5rem 1rem',
                color: 'var(--color-text)',
                textDecoration: 'none',
                fontWeight: 500
              }}>
                Tableau de bord
              </Link>
              <Link to="/profile" style={{
                padding: '0.5rem 1rem',
                color: 'var(--color-text)',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <User size={18} />
                Profil
              </Link>
              <button
                onClick={handleSignOut}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                Connexion
              </Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

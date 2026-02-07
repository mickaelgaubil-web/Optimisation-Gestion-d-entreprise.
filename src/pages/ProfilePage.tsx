import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building2, Save } from 'lucide-react';

interface CompanyProfile {
  company_name: string;
  sector: string;
  employee_count: number;
  revenue: number;
  fiscal_regime: string;
}

const SECTORS = [
  'Commerce',
  'Services',
  'Restauration',
  'BTP',
  'Industrie',
  'Technologies',
  'Santé',
  'Transport',
  'Autre'
];

const FISCAL_REGIMES = [
  'Micro-entreprise',
  'Réel simplifié',
  'Réel normal',
  'IS (Impôt sur les sociétés)',
  'IR (Impôt sur le revenu)'
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile>({
    company_name: '',
    sector: '',
    employee_count: 0,
    revenue: 0,
    fiscal_regime: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('company_profiles')
        .upsert({
          user_id: user?.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil enregistré avec succès !' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Building2 size={32} color="#2563eb" />
              <h1>Profil de l'entreprise</h1>
            </div>
            <p style={{ color: 'var(--color-text-light)' }}>
              Renseignez les informations de votre entreprise pour obtenir des analyses personnalisées
            </p>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="company_name">Raison sociale *</label>
                <input
                  type="text"
                  id="company_name"
                  value={profile.company_name}
                  onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  placeholder="Nom de votre entreprise"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="sector">Secteur d'activité *</label>
                <select
                  id="sector"
                  value={profile.sector}
                  onChange={(e) => setProfile({ ...profile, sector: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez un secteur</option>
                  {SECTORS.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="employee_count">Nombre d'employés</label>
                <input
                  type="number"
                  id="employee_count"
                  value={profile.employee_count || ''}
                  onChange={(e) => setProfile({ ...profile, employee_count: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="input-group">
                <label htmlFor="revenue">Chiffre d'affaires annuel (€)</label>
                <input
                  type="number"
                  id="revenue"
                  value={profile.revenue || ''}
                  onChange={(e) => setProfile({ ...profile, revenue: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="input-group">
                <label htmlFor="fiscal_regime">Régime fiscal *</label>
                <select
                  id="fiscal_regime"
                  value={profile.fiscal_regime}
                  onChange={(e) => setProfile({ ...profile, fiscal_regime: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez un régime</option>
                  {FISCAL_REGIMES.map(regime => (
                    <option key={regime} value={regime}>{regime}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                <Save size={18} />
                {saving ? 'Enregistrement...' : 'Enregistrer le profil'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { FileUp, Save, TrendingUp } from 'lucide-react';

interface FinancialData {
  year: number;
  revenue: number;
  fixed_costs: number;
  variable_costs: number;
  payroll: number;
  cash_flow: number;
  notes: string;
}

export default function DataEntryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [data, setData] = useState<FinancialData>({
    year: currentYear,
    revenue: 0,
    fixed_costs: 0,
    variable_costs: 0,
    payroll: 0,
    cash_flow: 0,
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('financial_data')
        .insert({
          user_id: user?.id,
          ...data
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Données enregistrées avec succès !' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <TrendingUp size={32} color="#2563eb" />
              <h1>Saisie des données financières</h1>
            </div>
            <p style={{ color: 'var(--color-text-light)' }}>
              Renseignez vos indicateurs clés pour obtenir des analyses personnalisées
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
                <label htmlFor="year">Exercice fiscal</label>
                <select
                  id="year"
                  value={data.year}
                  onChange={(e) => setData({ ...data, year: parseInt(e.target.value) })}
                  required
                >
                  {[currentYear, currentYear - 1, currentYear - 2].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="input-group">
                  <label htmlFor="revenue">Chiffre d'affaires (€) *</label>
                  <input
                    type="number"
                    id="revenue"
                    value={data.revenue || ''}
                    onChange={(e) => setData({ ...data, revenue: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="fixed_costs">Charges fixes (€) *</label>
                  <input
                    type="number"
                    id="fixed_costs"
                    value={data.fixed_costs || ''}
                    onChange={(e) => setData({ ...data, fixed_costs: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="variable_costs">Charges variables (€) *</label>
                  <input
                    type="number"
                    id="variable_costs"
                    value={data.variable_costs || ''}
                    onChange={(e) => setData({ ...data, variable_costs: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="payroll">Masse salariale (€)</label>
                  <input
                    type="number"
                    id="payroll"
                    value={data.payroll || ''}
                    onChange={(e) => setData({ ...data, payroll: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="cash_flow">Trésorerie disponible (€)</label>
                  <input
                    type="number"
                    id="cash_flow"
                    value={data.cash_flow || ''}
                    onChange={(e) => setData({ ...data, cash_flow: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="notes">Notes et commentaires</label>
                <textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  placeholder="Ajoutez des notes sur cet exercice..."
                  rows={4}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ flex: 1 }}
                >
                  <Save size={18} />
                  {saving ? 'Enregistrement...' : 'Enregistrer et analyser'}
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ marginTop: '2rem', backgroundColor: '#dbeafe' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <FileUp size={24} color="#2563eb" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Import de documents</h3>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                  Vous pouvez également importer vos bilans comptables, liasses fiscales et comptes de résultat.
                  Cette fonctionnalité sera disponible prochainement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { FileUp, Save, TrendingUp, Upload, AlertCircle } from 'lucide-react';

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setMessage({ type: '', text: '' });
    } else {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier PDF valide' });
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `fiscal-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadedFile);

      if (uploadError) throw uploadError;

      setMessage({
        type: 'info',
        text: 'PDF uploadé avec succès. Analyse en cours...'
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-fiscal-pdf`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze PDF');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setData({
          year: result.data.year || currentYear,
          revenue: result.data.revenue || 0,
          fixed_costs: result.data.fixed_costs || 0,
          variable_costs: result.data.variable_costs || 0,
          payroll: result.data.payroll || 0,
          cash_flow: result.data.cash_flow || 0,
          notes: result.data.notes || ''
        });

        setMessage({
          type: 'success',
          text: '✅ Données extraites avec succès ! Veuillez vérifier et corriger les informations ci-dessous avant de les enregistrer.'
        });
      } else {
        setMessage({
          type: 'warning',
          text: result.message || 'L\'analyse a échoué. Veuillez saisir les données manuellement.'
        });
      }

      setUploadedFile(null);
      if (document.getElementById('pdf-upload') as HTMLInputElement) {
        (document.getElementById('pdf-upload') as HTMLInputElement).value = '';
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'analyse du fichier. Veuillez saisir les données manuellement.' });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

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

          <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#eff6ff', border: '2px dashed #2563eb' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <Upload size={28} color="#2563eb" />
                <h3>Import automatique depuis une liasse fiscale (PDF)</h3>
              </div>
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
                Uploadez votre liasse fiscale au format PDF pour pré-remplir automatiquement les données de l'exercice
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #cbd5e1',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'white',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={!uploadedFile || uploading}
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                <FileUp size={18} />
                {uploading ? 'Analyse en cours...' : 'Analyser le PDF'}
              </button>
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#dbeafe',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <p style={{ fontSize: '0.875rem', margin: 0, color: '#1e40af' }}>
                <strong>Important :</strong> L'analyse automatique va extraire les données du PDF et pré-remplir le formulaire ci-dessous.
                Vous devez obligatoirement vérifier l'exactitude des informations extraites avant de les enregistrer.
              </p>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Vérifiez et complétez les données financières</h3>
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

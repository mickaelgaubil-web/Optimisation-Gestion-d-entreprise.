import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, AlertCircle, Plus } from 'lucide-react';

interface FinancialData {
  id: string;
  year: number;
  revenue: number;
  fixed_costs: number;
  variable_costs: number;
  payroll: number;
  cash_flow: number;
}

interface KPIs {
  margin: number;
  ebe: number;
  costRatio: number;
  profitability: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [kpis, setKPIs] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user?.id)
        .order('year', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setFinancialData(data);
        calculateKPIs(data[0]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = (data: FinancialData) => {
    const totalCosts = data.fixed_costs + data.variable_costs + data.payroll;
    const margin = ((data.revenue - data.variable_costs) / data.revenue) * 100;
    const ebe = data.revenue - totalCosts;
    const costRatio = (totalCosts / data.revenue) * 100;
    const profitability = (ebe / data.revenue) * 100;

    setKPIs({ margin, ebe, costRatio, profitability });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (financialData.length === 0) {
    return (
      <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 70px)' }}>
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <AlertCircle size={64} color="#f59e0b" style={{ marginBottom: '1rem' }} />
            <h2>Aucune donnée disponible</h2>
            <p style={{ color: 'var(--color-text-light)', margin: '1rem 0 2rem' }}>
              Commencez par saisir vos données financières pour obtenir des analyses et recommandations personnalisées
            </p>
            <Link to="/data-entry" className="btn btn-primary">
              <Plus size={18} />
              Saisir mes données
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestData = financialData[0];
  const chartData = financialData.reverse().map(d => ({
    year: d.year,
    'Chiffre d\'affaires': d.revenue,
    'Charges totales': d.fixed_costs + d.variable_costs + d.payroll,
    'Trésorerie': d.cash_flow
  }));

  return (
    <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Tableau de bord</h1>
            <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
              Analyse de l'exercice {latestData.year}
            </p>
          </div>
          <Link to="/data-entry" className="btn btn-primary">
            <Plus size={18} />
            Ajouter des données
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ opacity: 0.9, marginBottom: '0.5rem' }}>Chiffre d'affaires</p>
                <h2 style={{ color: 'white' }}>{latestData.revenue.toLocaleString('fr-FR')} €</h2>
              </div>
              <DollarSign size={32} />
            </div>
          </div>

          {kpis && (
            <>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Taux de marge</p>
                    <h2 style={{ color: kpis.margin > 30 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {kpis.margin.toFixed(1)}%
                    </h2>
                  </div>
                  {kpis.margin > 30 ? <TrendingUp size={32} color="#10b981" /> : <TrendingDown size={32} color="#f59e0b" />}
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>EBE</p>
                    <h2 style={{ color: kpis.ebe > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {kpis.ebe.toLocaleString('fr-FR')} €
                    </h2>
                  </div>
                  <Briefcase size={32} color="#2563eb" />
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Rentabilité</p>
                    <h2 style={{ color: kpis.profitability > 10 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {kpis.profitability.toFixed(1)}%
                    </h2>
                  </div>
                  {kpis.profitability > 10 ? <TrendingUp size={32} color="#10b981" /> : <TrendingDown size={32} color="#f59e0b" />}
                </div>
              </div>
            </>
          )}
        </div>

        {chartData.length > 1 && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Évolution financière</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR') + ' €'} />
                <Legend />
                <Line type="monotone" dataKey="Chiffre d'affaires" stroke="#667eea" strokeWidth={2} />
                <Line type="monotone" dataKey="Charges totales" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="Trésorerie" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Répartition des charges ({latestData.year})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{
              name: 'Charges',
              'Fixes': latestData.fixed_costs,
              'Variables': latestData.variable_costs,
              'Masse salariale': latestData.payroll
            }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR') + ' €'} />
              <Legend />
              <Bar dataKey="Fixes" fill="#667eea" />
              <Bar dataKey="Variables" fill="#f59e0b" />
              <Bar dataKey="Masse salariale" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/recommendations" className="btn btn-success" style={{ padding: '1rem 2rem' }}>
            Voir les recommandations
          </Link>
        </div>
      </div>
    </div>
  );
}

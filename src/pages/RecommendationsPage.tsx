import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Lightbulb, CheckCircle, FileDown, TrendingUp } from 'lucide-react';

interface FinancialData {
  revenue: number;
  fixed_costs: number;
  variable_costs: number;
  payroll: number;
  cash_flow: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: string;
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user?.id)
        .order('year', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        generateRecommendations(data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (data: FinancialData) => {
    const recs: Recommendation[] = [];
    const totalCosts = data.fixed_costs + data.variable_costs + data.payroll;
    const margin = ((data.revenue - data.variable_costs) / data.revenue) * 100;
    const costRatio = (totalCosts / data.revenue) * 100;

    if (margin < 30) {
      recs.push({
        id: '1',
        title: 'Améliorer la marge commerciale',
        description: 'Votre taux de marge est de ' + margin.toFixed(1) + '%, ce qui est inférieur à la norme du secteur (30-40%). Envisagez d\'optimiser vos prix de vente ou de négocier vos achats.',
        impact: 'high',
        effort: 'medium',
        category: 'Pricing'
      });
    }

    if (costRatio > 80) {
      recs.push({
        id: '2',
        title: 'Réduire le poids des charges',
        description: 'Vos charges représentent ' + costRatio.toFixed(1) + '% de votre CA. Identifiez les postes de dépenses non essentiels et envisagez des alternatives moins coûteuses.',
        impact: 'high',
        effort: 'medium',
        category: 'Coûts'
      });
    }

    if (data.payroll > data.revenue * 0.4) {
      recs.push({
        id: '3',
        title: 'Optimiser la masse salariale',
        description: 'Votre masse salariale représente plus de 40% de votre CA. Analysez la productivité de vos équipes et envisagez l\'automatisation de certaines tâches.',
        impact: 'high',
        effort: 'high',
        category: 'Ressources Humaines'
      });
    }

    if (data.cash_flow < data.revenue * 0.1) {
      recs.push({
        id: '4',
        title: 'Améliorer la trésorerie',
        description: 'Votre trésorerie est faible par rapport à votre activité. Optimisez vos délais de paiement clients et négociez avec vos fournisseurs.',
        impact: 'high',
        effort: 'medium',
        category: 'Trésorerie'
      });
    }

    if (data.fixed_costs > data.revenue * 0.3) {
      recs.push({
        id: '5',
        title: 'Réduire les charges fixes',
        description: 'Vos charges fixes sont élevées. Étudiez la possibilité de renégocier vos contrats (loyer, assurances, abonnements) ou de mutualiser certaines ressources.',
        impact: 'medium',
        effort: 'medium',
        category: 'Coûts'
      });
    }

    recs.push({
      id: '6',
      title: 'Développer de nouvelles sources de revenus',
      description: 'Diversifiez vos offres ou explorez de nouveaux marchés pour augmenter votre chiffre d\'affaires et diluer vos charges fixes.',
      impact: 'high',
      effort: 'high',
      category: 'Croissance'
    });

    setRecommendations(recs);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'high': return 'Impact élevé';
      case 'medium': return 'Impact moyen';
      case 'low': return 'Impact faible';
      default: return impact;
    }
  };

  const getEffortLabel = (effort: string) => {
    switch (effort) {
      case 'high': return 'Effort important';
      case 'medium': return 'Effort modéré';
      case 'low': return 'Effort faible';
      default: return effort;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Génération des recommandations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 70px)' }}>
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <TrendingUp size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h2>Aucune donnée disponible</h2>
            <p style={{ color: 'var(--color-text-light)', margin: '1rem 0' }}>
              Saisissez d'abord vos données financières pour obtenir des recommandations personnalisées
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Lightbulb size={32} color="#f59e0b" />
              <h1>Recommandations personnalisées</h1>
            </div>
            <p style={{ color: 'var(--color-text-light)' }}>
              Voici {recommendations.length} axes d'amélioration identifiés pour optimiser votre gestion
            </p>
          </div>

          <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
            <strong>Comment utiliser ces recommandations :</strong> Les actions sont classées par impact et effort.
            Priorisez celles avec un impact élevé et un effort modéré pour obtenir des résultats rapides.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {recommendations.map((rec, index) => (
              <div key={rec.id} className="card" style={{
                borderLeft: `4px solid ${getImpactColor(rec.impact)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: getImpactColor(rec.impact),
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        {index + 1}
                      </span>
                      <h3 style={{ marginBottom: 0 }}>{rec.title}</h3>
                    </div>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>
                      {rec.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        {rec.category}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: rec.impact === 'high' ? '#d1fae5' : '#fef3c7',
                        color: rec.impact === 'high' ? '#065f46' : '#92400e',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        {getImpactLabel(rec.impact)}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        {getEffortLabel(rec.effort)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: '2rem', backgroundColor: '#dbeafe' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <FileDown size={32} color="#2563eb" style={{ flexShrink: 0 }} />
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Besoin d'un rapport complet ?</h3>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                    La fonctionnalité d'export PDF avec un plan d'action détaillé sera disponible prochainement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-lg)', border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <CheckCircle size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: '#065f46' }}>Prochaines étapes</h3>
                <ul style={{ paddingLeft: '1.25rem', color: '#166534', lineHeight: 1.8 }}>
                  <li>Classez les recommandations par priorité selon votre contexte</li>
                  <li>Définissez un calendrier de mise en oeuvre</li>
                  <li>Suivez régulièrement l'impact de vos actions</li>
                  <li>Réévaluez vos KPIs dans 3 à 6 mois</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

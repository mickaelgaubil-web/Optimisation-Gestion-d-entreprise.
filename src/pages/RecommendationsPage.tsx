import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Lightbulb, CheckCircle, FileDown, TrendingUp, Target, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface FinancialData {
  revenue: number;
  fixed_costs: number;
  variable_costs: number;
  payroll: number;
  cash_flow: number;
  year: number;
}

interface CompanyProfile {
  sector: string;
  other_sector_description: string;
  employee_count: number;
}

interface ActionItem {
  title: string;
  description: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  potentialGain: string;
  actions: ActionItem[];
  benchmark?: string;
}

interface SectorBenchmark {
  margin: number;
  costRatio: number;
  payrollRatio: number;
  cashFlowRatio: number;
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set());
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedRecs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRecs(newExpanded);
  };

  const getSectorBenchmark = (sector: string): SectorBenchmark => {
    const benchmarks: Record<string, SectorBenchmark> = {
      'Commerce': { margin: 35, costRatio: 75, payrollRatio: 25, cashFlowRatio: 15 },
      'Services': { margin: 45, costRatio: 70, payrollRatio: 35, cashFlowRatio: 20 },
      'Restauration': { margin: 30, costRatio: 80, payrollRatio: 30, cashFlowRatio: 10 },
      'BTP': { margin: 32, costRatio: 78, payrollRatio: 28, cashFlowRatio: 12 },
      'Industrie': { margin: 28, costRatio: 82, payrollRatio: 30, cashFlowRatio: 15 },
      'Technologies': { margin: 50, costRatio: 65, payrollRatio: 40, cashFlowRatio: 25 },
      'Santé': { margin: 40, costRatio: 72, payrollRatio: 35, cashFlowRatio: 18 },
      'Transport': { margin: 25, costRatio: 85, payrollRatio: 32, cashFlowRatio: 10 }
    };
    return benchmarks[sector] || { margin: 35, costRatio: 75, payrollRatio: 30, cashFlowRatio: 15 };
  };

  const loadRecommendations = async () => {
    try {
      const [financialResult, profileResult] = await Promise.all([
        supabase
          .from('financial_data')
          .select('*')
          .eq('user_id', user?.id)
          .order('year', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle()
      ]);

      if (financialResult.error) throw financialResult.error;
      if (profileResult.error) throw profileResult.error;

      if (financialResult.data) {
        setCompanyProfile(profileResult.data);
        const benchmark = profileResult.data ? getSectorBenchmark(profileResult.data.sector) : null;
        generateRecommendations(financialResult.data, benchmark, profileResult.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (data: FinancialData, benchmark: SectorBenchmark | null, profile: CompanyProfile | null) => {
    const recs: Recommendation[] = [];
    const totalCosts = data.fixed_costs + data.variable_costs + data.payroll;
    const margin = ((data.revenue - data.variable_costs) / data.revenue) * 100;
    const costRatio = (totalCosts / data.revenue) * 100;
    const payrollRatio = (data.payroll / data.revenue) * 100;
    const fixedCostRatio = (data.fixed_costs / data.revenue) * 100;
    const variableCostRatio = (data.variable_costs / data.revenue) * 100;
    const cashFlowRatio = (data.cash_flow / data.revenue) * 100;
    const ebe = data.revenue - totalCosts;
    const profitability = (ebe / data.revenue) * 100;

    const benchmarkMargin = benchmark?.margin || 35;
    const benchmarkCostRatio = benchmark?.costRatio || 75;
    const benchmarkPayrollRatio = benchmark?.payrollRatio || 30;
    const benchmarkCashFlowRatio = benchmark?.cashFlowRatio || 15;

    if (margin < benchmarkMargin - 5) {
      const potentialIncrease = ((benchmarkMargin - margin) / 100) * data.revenue;
      recs.push({
        id: '1',
        title: 'Améliorer la marge commerciale',
        description: `Votre taux de marge est de ${margin.toFixed(1)}%, ce qui est ${(benchmarkMargin - margin).toFixed(1)} points inférieur à la moyenne du secteur ${profile?.sector || ''} (${benchmarkMargin}%). Cette situation réduit significativement votre rentabilité et limite vos capacités d'investissement.`,
        impact: 'high',
        effort: 'medium',
        category: 'Rentabilité',
        currentValue: margin,
        targetValue: benchmarkMargin,
        unit: '%',
        potentialGain: `+${potentialIncrease.toLocaleString('fr-FR')} € de marge annuelle`,
        benchmark: `Moyenne secteur: ${benchmarkMargin}%`,
        actions: [
          {
            title: 'Revoir votre politique de prix',
            description: 'Analysez votre grille tarifaire et augmentez vos prix de 5-10% sur les prestations/produits à forte valeur ajoutée. Testez d\'abord sur un segment de clients.'
          },
          {
            title: 'Négocier avec vos fournisseurs',
            description: 'Demandez des réductions de volume, comparez 3 fournisseurs alternatifs, et renégociez vos contrats annuels. Objectif: -10% sur les achats principaux.'
          },
          {
            title: 'Optimiser votre mix produit/service',
            description: 'Identifiez vos offres les plus rentables (marge > 40%) et concentrez vos efforts commerciaux sur celles-ci. Abandonnez ou augmentez le prix des offres peu rentables.'
          },
          {
            title: 'Réduire les remises commerciales',
            description: 'Limitez les remises exceptionnelles à 5% maximum. Créez une grille de remises structurée basée sur le volume, pas sur la négociation.'
          }
        ]
      });
    }

    if (costRatio > benchmarkCostRatio + 5) {
      const excessCosts = ((costRatio - benchmarkCostRatio) / 100) * data.revenue;
      recs.push({
        id: '2',
        title: 'Réduire le poids des charges',
        description: `Vos charges totales représentent ${costRatio.toFixed(1)}% de votre CA, soit ${(costRatio - benchmarkCostRatio).toFixed(1)} points au-dessus de la norme sectorielle (${benchmarkCostRatio}%). Cette structure de coûts excessive érode votre rentabilité et fragilise votre position concurrentielle.`,
        impact: 'high',
        effort: 'medium',
        category: 'Coûts',
        currentValue: costRatio,
        targetValue: benchmarkCostRatio,
        unit: '%',
        potentialGain: `Économies potentielles: ${excessCosts.toLocaleString('fr-FR')} €/an`,
        benchmark: `Moyenne secteur: ${benchmarkCostRatio}%`,
        actions: [
          {
            title: 'Audit des dépenses récurrentes',
            description: 'Passez en revue tous les abonnements, contrats et charges fixes mensuels. Identifiez et résiliez les services non essentiels ou sous-utilisés (20-30% d\'économies possibles).'
          },
          {
            title: 'Digitaliser et automatiser',
            description: 'Investissez dans des outils numériques pour réduire les tâches manuelles: facturation automatique, gestion de stock digitale, CRM. ROI attendu: 6-12 mois.'
          },
          {
            title: 'Renégocier les contrats majeurs',
            description: 'Ciblez vos 5 plus gros postes de dépenses (loyer, assurances, énergie, télécoms, etc.) et obtenez au minimum 10% de réduction sur chacun via appels d\'offres.'
          },
          {
            title: 'Optimiser la logistique',
            description: 'Réduisez les coûts de transport en regroupant les livraisons, négociez avec des transporteurs alternatifs, ou utilisez des plateformes de mutualisation.'
          }
        ]
      });
    }

    if (payrollRatio > benchmarkPayrollRatio + 5) {
      const excessPayroll = ((payrollRatio - benchmarkPayrollRatio) / 100) * data.revenue;
      recs.push({
        id: '3',
        title: 'Optimiser la masse salariale',
        description: `Votre masse salariale représente ${payrollRatio.toFixed(1)}% de votre CA, soit ${(payrollRatio - benchmarkPayrollRatio).toFixed(1)} points au-dessus du secteur (${benchmarkPayrollRatio}%). Bien que vos équipes soient votre principal actif, cette structure peut indiquer un problème de productivité ou d'organisation.`,
        impact: 'high',
        effort: 'high',
        category: 'Ressources Humaines',
        currentValue: payrollRatio,
        targetValue: benchmarkPayrollRatio,
        unit: '% du CA',
        potentialGain: `Optimisation possible: ${excessPayroll.toLocaleString('fr-FR')} €/an`,
        benchmark: `Moyenne secteur: ${benchmarkPayrollRatio}%`,
        actions: [
          {
            title: 'Analyser la productivité par poste',
            description: 'Calculez le CA généré par employé. Identifiez les postes sous-performants (< 80 000€ CA/personne en moyenne). Fixez des objectifs clairs et mesurables.'
          },
          {
            title: 'Former vos équipes à la polyvalence',
            description: 'Développez les compétences transversales pour réduire la dépendance aux spécialistes et améliorer la flexibilité. Budget formation: 1-2% de la masse salariale.'
          },
          {
            title: 'Externaliser les tâches non-cœur',
            description: 'Sous-traitez la comptabilité, le nettoyage, l\'IT, etc. plutôt que d\'embaucher. Économies potentielles: 20-30% vs salaire chargé équivalent.'
          },
          {
            title: 'Optimiser l\'organisation du travail',
            description: 'Introduisez des outils de gestion de projet, éliminez les réunions improductives, clarifiez les responsabilités. Gain productivité attendu: 15-20%.'
          }
        ]
      });
    }

    if (cashFlowRatio < benchmarkCashFlowRatio - 5) {
      const cashFlowGap = ((benchmarkCashFlowRatio - cashFlowRatio) / 100) * data.revenue;
      recs.push({
        id: '4',
        title: 'Renforcer la trésorerie',
        description: `Votre trésorerie représente seulement ${cashFlowRatio.toFixed(1)}% de votre CA, alors que le secteur affiche ${benchmarkCashFlowRatio}% en moyenne. Cette faiblesse vous expose aux aléas et limite votre capacité à saisir des opportunités. Une trésorerie insuffisante est l'une des principales causes de défaillance d'entreprise.`,
        impact: 'high',
        effort: 'medium',
        category: 'Trésorerie',
        currentValue: cashFlowRatio,
        targetValue: benchmarkCashFlowRatio,
        unit: '% du CA',
        potentialGain: `Objectif: +${cashFlowGap.toLocaleString('fr-FR')} € de trésorerie`,
        benchmark: `Moyenne secteur: ${benchmarkCashFlowRatio}%`,
        actions: [
          {
            title: 'Accélérer les encaissements clients',
            description: 'Passez à la facturation immédiate, activez le prélèvement automatique, proposez 2% d\'escompte pour paiement à 10 jours. Objectif: réduire le délai de paiement moyen de 15 jours.'
          },
          {
            title: 'Optimiser le BFR (Besoin en Fonds de Roulement)',
            description: 'Réduisez vos stocks au strict minimum (méthode juste-à-temps), négociez des délais fournisseurs plus longs. Libérez 10-20% de trésorerie.'
          },
          {
            title: 'Mettre en place un suivi hebdomadaire',
            description: 'Créez un tableau de bord de trésorerie actualisé chaque semaine avec prévisions à 13 semaines. Anticipez et évitez les découverts coûteux.'
          },
          {
            title: 'Relancer systématiquement les impayés',
            description: 'Appelez les clients dès J+1 après échéance, facturez les pénalités de retard, utilisez un outil de relance automatique. Réduisez les créances douteuses de 50%.'
          }
        ]
      });
    }

    if (fixedCostRatio > 35) {
      recs.push({
        id: '5',
        title: 'Réduire les charges fixes',
        description: `Vos charges fixes représentent ${fixedCostRatio.toFixed(1)}% de votre CA, ce qui est élevé. Des charges fixes importantes réduisent votre flexibilité et augmentent votre seuil de rentabilité, vous rendant vulnérable en cas de baisse d'activité.`,
        impact: 'medium',
        effort: 'medium',
        category: 'Structure de coûts',
        currentValue: fixedCostRatio,
        targetValue: 30,
        unit: '% du CA',
        potentialGain: `Flexibilité améliorée + sécurité renforcée`,
        actions: [
          {
            title: 'Renégocier le bail commercial',
            description: 'Si votre loyer dépasse 10% du CA, négociez une réduction ou cherchez des locaux moins chers. Alternative: sous-louez une partie de l\'espace inutilisé.'
          },
          {
            title: 'Passer en mode variable',
            description: 'Transformez vos coûts fixes en variables: intérim vs CDI pour les pics d\'activité, location d\'équipement vs achat, commission vs salaire fixe.'
          },
          {
            title: 'Mutualiser les ressources',
            description: 'Partagez des espaces de travail (coworking), mutualisez un comptable ou un commercial avec d\'autres entreprises, utilisez des services à la demande.'
          },
          {
            title: 'Revoir les assurances',
            description: 'Faites jouer la concurrence sur toutes vos assurances professionnelles annuellement. Économies moyennes constatées: 15-25%.'
          }
        ]
      });
    }

    if (profitability < 10) {
      recs.push({
        id: '6',
        title: 'Améliorer la rentabilité globale',
        description: `Votre rentabilité nette est de ${profitability.toFixed(1)}%, en-dessous du seuil de viabilité long terme (10-15%). Une rentabilité faible limite vos investissements, votre croissance et votre résilience face aux crises.`,
        impact: 'high',
        effort: 'high',
        category: 'Rentabilité',
        currentValue: profitability,
        targetValue: 12,
        unit: '%',
        potentialGain: `Objectif: multiplier le résultat net par ${(12 / Math.max(profitability, 1)).toFixed(1)}`,
        actions: [
          {
            title: 'Analyser la rentabilité par produit/service',
            description: 'Calculez la marge nette de chaque offre. Arrêtez ou augmentez le prix des offres non rentables (< 5% de marge). Concentrez-vous sur les best-sellers rentables.'
          },
          {
            title: 'Identifier les clients non rentables',
            description: 'Analysez le coût de service par client. Augmentez les tarifs des petits clients coûteux ou facturez les services additionnels. Visez 20% de clients générant 80% de la marge.'
          },
          {
            title: 'Investir dans le commercial',
            description: 'Une croissance du CA de 20% avec la même structure dilue les coûts fixes. Recrutez un commercial performant, formez l\'équipe, investissez en marketing digital.'
          },
          {
            title: 'Créer une offre premium',
            description: 'Développez une version haut de gamme de votre offre principale avec 50-100% de marge supplémentaire. Même avec 10% des clients, l\'impact est significatif.'
          }
        ]
      });
    }

    if (data.revenue < 100000) {
      recs.push({
        id: '7',
        title: 'Accélérer la croissance du chiffre d\'affaires',
        description: `Votre CA actuel de ${data.revenue.toLocaleString('fr-FR')} € limite vos économies d'échelle. Atteindre un CA supérieur à 200 000€ vous permettra de diluer vos charges fixes et d'améliorer significativement votre rentabilité.`,
        impact: 'high',
        effort: 'high',
        category: 'Croissance',
        currentValue: data.revenue,
        targetValue: 200000,
        unit: '€',
        potentialGain: 'Amélioration de 5-10 points de rentabilité attendue',
        actions: [
          {
            title: 'Définir une stratégie commerciale agressive',
            description: 'Fixez un objectif de croissance de 30% annuel. Allouez 10-15% du CA au marketing et commercial. Mesurez le coût d\'acquisition client et optimisez.'
          },
          {
            title: 'Diversifier les canaux d\'acquisition',
            description: 'Ajoutez 2-3 nouveaux canaux: site web optimisé SEO, publicité Google/Facebook, partenariats avec prescripteurs, présence sur marketplaces.'
          },
          {
            title: 'Développer la récurrence',
            description: 'Créez des offres d\'abonnement ou de maintenance pour générer du revenu récurrent. Objectif: 30% du CA en récurrent d\'ici 18 mois.'
          },
          {
            title: 'Explorer de nouveaux segments',
            description: 'Identifiez 2-3 segments de clients adjacents où votre expertise s\'applique. Testez avec des pilotes avant de déployer massivement.'
          }
        ]
      });
    }

    if (variableCostRatio > 50) {
      recs.push({
        id: '8',
        title: 'Optimiser les achats et coûts variables',
        description: `Vos charges variables représentent ${variableCostRatio.toFixed(1)}% du CA, ce qui est élevé. Chaque point gagné sur les achats se traduit directement en amélioration de votre marge.`,
        impact: 'medium',
        effort: 'medium',
        category: 'Achats',
        currentValue: variableCostRatio,
        targetValue: 40,
        unit: '% du CA',
        potentialGain: `Marge améliorée de ${((variableCostRatio - 40) / 100 * data.revenue).toLocaleString('fr-FR')} €`,
        actions: [
          {
            title: 'Centraliser et massifier les achats',
            description: 'Regroupez vos achats pour obtenir des tarifs dégressifs. Négociez des contrats annuels avec engagement de volume pour -10 à -20%.'
          },
          {
            title: 'Mettre en concurrence les fournisseurs',
            description: 'Consultez au moins 3 fournisseurs pour chaque poste d\'achat important. Renégociez annuellement, même avec vos fournisseurs historiques.'
          },
          {
            title: 'Réduire les pertes et le gaspillage',
            description: 'Mesurez vos taux de perte, de casse, de retour produit. Fixez un objectif de réduction de 50% sous 6 mois. Typiquement 2-5% du CA à récupérer.'
          },
          {
            title: 'Intégrer verticalement si possible',
            description: 'Pour les achats stratégiques récurrents, évaluez le coût de production en interne vs achat externe. Parfois 30-40% d\'économies à la clé.'
          }
        ]
      });
    }

    recs.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      const effortScore = { high: 1, medium: 2, low: 3 };
      const scoreA = impactScore[a.impact] * effortScore[a.effort];
      const scoreB = impactScore[b.impact] * effortScore[b.effort];
      return scoreB - scoreA;
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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Lightbulb size={32} color="#f59e0b" />
              <h1>Recommandations personnalisées</h1>
            </div>
            <p style={{ color: 'var(--color-text-light)' }}>
              {recommendations.length} axes d'amélioration prioritaires identifiés pour votre entreprise {companyProfile?.sector ? `(secteur: ${companyProfile.sector})` : ''}
            </p>
          </div>

          <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
            <Target size={20} style={{ flexShrink: 0 }} />
            <div style={{ marginLeft: '0.75rem' }}>
              <strong>Méthodologie :</strong> Nos recommandations sont basées sur l'analyse de vos données financières comparées aux standards de votre secteur.
              Cliquez sur chaque recommandation pour voir le plan d'action détaillé.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {recommendations.map((rec, index) => {
              const isExpanded = expandedRecs.has(rec.id);
              const progressPercentage = ((rec.currentValue / rec.targetValue) * 100);

              return (
                <div key={rec.id} className="card" style={{
                  borderLeft: `4px solid ${getImpactColor(rec.impact)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <div onClick={() => toggleExpanded(rec.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <span style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: getImpactColor(rec.impact),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            flexShrink: 0
                          }}>
                            {index + 1}
                          </span>
                          <h3 style={{ marginBottom: 0, flex: 1 }}>{rec.title}</h3>
                          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </div>
                      </div>
                    </div>

                    <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem', lineHeight: 1.6 }}>
                      {rec.description}
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      <span style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        {rec.category}
                      </span>
                      <span style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: rec.impact === 'high' ? '#d1fae5' : '#fef3c7',
                        color: rec.impact === 'high' ? '#065f46' : '#92400e',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        {getImpactLabel(rec.impact)}
                      </span>
                      <span style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        {getEffortLabel(rec.effort)}
                      </span>
                    </div>

                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                          Situation actuelle: {rec.currentValue.toFixed(1)} {rec.unit}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981' }}>
                          Objectif: {rec.targetValue.toFixed(1)} {rec.unit}
                        </span>
                      </div>
                      {rec.benchmark && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
                          {rec.benchmark}
                        </div>
                      )}
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(progressPercentage, 100)}%`,
                          height: '100%',
                          backgroundColor: getImpactColor(rec.impact),
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#10b981'
                      }}>
                        💰 {rec.potentialGain}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{
                      marginTop: '1.5rem',
                      paddingTop: '1.5rem',
                      borderTop: '2px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Target size={20} color="#2563eb" />
                        <h4 style={{ margin: 0 }}>Plan d'action détaillé</h4>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {rec.actions.map((action, actionIndex) => (
                          <div key={actionIndex} style={{
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '3px solid #2563eb'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                              <span style={{
                                minWidth: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                marginTop: '0.125rem'
                              }}>
                                {actionIndex + 1}
                              </span>
                              <div style={{ flex: 1 }}>
                                <h5 style={{ marginBottom: '0.5rem', color: '#1e40af' }}>
                                  {action.title}
                                </h5>
                                <p style={{
                                  fontSize: '0.9rem',
                                  lineHeight: 1.6,
                                  color: 'var(--color-text-light)',
                                  margin: 0
                                }}>
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#fef3c7',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start'
                      }}>
                        <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                        <p style={{ fontSize: '0.875rem', margin: 0, color: '#92400e' }}>
                          <strong>Conseil:</strong> Commencez par mettre en place 1-2 actions, mesurez les résultats après 30 jours, puis ajustez votre approche avant de déployer les autres actions.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            <div className="card" style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0' }}>
              <h4 style={{ color: '#065f46', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} />
                Méthodologie
              </h4>
              <ul style={{ paddingLeft: '1.25rem', color: '#166534', lineHeight: 1.8, fontSize: '0.9rem' }}>
                <li>Priorisez 2-3 recommandations maximum pour commencer</li>
                <li>Choisissez des actions "Quick Wins" (Impact élevé / Effort faible)</li>
                <li>Assignez un responsable pour chaque action</li>
                <li>Fixez des deadlines précises (J+30, J+60, J+90)</li>
              </ul>
            </div>

            <div className="card" style={{ backgroundColor: '#eff6ff', border: '2px solid #bfdbfe' }}>
              <h4 style={{ color: '#1e40af', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} />
                Suivi des résultats
              </h4>
              <ul style={{ paddingLeft: '1.25rem', color: '#1e3a8a', lineHeight: 1.8, fontSize: '0.9rem' }}>
                <li>Mettez à jour vos données financières mensuellement</li>
                <li>Mesurez l'écart entre objectif et réalité</li>
                <li>Ajustez votre stratégie si besoin après 2 mois</li>
                <li>Célébrez les victoires, même les petites</li>
              </ul>
            </div>

            <div className="card" style={{ backgroundColor: '#fef3c7', border: '2px solid #fde68a' }}>
              <h4 style={{ color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} />
                Points de vigilance
              </h4>
              <ul style={{ paddingLeft: '1.25rem', color: '#78350f', lineHeight: 1.8, fontSize: '0.9rem' }}>
                <li>Ne changez pas tout d'un coup (risque de désorganisation)</li>
                <li>Impliquez vos équipes dans les décisions</li>
                <li>Gardez un œil sur la trésorerie pendant les changements</li>
                <li>Documentez ce qui fonctionne ou pas</li>
              </ul>
            </div>
          </div>

          <div className="card" style={{ marginTop: '2rem', backgroundColor: '#dbeafe' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <FileDown size={32} color="#2563eb" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '0.75rem' }}>Export et partage</h3>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  La fonctionnalité d'export PDF avec un plan d'action détaillé, calendrier de mise en œuvre et indicateurs de suivi sera disponible prochainement.
                </p>
                <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                  En attendant, vous pouvez prendre des captures d'écran de chaque recommandation pour les partager avec votre équipe ou votre expert-comptable.
                </p>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#f0fdf4',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid #10b981',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#065f46', marginBottom: '1rem' }}>
              🎯 Objectif: Améliorer votre rentabilité de 3 à 10 points en 6 mois
            </h3>
            <p style={{ color: '#166534', fontSize: '0.95rem', maxWidth: '800px', margin: '0 auto' }}>
              En appliquant méthodiquement ces recommandations, la plupart de nos utilisateurs constatent une amélioration significative
              de leur rentabilité et de leur trésorerie. Commencez dès aujourd'hui !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

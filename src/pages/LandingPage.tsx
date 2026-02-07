import { Link } from 'react-router-dom';
import { TrendingUp, Target, FileText, PieChart, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div>
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '5rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'white' }}>
            Optimisez la Gestion de Votre Entreprise
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.95, maxWidth: '700px', margin: '0 auto 2rem' }}>
            Déposez vos données comptables et fiscales pour obtenir des analyses personnalisées
            et des recommandations concrètes d'amélioration.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary" style={{
              backgroundColor: 'white',
              color: '#667eea',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: 600
            }}>
              Commencer gratuitement
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '1rem 2rem',
              fontSize: '1.125rem'
            }}>
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>
            Une solution complète pour votre entreprise
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <FileText size={30} color="#2563eb" />
              </div>
              <h3>Centralisation des données</h3>
              <p style={{ color: 'var(--color-text-light)', marginTop: '0.75rem' }}>
                Importez vos bilans, comptes de résultats et indicateurs clés en toute sécurité
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <PieChart size={30} color="#10b981" />
              </div>
              <h3>Analyses personnalisées</h3>
              <p style={{ color: 'var(--color-text-light)', marginTop: '0.75rem' }}>
                Obtenez des KPIs détaillés et des comparaisons sectorielles pertinentes
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Target size={30} color="#f59e0b" />
              </div>
              <h3>Plans d'action ciblés</h3>
              <p style={{ color: 'var(--color-text-light)', marginTop: '0.75rem' }}>
                Recevez des recommandations concrètes pour améliorer votre rentabilité
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <TrendingUp size={30} color="#8b5cf6" />
              </div>
              <h3>Suivi de progression</h3>
              <p style={{ color: 'var(--color-text-light)', marginTop: '0.75rem' }}>
                Suivez l'évolution de vos indicateurs sur plusieurs exercices
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-bg-light)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>
            Comment ça fonctionne ?
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {[
              { step: 1, title: 'Créez votre compte', desc: 'Inscription rapide en quelques secondes' },
              { step: 2, title: 'Configurez votre profil', desc: 'Renseignez les informations de votre entreprise' },
              { step: 3, title: 'Importez vos données', desc: 'Uploadez vos documents comptables ou saisissez vos indicateurs' },
              { step: 4, title: 'Obtenez vos analyses', desc: 'Consultez votre tableau de bord et vos recommandations' }
            ].map((item) => (
              <div key={item.step} style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'flex-start',
                marginBottom: '2rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--color-text-light)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>
            Avantages pour votre entreprise
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {[
              'Gain de temps dans l\'analyse de vos données',
              'Identification rapide des axes d\'amélioration',
              'Comparaison avec les standards de votre secteur',
              'Recommandations personnalisées et actionnables',
              'Sécurité et confidentialité garanties (RGPD)',
              'Historique de vos exercices pour suivre l\'évolution'
            ].map((benefit, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <CheckCircle size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>
            Prêt à optimiser votre gestion ?
          </h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.95 }}>
            Rejoignez les entreprises qui utilisent OptiGest pour améliorer leur performance
          </p>
          <Link to="/signup" className="btn btn-primary" style={{
            backgroundColor: 'white',
            color: '#667eea',
            padding: '1rem 2rem',
            fontSize: '1.125rem',
            fontWeight: 600
          }}>
            Commencer maintenant
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer style={{
        backgroundColor: 'var(--color-text)',
        color: 'white',
        padding: '2rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <p style={{ opacity: 0.8 }}>
            &copy; 2026 OptiGest - Optimisation de Gestion d'Entreprise. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

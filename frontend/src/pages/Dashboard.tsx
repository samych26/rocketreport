import { useEffect, useState } from 'react';
import { FileText, Plug, Hammer, History, Eye, X, Plus, Loader2, CheckCircle, LayoutTemplate } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import { apiSourceService } from '../services/apiSourceService';
import { templateService } from '../services/templateService';
import { buildService } from '../services/buildService';
import { generationService } from '../services/generationService';
import './Dashboard.css';

/* ── Stats ── */
const STAT_DEFS = [
    { icon: Plug,     label: 'API Sources', color: '#d2a679', key: 'sources'     },
    { icon: FileText, label: 'Templates',   color: '#7fbfaf', key: 'templates'   },
    { icon: Hammer,   label: 'Builds',      color: '#9b8ec4', key: 'builds'      },
    { icon: History,  label: 'Générations', color: '#e07b7b', key: 'generations' },
] as const;

/* ── Example templates with prefilled preview data ── */
const EXAMPLE_TEMPLATES = [
    {
        name: 'Rapport de ventes mensuel',
        desc: 'Synthèse mensuelle des ventes par produit.',
        format: 'html' as const,
        icon: '📊',
        preview: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:#1e293b;padding:2rem}
  h1{color:#4f46e5;font-size:1.5rem;margin-bottom:.25rem}
  .sub{color:#64748b;font-size:.85rem;margin-bottom:1.5rem}
  .kpis{display:flex;gap:1rem;margin-bottom:1.5rem}
  .kpi{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:1rem 1.25rem;flex:1}
  .kpi-v{font-size:1.4rem;font-weight:700;color:#4f46e5}
  .kpi-l{font-size:.75rem;color:#94a3b8;margin-top:.1rem}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px #0001}
  th{background:#f1f5f9;padding:.65rem 1rem;text-align:left;font-size:.8rem;color:#475569;text-transform:uppercase;letter-spacing:.04em}
  td{padding:.65rem 1rem;border-top:1px solid #f1f5f9;font-size:.88rem}
  .badge{display:inline-block;padding:.15rem .5rem;border-radius:4px;font-size:.72rem;font-weight:600}
  .up{background:#dcfce7;color:#166534}.down{background:#fee2e2;color:#991b1b}
</style></head><body>
<h1>Rapport de ventes — Février 2025</h1>
<p class="sub">Généré automatiquement le 28 février 2025</p>
<div class="kpis">
  <div class="kpi"><div class="kpi-v">124 850 €</div><div class="kpi-l">Chiffre d'affaires</div></div>
  <div class="kpi"><div class="kpi-v">1 247</div><div class="kpi-l">Commandes</div></div>
  <div class="kpi"><div class="kpi-v">+12.4 %</div><div class="kpi-l">vs mois précédent</div></div>
  <div class="kpi"><div class="kpi-v">100.08 €</div><div class="kpi-l">Panier moyen</div></div>
</div>
<table>
  <tr><th>Produit</th><th>Qtité vendues</th><th>CA</th><th>Évolution</th></tr>
  <tr><td>Abonnement Pro</td><td>412</td><td>61 800 €</td><td><span class="badge up">+18%</span></td></tr>
  <tr><td>Abonnement Starter</td><td>530</td><td>26 500 €</td><td><span class="badge up">+7%</span></td></tr>
  <tr><td>Consulting</td><td>28</td><td>22 400 €</td><td><span class="badge down">-3%</span></td></tr>
  <tr><td>Formation</td><td>77</td><td>14 150 €</td><td><span class="badge up">+22%</span></td></tr>
</table>
</body></html>`,
        content: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:#1e293b;padding:2rem}
  h1{color:#4f46e5;font-size:1.5rem;margin-bottom:.25rem}
  .sub{color:#64748b;font-size:.85rem;margin-bottom:1.5rem}
  .kpis{display:flex;gap:1rem;margin-bottom:1.5rem}
  .kpi{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:1rem 1.25rem;flex:1}
  .kpi-v{font-size:1.4rem;font-weight:700;color:#4f46e5}
  .kpi-l{font-size:.75rem;color:#94a3b8;margin-top:.1rem}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden}
  th{background:#f1f5f9;padding:.65rem 1rem;text-align:left;font-size:.8rem;color:#475569;text-transform:uppercase}
  td{padding:.65rem 1rem;border-top:1px solid #f1f5f9;font-size:.88rem}
</style></head><body>
<h1>Rapport de ventes — {{month}}</h1>
<p class="sub">Généré le {{date}}</p>
<div class="kpis">
  <div class="kpi"><div class="kpi-v">{{total_revenue}} €</div><div class="kpi-l">Chiffre d'affaires</div></div>
  <div class="kpi"><div class="kpi-v">{{orders}}</div><div class="kpi-l">Commandes</div></div>
  <div class="kpi"><div class="kpi-v">{{growth}}</div><div class="kpi-l">vs mois précédent</div></div>
  <div class="kpi"><div class="kpi-v">{{avg_basket}} €</div><div class="kpi-l">Panier moyen</div></div>
</div>
<table>
  <tr><th>Produit</th><th>Quantité</th><th>CA</th></tr>
  {{#each items}}<tr><td>{{name}}</td><td>{{qty}}</td><td>{{revenue}} €</td></tr>{{/each}}
</table>
</body></html>`,
    },
    {
        name: 'Facture client',
        desc: 'Facture PDF professionnelle avec détail des lignes.',
        format: 'pdf' as const,
        icon: '🧾',
        preview: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>
  *{box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1e293b;padding:2.5rem;max-width:700px;margin:auto}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem}
  .logo{font-size:1.4rem;font-weight:800;color:#4f46e5}
  .invoice-title{font-size:1.8rem;font-weight:700;color:#4f46e5;margin-bottom:.25rem}
  .meta{font-size:.82rem;color:#64748b}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin:1.5rem 0;padding:1rem;background:#f8fafc;border-radius:8px}
  .party-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:.3rem}
  .party-name{font-weight:700;font-size:.95rem}
  .party-info{font-size:.82rem;color:#475569;line-height:1.6}
  table{width:100%;border-collapse:collapse;margin:1.5rem 0}
  th{background:#4f46e5;color:#fff;padding:.6rem 1rem;text-align:left;font-size:.8rem}
  td{padding:.6rem 1rem;border-bottom:1px solid #f1f5f9;font-size:.85rem}
  .total-row td{font-weight:700;font-size:.95rem;border-top:2px solid #4f46e5;color:#4f46e5}
  .footer{margin-top:2rem;font-size:.75rem;color:#94a3b8;text-align:center}
</style></head><body>
<div class="header">
  <div><div class="logo">RocketReport</div><div style="font-size:.8rem;color:#94a3b8">SAS au capital de 10 000 €</div></div>
  <div style="text-align:right">
    <div class="invoice-title">FACTURE</div>
    <div class="meta">N° FA-2025-0142 · 28 février 2025</div>
    <div class="meta">Échéance : 30 mars 2025</div>
  </div>
</div>
<div class="parties">
  <div><div class="party-label">Émetteur</div><div class="party-name">RocketReport SAS</div><div class="party-info">12 rue de la République<br>75001 Paris<br>SIRET 123 456 789 00012</div></div>
  <div><div class="party-label">Client</div><div class="party-name">Acme Corp</div><div class="party-info">45 avenue Haussmann<br>75009 Paris<br>TVA FR 98 765 432 100</div></div>
</div>
<table>
  <tr><th>Description</th><th>Qté</th><th>P.U. HT</th><th>Total HT</th></tr>
  <tr><td>Abonnement Pro — février 2025</td><td>1</td><td>299.00 €</td><td>299.00 €</td></tr>
  <tr><td>Intégration API personnalisée</td><td>3</td><td>150.00 €</td><td>450.00 €</td></tr>
  <tr><td>Formation utilisateurs (2h)</td><td>2</td><td>200.00 €</td><td>400.00 €</td></tr>
  <tr><td></td><td></td><td style="color:#64748b">TVA 20%</td><td style="color:#64748b">229.80 €</td></tr>
  <tr class="total-row"><td colspan="3">TOTAL TTC</td><td>1 378.80 €</td></tr>
</table>
<div class="footer">Paiement par virement — IBAN FR76 1234 5678 9012 3456 7890 123 · Merci de votre confiance !</div>
</body></html>`,
        content: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1e293b;padding:2.5rem;max-width:700px;margin:auto}
  .header{display:flex;justify-content:space-between;margin-bottom:2rem}
  .logo{font-size:1.4rem;font-weight:800;color:#4f46e5}
  .invoice-title{font-size:1.8rem;font-weight:700;color:#4f46e5}
  table{width:100%;border-collapse:collapse;margin:1.5rem 0}
  th{background:#4f46e5;color:#fff;padding:.6rem 1rem;text-align:left;font-size:.8rem}
  td{padding:.6rem 1rem;border-bottom:1px solid #f1f5f9;font-size:.85rem}
  .total-row td{font-weight:700;color:#4f46e5;border-top:2px solid #4f46e5}
</style></head><body>
<div class="header">
  <div><div class="logo">{{company_name}}</div></div>
  <div><div class="invoice-title">FACTURE</div><div>N° {{invoice_number}} · {{date}}</div></div>
</div>
<p><strong>Client :</strong> {{client_name}} — {{client_address}}</p>
<table>
  <tr><th>Description</th><th>Qté</th><th>P.U. HT</th><th>Total HT</th></tr>
  {{#each lines}}<tr><td>{{description}}</td><td>{{qty}}</td><td>{{unit_price}} €</td><td>{{total}} €</td></tr>{{/each}}
  <tr class="total-row"><td colspan="3">TOTAL TTC</td><td>{{total_ttc}} €</td></tr>
</table>
</body></html>`,
    },
    {
        name: 'Tableau de bord KPI',
        desc: 'Export Excel des indicateurs clés de performance.',
        format: 'xlsx' as const,
        icon: '📈',
        preview: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>
  *{box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f0fdf4;padding:1.5rem;color:#1e293b}
  h1{font-size:1.1rem;font-weight:700;color:#15803d;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}
  .sheet{background:#fff;border:1px solid #bbf7d0;border-radius:8px;overflow:hidden;margin-bottom:1rem}
  .sheet-tab{background:#dcfce7;padding:.4rem 1rem;font-size:.75rem;font-weight:600;color:#15803d;border-bottom:1px solid #bbf7d0}
  table{width:100%;border-collapse:collapse}
  th{background:#f0fdf4;padding:.55rem .8rem;text-align:left;font-size:.75rem;font-weight:700;color:#15803d;border-bottom:1px solid #bbf7d0}
  td{padding:.5rem .8rem;font-size:.8rem;border-bottom:1px solid #f0fdf4}
  td:nth-child(2),td:nth-child(3),td:nth-child(4){text-align:right;font-variant-numeric:tabular-nums}
  .ok{color:#15803d;font-weight:600}.ko{color:#dc2626;font-weight:600}.warn{color:#d97706;font-weight:600}
  .bar-wrap{display:flex;align-items:center;gap:.5rem}
  .bar{height:8px;border-radius:4px;background:#22c55e}
  .bar.warn{background:#f59e0b}.bar.ko{background:#ef4444}
</style></head><body>
<h1>📈 Tableau de bord KPI — T1 2025</h1>
<div class="sheet">
  <div class="sheet-tab">Feuille 1 — Indicateurs</div>
  <table>
    <tr><th>Métrique</th><th>Réalisé</th><th>Objectif</th><th>Atteinte</th><th>Tendance</th></tr>
    <tr><td>CA mensuel</td><td>124 850 €</td><td>120 000 €</td><td class="ok">104%</td><td><div class="bar-wrap"><div class="bar" style="width:80px"></div></div></td></tr>
    <tr><td>Nouveaux clients</td><td>87</td><td>100</td><td class="warn">87%</td><td><div class="bar-wrap"><div class="bar warn" style="width:65px"></div></div></td></tr>
    <tr><td>Taux de rétention</td><td>94.2%</td><td>92%</td><td class="ok">102%</td><td><div class="bar-wrap"><div class="bar" style="width:75px"></div></div></td></tr>
    <tr><td>NPS</td><td>62</td><td>70</td><td class="warn">89%</td><td><div class="bar-wrap"><div class="bar warn" style="width:55px"></div></div></td></tr>
    <tr><td>Taux de churn</td><td>1.8%</td><td>2%</td><td class="ok">✓ Sous seuil</td><td><div class="bar-wrap"><div class="bar" style="width:90px"></div></div></td></tr>
    <tr><td>Ticket moyen</td><td>100.08 €</td><td>95 €</td><td class="ok">105%</td><td><div class="bar-wrap"><div class="bar" style="width:85px"></div></div></td></tr>
  </table>
</div>
</body></html>`,
        content: `Métrique,Réalisé,Objectif,Atteinte
CA mensuel,{{revenue}},{{revenue_target}},{{revenue_pct}}%
Nouveaux clients,{{new_clients}},{{client_target}},{{client_pct}}%
Taux de rétention,{{retention}}%,{{retention_target}}%,{{retention_pct}}%
NPS,{{nps}},{{nps_target}},{{nps_pct}}%
Taux de churn,{{churn}}%,{{churn_target}}%,{{churn_pct}}%
Ticket moyen,{{avg_basket}},{{basket_target}},{{basket_pct}}%`,
    },
    {
        name: 'Rapport d\'activité hebdo',
        desc: 'Compte-rendu texte structuré pour les équipes.',
        format: 'txt' as const,
        icon: '📝',
        preview: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>
  body{font-family:'Courier New',monospace;background:#0f172a;color:#e2e8f0;padding:2rem;margin:0}
  pre{white-space:pre-wrap;font-size:.82rem;line-height:1.7}
  .h{color:#818cf8;font-weight:bold}.sep{color:#334155}.val{color:#4ade80}.warn{color:#fbbf24}
</style></head><body><pre>
<span class="h">═══════════════════════════════════════════</span>
<span class="h">   RAPPORT D'ACTIVITÉ — Semaine 9 / 2025   </span>
<span class="h">═══════════════════════════════════════════</span>
  Équipe     : Produit & Engineering
  Période    : 24 févr. → 28 févr. 2025
  Responsable: Marie Dupont

<span class="h">RÉSUMÉ EXÉCUTIF</span>
<span class="sep">───────────────</span>
  Sprint 22 terminé avec 94% des story points livrés.
  Lancement de la feature "Export PDF" en production.
  Incident mineur résolu en 47 min (P2).

<span class="h">TÂCHES COMPLÉTÉES</span>
<span class="sep">─────────────────</span>
  <span class="val">✓</span> Intégration Stripe (paiements récurrents)
  <span class="val">✓</span> Refonte page d'accueil (A/B test +14% conv.)
  <span class="val">✓</span> Export PDF / XLSX des rapports
  <span class="val">✓</span> Optimisation requêtes SQL (-60ms p95)

<span class="h">EN COURS</span>
<span class="sep">────────</span>
  <span class="warn">⏳</span> Migration base de données PostgreSQL 16
  <span class="warn">⏳</span> Dashboard analytics temps réel

<span class="h">INDICATEURS</span>
<span class="sep">───────────</span>
  Vélocité sprint   : 47 pts (objectif 45)
  Couverture tests  : 78% (+3%)
  Uptime semaine    : 99.97%
  Bugs ouverts      : 8 (−3 vs S8)

<span class="h">SEMAINE PROCHAINE</span>
<span class="sep">─────────────────</span>
  → Sprint 23 : focus performance & sécurité
  → Revue architecture microservices
  → Onboarding 2 nouveaux devs
<span class="h">═══════════════════════════════════════════</span>
</pre></body></html>`,
        content: `RAPPORT D'ACTIVITÉ — {{period}}
Généré le : {{date}}
Équipe : {{team}}
==========================================

RÉSUMÉ EXÉCUTIF
---------------
{{summary}}

TÂCHES COMPLÉTÉES
-----------------
{{#each completed}}- {{this}}
{{/each}}

EN COURS
--------
{{#each in_progress}}- {{this}}
{{/each}}

INDICATEURS
-----------
- Vélocité sprint   : {{velocity}} pts
- Couverture tests  : {{test_coverage}}%
- Uptime            : {{uptime}}%
- Bugs ouverts      : {{open_bugs}}

SEMAINE PROCHAINE
-----------------
{{#each next_actions}}- {{this}}
{{/each}}
==========================================
Rapport généré par RocketReport`,
    },
] as const;

/* ════════════════════════════════════════════════════════ */

const Dashboard = () => {
    const { user } = useAuth();
    const [counts,   setCounts]   = useState({ sources: '—', templates: '—', builds: '—', generations: '—' });
    const [preview,  setPreview]  = useState<number | null>(null);
    const [creating, setCreating] = useState<Record<number, boolean>>({});
    const [created,  setCreated]  = useState<Record<number, boolean>>({});

    useEffect(() => {
        Promise.all([
            apiSourceService.list(),
            templateService.list(),
            buildService.list(),
        ]).then(async ([sources, templates, builds]) => {
            const genCounts = await Promise.all(
                builds.map(b => generationService.list(b.id).then(g => g.length).catch(() => 0))
            );
            const totalGens = genCounts.reduce((a, b) => a + b, 0);
            setCounts({
                sources:     String(sources.length),
                templates:   String(templates.length),
                builds:      String(builds.length),
                generations: String(totalGens),
            });
        }).catch(() => {});
    }, []);

    const handleCreate = async (idx: number) => {
        if (creating[idx] || created[idx]) return;
        setCreating(c => ({ ...c, [idx]: true }));
        const tpl = EXAMPLE_TEMPLATES[idx];
        try {
            await templateService.create({
                name:          tpl.name,
                description:   tpl.desc,
                output_format: tpl.format,
                content:       tpl.content,
            });
            setCreated(c => ({ ...c, [idx]: true }));
            setCounts(c => ({ ...c, templates: String(Number(c.templates === '—' ? 0 : c.templates) + 1) }));
        } catch {
            alert('Erreur lors de la création du template.');
        } finally {
            setCreating(c => ({ ...c, [idx]: false }));
        }
    };

    return (
        <MainLayout>
            <div className="dashboard">

                {/* Header */}
                <div className="dashboard-header">
                    <h1>Bonjour, {user?.name || user?.email} 👋</h1>
                    <p className="dashboard-subtitle">Voici un aperçu de votre espace de travail.</p>
                </div>

                {/* Stats */}
                <div className="dashboard-stats">
                    {STAT_DEFS.map(({ icon: Icon, label, color, key }) => (
                        <div className="stat-card" key={key}>
                            <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
                                <Icon size={22} strokeWidth={1.8} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{counts[key]}</span>
                                <span className="stat-label">label</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Example templates */}
                <div className="dashboard-section">
                    <div className="section-heading">
                        <LayoutTemplate size={16} strokeWidth={2} />
                        <h2>Templates exemples</h2>
                        <span className="section-hint">Prévisualisez le rendu de chaque format, puis créez-les en un clic</span>
                    </div>
                    <div className="example-templates-grid">
                        {EXAMPLE_TEMPLATES.map((tpl, idx) => (
                            <div key={idx} className={`example-tpl-card ${created[idx] ? 'example-tpl-card--done' : ''}`}>
                                <div className="etpl-top">
                                    <span className="etpl-emoji">{tpl.icon}</span>
                                    <span className={`etpl-format format-${tpl.format}`}>{tpl.format.toUpperCase()}</span>
                                </div>
                                <div className="etpl-name">{tpl.name}</div>
                                <div className="etpl-desc">{tpl.desc}</div>
                                <div className="etpl-actions">
                                    <button className="etpl-btn etpl-btn--preview" onClick={() => setPreview(idx)}>
                                        <Eye size={13} /> Aperçu
                                    </button>
                                    <button
                                        className="etpl-btn etpl-btn--create"
                                        onClick={() => handleCreate(idx)}
                                        disabled={creating[idx] || created[idx]}
                                    >
                                        {creating[idx]
                                            ? <Loader2 size={13} className="spin" />
                                            : created[idx]
                                                ? <><CheckCircle size={13} /> Créé</>
                                                : <><Plus size={13} /> Créer</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Preview modal */}
            {preview !== null && (
                <div className="preview-overlay" onClick={() => setPreview(null)}>
                    <div className="preview-modal" onClick={e => e.stopPropagation()}>
                        <div className="preview-modal-header">
                            <span>{EXAMPLE_TEMPLATES[preview].icon} {EXAMPLE_TEMPLATES[preview].name}</span>
                            <button className="preview-close" onClick={() => setPreview(null)}><X size={18} /></button>
                        </div>
                        <iframe
                            className="preview-iframe"
                            srcDoc={EXAMPLE_TEMPLATES[preview].preview}
                            sandbox="allow-same-origin"
                            title="Aperçu template"
                        />
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import {
    Plus, Hammer, Trash2, Pencil, Play, RefreshCw,
    ChevronRight, ChevronLeft, Check, Plug, FileCode,
    Loader2, AlertCircle, CheckCircle2, Terminal, Globe
} from 'lucide-react';
import { buildService } from '../services/buildService';
import type { Build, BuildPayload, PreviewResult, RunCodeResult } from '../services/buildService';
import { apiSourceService } from '../services/apiSourceService';
import type { ApiSource, ApiEndpoint } from '../services/apiSourceService';
import { templateService } from '../services/templateService';
import type { Template } from '../services/templateService';
import MainLayout from '../layouts/MainLayout';
import './PlaceholderPage.css';
import './BuildPage.css';

type Language = 'javascript' | 'typescript' | 'python';

const DEFAULT_CODE: Record<Language, string> = {
    javascript: `// "data" contient la réponse de l'API
// Définissez processData et retournez l'objet à injecter dans le template

function processData(data) {
    return {
        title: "Mon rapport",
        generated_at: new Date().toISOString(),
        items: Array.isArray(data) ? data : [data],
    };
}`,
    typescript: `// TypeScript — les types sont optionnels

function processData(data: any): Record<string, any> {
    const items: any[] = Array.isArray(data) ? data : [data];
    return {
        title: "Mon rapport",
        generated_at: new Date().toISOString(),
        count: items.length,
        items,
    };
}`,
    python: `# "data" contient la réponse de l'API
# Définissez process_data(data) et retournez le dict à injecter

def process_data(data):
    items = data if isinstance(data, list) else [data]
    return {
        "title": "Mon rapport",
        "count": len(items),
        "items": items,
    }`,
};

const LANG_OPTIONS: { value: Language; label: string; hint: string }[] = [
    { value: 'javascript', label: 'JavaScript', hint: 'Définissez processData(data)' },
    { value: 'typescript', label: 'TypeScript', hint: 'Définissez processData(data: any)' },
    { value: 'python',     label: 'Python',     hint: 'Définissez process_data(data)' },
];

type Step = 1 | 2 | 3 | 4;

/* ═══════════════════════════════════════════════════════
   WIZARD COMPONENT
═══════════════════════════════════════════════════════ */
interface WizardProps {
    editing?: Build | null;
    apiSources: ApiSource[];
    templates: Template[];
    onSave: (payload: BuildPayload, id?: number) => Promise<void>;
    onCancel: () => void;
}

const BuildWizard = ({ editing, apiSources, templates, onSave, onCancel }: WizardProps) => {
    const isEditing = !!editing;
    const [step, setStep] = useState<Step>(1);

    /* Step 1 — API Source & Endpoint */
    const [sourceId, setSourceId]           = useState<number | null>(editing?.api_source.id ?? null);
    const [endpoints, setEndpoints]         = useState<ApiEndpoint[]>([]);
    const [endpointId, setEndpointId]       = useState<number | null>(editing?.api_endpoint.id ?? null);
    const [preview, setPreview]             = useState<PreviewResult | null>(null);
    const [fetching, setFetching]           = useState(false);
    const [loadingEndpoints, setLoadingEP]  = useState(false);

    useEffect(() => {
        if (sourceId) {
            setLoadingEP(true);
            apiSourceService.listEndpoints(sourceId)
                .then(setEndpoints)
                .finally(() => setLoadingEP(false));
        } else {
            setEndpoints([]);
            setEndpointId(null);
        }
    }, [sourceId]);

    /* Step 2 — Code */
    const [language, setLanguage]       = useState<Language>('javascript');
    const [code, setCode]               = useState(editing?.code ?? DEFAULT_CODE['javascript']);
    const [codeResult, setCodeResult]   = useState<RunCodeResult | null>(null);
    const [running, setRunning]         = useState(false);

    const handleLangChange = (lang: Language) => {
        if (code === DEFAULT_CODE[language]) setCode(DEFAULT_CODE[lang]);
        setLanguage(lang);
        setCodeResult(null);
    };

    /* Step 3 — Template */
    const [templateId, setTemplateId]   = useState<number | null>(editing?.template?.id ?? null);

    /* Step 4 — Finalize */
    const [name, setName]               = useState(editing?.name ?? '');
    const [description, setDesc]        = useState(editing?.description ?? '');
    const [saving, setSaving]           = useState(false);
    const [error, setError]             = useState('');

    const selectedSource = apiSources.find(s => s.id === sourceId);

    /* ── Step 1 : fetch preview ── */
    const fetchPreview = async () => {
        if (!endpointId) return;
        setFetching(true);
        setPreview(null);
        try {
            const result = await buildService.previewData({ api_endpoint_id: endpointId });
            setPreview(result);
        } catch {
            setPreview({ success: false, error: 'Erreur réseau' });
        } finally {
            setFetching(false);
        }
    };

    /* ── Step 2 : run code ── */
    const runCode = async () => {
        setRunning(true);
        setCodeResult(null);
        try {
            const inputData = preview?.data ?? {};
            const result = await buildService.runCode(code, inputData, language);
            setCodeResult(result);
        } catch {
            setCodeResult({ success: false, error: 'Erreur réseau' });
        } finally {
            setRunning(false);
        }
    };

    /* ── Submit ── */
    const handleSave = async () => {
        if (!name.trim()) { setError('Le nom du build est requis.'); return; }
        if (!sourceId)    { setError('Sélectionnez une source API.'); return; }
        if (!endpointId)  { setError("L'endpoint est requis."); return; }
        if (!code.trim()) { setError('Le code de transformation est requis.'); return; }

        setSaving(true);
        setError('');
        try {
            await onSave({
                name, description: description || undefined,
                api_endpoint_id: endpointId!,
                code, language, template_id: templateId ?? undefined,
            }, editing?.id);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    const canNext: Record<Step, boolean> = {
        1: !!sourceId && !!endpointId,
        2: code.trim().length > 10,
        3: true,
        4: true,
    };

    const STEPS = [
        { n: 1, label: 'Source API' },
        { n: 2, label: 'Code' },
        { n: 3, label: 'Template' },
        { n: 4, label: 'Finaliser' },
    ];

    return (
        <div className="wizard-panel">
            {/* Header */}
            <div className="wizard-header">
                <div className="wizard-title">
                    <Hammer size={20} />
                    <h2>{isEditing ? 'Modifier le build' : 'Nouveau build'}</h2>
                </div>
                    {/* Stepper */}
                    <div className="wizard-stepper">
                        {STEPS.map(({ n, label }, i) => (
                            <div key={n} className="stepper-item">
                                <button
                                    className={`stepper-dot ${step === n ? 'active' : step > n ? 'done' : ''}`}
                                    onClick={() => step > n && setStep(n as Step)}>
                                    {step > n ? <Check size={12} /> : n}
                                </button>
                                <span className={`stepper-label ${step === n ? 'active' : ''}`}>{label}</span>
                                {i < STEPS.length - 1 && <div className={`stepper-line ${step > n ? 'done' : ''}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="wizard-body">

                    {/* ── STEP 1: API Source ── */}
                    {step === 1 && (
                        <div className="wizard-step">
                            <h3 className="step-title"><Plug size={16} /> Sélectionnez une source API</h3>

                            <div className="source-grid">
                                {apiSources.length === 0 ? (
                                    <p className="no-data">Aucune source API configurée. <br/>Allez créer une source dans "API Sources".</p>
                                ) : apiSources.map(src => (
                                    <div key={src.id}
                                        className={`source-card ${sourceId === src.id ? 'selected' : ''}`}
                                        onClick={() => setSourceId(src.id)}>
                                        <div className="source-card-icon"><Plug size={16} /></div>
                                        <div className="source-card-info">
                                            <span className="source-card-name">{src.name}</span>
                                            <span className="source-card-url">{src.url_base}</span>
                                        </div>
                                        {sourceId === src.id && <Check size={16} className="source-check" />}
                                    </div>
                                ))}
                            </div>

                            {sourceId && (
                                <div className="endpoint-config">
                                    <h4 className="config-subtitle">Choisissez un endpoint</h4>
                                    {loadingEndpoints ? (
                                        <div className="loading-mini">Chargement des endpoints…</div>
                                    ) : endpoints.length === 0 ? (
                                        <p className="no-data-mini">Aucun endpoint défini pour cette source.</p>
                                    ) : (
                                        <div className="endpoint-select-grid">
                                            {endpoints.map(ep => (
                                                <div key={ep.id} 
                                                    className={`endpoint-select-card ${endpointId === ep.id ? 'selected' : ''}`}
                                                    onClick={() => setEndpointId(ep.id)}>
                                                    <span className={`method-badge method-${ep.method.toLowerCase()}`}>{ep.method}</span>
                                                    <span className="ep-path">{ep.path}</span>
                                                    <div className="ep-name">{ep.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {endpointId && (
                                        <div className="endpoint-preview-action">
                                            <button className="btn-fetch" onClick={fetchPreview} disabled={fetching}>
                                                {fetching ? <Loader2 size={15} className="spin" /> : 'Tester l\'endpoint'}
                                            </button>
                                        </div>
                                    )}

                                    {preview && (
                                        <div className={`preview-box ${preview.success ? 'ok' : 'err'}`}>
                                            <div className="preview-box-header">
                                                {preview.success
                                                    ? <><CheckCircle2 size={14}/> HTTP {preview.status_code} — Données reçues</>
                                                    : <><AlertCircle size={14}/> Erreur : {preview.error}</>}
                                            </div>
                                            {preview.success && (
                                                <pre className="preview-json">
                                                    {JSON.stringify(preview.data, null, 2).slice(0, 1200)}
                                                    {JSON.stringify(preview.data).length > 1200 ? '\n…' : ''}
                                                </pre>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 2: Code ── */}
                    {step === 2 && (
                        <div className="wizard-step wizard-step--code">
                            <div className="code-pane">
                                <div className="code-pane-header">
                                    <Terminal size={14} />
                                    {/* Language selector */}
                                    <div className="lang-tabs">
                                        {LANG_OPTIONS.map(l => (
                                            <button
                                                key={l.value}
                                                className={`lang-tab ${language === l.value ? 'active' : ''}`}
                                                onClick={() => handleLangChange(l.value)}
                                            >{l.label}</button>
                                        ))}
                                    </div>
                                    <span className="code-hint">
                                        {LANG_OPTIONS.find(l => l.value === language)?.hint}
                                    </span>
                                    <button className="btn-run" onClick={runCode} disabled={running}>
                                        {running ? <Loader2 size={13} className="spin" /> : <><Play size={13}/> Exécuter</>}
                                    </button>
                                </div>
                                <textarea
                                    className="code-editor"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    spellCheck={false}
                                />
                            </div>

                            <div className="code-result-pane">
                                <div className="code-pane-header"><Terminal size={14} /> Résultat</div>
                                {!codeResult && (
                                    <div className="result-empty">
                                        Cliquez sur "Exécuter" pour tester votre code avec les données de l'API.
                                    </div>
                                )}
                                {codeResult && (
                                    <div className={`result-box ${codeResult.success ? 'ok' : 'err'}`}>
                                        {!codeResult.success && (
                                            <div className="result-error"><AlertCircle size={13}/> {codeResult.error}</div>
                                        )}
                                        {codeResult.success && (
                                            <pre className="result-json">
                                                {JSON.stringify(codeResult.output_data, null, 2).slice(0, 2000)}
                                            </pre>
                                        )}
                                        {codeResult.logs && codeResult.logs.length > 0 && (
                                            <div className="result-logs">
                                                {codeResult.logs.map((l, i) => <div key={i} className="log-line">» {l}</div>)}
                                            </div>
                                        )}
                                        {codeResult.execution_time_ms !== undefined && (
                                            <div className="result-time">⏱ {codeResult.execution_time_ms} ms</div>
                                        )}
                                    </div>
                                )}

                                <div className="api-data-preview">
                                    <div className="code-pane-header">Données d'entrée (apiData)</div>
                                    <pre className="result-json">
                                        {preview?.data
                                            ? JSON.stringify(preview.data, null, 2).slice(0, 600)
                                            : '// Aucune donnée — testez d\'abord la source à l\'étape 1'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Template ── */}
                    {step === 3 && (
                        <div className="wizard-step">
                            <h3 className="step-title"><FileCode size={16}/> Associez un template <span className="optional-tag">(optionnel)</span></h3>
                            <p className="step-desc">Le template sera utilisé lors de la génération pour mettre en forme les données.</p>

                            <div className="template-grid">
                                <div
                                    className={`tpl-choice-card ${templateId === null ? 'selected' : ''}`}
                                    onClick={() => setTemplateId(null)}>
                                    <span className="tpl-choice-none">⊘ Aucun template</span>
                                </div>
                                {templates.map(t => (
                                    <div key={t.id}
                                        className={`tpl-choice-card ${templateId === t.id ? 'selected' : ''}`}
                                        onClick={() => setTemplateId(t.id)}>
                                        <div className="tpl-choice-header">
                                            <FileCode size={15}/>
                                            <span className={`tpl-choice-format format-${t.output_format}`}>{t.output_format.toUpperCase()}</span>
                                            {templateId === t.id && <Check size={14} className="source-check" />}
                                        </div>
                                        <div className="tpl-choice-name">{t.name}</div>
                                        {t.description && <div className="tpl-choice-desc">{t.description}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: Finalize ── */}
                    {step === 4 && (
                        <div className="wizard-step">
                            <h3 className="step-title">Finalisez votre build</h3>

                            {error && <div className="modal-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                            <div className="form-field">
                                <label>Nom du build *</label>
                                <input type="text" placeholder="Ex: Rapport mensuel ventes…"
                                    value={name} onChange={e => setName(e.target.value)} autoFocus />
                            </div>

                            <div className="form-field">
                                <label>Description</label>
                                <input type="text" placeholder="Description optionnelle…"
                                    value={description} onChange={e => setDesc(e.target.value)} />
                            </div>

                            {/* Summary */}
                            <div className="build-summary">
                                <div className="summary-row">
                                    <Plug size={14}/> <strong>Source :</strong> {selectedSource?.name}
                                </div>
                                <div className="summary-row">
                                    <Globe size={14}/> <strong>Endpoint :</strong> {endpoints.find(e => e.id === endpointId)?.path}
                                </div>
                                <div className="summary-row">
                                    <Terminal size={14}/> <strong>Code :</strong> {code.split('\n').length} lignes
                                    <span className={`lang-badge lang-${language}`}>{language.toUpperCase()}</span>
                                </div>
                                <div className="summary-row">
                                    <FileCode size={14}/> <strong>Template :</strong>{' '}
                                    {templateId ? templates.find(t => t.id === templateId)?.name : 'Aucun'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer navigation */}
                <div className="wizard-footer">
                    <button className="btn-cancel" onClick={onCancel}>Annuler</button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {step > 1 && (
                            <button className="btn-prev" onClick={() => setStep((step - 1) as Step)}>
                                <ChevronLeft size={15}/> Précédent
                            </button>
                        )}
                        {step < 4 ? (
                            <button className="btn-next" onClick={() => setStep((step + 1) as Step)}
                                disabled={!canNext[step]}>
                                Suivant <ChevronRight size={15}/>
                            </button>
                        ) : (
                            <button className="btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 size={15} className="spin"/> : <><Check size={15}/>{' '}{isEditing ? 'Mettre à jour' : 'Créer le build'}</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
    );
};

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
const BuildPage = () => {
    const [builds, setBuilds]         = useState<Build[]>([]);
    const [apiSources, setApiSources] = useState<ApiSource[]>([]);
    const [templates, setTemplates]   = useState<Template[]>([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [showWizard, setShowWizard] = useState(false);
    const [editing, setEditing]       = useState<Build | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const [b, s, t] = await Promise.all([
                buildService.list(),
                apiSourceService.list(),
                templateService.list(),
            ]);
            setBuilds(b); setApiSources(s); setTemplates(t);
        } catch {
            setError('Impossible de charger les builds.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (payload: BuildPayload, id?: number) => {
        if (id) {
            const updated = await buildService.update(id, payload);
            setBuilds(b => b.map(x => x.id === id ? updated : x));
        } else {
            const created = await buildService.create(payload);
            setBuilds(b => [created, ...b]);
        }
        setShowWizard(false);
        setEditing(null);
    };

    const handleDelete = async (build: Build) => {
        if (!confirm(`Supprimer "${build.name}" ?`)) return;
        try {
            await buildService.delete(build.id);
            setBuilds(b => b.filter(x => x.id !== build.id));
            if (editing?.id === build.id) { setShowWizard(false); setEditing(null); }
        } catch {
            alert('Erreur lors de la suppression.');
        }
    };

    const openCreate  = () => { setEditing(null); setShowWizard(true); };
    const openEdit    = (b: Build) => { setEditing(b); setShowWizard(true); };
    const closeWizard = () => { setShowWizard(false); setEditing(null); };

    return (
        <MainLayout>
            <div className={`build-workspace ${showWizard ? 'build-workspace--split' : ''}`}>

                {/* ── Left : builds list ── */}
                <div className="build-list-col">
                    <div className="page-header">
                        <div>
                            <div className="page-title">
                                <Hammer size={22} strokeWidth={1.8}/>
                                <h1>Builds</h1>
                            </div>
                            <p className="page-subtitle">
                                Configurez vos pipelines : source API → transformation → template
                            </p>
                        </div>
                        <div className="page-header-actions">
                            <button className="btn-icon" onClick={load} title="Rafraîchir"><RefreshCw size={16}/></button>
                            <button className="btn-primary-action" onClick={openCreate}>
                                <Plus size={16}/> Nouveau build
                            </button>
                        </div>
                    </div>

                    {error && <div className="page-error">{error}</div>}

                    {loading ? (
                        <div className="build-grid">
                            {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
                        </div>
                    ) : builds.length === 0 ? (
                        <div className="page-empty">
                            <Hammer size={48} strokeWidth={1} className="empty-icon"/>
                            <h3>Aucun build</h3>
                            <p>Créez votre premier build pour connecter une source API à un template.</p>
                            <button className="btn-primary-action" onClick={openCreate}>
                                <Plus size={16}/> Créer un build
                            </button>
                        </div>
                    ) : (
                        <div className="build-grid">
                            {builds.map(build => (
                                <div key={build.id}
                                     className={`build-card ${editing?.id === build.id ? 'build-card--active' : ''}`}>
                                    <div className="build-card-header">
                                        <div className="build-card-title">{build.name}</div>
                                        <div className="build-card-actions">
                                            <button className="tpl-action-btn"
                                                    onClick={() => openEdit(build)} title="Modifier">
                                                <Pencil size={13}/>
                                            </button>
                                            <button className="tpl-action-btn tpl-action-btn--danger"
                                                    onClick={() => handleDelete(build)} title="Supprimer">
                                                <Trash2 size={13}/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="build-card-body">
                                        <div className="build-meta-row">
                                            <Plug size={13}/>
                                            <span>{build.api_source.name}</span>
                                            <code className="build-method">{build.api_endpoint.method}</code>
                                            <code className="build-endpoint">/{build.api_endpoint.path}</code>
                                        </div>
                                        {build.template && (
                                            <div className="build-meta-row">
                                                <FileCode size={13}/>
                                                <span>{build.template.name}</span>
                                                <span className={`format-pill format-${build.template.format}`}>
                                                    {build.template.format.toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        {build.description && (
                                            <p className="build-desc">{build.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Right : inline wizard ── */}
                {showWizard && (
                    <div className="build-wizard-col">
                        <BuildWizard
                            editing={editing}
                            apiSources={apiSources}
                            templates={templates}
                            onSave={handleSave}
                            onCancel={closeWizard}
                        />
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default BuildPage;

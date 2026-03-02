import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Plus, FileCode, Pencil, Trash2, RefreshCw,
    Upload, Sparkles, Loader2, X, FileUp,
} from 'lucide-react';
import { templateService, uploadTemplate } from '../services/templateService';
import type { Template, TemplatePayload } from '../services/templateService';
import TemplateEditor from '../components/TemplateEditor';
import MainLayout from '../layouts/MainLayout';
import './TemplatesPage.css';

type View = 'list' | 'editor';

const TemplatesPage = () => {
    const [view, setView]           = useState<View>('list');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [editing, setEditing]     = useState<Template | null>(null);

    // Upload state
    const fileInputRef              = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadErr, setUploadErr] = useState('');
    const [dragOver, setDragOver]   = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setTemplates(await templateService.list());
        } catch {
            setError('Impossible de charger les templates.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (payload: TemplatePayload, id?: number) => {
        if (id) {
            const updated = await templateService.update(id, payload);
            setTemplates(ts => ts.map(t => t.id === id ? updated : t));
        } else {
            const created = await templateService.create(payload);
            setTemplates(ts => [created, ...ts]);
        }
        setView('list');
        setEditing(null);
    };

    const handleDelete = async (t: Template) => {
        if (!confirm(`Supprimer "${t.name}" ?`)) return;
        try {
            await templateService.delete(t.id);
            setTemplates(ts => ts.filter(x => x.id !== t.id));
        } catch { alert('Erreur lors de la suppression.'); }
    };

    const openNew  = () => { setEditing(null); setView('editor'); };
    const openEdit = (t: Template) => { setEditing(t); setView('editor'); };

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        setUploadErr('');
        try {
            const result = await uploadTemplate(file);
            // Ouvrir l'éditeur pré-rempli avec le contenu uploadé
            setEditing({
                id: 0,
                name: result.source_name,
                content: result.content,
                output_format: result.output_format as any,
                description: '',
                status: 'active',
                created_at: new Date().toISOString(),
            } as Template);
            setView('editor');
        } catch (e: any) {
            setUploadErr(e.response?.data?.error ?? 'Erreur lors de l\'analyse du fichier.');
        } finally {
            setUploading(false);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
        e.target.value = '';
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileUpload(file);
    };

    // ── Éditeur ──
    if (view === 'editor') {
        return (
            <TemplateEditor
                editing={editing?.id ? editing : null}
                onSave={handleSave}
                onBack={() => { setView('list'); setEditing(null); }}
            />
        );
    }

    // ── Liste ──
    return (
        <MainLayout>
            <div className="page-container tpl-list-page">

                {/* ─ Hero buttons ─ */}
                <div className="tpl-hero">
                    <button className="tpl-hero-btn tpl-hero-btn--start" onClick={openNew}>
                        <div className="tpl-hero-icon"><Sparkles size={28}/></div>
                        <div className="tpl-hero-text">
                            <span className="tpl-hero-title">Créer mon template</span>
                            <span className="tpl-hero-sub">Éditeur visuel avec aperçu en temps réel</span>
                        </div>
                        <Plus size={22} className="tpl-hero-plus"/>
                    </button>

                    <div
                        className={`tpl-hero-btn tpl-hero-btn--upload ${dragOver ? 'drag-over' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}>
                        <div className="tpl-hero-icon">
                            {uploading ? <Loader2 size={28} className="spin"/> : <FileUp size={28}/>}
                        </div>
                        <div className="tpl-hero-text">
                            <span className="tpl-hero-title">{uploading ? 'Analyse en cours…' : 'Importer un fichier'}</span>
                            <span className="tpl-hero-sub">HTML, PDF, XLSX, TXT — glissez ou cliquez</span>
                        </div>
                        <Upload size={22} className="tpl-hero-plus"/>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".html,.htm,.pdf,.xlsx,.xls,.csv,.txt"
                            style={{ display: 'none' }}
                            onChange={onFileChange}
                        />
                    </div>
                </div>

                {uploadErr && (
                    <div className="tpl-upload-err">
                        <X size={14}/> {uploadErr}
                    </div>
                )}

                {/* ─ Header liste ─ */}
                <div className="tpl-list-header">
                    <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileCode size={20} strokeWidth={1.8}/>
                        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>
                            Mes templates
                            {templates.length > 0 && <span className="count-badge" style={{ marginLeft: '0.5rem' }}>{templates.length}</span>}
                        </h2>
                    </div>
                    <button className="btn-icon" onClick={load} title="Rafraîchir"><RefreshCw size={15}/></button>
                </div>

                {error && <div className="tpl-error">{error}</div>}

                {/* ─ Grid ─ */}
                {loading ? (
                    <div className="templates-grid">
                        {[1,2,3].map(i => <div key={i} className="skeleton-card"/>)}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="tpl-empty">
                        <FileCode size={40} strokeWidth={1} style={{ color: 'var(--text-secondary)', opacity: 0.4 }}/>
                        <p>Aucun template — créez-en un ou importez un fichier.</p>
                    </div>
                ) : (
                    <div className="templates-grid">
                        {templates.map(t => (
                            <div key={t.id} className="template-card">
                                <div className="tpl-card-header">
                                    <div className="tpl-format-badge">
                                        <span className={`format-pill format-${t.output_format}`}>{t.output_format.toUpperCase()}</span>
                                        <span className={`status-pill status-${t.status}`}>{t.status}</span>
                                    </div>
                                    <div className="tpl-actions">
                                        <button className="tpl-action-btn" onClick={() => openEdit(t)} title="Modifier"><Pencil size={13}/></button>
                                        <button className="tpl-action-btn tpl-action-btn--danger" onClick={() => handleDelete(t)} title="Supprimer"><Trash2 size={13}/></button>
                                    </div>
                                </div>
                                <div className="tpl-card-body">
                                    <p className="tpl-doc-name">{t.name}</p>
                                    {t.description && <p className="tpl-description">{t.description}</p>}
                                    <pre className="tpl-preview">{t.content.slice(0, 160)}{t.content.length > 160 ? '…' : ''}</pre>
                                </div>
                                <div className="tpl-card-footer">
                                    <FileCode size={13}/>
                                    <span>{new Date(t.created_at).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default TemplatesPage;

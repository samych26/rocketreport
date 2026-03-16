import { useState, useEffect, useRef } from 'react';
import { X, FileCode, Upload, ChevronDown, CheckCircle, Tag } from 'lucide-react';
import type { Template, TemplatePayload, UploadResult } from '../services/templateService';
import { uploadTemplate } from '../services/templateService';
import './TemplateModal.css';

interface TemplateModalProps {
    editingTemplate?: Template | null;
    onSave: (payload: TemplatePayload, id?: number) => Promise<void>;
    onClose: () => void;
}

const HANDLEBARS_HELPERS = [
    { helper: '{{variable}}',              desc: 'Afficher une variable' },
    { helper: '{{uppercase variable}}',    desc: 'Majuscules' },
    { helper: '{{lowercase variable}}',    desc: 'Minuscules' },
    { helper: '{{date variable "Y-m-d"}}', desc: 'Formater une date' },
    { helper: '{{number variable 2}}',     desc: 'Formater un nombre' },
    { helper: '{{currency amount "€"}}',   desc: 'Devise' },
    { helper: '{{#if cond}}…{{/if}}',      desc: 'Condition' },
    { helper: '{{#each items}}…{{/each}}', desc: 'Boucle' },
];

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; }
    h1   { color: #d2a679; }
    table { width: 100%; border-collapse: collapse; }
    td, th { border: 1px solid #ddd; padding: 8px; }
  </style>
</head>
<body>
  <h1>{{title}}</h1>
  <p>Généré le {{date created_at "d/m/Y"}}</p>

  {{#each items}}
  <div>
    <strong>{{name}}</strong> — {{value}}
  </div>
  {{/each}}
</body>
</html>`;

type Tab = 'write' | 'upload';

const TemplateModal = ({ editingTemplate, onSave, onClose }: TemplateModalProps) => {
    const isEditing = !!editingTemplate;
    const [tab, setTab]                     = useState<Tab>('write');
    const [name, setName]                   = useState(editingTemplate?.name ?? '');
    const [content, setContent]             = useState(editingTemplate?.content ?? DEFAULT_TEMPLATE);
    const [outputFormat, setOutputFormat]   = useState<'html' | 'pdf' | 'xlsx' | 'txt'>(editingTemplate?.output_format ?? 'pdf');
    const [description, setDescription]    = useState(editingTemplate?.description ?? '');
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState('');
    const [showHelpers, setShowHelpers]     = useState(false);

    // Upload state
    const fileRef                           = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver]           = useState(false);
    const [uploading, setUploading]         = useState(false);
    const [uploadResult, setUploadResult]   = useState<UploadResult | null>(null);
    const [uploadError, setUploadError]     = useState('');

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Le nom du template est requis.'); return; }
        if (!content.trim()) { setError('Le contenu est requis.'); return; }
        setLoading(true);
        setError('');
        try {
            await onSave(
                { name, content, output_format: outputFormat, description: description || undefined },
                editingTemplate?.id,
            );
        } catch (err: any) {
            setError(
                err.response?.data?.details?.join(', ') ||
                err.response?.data?.error ||
                'Erreur lors de la sauvegarde.'
            );
        } finally {
            setLoading(false);
        }
    };

    const processFile = async (file: File) => {
        setUploading(true);
        setUploadError('');
        setUploadResult(null);
        try {
            const result = await uploadTemplate(file);
            setUploadResult(result);
        } catch (err: any) {
            setUploadError(err.response?.data?.error || 'Erreur lors de l\'analyse du fichier.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const applyUpload = () => {
        if (!uploadResult) return;
        if (!name) setName(uploadResult.source_name);
        setContent(uploadResult.content);
        setOutputFormat(uploadResult.output_format);
        setTab('write');
        setUploadResult(null);
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-panel">
                <div className="modal-header">
                    <div className="modal-title">
                        <FileCode size={20} />
                        <h2>{isEditing ? 'Modifier le template' : 'Nouveau template'}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {!isEditing && (
                            <div className="modal-tabs">
                                <button className={`modal-tab ${tab === 'write' ? 'active' : ''}`} onClick={() => setTab('write')}>
                                    <FileCode size={14} /> Écrire
                                </button>
                                <button className={`modal-tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>
                                    <Upload size={14} /> Importer
                                </button>
                            </div>
                        )}
                        <button className="modal-close" onClick={onClose}><X size={20} /></button>
                    </div>
                </div>

                {/* ── UPLOAD TAB ── */}
                {tab === 'upload' && !isEditing && (
                    <div className="modal-body">
                        <p className="upload-hint">
                            Importez un fichier existant (.txt, .html, .pdf, .xlsx, .xls, .csv).<br />
                            Le système extraira automatiquement les variables et le contenu.
                        </p>

                        {uploadError && <div className="modal-error">{uploadError}</div>}

                        <div
                            className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
                            onClick={() => fileRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleFileDrop}
                        >
                            <input ref={fileRef} type="file"
                                accept=".txt,.html,.htm,.pdf,.xlsx,.xls,.csv"
                                style={{ display: 'none' }} onChange={handleFileChange} />
                            {uploading ? (
                                <div className="upload-loading">
                                    <div className="spinner" />
                                    <span>Analyse en cours…</span>
                                </div>
                            ) : (
                                <>
                                    <Upload size={32} />
                                    <span className="upload-label">Glissez un fichier ici ou <u>parcourir</u></span>
                                    <span className="upload-sub">PDF, Excel (.xlsx), CSV, HTML, TXT</span>
                                </>
                            )}
                        </div>

                        {uploadResult && (
                            <div className="upload-result">
                                <div className="upload-result-header">
                                    <CheckCircle size={18} className="upload-ok-icon" />
                                    <span>Fichier analysé avec succès</span>
                                    <span className="upload-format-badge">{uploadResult.output_format.toUpperCase()}</span>
                                </div>

                                {uploadResult.variables.length > 0 && (
                                    <div className="upload-vars">
                                        <div className="upload-vars-title">
                                            <Tag size={13} /> {uploadResult.variables.length} variable(s) extraite(s)
                                        </div>
                                        <div className="upload-vars-list">
                                            {uploadResult.variables.map(v => (
                                                <code key={v} className="var-chip">{`{{${v}}}`}</code>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="upload-preview">
                                    <pre>{uploadResult.content.slice(0, 400)}{uploadResult.content.length > 400 ? '\n…' : ''}</pre>
                                </div>

                                <button className="btn-apply-upload" onClick={applyUpload}>
                                    <CheckCircle size={15} /> Utiliser ce template
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── WRITE TAB ── */}
                {(tab === 'write' || isEditing) && (
                    <form onSubmit={handleSubmit} className="modal-body">
                        {error && <div className="modal-error">{error}</div>}

                        <div className="modal-row">
                            <div className="form-field">
                                <label>Nom du template *</label>
                                <input type="text" placeholder="Ex: Rapport mensuel, Facture client…"
                                    value={name} onChange={e => setName(e.target.value)} required autoFocus />
                            </div>
                            <div className="form-field form-field--sm">
                                <label>Format</label>
                                <div className="format-toggle">
                                    {(['html', 'pdf'] as const).map(f => (
                                        <button key={f} type="button"
                                            className={`format-btn ${outputFormat === f ? 'active' : ''}`}
                                            onClick={() => setOutputFormat(f)}>
                                            {f.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Description</label>
                            <input type="text" placeholder="Description optionnelle…"
                                value={description} onChange={e => setDescription(e.target.value)} />
                        </div>

                        <div className="helpers-toggle" onClick={() => setShowHelpers(v => !v)}>
                            <span>📖 Référence Handlebars</span>
                            <ChevronDown size={16} className={showHelpers ? 'rotated' : ''} />
                        </div>
                        {showHelpers && (
                            <div className="helpers-grid">
                                {HANDLEBARS_HELPERS.map(({ helper, desc }) => (
                                    <div key={helper} className="helper-item"
                                        onClick={() => setContent(c => c + '\n' + helper)} title="Cliquer pour insérer">
                                        <code>{helper}</code>
                                        <span>{desc}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="form-field form-field--grow">
                            <label>Contenu Handlebars *</label>
                            <textarea className="template-editor" value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="<!DOCTYPE html>…" spellCheck={false} required />
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Annuler</button>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Sauvegarde…' : isEditing ? 'Mettre à jour' : 'Créer le template'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TemplateModal;

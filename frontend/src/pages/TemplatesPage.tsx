import { useState, useEffect } from 'react';
import { Plus, FileCode, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { templateService } from '../services/templateService';
import type { Template, TemplatePayload } from '../services/templateService';
import TemplateModal from '../components/TemplateModal';
import MainLayout from '../layouts/MainLayout';
import './PlaceholderPage.css';
import './TemplatesPage.css';

const TemplatesPage = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing]     = useState<Template | null>(null);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await templateService.list();
            setTemplates(data);
        } catch {
            setError('Impossible de charger les templates.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (payload: TemplatePayload, id?: number) => {
        if (id) {
            const updated = await templateService.update(id, payload);
            setTemplates(ts => ts.map(t => t.id === id ? updated : t));
        } else {
            const created = await templateService.create(payload);
            setTemplates(ts => [created, ...ts]);
        }
        setShowModal(false);
        setEditing(null);
    };

    const handleDelete = async (template: Template) => {
        if (!confirm(`Supprimer le template "${template.name}" ?`)) return;
        try {
            await templateService.delete(template.id);
            setTemplates(ts => ts.filter(t => t.id !== template.id));
        } catch {
            alert('Erreur lors de la suppression.');
        }
    };

    const openNew  = () => { setEditing(null); setShowModal(true); };
    const openEdit = (t: Template) => { setEditing(t); setShowModal(true); };

    return (
        <MainLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <div className="page-title">
                            <FileCode size={22} strokeWidth={1.8} />
                            <h1>Templates</h1>
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                            Vos modèles Handlebars de rapports
                        </p>
                    </div>
                    <div className="page-header-actions">
                        <button className="btn-icon" onClick={load} title="Rafraîchir">
                            <RefreshCw size={16} />
                        </button>
                        <button className="btn-primary-action" onClick={openNew}>
                            <Plus size={16} /> Nouveau template
                        </button>
                    </div>
                </div>

                {error && <div className="tpl-error">{error}</div>}

                {loading ? (
                    <div className="templates-grid">
                        {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="page-empty">
                        <FileCode size={48} strokeWidth={1} className="empty-icon" />
                        <h3>Aucun template</h3>
                        <p>Créez votre premier template Handlebars ou importez un fichier existant.</p>
                        <button className="btn-primary-action" onClick={openNew}>
                            <Plus size={16} /> Créer un template
                        </button>
                    </div>
                ) : (
                    <div className="templates-grid">
                        {templates.map(t => (
                            <div key={t.id} className="template-card">
                                <div className="tpl-card-header">
                                    <div className="tpl-format-badge">
                                        <span className={`format-pill format-${t.output_format}`}>
                                            {t.output_format.toUpperCase()}
                                        </span>
                                        <span className={`status-pill status-${t.status}`}>{t.status}</span>
                                    </div>
                                    <div className="tpl-actions">
                                        <button className="tpl-action-btn" onClick={() => openEdit(t)} title="Modifier">
                                            <Pencil size={13} />
                                        </button>
                                        <button className="tpl-action-btn tpl-action-btn--danger" onClick={() => handleDelete(t)} title="Supprimer">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                <div className="tpl-card-body">
                                    <p className="tpl-doc-name">{t.name}</p>
                                    {t.document_name && (
                                        <p className="tpl-description">📄 {t.document_name}</p>
                                    )}
                                    {t.description && (
                                        <p className="tpl-description">{t.description}</p>
                                    )}
                                    <pre className="tpl-preview">{t.content.slice(0, 160)}{t.content.length > 160 ? '…' : ''}</pre>
                                </div>

                                <div className="tpl-card-footer">
                                    <FileCode size={13} />
                                    <span>{new Date(t.created_at).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <TemplateModal
                    editingTemplate={editing}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditing(null); }}
                />
            )}
        </MainLayout>
    );
};

export default TemplatesPage;

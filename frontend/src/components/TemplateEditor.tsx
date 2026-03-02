import { useState, useEffect, useRef, useCallback } from 'react';
import Handlebars from 'handlebars';
import { ArrowLeft, Save, Eye, Code2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import type { Template, TemplatePayload } from '../services/templateService';
import './TemplateEditor.css';

interface Props {
    editing?: Template | null;
    onSave: (payload: TemplatePayload, id?: number) => Promise<void>;
    onBack: () => void;
}

type OutputFormat = 'pdf' | 'html' | 'xlsx' | 'txt';
type ViewMode = 'split' | 'code' | 'preview';

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body  { font-family: Arial, sans-serif; padding: 2rem; color: #333; }
    h1    { color: #d2a679; margin-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th    { background: #d2a679; color: #fff; padding: 8px 12px; text-align: left; }
    td    { border-bottom: 1px solid #eee; padding: 8px 12px; }
    tr:nth-child(even) td { background: #fafafa; }
  </style>
</head>
<body>
  <h1>{{title}}</h1>
  <p>Généré le {{generated_at}}</p>

  <table>
    <thead><tr><th>Nom</th><th>Email</th></tr></thead>
    <tbody>
      {{#each items}}
      <tr><td>{{name}}</td><td>{{email}}</td></tr>
      {{/each}}
    </tbody>
  </table>
</body>
</html>`;

const DEFAULT_TXT = `Rapport : {{title}}
Généré le : {{generated_at}}

{{#each items}}
- {{name}} <{{email}}>
{{/each}}`;

/** Extrait les noms de variables Handlebars depuis le contenu */
function extractVars(content: string): string[] {
    const matches = content.matchAll(/\{\{(?!#|\/|>|!|else)([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g);
    const vars = new Set<string>();
    for (const m of matches) {
        const name = m[1].split('.')[0];
        if (!['each', 'if', 'unless', 'with', 'log'].includes(name)) vars.add(name);
    }
    // Aussi extraire les variables dans les blocs #each
    const eachMatches = content.matchAll(/\{\{#each ([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g);
    for (const m of eachMatches) vars.add(m[1]);
    return Array.from(vars);
}

/** Construit un objet de données imbriqué depuis les testValues */
function buildTestData(vars: string[], testValues: Record<string, string>): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const v of vars) {
        const val = testValues[v] ?? '';
        // Si la variable est utilisée dans #each, créer un tableau
        data[v] = val || `[${v}]`;
    }
    return data;
}

const TemplateEditor = ({ editing, onSave, onBack }: Props) => {
    const isEditing = !!editing;
    const [name, setName]           = useState(editing?.name ?? '');
    const [format, setFormat]       = useState<OutputFormat>((editing?.output_format as OutputFormat) ?? 'pdf');
    const [content, setContent]     = useState(editing?.content ?? DEFAULT_HTML);
    const [description, setDesc]    = useState(editing?.description ?? '');
    const [viewMode, setViewMode]   = useState<ViewMode>('split');
    const [testValues, setTestValues] = useState<Record<string, string>>({});
    const [saving, setSaving]       = useState(false);
    const [saveError, setSaveError] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');
    const [previewError, setPreviewError] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const iframeRef   = useRef<HTMLIFrameElement>(null);

    // Quand le format change, propose le contenu par défaut adapté
    const handleFormatChange = (f: OutputFormat) => {
        setFormat(f);
        if (!isEditing && content === DEFAULT_HTML && f === 'txt') setContent(DEFAULT_TXT);
        if (!isEditing && content === DEFAULT_TXT && f !== 'txt')  setContent(DEFAULT_HTML);
    };

    // Variables détectées
    const detectedVars = extractVars(content);

    // Rendu live Handlebars
    const renderPreview = useCallback(() => {
        try {
            const template = Handlebars.compile(content, { noEscape: false });
            const testData = buildTestData(detectedVars, testValues);
            // Pour les variables #each, injecter un tableau de test
            for (const v of detectedVars) {
                if (content.includes(`{{#each ${v}}}`)) {
                    const val = testValues[v];
                    if (val) {
                        try { testData[v] = JSON.parse(val); } catch {
                            testData[v] = val.split(',').map(s => ({ name: s.trim(), email: `${s.trim()}@example.com` }));
                        }
                    } else {
                        testData[v] = [{ name: 'Alice', email: 'alice@example.com' }, { name: 'Bob', email: 'bob@example.com' }];
                    }
                }
            }
            const rendered = template(testData);
            setPreviewHtml(rendered);
            setPreviewError('');
        } catch (e: any) {
            setPreviewError(e.message);
        }
    }, [content, testValues, detectedVars, format]);

    useEffect(() => {
        renderPreview();
    }, [renderPreview]);

    // Injecter dans l'iframe pour isolation CSS
    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;
        const banner = format === 'xlsx'
            ? `<div style="background:#e8f5e9;border-bottom:1px solid #a5d6a7;padding:6px 12px;font-size:12px;color:#2e7d32;font-family:sans-serif">
                 📊 Aperçu HTML — le rapport sera généré en fichier <strong>.xlsx</strong>
               </div>`
            : '';
        doc.open();
        doc.write(format === 'txt'
            ? `<html><body style="font-family:monospace;white-space:pre-wrap;padding:1rem;color:#333">${previewHtml}</body></html>`
            : banner + previewHtml
        );
        doc.close();
    }, [previewHtml, format]);

    const handleSave = async () => {
        if (!name.trim()) { setSaveError('Le nom du template est requis.'); return; }
        if (!content.trim()) { setSaveError('Le contenu est requis.'); return; }
        setSaving(true);
        setSaveError('');
        try {
            await onSave({ name, content, output_format: format as any, description: description || undefined }, editing?.id);
        } catch (e: any) {
            setSaveError(e.response?.data?.error ?? e.message ?? 'Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    const insertHelper = (helper: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end   = ta.selectionEnd;
        const next  = content.slice(0, start) + helper + content.slice(end);
        setContent(next);
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + helper.length, start + helper.length); }, 0);
    };

    return (
        <div className="tpl-editor">
            {/* ── Header ── */}
            <div className="tpl-editor-header">
                <button className="tpl-editor-back" onClick={onBack}>
                    <ArrowLeft size={16}/> Retour
                </button>
                <div className="tpl-editor-title-row">
                    <input
                        className="tpl-editor-name"
                        placeholder="Nom du template…"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <select
                        className="tpl-format-select"
                        value={format}
                        onChange={e => handleFormatChange(e.target.value as OutputFormat)}>
                        <option value="pdf">PDF</option>
                        <option value="html">HTML</option>
                        <option value="xlsx">XLSX</option>
                        <option value="txt">TXT</option>
                    </select>
                    <input
                        className="tpl-editor-desc"
                        placeholder="Description (optionnel)"
                        value={description}
                        onChange={e => setDesc(e.target.value)}
                    />
                </div>
                <div className="tpl-editor-actions">
                    <div className="view-toggle">
                        <button className={viewMode === 'code' ? 'active' : ''} onClick={() => setViewMode('code')} title="Code uniquement"><Code2 size={15}/></button>
                        <button className={viewMode === 'split' ? 'active' : ''} onClick={() => setViewMode('split')} title="Split"><Sparkles size={15}/></button>
                        <button className={viewMode === 'preview' ? 'active' : ''} onClick={() => setViewMode('preview')} title="Aperçu uniquement"><Eye size={15}/></button>
                    </div>
                    <button className="tpl-save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? <><Loader2 size={15} className="spin"/> Sauvegarde…</> : <><Save size={15}/> {isEditing ? 'Mettre à jour' : 'Sauvegarder'}</>}
                    </button>
                </div>
            </div>

            {saveError && (
                <div className="tpl-save-error"><AlertCircle size={14}/> {saveError}</div>
            )}

            {/* ── Body ── */}
            <div className={`tpl-editor-body tpl-editor-body--${viewMode}`}>

                {/* Panneau code */}
                {viewMode !== 'preview' && (
                    <div className="tpl-code-panel">
                        <div className="tpl-helpers-bar">
                            {[
                                ['{{variable}}', 'Variable'],
                                ['{{#if cond}}…{{/if}}', 'If'],
                                ['{{#each items}}…{{/each}}', 'Each'],
                                ['{{uppercase var}}', 'Majuscules'],
                                ['{{date var "d/m/Y"}}', 'Date'],
                            ].map(([h, label]) => (
                                <button key={h} className="helper-chip" onClick={() => insertHelper(h)}>{label}</button>
                            ))}
                        </div>
                        <textarea
                            ref={textareaRef}
                            className="tpl-code-textarea"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            spellCheck={false}
                            placeholder="Écrivez votre template Handlebars ici…"
                        />
                    </div>
                )}

                {/* Panneau preview */}
                {viewMode !== 'code' && (
                    <div className="tpl-preview-panel">
                        <div className="tpl-preview-topbar">
                            <Eye size={13}/> Aperçu en temps réel
                            {previewError && <span className="preview-error"><AlertCircle size={12}/> {previewError}</span>}
                        </div>
                        <iframe ref={iframeRef} className="tpl-preview-iframe" title="Aperçu du template" sandbox="allow-same-origin"/>
                    </div>
                )}
            </div>

            {/* ── Variables panel ── */}
            {detectedVars.length > 0 && (
                <div className="tpl-vars-panel">
                    <span className="tpl-vars-label">Variables détectées :</span>
                    <div className="tpl-vars-inputs">
                        {detectedVars.map(v => (
                            <div key={v} className="tpl-var-input">
                                <label className="tpl-var-name"><code>{`{{${v}}}`}</code></label>
                                <input
                                    type="text"
                                    className="tpl-var-field"
                                    placeholder={content.includes(`{{#each ${v}}}`) ? 'JSON ou val1,val2' : `Valeur test…`}
                                    value={testValues[v] ?? ''}
                                    onChange={e => setTestValues(tv => ({ ...tv, [v]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateEditor;

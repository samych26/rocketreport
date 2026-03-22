import { useState, useEffect } from 'react';
import {
    History, Play, Download, Loader2, RefreshCw,
    Plug, FileCode, ChevronDown, ChevronUp,
    CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { buildService } from '../services/buildService';
import type { Build } from '../services/buildService';
import { generationService } from '../services/generationService';
import type { Generation } from '../services/generationService';
import './GenerationsPage.css';

/* ── helpers ── */
const extFromMime = (ct: string) =>
    ct.includes('pdf') ? 'pdf'
    : ct.includes('spreadsheet') || ct.includes('excel') ? 'xlsx'
    : ct.includes('html') ? 'html'
    : ct.includes('plain') ? 'txt'
    : 'bin';

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

/* ── BuildRow ── */
interface BuildRowProps { build: Build; }

const BuildRow = ({ build }: BuildRowProps) => {
    const [open,        setOpen]        = useState(false);
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [loadingHist, setLoadingHist] = useState(false);
    const [generating,  setGenerating]  = useState(false);
    const [genMsg,      setGenMsg]      = useState<{ ok: boolean; msg: string } | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<Record<number, boolean>>({});

    const loadHistory = async () => {
        setLoadingHist(true);
        try {
            const list = await generationService.list(build.id);
            setGenerations(list);
        } catch {
            /* silently fail — history not critical */
        } finally {
            setLoadingHist(false);
        }
    };

    const toggle = () => {
        if (!open) loadHistory();
        setOpen(v => !v);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setGenMsg(null);
        try {
            const result = await generationService.generate(build.id);
            setGenMsg({ ok: true, msg: result.cached ? 'Rapport déjà en cache ✓' : 'Rapport généré ✓' });
            if (result.download_url) setDownloadUrl(result.download_url);
            loadHistory();
        } catch (err: any) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur de génération';
            setGenMsg({ ok: false, msg });
        } finally {
            setGenerating(false);
        }
    };

    const handleDownloadUrl = async (name: string) => {
        if (!downloadUrl) return;
        try {
            const { blob, contentType } = await generationService.downloadByUrl(downloadUrl);
            const ext  = extFromMime(contentType);
            const link = document.createElement('a');
            link.href  = URL.createObjectURL(blob);
            link.download = `${name}.${ext}`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch { alert('Erreur lors du téléchargement.'); }
    };

    const handleDownloadGen = async (gen: Generation) => {
        setDownloading(d => ({ ...d, [gen.id]: true }));
        try {
            const blob = await generationService.download(build.id, gen.id);
            const ext  = extFromMime(blob.type);
            const link = document.createElement('a');
            link.href  = URL.createObjectURL(blob);
            link.download = `${build.name}_${gen.id}.${ext}`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch { alert('Erreur lors du téléchargement.'); }
        finally { setDownloading(d => ({ ...d, [gen.id]: false })); }
    };

    return (
        <div className="gen-build-card">
            {/* ── Card header ── */}
            <div className="gen-build-header">
                <div className="gen-build-info">
                    <span className="gen-build-name">{build.name}</span>
                    <div className="gen-build-meta">
                        <Plug size={12}/>
                        <span>{build.api_source.name}</span>
                        <code className="build-method">{build.method}</code>
                        <code className="build-endpoint">/{build.endpoint}</code>
                        {build.template && (
                            <>
                                <FileCode size={12}/>
                                <span>{build.template.name}</span>
                                <span className={`format-pill format-${build.template.format}`}>
                                    {build.template.format.toUpperCase()}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="gen-build-actions">
                    <button className="btn-generate" onClick={handleGenerate} disabled={generating}>
                        {generating
                            ? <><Loader2 size={14} className="spin"/> Génération…</>
                            : <><Play size={14}/> Générer</>}
                    </button>

                    {downloadUrl && (
                        <button className="btn-download" onClick={() => handleDownloadUrl(build.name)}>
                            <Download size={14}/> Télécharger
                        </button>
                    )}

                    <button className="btn-icon" onClick={toggle} title="Historique">
                        {open ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                    </button>
                </div>
            </div>

            {/* Inline generation message */}
            {genMsg && (
                <div className={`gen-inline-msg ${genMsg.ok ? 'ok' : 'err'}`}>
                    {genMsg.ok ? <CheckCircle2 size={13}/> : <XCircle size={13}/>}
                    {genMsg.msg}
                </div>
            )}

            {/* ── History panel ── */}
            {open && (
                <div className="gen-history">
                    <div className="gen-history-header">
                        <History size={13}/> Historique des générations
                        <button className="btn-icon-sm" onClick={loadHistory} title="Rafraîchir">
                            <RefreshCw size={12}/>
                        </button>
                    </div>

                    {loadingHist ? (
                        <div className="gen-history-loading">
                            <Loader2 size={16} className="spin"/>
                        </div>
                    ) : generations.length === 0 ? (
                        <p className="gen-history-empty">Aucune génération pour ce build.</p>
                    ) : (
                        <div className="gen-table-wrap">
                        <table className="gen-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Format</th>
                                    <th>Statut</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {generations.map(gen => (
                                    <tr key={gen.id}>
                                        <td className="gen-td-id">{gen.id}</td>
                                        <td>{fmtDate(gen.created_at)}</td>
                                        <td>
                                            <span className={`format-pill format-${gen.output_format}`}>
                                                {gen.output_format?.toUpperCase() ?? '—'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`gen-status gen-status--${gen.status}`}>
                                                {gen.status === 'success' && <CheckCircle2 size={12}/>}
                                                {gen.status === 'failed'  && <XCircle size={12}/>}
                                                {gen.status === 'pending' && <Clock size={12}/>}
                                                {gen.status}
                                            </span>
                                        </td>
                                        <td>
                                            {gen.status === 'success' && (
                                                <button
                                                    className="btn-download-sm"
                                                    onClick={() => handleDownloadGen(gen)}
                                                    disabled={downloading[gen.id]}>
                                                    {downloading[gen.id]
                                                        ? <Loader2 size={12} className="spin"/>
                                                        : <><Download size={12}/> Télécharger</>}
                                                </button>
                                            )}
                                            {gen.status === 'failed' && gen.error_message && (
                                                <span className="gen-error-msg" title={gen.error_message}>
                                                    {gen.error_message.slice(0, 40)}…
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>

                    )}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   GENERATIONS PAGE
═══════════════════════════════════════════════════ */
const GenerationsPage = () => {
    const [builds,  setBuilds]  = useState<Build[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    const load = async () => {
        setLoading(true);
        try {
            setBuilds(await buildService.list());
        } catch {
            setError('Impossible de charger les builds.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <MainLayout>
            <div className="page-container">
                <div className="page-header">
                    <div className="page-title">
                        <History size={22} strokeWidth={1.8}/>
                        <h1>Générations</h1>
                    </div>
                    <button className="btn-icon" onClick={load} title="Rafraîchir">
                        <RefreshCw size={16}/>
                    </button>
                </div>

                {error && <div className="page-error">{error}</div>}

                {loading ? (
                    <div className="gen-loading">
                        <Loader2 size={28} className="spin"/>
                    </div>
                ) : builds.length === 0 ? (
                    <div className="page-empty">
                        <History size={48} strokeWidth={1} className="empty-icon"/>
                        <h3>Aucun build configuré</h3>
                        <p>Créez d'abord un build dans la section "Build" pour lancer des générations.</p>
                    </div>
                ) : (
                    <div className="gen-list">
                        {builds.map(build => (
                            <BuildRow key={build.id} build={build} />
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default GenerationsPage;


'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
    ArrowLeftRight, Plus, X,
    ChevronDown, Trash2, Calculator, Info,
    FileSpreadsheet, Sparkles, TrendingDown,
    Download, LayoutGrid, ChevronRight,
    Search, RotateCcw, MoreHorizontal, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const GET_COMPARIF_DATA = gql`
  query GetComparatifData {
    getSuppliers {
      id
      name
    }
    getArticleFamilies {
      id
      name
      rows
      suppliers
    }
  }
`;

const ADD_ARTICLE_FAMILY = gql`
  mutation AddArticleFamily($name: String!) {
    addArticleFamily(name: $name) {
      id
      name
      rows
      suppliers
    }
  }
`;

const UPDATE_ARTICLE_FAMILY = gql`
  mutation UpdateArticleFamily($id: Int!, $rows: String, $suppliers: String) {
    updateArticleFamily(id: $id, rows: $rows, suppliers: $suppliers) {
      id
      name
    }
  }
`;

const DELETE_ARTICLE_FAMILY = gql`
  mutation DeleteArticleFamily($id: Int!) {
    deleteArticleFamily(id: $id)
  }
`;

interface ComparisonRow {
    id: string;
    article: string;
    quantite: number;
    unite: string;
    prices: Record<string, number>; // supplier_id -> price
}

interface Supplier {
    id: string;
    name: string;
}

interface ArticleFamily {
    id: number;
    name: string;
    rows: string;
    suppliers: string;
}

const UnitSelector = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const options = [
        { value: 'kg', label: 'KG' },
        { value: 'gr', label: 'GR' },
        { value: 'L', label: 'L' },
        { value: 'unité', label: 'U' },
        { value: 'carton', label: 'CTN' },
    ];

    const selectedOption = options.find(o => o.value === value) || options[0];

    const getMenuStyles = () => {
        if (!triggerRef.current) return {};
        const rect = triggerRef.current.getBoundingClientRect();
        return {
            position: 'fixed' as const,
            top: rect.bottom + 10,
            left: rect.left + (rect.width / 2),
            transform: 'translateX(-50%)',
            zIndex: 9999
        };
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${isOpen
                    ? 'bg-[#4a3426] text-white shadow-lg'
                    : 'bg-[#fcfaf8] text-[#8c8279] hover:bg-[#f3eee8] hover:text-[#4a3426]'
                    }`}
            >
                <span className="text-[11px] font-black uppercase tracking-[0.15em]">{selectedOption.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-[#c69f6e]'}`} />
            </button>

            {mounted && createPortal(
                <AnimatePresence mode="wait">
                    {isOpen && (
                        <div key="selector-portal-wrapper">
                            <motion.div
                                key="backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[9998] bg-black/5 backdrop-blur-[1px]"
                                onClick={() => setIsOpen(false)}
                            />
                            <motion.div
                                key="menu"
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                style={getMenuStyles()}
                                className="w-32 bg-white rounded-2xl shadow-[0_25px_70px_rgba(74,52,38,0.3)] border border-[#e6dace] overflow-hidden p-1.5"
                            >
                                <div className="space-y-1">
                                    {options.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                onChange(opt.value);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${value === opt.value
                                                ? 'bg-[#4a3426] text-white shadow-md'
                                                : 'text-[#8c8279] hover:bg-[#fcfaf8] hover:text-[#4a3426]'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default function ComparatifPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ role: 'admin' | 'caissier' } | null>(null);
    const [initializing, setInitializing] = useState(true);

    const [dbFamilies, setDbFamilies] = useState<ArticleFamily[]>([]);
    const [selectedFamille, setSelectedFamille] = useState<string>('');
    const [isInternalSidebarOpen, setIsInternalSidebarOpen] = useState(true);

    const { data, loading, refetch } = useQuery(GET_COMPARIF_DATA);
    const [addFamily] = useMutation(ADD_ARTICLE_FAMILY);
    const [updateFamily] = useMutation(UPDATE_ARTICLE_FAMILY);
    const [deleteFamily] = useMutation(DELETE_ARTICLE_FAMILY);

    const [rowsByFamily, setRowsByFamily] = useState<Record<string, ComparisonRow[]>>({});
    const [familySuppliers, setFamilySuppliers] = useState<Record<string, Supplier[]>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (data?.getArticleFamilies) {
            const fams = data.getArticleFamilies;
            setDbFamilies(fams);

            const rows: Record<string, ComparisonRow[]> = {};
            const sups: Record<string, Supplier[]> = {};

            fams.forEach((f: ArticleFamily) => {
                rows[f.name] = JSON.parse(f.rows || '[]');
                sups[f.name] = JSON.parse(f.suppliers || '[]');
            });

            setRowsByFamily(rows);
            setFamilySuppliers(sups);

            if (fams.length > 0 && !selectedFamille) {
                setSelectedFamille(fams[0].name);
            }
        }
    }, [data, selectedFamille]);

    const handleAddFamily = async () => {
        const { value: name } = await Swal.fire({
            title: 'Nouvelle Famille',
            input: 'text',
            inputLabel: 'Nom de la nouvelle famille',
            inputPlaceholder: 'Entrez le nom...',
            showCancelButton: true,
            confirmButtonColor: '#4a3426',
            cancelButtonColor: '#8c8279',
            confirmButtonText: 'Ajouter',
            cancelButtonText: 'Annuler',
            inputValidator: (value) => {
                if (!value) return 'Le nom est obligatoire !';
                return null;
            }
        });

        if (!name) return;
        const upperName = name.toUpperCase();

        try {
            await addFamily({ variables: { name: upperName } });
            refetch();
            Swal.fire({
                icon: 'success',
                title: 'Ajouté !',
                text: `La famille ${upperName} a été créée.`,
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de l\'ajout de la famille'
            });
        }
    };

    const handleSave = async () => {
        const currentFam = dbFamilies.find(f => f.name === selectedFamille);
        if (!currentFam) return;

        setIsSaving(true);
        try {
            await updateFamily({
                variables: {
                    id: currentFam.id,
                    rows: JSON.stringify(rowsByFamily[selectedFamille] || []),
                    suppliers: JSON.stringify(familySuppliers[selectedFamille] || [])
                }
            });
            setIsSaving(false);
            Swal.fire({
                icon: 'success',
                title: 'Sauvegardé',
                text: 'Vos modifications ont été enregistrées.',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (err) {
            setIsSaving(false);
            console.error('Save error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Erreur de sauvegarde',
                text: err instanceof Error ? err.message : 'Une erreur est survenue'
            });
        }
    };

    const activeRows = useMemo(() => rowsByFamily[selectedFamille] || [], [rowsByFamily, selectedFamille]);
    const currentSuppliers = useMemo(() => familySuppliers[selectedFamille] || [], [familySuppliers, selectedFamille]);

    useEffect(() => {
        const savedUser = localStorage.getItem('bb_user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            if (parsed.role !== 'admin') {
                router.replace('/');
                return;
            } else {
                setUser(parsed);
            }
        } else {
            router.replace('/');
            return;
        }
        setInitializing(false);
    }, [router]);

    const addRow = () => {
        const newId = Date.now().toString();
        const newRow: ComparisonRow = { id: newId, article: '', quantite: 1, unite: 'kg', prices: {} };
        setRowsByFamily(prev => ({
            ...prev,
            [selectedFamille]: [...(prev[selectedFamille] || []), newRow]
        }));
    };

    const removeRow = (id: string) => {
        setRowsByFamily(prev => ({
            ...prev,
            [selectedFamille]: (prev[selectedFamille] || []).filter(r => r.id !== id)
        }));
    };

    const updateRow = (id: string, field: string, value: any) => {
        setRowsByFamily(prev => ({
            ...prev,
            [selectedFamille]: (prev[selectedFamille] || []).map(r => r.id === id ? { ...r, [field]: value } : r)
        }));
    };

    const updatePrice = (rowId: string, supplierId: string, price: number) => {
        setRowsByFamily(prev => ({
            ...prev,
            [selectedFamille]: (prev[selectedFamille] || []).map(r => {
                if (r.id === rowId) {
                    return { ...r, prices: { ...r.prices, [supplierId]: price } };
                }
                return r;
            })
        }));
    };

    const addSupplierColumn = () => {
        const newId = `sup_${Date.now()}`;
        setFamilySuppliers(prev => ({
            ...prev,
            [selectedFamille]: [...(prev[selectedFamille] || []), { id: newId, name: 'NOUVEAU' }]
        }));
    };

    const updateSupplierName = (id: string, name: string) => {
        setFamilySuppliers(prev => ({
            ...prev,
            [selectedFamille]: (prev[selectedFamille] || []).map(s => s.id === id ? { ...s, name } : s)
        }));
    };

    const removeSupplierColumn = (id: string) => {
        setFamilySuppliers(prev => ({
            ...prev,
            [selectedFamille]: (prev[selectedFamille] || []).filter(s => s.id !== id)
        }));
    };

    const handleDeleteFamily = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Supprimer ?',
            text: `Voulez-vous vraiment supprimer la famille "${name}" ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#8c8279',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (!result.isConfirmed) return;

        try {
            await deleteFamily({ variables: { id } });
            if (selectedFamille === name) {
                setSelectedFamille('');
            }
            refetch();
            Swal.fire({
                icon: 'success',
                title: 'Supprimé',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de la suppression'
            });
        }
    };

    const getPriceStatus = (row: ComparisonRow, supplierId: string) => {
        const prices = Object.values(row.prices).filter(p => p > 0);
        if (prices.length < 2) return 'normal';
        const currentPrice = row.prices[supplierId];
        if (!currentPrice) return 'normal';

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        if (currentPrice === min) return 'lowest';
        if (currentPrice === max) return 'highest';
        return 'normal';
    };

    const calculateTotalForSupplier = (supplierId: string) => {
        return activeRows.reduce((sum, row) => {
            const price = row.prices[supplierId] || 0;
            return sum + (row.quantite * price);
        }, 0);
    };

    if (initializing || !user) return null;

    return (
        <div className="flex min-h-screen bg-[#fdfbf7]">
            <Sidebar role={user.role} />

            <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
                <div className="md:hidden bg-white border-b border-[#e6dace] px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                    {dbFamilies.map((f: ArticleFamily) => (
                        <button
                            key={f.id}
                            onClick={() => setSelectedFamille(f.name)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedFamille === f.name
                                ? 'bg-[#4a3426] text-white border-[#4a3426] shadow-md'
                                : 'bg-[#fcfaf8] text-[#8c8279] border-[#e6dace]'
                                }`}
                        >
                            {f.name}
                        </button>
                    ))}
                    <button
                        onClick={handleAddFamily}
                        className="p-2 rounded-xl bg-[#c69f6e]/10 text-[#c69f6e] border border-dashed border-[#c69f6e]/40"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="flex-1 flex flex-row min-w-0 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {isInternalSidebarOpen && (
                            <motion.aside
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 288, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="hidden md:flex w-72 bg-white/50 border-r border-[#e6dace] p-6 flex-col gap-6 overflow-hidden shrink-0"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[10px] font-black text-[#bba282] uppercase tracking-[0.2em] opacity-60">Familles d'articles</h3>
                                    <button
                                        onClick={() => setIsInternalSidebarOpen(false)}
                                        className="p-2 hover:bg-[#4a3426]/5 rounded-xl text-[#8c8279] transition-all flex items-center gap-2 group"
                                    >
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Réduire</span>
                                        <PanelLeftClose size={16} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {dbFamilies.map((f: ArticleFamily) => (
                                        <div key={f.id} className="group/fam relative">
                                            <button
                                                onClick={() => setSelectedFamille(f.name)}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${selectedFamille === f.name ? 'bg-[#4a3426] text-white shadow-lg shadow-[#4a3426]/20' : 'bg-white hover:bg-[#fcfaf8] text-[#8c8279] border border-[#e6dace]/50'}`}
                                            >
                                                <span className="text-xs font-black uppercase tracking-tight">{f.name}</span>
                                                {selectedFamille === f.name ? <ChevronRight size={14} className="opacity-50" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#e6dace]"></div>}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteFamily(f.id, f.name); }}
                                                className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover/fam:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10 z-10"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleAddFamily}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-[#e6dace] text-[#bba282] hover:border-[#c69f6e] hover:text-[#c69f6e] transition-all group"
                                    >
                                        <Plus size={16} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Nouvelle famille</span>
                                    </button>
                                </div>

                                <div className="mt-auto">
                                    <div className="p-5 bg-gradient-to-br from-[#4a3426] to-[#6d4c3a] rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                        <h4 className="text-[11px] font-black uppercase tracking-widest mb-2 relative z-10">Calcul auto</h4>
                                        <p className="text-[9px] font-bold text-white/60 leading-relaxed mb-4 relative z-10">Les totaux sont calculés selon: <br /><strong>Qté × Prix</strong></p>
                                        <div className="flex items-center gap-2 text-[#c69f6e] relative z-10">
                                            <Calculator size={14} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Temps réel</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
                        <header className="bg-white border-b border-[#e6dace] py-3 md:py-6 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                                {!isInternalSidebarOpen && (
                                    <button
                                        onClick={() => setIsInternalSidebarOpen(true)}
                                        className="hidden md:flex p-3 bg-[#fcfaf8] hover:bg-[#4a3426] hover:text-white border border-[#e6dace] rounded-xl text-[#c69f6e] transition-all shadow-sm group relative"
                                        title="Afficher les familles"
                                    >
                                        <PanelLeftOpen size={20} />
                                        <span className="absolute left-full ml-3 px-3 py-1 bg-[#4a3426] text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[70]">Afficher les familles</span>
                                    </button>
                                )}
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#fcfaf8] border border-[#e6dace] flex items-center justify-center text-[#c69f6e] shrink-0">
                                    <ArrowLeftRight size={20} className="md:size-6" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1 md:gap-2">
                                        <h1 className="text-sm md:text-xl font-black text-[#4a3426] tracking-tight uppercase truncate">Comparatif</h1>
                                        <div className="h-1 w-1 rounded-full bg-[#e6dace]"></div>
                                        <span className="text-sm md:text-xl font-black text-[#c69f6e] tracking-tight uppercase truncate">{selectedFamille}</span>
                                    </div>
                                    <p className="text-[7px] md:text-[9px] text-[#8c8279] font-black uppercase tracking-widest mt-0.5 opacity-60 flex items-center gap-1.5">
                                        <Sparkles size={8} className="text-[#c69f6e] md:size-2.5" />
                                        Optimisez vos coûts
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !selectedFamille}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-[#4a3426] text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#4a3426]/20 disabled:opacity-50"
                                >
                                    <Sparkles size={14} className={isSaving ? 'animate-spin' : ''} />
                                    <span>{isSaving ? 'Enregistrement...' : 'Sauvegarder'}</span>
                                </button>
                                <button
                                    onClick={addRow}
                                    disabled={!selectedFamille}
                                    className="w-9 h-9 md:w-11 md:h-11 bg-white border border-[#e6dace] text-[#4a3426] rounded-xl flex items-center justify-center hover:bg-[#fcfaf8] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </header>

                        <main className="flex-1 overflow-auto p-3 md:p-8 space-y-6 md:space-y-8 bg-[#fdfbf7]/50">
                            <div className="bg-white rounded-[2.5rem] luxury-shadow border border-[#e6dace]/50 overflow-x-auto custom-scrollbar min-w-0">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#fcfaf8]/80 backdrop-blur-sm sticky top-0 z-10">
                                            <th className="px-4 md:px-6 py-4 md:py-5 text-left text-[8px] md:text-[9px] font-black text-[#bba282] uppercase tracking-[0.2em] border-b border-[#e6dace] bg-[#fcfaf8]/80 sticky left-0 z-30 min-w-[140px] md:min-w-[200px]">Désignation</th>
                                            <th className="px-4 md:px-6 py-4 md:py-5 text-center text-[8px] md:text-[9px] font-black text-[#bba282] uppercase tracking-[0.2em] border-b border-[#e6dace] w-16 md:w-24 bg-[#fcfaf8]/80 md:sticky md:left-[200px] z-20">Qté</th>
                                            <th className="px-4 md:px-6 py-4 md:py-5 text-center text-[8px] md:text-[9px] font-black text-[#bba282] uppercase tracking-[0.2em] border-b border-[#e6dace] w-16 md:w-24 bg-[#fcfaf8]/80 md:sticky md:left-[296px] z-20">Unité</th>
                                            {currentSuppliers.map((s, idx) => (
                                                <th key={s.id} className="p-0 border-b border-[#e6dace] bg-[#fcfaf8] min-w-[160px] group/header">
                                                    <div className="px-6 py-5 flex flex-col items-center relative gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="opacity-40 text-[7px] font-bold uppercase tracking-[0.2em]">Fournisseur</span>
                                                            <button
                                                                onClick={() => removeSupplierColumn(s.id)}
                                                                className="p-1 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover/header:opacity-100 transition-all"
                                                            >
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={s.name}
                                                            onChange={(e) => updateSupplierName(s.id, e.target.value.toUpperCase())}
                                                            className="bg-transparent border-none outline-none text-center text-[11px] font-black text-[#4a3426] uppercase tracking-[0.1em] focus:ring-0 w-full"
                                                        />
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="px-4 py-5 border-b border-[#e6dace] w-16 bg-[#fcfaf8]">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={addSupplierColumn}
                                                        className="w-10 h-10 rounded-2xl bg-[#c69f6e]/10 text-[#c69f6e] hover:bg-[#c69f6e] hover:text-white transition-all flex items-center justify-center border-2 border-dashed border-[#c69f6e]/30 shadow-sm"
                                                        title="Ajouter un fournisseur"
                                                    >
                                                        <Plus size={20} />
                                                    </button>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f9f6f2]">
                                        {activeRows.map((row, idx) => (
                                            <motion.tr
                                                key={row.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="group hover:bg-[#fcfaf8]/40 transition-colors"
                                            >
                                                <td className="px-4 md:px-6 py-3 md:py-4 sticky left-0 z-20 bg-white/95 backdrop-blur-sm group-hover:bg-[#fcfaf8]/95 transition-colors">
                                                    <input
                                                        type="text"
                                                        value={row.article}
                                                        onChange={(e) => updateRow(row.id, 'article', e.target.value)}
                                                        placeholder="..."
                                                        className="w-full bg-transparent border-none outline-none text-[11px] md:text-[13px] font-black text-[#4a3426] placeholder:text-[#bba282]/30 focus:ring-0"
                                                    />
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 md:sticky md:left-[200px] z-10 bg-white/95 backdrop-blur-sm group-hover:bg-[#fcfaf8]/95 transition-colors">
                                                    <input
                                                        type="number"
                                                        value={row.quantite}
                                                        step="0.1"
                                                        onChange={(e) => updateRow(row.id, 'quantite', parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-[#fcfaf8] border border-[#e6dace]/50 rounded-lg md:rounded-xl px-1 md:px-2 py-1.5 md:py-2 text-center text-[10px] md:text-xs font-black text-[#4a3426] outline-none focus:border-[#c69f6e] transition-colors"
                                                    />
                                                </td>
                                                <td className="px-4 md:px-6 py-3 md:py-4 md:sticky md:left-[296px] z-10 bg-white/95 backdrop-blur-sm group-hover:bg-[#fcfaf8]/95 transition-colors">
                                                    <div className="relative flex justify-center">
                                                        <UnitSelector
                                                            value={row.unite}
                                                            onChange={(val: string) => updateRow(row.id, 'unite', val)}
                                                        />
                                                    </div>
                                                </td>
                                                {currentSuppliers.map(s => {
                                                    const status = getPriceStatus(row, s.id);
                                                    const price = row.prices[s.id] || 0;
                                                    const lineTotal = row.quantite * price;

                                                    return (
                                                        <td key={s.id} className="px-4 md:px-6 py-3 md:py-4 text-center min-w-[130px] md:min-w-[160px]">
                                                            <div className="flex flex-col items-center gap-1 md:gap-1.5">
                                                                <div className={`relative w-24 md:w-28 rounded-lg md:rounded-xl border-2 transition-all p-0.5 ${status === 'lowest' ? 'bg-green-50/50 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.15)] animate-pulse' :
                                                                    status === 'highest' ? 'bg-red-50/50 border-red-200 ring-2 ring-red-500/10' :
                                                                        'bg-white border-[#f3eee8]'
                                                                    }`}>
                                                                    <input
                                                                        type="number"
                                                                        value={price || ''}
                                                                        onChange={(e) => updatePrice(row.id, s.id, parseFloat(e.target.value) || 0)}
                                                                        placeholder="0.000"
                                                                        className={`w-full bg-transparent border-none outline-none text-center py-1.5 md:py-2 text-xs md:text-base font-black transition-colors ${status === 'lowest' ? 'text-green-700' :
                                                                            status === 'highest' ? 'text-red-700' :
                                                                                'text-[#4a3426]'
                                                                            }`}
                                                                    />
                                                                    {status === 'lowest' && (
                                                                        <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px] md:text-[10px] border-2 border-white shadow-sm">
                                                                            <TrendingDown size={10} className="md:size-3" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className={`text-[9px] md:text-[12px] font-black uppercase tracking-tighter ${lineTotal > 0 ? 'text-[#4a3426]/80' : 'opacity-0'}`}>
                                                                    {lineTotal.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                                                                </div>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                                <td colSpan={2} className="px-4 md:px-6 py-3 md:py-4 text-right">
                                                    <button
                                                        onClick={() => removeRow(row.id)}
                                                        className="p-1.5 md:p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg md:rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={14} className="md:size-4" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                        {
                                            activeRows.length > 0 && (
                                                <tr className="border-t border-[#f9f6f2]">
                                                    <td colSpan={3} className="px-6 py-4">
                                                        <button
                                                            onClick={addRow}
                                                            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#fcfaf8] border-2 border-dashed border-[#e6dace] text-[#bba282] hover:border-[#4a3426] hover:text-[#4a3426] hover:bg-white transition-all group w-full sm:w-auto"
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-white border border-[#e6dace] flex items-center justify-center group-hover:bg-[#4a3426] group-hover:text-white group-hover:border-[#4a3426] transition-all">
                                                                <Plus size={16} />
                                                            </div>
                                                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">Ajouter un article</span>
                                                        </button>
                                                    </td>
                                                    <td colSpan={currentSuppliers.length + 2}></td>
                                                </tr>
                                            )
                                        }
                                        {
                                            activeRows.length === 0 && (
                                                <tr>
                                                    <td colSpan={currentSuppliers.length + 5} className="py-12 md:py-20 text-center">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#fcfaf8] border border-dashed border-[#e6dace] flex items-center justify-center text-[#bba282]">
                                                                <LayoutGrid size={24} />
                                                            </div>
                                                            <p className="text-[10px] md:text-xs font-bold text-[#8c8279] uppercase tracking-widest px-4">Aucun article dans cette famille</p>
                                                            <button onClick={addRow} className="text-[9px] md:text-[10px] font-black text-[#c69f6e] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Ajouter le premier article</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-[#4a3426] relative z-20">
                                            <td colSpan={3} className="px-4 md:px-8 py-6 md:py-8 text-right border-r border-white/5 sticky left-0 z-30 bg-[#4a3426]">
                                                <div>
                                                    <div className="text-[10px] md:text-[13px] font-black text-white uppercase tracking-[0.2em] md:tracking-[0.4em]">Total</div>
                                                    <p className="hidden md:block text-[8px] font-bold text-[#c69f6e] uppercase tracking-widest mt-1">Comparatif Qté × Prix</p>
                                                </div>
                                            </td>
                                            {currentSuppliers.map(s => {
                                                const total = calculateTotalForSupplier(s.id);
                                                return (
                                                    <td key={s.id} className="px-4 md:px-6 py-6 md:py-8 text-center bg-black/10 border-r border-white/5 last:border-r-0 min-w-[130px] md:min-w-[160px]">
                                                        <div className="flex flex-col items-center gap-0.5 md:gap-1">
                                                            <div className="text-[8px] md:text-[10px] font-black text-[#c69f6e] uppercase tracking-[0.1em] md:tracking-[0.2em] mb-0.5 md:mb-1 truncate w-full px-1">{s.name}</div>
                                                            <div className="text-sm md:text-3xl font-black text-white tracking-tighter leading-none">
                                                                {total.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                                                            </div>
                                                            <div className="text-[6px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">DT</div>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            <td colSpan={2}></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Best Offer Section Restored */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-20">
                                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border border-[#e6dace]/50 shadow-sm">
                                    <h3 className="text-[11px] md:text-sm font-black text-[#4a3426] uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                                        <TrendingDown className="text-green-500" size={16} />
                                        Meilleure offre
                                    </h3>
                                    {(() => {
                                        const supplierTotals = currentSuppliers.map(s => ({ name: s.name, total: calculateTotalForSupplier(s.id) }));
                                        const best = supplierTotals.filter(t => t.total > 0).sort((a, b) => a.total - b.total)[0];

                                        if (!best) return <p className="text-[9px] md:text-xs font-bold text-[#8c8279] italic">Saisissez des prix</p>;

                                        return (
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-6 bg-green-50 rounded-xl md:rounded-2xl border border-green-100">
                                                <div className="flex flex-col items-center sm:items-start">
                                                    <span className="text-[8px] md:text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">{best.name}</span>
                                                    <span className="text-2xl md:text-4xl font-black text-[#4a3426] tracking-tighter">{best.total.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT</span>
                                                </div>
                                                <div className="flex flex-col items-center sm:items-end">
                                                    <div className="px-3 py-1 bg-green-500 text-white text-[8px] md:text-[9px] font-black uppercase rounded-lg shadow-lg shadow-green-500/20 mb-1 md:mb-2">Recommandé</div>
                                                    <span className="text-[8px] md:text-[10px] font-bold text-green-600/60 uppercase tracking-widest">Économie max</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}

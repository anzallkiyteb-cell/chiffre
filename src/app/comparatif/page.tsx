'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
    Calendar, ChevronLeft,
    ArrowLeftRight, Plus, X,
    ChevronDown, Trash2, Calculator, Info,
    FileSpreadsheet, Sparkles, TrendingDown,
    Download, LayoutGrid, ChevronRight,
    Search, RotateCcw, MoreHorizontal, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';

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

interface PriceEntry {
    value: number;
    date: string; // dd/mm/yyyy
}

interface ComparisonRow {
    id: string;
    article: string;
    quantite: number;
    unite: string;
    prices: Record<string, number | PriceEntry>; // supplier_id -> price (backward compatible)
}

// Helper functions for backward-compatible price access
const getPriceValue = (entry: number | PriceEntry | undefined | null): number => {
    if (entry === undefined || entry === null) return 0;
    if (typeof entry === 'number') return entry;
    return entry.value || 0;
};

const getPriceDate = (entry: number | PriceEntry | undefined | null): string => {
    if (entry === undefined || entry === null) return '';
    if (typeof entry === 'number') return '';
    return entry.date || '';
};

const getTodayString = (): string => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

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

const formatDateToDisplay = (dateStr: string) => {
    if (!dateStr) return 'JJ/MM/AAAA';
    if (dateStr.includes('/')) return dateStr; // Already in dd/mm/yyyy
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
};

const PremiumDatePicker = ({ value, onChange, align = 'left' }: { value: string, onChange: (val: string) => void, align?: 'left' | 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Convert dd/mm/yyyy to yyyy-mm-dd for internal logic
    const internalValue = useMemo(() => {
        if (!value) return '';
        if (value.includes('/')) return value.split('/').reverse().join('-');
        return value;
    }, [value]);

    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        if (isOpen && internalValue) {
            setViewDate(new Date(internalValue));
        } else if (isOpen) {
            setViewDate(new Date());
        }
    }, [isOpen, internalValue]);

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const days = [];

        const offset = firstDay === 0 ? 6 : firstDay - 1;
        for (let i = 0; i < offset; i++) days.push(null);

        const lastDay = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= lastDay; i++) days.push(new Date(year, month, i));

        return days;
    }, [viewDate]);

    const getMenuStyles = () => {
        if (!triggerRef.current) return {};
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const showAbove = spaceBelow < 320;

        const styles: React.CSSProperties = {
            position: 'fixed',
            zIndex: 9999
        };

        if (showAbove) {
            styles.bottom = window.innerHeight - rect.top + 8;
        } else {
            styles.top = rect.bottom + 8;
        }

        if (align === 'right') {
            styles.right = window.innerWidth - rect.right;
        } else {
            styles.left = rect.left;
        }

        return styles;
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-all min-w-[100px] border ${isOpen
                        ? 'bg-[#4a3426] text-white border-[#4a3426] shadow-md'
                        : 'bg-[#fcfaf8] text-[#4a3426] border-[#e6dace] hover:border-[#c69f6e]'
                    }`}
            >
                <Calendar size={12} className={isOpen ? 'text-white/70' : 'text-[#c69f6e]'} />
                <span className={`text-[10px] font-black tracking-tight ${isOpen ? 'text-white' : 'text-[#4a3426]'}`}>
                    {formatDateToDisplay(value)}
                </span>
            </button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9998] pointer-events-none">
                            <div className="fixed inset-0 pointer-events-auto bg-black/5 backdrop-blur-[1px]" onClick={() => setIsOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                style={getMenuStyles()}
                                className="pointer-events-auto bg-white rounded-3xl shadow-[0_25px_70px_rgba(74,52,38,0.3)] border border-[#e6dace] p-5 w-72"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}
                                        className="p-1.5 hover:bg-[#fcfaf8] rounded-xl text-[#8c8279]"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="text-xs font-black text-[#4a3426] uppercase tracking-widest">
                                        {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}
                                        className="p-1.5 hover:bg-[#fcfaf8] rounded-xl text-[#8c8279]"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                        <div key={i} className="text-[9px] font-bold text-[#c69f6e] text-center">{d}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {daysInMonth.map((day, i) => {
                                        if (!day) return <div key={`empty-${i}`} />;

                                        const y = day.getFullYear();
                                        const m = String(day.getMonth() + 1).padStart(2, '0');
                                        const d = String(day.getDate()).padStart(2, '0');
                                        const dStr = `${d}/${m}/${y}`;

                                        const isSelected = value === dStr;
                                        const now = new Date();
                                        const isToday = now.getFullYear() === day.getFullYear() &&
                                            now.getMonth() === day.getMonth() &&
                                            now.getDate() === day.getDate();

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    onChange(dStr);
                                                    setIsOpen(false);
                                                }}
                                                className={`
                                                    h-8 w-8 rounded-lg text-[10px] font-black transition-all flex items-center justify-center
                                                    ${isSelected
                                                        ? 'bg-[#c69f6e] text-white shadow-lg shadow-[#c69f6e]/30'
                                                        : 'text-[#4a3426] hover:bg-[#fcfaf8] border border-transparent hover:border-[#e6dace]'
                                                    }
                                                    ${isToday && !isSelected ? 'text-[#c69f6e] !border-[#c69f6e]/30' : ''}
                                                `}
                                            >
                                                {day.getDate()}
                                            </button>
                                        );
                                    })}
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

const FamilySelector = ({
    families,
    selected,
    onSelect,
    onAdd,
    onDelete
}: {
    families: ArticleFamily[],
    selected: string,
    onSelect: (name: string) => void,
    onAdd: () => void,
    onDelete: (id: number, name: string) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const selectedFamily = families.find(f => f.name === selected);

    const getMenuStyles = () => {
        if (!triggerRef.current) return {};
        const rect = triggerRef.current.getBoundingClientRect();
        return {
            position: 'fixed' as const,
            top: rect.bottom + 8,
            left: rect.left,
            width: '280px',
            zIndex: 9999
        };
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 border border-[#e6dace] ${isOpen
                    ? 'bg-[#4a3426] text-white shadow-xl shadow-[#4a3426]/20'
                    : 'bg-[#fcfaf8] text-[#4a3426] hover:bg-white'
                    }`}
            >
                <div className="flex flex-col items-start text-left">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Famille sélectionnée</span>
                    <span className="text-sm font-black uppercase tracking-tight">{selectedFamily?.name || 'Sélectionner'}</span>
                </div>
                <ChevronDown size={18} className={`ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {mounted && createPortal(
                <AnimatePresence mode="wait">
                    {isOpen && (
                        <div key="family-selector-portal">
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
                                className="bg-white rounded-2xl shadow-[0_25px_70px_rgba(74,52,38,0.2)] border border-[#e6dace] overflow-hidden p-2 flex flex-col gap-1 max-h-[60vh]"
                            >
                                <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
                                    {families.map((f) => (
                                        <div key={f.id} className="group relative">
                                            <button
                                                onClick={() => {
                                                    onSelect(f.name);
                                                    setIsOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${selected === f.name
                                                    ? 'bg-[#4a3426] text-white shadow-md'
                                                    : 'text-[#8c8279] hover:bg-[#fcfaf8] hover:text-[#4a3426]'
                                                    }`}
                                            >
                                                <span className="text-xs font-black uppercase tracking-tight text-left truncate pr-8">{f.name}</span>
                                                {selected === f.name && <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(f.id, f.name);
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 border-t border-[#f9f6f2] mt-1">
                                    <button
                                        onClick={() => {
                                            onAdd();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#c69f6e]/10 text-[#c69f6e] hover:bg-[#c69f6e] hover:text-white transition-all group border border-dashed border-[#c69f6e]/30"
                                    >
                                        <Plus size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Nouvelle famille</span>
                                    </button>
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
        const today = getTodayString();
        setRowsByFamily(prev => ({
            ...prev,
            [selectedFamille]: (prev[selectedFamille] || []).map(r => {
                if (r.id === rowId) {
                    const existingDate = getPriceDate(r.prices[supplierId]);
                    return { ...r, prices: { ...r.prices, [supplierId]: { value: price, date: existingDate || today } } };
                }
                return r;
            })
        }));
    };

    const updatePriceDate = (rowId: string, supplierId: string, date: string) => {
        setRowsByFamily(prev => ({
            ...prev,
            [selectedFamille]: (prev[selectedFamille] || []).map(r => {
                if (r.id === rowId) {
                    const existingValue = getPriceValue(r.prices[supplierId]);
                    return { ...r, prices: { ...r.prices, [supplierId]: { value: existingValue, date } } };
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

    const handleGeneratePDF = () => {
        if (!selectedFamille) return;

        const doc = new jsPDF();
        const today = getTodayString();

        // Group best offers by supplier
        const itemsBySupplier: Record<string, any[]> = {};

        activeRows.forEach(row => {
            const supplierPrices = currentSuppliers
                .map(s => ({
                    id: s.id,
                    name: s.name,
                    price: getPriceValue(row.prices[s.id])
                }))
                .filter(sp => sp.price > 0);

            if (supplierPrices.length >= 2) {
                const best = supplierPrices.reduce((min, sp) => sp.price < min.price ? sp : min);
                if (!itemsBySupplier[best.name]) {
                    itemsBySupplier[best.name] = [];
                }
                itemsBySupplier[best.name].push({
                    article: row.article,
                    quantite: row.quantite,
                    unite: row.unite,
                    price: best.price,
                    total: row.quantite * best.price
                });
            }
        });

        const suppliersWithItems = Object.keys(itemsBySupplier);
        if (suppliersWithItems.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Aucune commande',
                text: 'Saisissez au moins 2 prix par article pour comparer.',
                confirmButtonColor: '#4a3426'
            });
            return;
        }

        suppliersWithItems.forEach((supplierName, index) => {
            if (index > 0) doc.addPage();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(74, 52, 38); // #4a3426
            doc.text(supplierName, 20, 30);

            doc.setFontSize(12);
            doc.setTextColor(140, 130, 121); // #8c8279
            doc.text(`Famille: ${selectedFamille}`, 20, 40);
            doc.text(`Date: ${today}`, 20, 47);

            doc.setDrawColor(230, 218, 206); // #e6dace
            doc.line(20, 55, 190, 55);

            // Table Header
            doc.setFontSize(10);
            doc.setTextColor(187, 162, 130); // #bba282
            doc.text('ARTICLE', 20, 65);
            doc.text('QTE', 100, 65, { align: 'center' });
            doc.text('UNITE', 120, 65, { align: 'center' });
            doc.text('PRIX U.', 150, 65, { align: 'right' });
            doc.text('TOTAL', 185, 65, { align: 'right' });

            doc.line(20, 68, 190, 68);

            // Table Rows
            let y = 75;
            let supplierTotal = 0;

            doc.setTextColor(74, 52, 38);
            itemsBySupplier[supplierName].forEach(item => {
                // Handle text wrapping for article name if needed
                const articleLines = doc.splitTextToSize(item.article || '-', 70);
                doc.text(articleLines, 20, y);

                doc.text(item.quantite.toString(), 100, y, { align: 'center' });
                doc.text(item.unite.toUpperCase(), 120, y, { align: 'center' });
                doc.text(item.price.toLocaleString('fr-FR', { minimumFractionDigits: 3 }), 150, y, { align: 'right' });
                doc.text(item.total.toLocaleString('fr-FR', { minimumFractionDigits: 3 }), 185, y, { align: 'right' });

                supplierTotal += item.total;
                y += (articleLines.length * 7) + 3;

                if (y > 270) {
                    doc.addPage();
                    y = 30;
                }
            });

            // Footer
            doc.line(20, y, 190, y);
            doc.setFontSize(14);
            doc.text('TOTAL COMMANDE:', 140, y + 15, { align: 'right' });
            doc.setFontSize(18);
            doc.text(`${supplierTotal.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT`, 185, y + 15, { align: 'right' });
        });

        doc.save(`Commande_${selectedFamille}_${today.replace(/\//g, '-')}.pdf`);
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
        const prices = Object.values(row.prices).map(getPriceValue).filter(p => p > 0);
        if (prices.length < 2) return 'normal';
        const currentPrice = getPriceValue(row.prices[supplierId]);
        if (!currentPrice) return 'normal';

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        if (currentPrice === min) return 'lowest';
        if (currentPrice === max) return 'highest';
        return 'normal';
    };

    const calculateTotalForSupplier = (supplierId: string) => {
        return activeRows.reduce((sum, row) => {
            const price = getPriceValue(row.prices[supplierId]);
            return sum + (row.quantite * price);
        }, 0);
    };

    if (initializing || !user) return null;

    return (
        <div className="flex min-h-screen bg-[#fdfbf7]">
            <Sidebar role={user.role} />

            <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
                <header className="bg-white border-b border-[#e6dace] py-3 md:py-4 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 transition-all z-40">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <FamilySelector
                            families={dbFamilies}
                            selected={selectedFamille}
                            onSelect={setSelectedFamille}
                            onAdd={handleAddFamily}
                            onDelete={handleDeleteFamily}
                        />
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-end">
                        <button
                            onClick={handleGeneratePDF}
                            disabled={!selectedFamille}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
                        >
                            <Download size={14} />
                            <span>Passer Commande</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !selectedFamille}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#4a3426] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#4a3426]/20 disabled:opacity-50"
                        >
                            <Sparkles size={14} className={isSaving ? 'animate-spin' : ''} />
                            <span>{isSaving ? 'Enregistrement...' : 'Sauvegarder'}</span>
                        </button>
                        <button
                            onClick={addRow}
                            disabled={!selectedFamille}
                            className="w-10 h-10 bg-white border border-[#e6dace] text-[#4a3426] rounded-xl flex items-center justify-center hover:bg-[#fcfaf8] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            title="Ajouter un article"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-3 md:p-6 space-y-6 md:space-y-8 bg-[#fdfbf7]/50">
                    <div className="bg-white rounded-[2.5rem] luxury-shadow border border-[#e6dace]/50 overflow-x-auto custom-scrollbar min-w-0">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#fcfaf8]/80 backdrop-blur-sm sticky top-0 z-10">
                                    <th className="px-3 py-4 text-left text-[10px] md:text-[11px] font-black text-[#bba282] uppercase tracking-[0.2em] border-b border-[#e6dace] bg-[#fcfaf8]/80 sticky left-0 z-30 min-w-[120px] md:min-w-[180px]">Désignation</th>
                                    <th className="px-1 py-4 text-center text-[10px] md:text-[11px] font-black text-[#bba282] uppercase tracking-[0.2em] border-b border-[#e6dace] w-12 md:w-16 bg-[#fcfaf8]/80 sticky left-[120px] md:left-[180px] z-20">Qté</th>
                                    <th className="px-1 py-4 text-center text-[10px] md:text-[11px] font-black text-[#bba282] uppercase tracking-[0.2em] border-b border-[#e6dace] w-12 md:w-16 bg-[#fcfaf8]/80 sticky left-[168px] md:left-[244px] z-20">Unité</th>
                                    {currentSuppliers.map((s, idx) => (
                                        <th key={s.id} className="p-0 border-b border-[#e6dace] bg-[#fcfaf8] min-w-[110px] md:min-w-[120px] group/header">
                                            <div className="px-1 py-2 flex flex-col items-center relative gap-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="opacity-50 text-[7px] font-black uppercase tracking-[0.2em] truncate max-w-[90px]">Fournisseur</span>
                                                    <button
                                                        onClick={() => removeSupplierColumn(s.id)}
                                                        className="p-0.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover/header:opacity-100 transition-all"
                                                    >
                                                        <Trash2 size={8} />
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={s.name}
                                                    onChange={(e) => updateSupplierName(s.id, e.target.value.toUpperCase())}
                                                    className="bg-transparent border-none outline-none text-center text-[10px] md:text-[11px] font-black text-[#4a3426] uppercase tracking-[0.1em] focus:ring-0 w-full p-0"
                                                />
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-2 py-3 border-b border-[#e6dace] w-10 bg-[#fcfaf8]">
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={addSupplierColumn}
                                                className="w-6 h-6 rounded-lg bg-[#c69f6e]/10 text-[#c69f6e] hover:bg-[#c69f6e] hover:text-white transition-all flex items-center justify-center border border-dashed border-[#c69f6e]/30 shadow-sm"
                                                title="Ajouter un fournisseur"
                                            >
                                                <Plus size={14} />
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
                                        <td className="px-3 py-2 sticky left-0 z-20 bg-white/95 backdrop-blur-sm group-hover:bg-[#fcfaf8]/95 transition-colors border-r border-transparent group-hover:border-[#e6dace]/20">
                                            <input
                                                type="text"
                                                value={row.article}
                                                onChange={(e) => updateRow(row.id, 'article', e.target.value)}
                                                placeholder="..."
                                                className="w-full bg-transparent border-none outline-none text-[11px] md:text-[12px] font-black text-[#4a3426] placeholder:text-[#bba282]/30 focus:ring-0 p-0"
                                            />
                                        </td>
                                        <td className="px-1 py-2 sticky left-[120px] md:left-[180px] z-10 bg-white/95 backdrop-blur-sm group-hover:bg-[#fcfaf8]/95 transition-colors text-center border-r border-transparent group-hover:border-[#e6dace]/20">
                                            <input
                                                type="number"
                                                value={row.quantite}
                                                step="0.1"
                                                onChange={(e) => updateRow(row.id, 'quantite', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-[#fcfaf8] border border-[#e6dace]/50 rounded-md px-1 py-1 text-center text-[10px] md:text-[11px] font-black text-[#4a3426] outline-none focus:border-[#c69f6e] transition-colors p-0"
                                            />
                                        </td>
                                        <td className="px-1 py-2 sticky left-[168px] md:left-[244px] z-10 bg-white/95 backdrop-blur-sm group-hover:bg-[#fcfaf8]/95 transition-colors text-center border-r border-[#e6dace]/40 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.02)]">
                                            <div className="relative flex justify-center scale-90 origin-center">
                                                <UnitSelector
                                                    value={row.unite}
                                                    onChange={(val: string) => updateRow(row.id, 'unite', val)}
                                                />
                                            </div>
                                        </td>
                                        {currentSuppliers.map(s => {
                                            const status = getPriceStatus(row, s.id);
                                            const price = getPriceValue(row.prices[s.id]);
                                            const dateStr = getPriceDate(row.prices[s.id]);
                                            const lineTotal = row.quantite * price;

                                            return (
                                                <td key={s.id} className="px-1 py-2 text-center min-w-[110px] md:min-w-[120px]">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <div className={`relative w-20 md:w-24 rounded-lg border transition-all p-0.5 ${status === 'lowest' ? 'bg-green-50/50 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.15)]' :
                                                            status === 'highest' ? 'bg-red-50/50 border-red-200 ring-1 ring-red-500/10' :
                                                                'bg-white border-[#f3eee8]'
                                                            }`}>
                                                            <input
                                                                type="number"
                                                                value={price || ''}
                                                                onChange={(e) => updatePrice(row.id, s.id, parseFloat(e.target.value) || 0)}
                                                                placeholder="0.000"
                                                                className={`w-full bg-transparent border-none outline-none text-center py-1 text-[10px] md:text-[11px] font-black transition-colors ${status === 'lowest' ? 'text-green-700' :
                                                                    status === 'highest' ? 'text-red-700' :
                                                                        'text-[#4a3426]'
                                                                    }`}
                                                            />
                                                            {status === 'lowest' && (
                                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-[6px] border border-white shadow-sm">
                                                                    <TrendingDown size={6} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <PremiumDatePicker
                                                            value={dateStr}
                                                            onChange={(newDate) => updatePriceDate(row.id, s.id, newDate)}
                                                            align={s === currentSuppliers[currentSuppliers.length - 1] ? 'right' : 'left'}
                                                        />
                                                        <div className={`text-[9px] font-black uppercase tracking-tighter ${lineTotal > 0 ? 'text-[#4a3426]/60' : 'opacity-0'}`}>
                                                            {lineTotal.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
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

                    {/* Best Offer Section - Per Article Summary */}
                    <div className="pb-20">
                        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border border-[#e6dace]/50 shadow-sm">
                            <h3 className="text-[11px] md:text-sm font-black text-[#4a3426] uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                                <TrendingDown className="text-green-500" size={16} />
                                Meilleure offre par article
                            </h3>
                            {(() => {
                                const bestPrices = activeRows.map(row => {
                                    const supplierPrices = currentSuppliers
                                        .map(s => ({
                                            supplier: s,
                                            price: getPriceValue(row.prices[s.id]),
                                            date: getPriceDate(row.prices[s.id])
                                        }))
                                        .filter(sp => sp.price > 0);

                                    if (supplierPrices.length < 2) return null;

                                    const best = supplierPrices.reduce((min, sp) => sp.price < min.price ? sp : min);
                                    return {
                                        article: row.article,
                                        quantite: row.quantite,
                                        unite: row.unite,
                                        supplierName: best.supplier.name,
                                        price: best.price,
                                        date: best.date,
                                        lineTotal: row.quantite * best.price
                                    };
                                }).filter(Boolean) as { article: string; quantite: number; unite: string; supplierName: string; price: number; date: string; lineTotal: number }[];

                                if (bestPrices.length === 0) return <p className="text-[9px] md:text-xs font-bold text-[#8c8279] italic">Saisissez des prix pour au moins 2 fournisseurs</p>;

                                const grandTotal = bestPrices.reduce((s, bp) => s + bp.lineTotal, 0);

                                return (
                                    <div className="space-y-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-[8px] md:text-[9px] font-black text-[#bba282] uppercase tracking-widest">
                                                        <th className="text-left pb-2 pr-3">Article</th>
                                                        <th className="text-center pb-2 px-2">Qté</th>
                                                        <th className="text-center pb-2 px-2">Unité</th>
                                                        <th className="text-center pb-2 px-2">Fournisseur</th>
                                                        <th className="text-right pb-2 px-2">Prix U.</th>
                                                        <th className="text-right pb-2 pl-2">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#f9f6f2]">
                                                    {bestPrices.map((bp, i) => (
                                                        <tr key={i} className="text-[10px] md:text-xs text-[#4a3426]">
                                                            <td className="py-2.5 pr-3 font-bold">{bp.article || '-'}</td>
                                                            <td className="py-2.5 px-2 text-center">{bp.quantite}</td>
                                                            <td className="py-2.5 px-2 text-center uppercase text-[9px]">{bp.unite}</td>
                                                            <td className="py-2.5 px-2 text-center">
                                                                <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-[9px] font-black border border-green-100">
                                                                    {bp.supplierName}
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 px-2 text-right font-black">{bp.price.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}</td>
                                                            <td className="py-2.5 pl-2 text-right font-black">{bp.lineTotal.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="border-t-2 border-[#4a3426]">
                                                        <td colSpan={5} className="pt-3 pb-1 text-right font-black text-[#4a3426] uppercase tracking-widest text-[9px] md:text-[10px]">Total optimal</td>
                                                        <td className="pt-3 pb-1 text-right font-black text-green-700 text-sm md:text-lg pl-2">{grandTotal.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

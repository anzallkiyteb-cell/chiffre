'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
    LayoutDashboard, TrendingDown, TrendingUp, Calendar, ChevronLeft, ChevronRight,
    BarChart3, LineChart, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight,
    Download, Filter, DownloadCloud, Loader2, Users, Receipt, CreditCard,
    Banknote, Coins, Plus, Search, Trash2, FileText, UploadCloud, ChevronDown, Check,
    LogOut, ZoomIn, ZoomOut, Maximize2, RotateCcw, LockIcon, UnlockIcon, X, PlusCircle, AlertCircle,
    Wallet, Eye, EyeOff, ChevronsRight, Upload, SlidersHorizontal, ArrowUpDown, Lock, Unlock, Settings,
    Briefcase, User, MessageSquare, Share2, ExternalLink, List, Pencil, Save, Calculator, Zap, Sparkles, Clock, Tag,
    Camera, Image as ImageIcon, LayoutGrid
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const formatDisplayTime = (dateValue: any) => {
    if (!dateValue) return null;
    try {
        const d = new Date(typeof dateValue === 'string' && !isNaN(Number(dateValue)) ? Number(dateValue) : (typeof dateValue === 'string' ? dateValue.replace(' ', 'T') : dateValue));
        if (isNaN(d.getTime())) return null;
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return null;
    }
};

const formatDisplayDate = (dateValue: any) => {
    if (!dateValue) return null;
    try {
        const d = new Date(typeof dateValue === 'string' && !isNaN(Number(dateValue)) ? Number(dateValue) : (typeof dateValue === 'string' ? dateValue.replace(' ', 'T') : dateValue));
        if (isNaN(d.getTime())) return String(dateValue);
        return d.toLocaleDateString('fr-FR');
    } catch (e) {
        return String(dateValue);
    }
};

const GET_CHIFFRES_RANGE = gql`
  query GetChiffresRange($startDate: String!, $endDate: String!) {
    getChiffresByRange(startDate: $startDate, endDate: $endDate) {
        id
        date
        avances_details { id username montant date created_at }
        doublages_details { id username montant date created_at }
        extras_details { id username montant date created_at }
        primes_details { id username montant date created_at }
        diponce
        diponce_divers
        diponce_admin
        restes_salaires_details { id username montant nb_jours date created_at }
    }
  }
`;

const GET_CHIFFRE = gql`
  query GetChiffre($date: String!) {
    getChiffreByDate(date: $date) {
        id
        date
        recette_de_caisse
        total_diponce
        diponce
        recette_net
        tpe
        tpe2
        cheque_bancaire
        espaces
        tickets_restaurant
        extra
        primes
        avances_details { id username montant created_at }
        doublages_details { id username montant created_at }
        extras_details { id username montant created_at }
        primes_details { id username montant created_at }
        restes_salaires_details { id username montant nb_jours created_at }
        diponce_divers
        diponce_admin
        offres
        offres_data
        caisse_photo
        is_locked
    }
}
`;

const UNLOCK_CHIFFRE = gql`
  mutation UnlockChiffre($date: String!) {
    unlockChiffre(date: $date) {
        id
        is_locked
    }
}
`;

const GET_SUPPLIERS = gql`
    query GetSuppliers {
        getSuppliers {
            id
            name
        }
    }
`;

const GET_DESIGNATIONS = gql`
    query GetDesignations {
        getDesignations {
            id
            name
        }
    }
`;

const UPSERT_DESIGNATION = gql`
    mutation UpsertDesignation($name: String!) {
        upsertDesignation(name: $name) {
            id
            name
        }
    }
`;

const SAVE_CHIFFRE = gql`
  mutation SaveChiffre(
    $date: String!
    $recette_de_caisse: String!
    $total_diponce: String!
    $diponce: String!
    $recette_net: String!
    $tpe: String!
    $tpe2: String
    $cheque_bancaire: String!
    $espaces: String!
    $tickets_restaurant: String!
    $extra: String!
    $primes: String!
    $diponce_divers: String!
    $diponce_admin: String!
    $offres: String
    $offres_data: String
    $caisse_photo: String
    $payer: String
) {
    saveChiffre(
        date: $date
      recette_de_caisse: $recette_de_caisse
      total_diponce: $total_diponce
      diponce: $diponce
      recette_net: $recette_net
      tpe: $tpe
      tpe2: $tpe2
      cheque_bancaire: $cheque_bancaire
      espaces: $espaces
      tickets_restaurant: $tickets_restaurant
      extra: $extra
      primes: $primes
      diponce_divers: $diponce_divers
      diponce_admin: $diponce_admin
      offres: $offres
      offres_data: $offres_data
      caisse_photo: $caisse_photo
      payer: $payer
    ) {
        id
    }
}
`;

const UPSERT_SUPPLIER = gql`
  mutation UpsertSupplier($name: String!) {
    upsertSupplier(name: $name) {
        id
        name
    }
}
`;

const UNPAY_INVOICE = gql`
  mutation UnpayInvoice($id: Int!) {
    unpayInvoice(id: $id) {
      id
      status
    }
  }
`;

const GET_EMPLOYEES = gql`
  query GetEmployees {
    getEmployees {
      id
      name
      department
    }
  }
`;

const UPSERT_EMPLOYEE = gql`
  mutation UpsertEmployee($name: String!, $department: String) {
    upsertEmployee(name: $name, department: $department) {
      id
      name
      department
    }
  }
`;

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: Int!, $name: String!, $department: String) {
    updateEmployee(id: $id, name: $name, department: $department) { id name department }
  }
`;

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: Int!) {
    deleteEmployee(id: $id)
  }
`;

const ADD_AVANCE = gql`
  mutation AddAvance($username: String!, $amount: Float!, $date: String!) {
    addAvance(username: $username, amount: $amount, date: $date) { id username montant }
  }
`;
const DELETE_AVANCE = gql`
  mutation DeleteAvance($id: Int!) { deleteAvance(id: $id) }
`;

const ADD_DOUBLAGE = gql`
  mutation AddDoublage($username: String!, $amount: Float!, $date: String!) {
    addDoublage(username: $username, amount: $amount, date: $date) { id username montant }
  }
`;
const DELETE_DOUBLAGE = gql`
  mutation DeleteDoublage($id: Int!) { deleteDoublage(id: $id) }
`;

const ADD_EXTRA = gql`
  mutation AddExtra($username: String!, $amount: Float!, $date: String!) {
    addExtra(username: $username, amount: $amount, date: $date) { id username montant }
  }
`;
const DELETE_EXTRA = gql`
  mutation DeleteExtra($id: Int!) { deleteExtra(id: $id) }
`;

const ADD_PRIME = gql`
  mutation AddPrime($username: String!, $amount: Float!, $date: String!) {
    addPrime(username: $username, amount: $amount, date: $date) { id username montant }
  }
`;
const DELETE_PRIME = gql`
  mutation DeletePrime($id: Int!) { deletePrime(id: $id) }
`;

const ADD_RESTES_SALAIRES = gql`
  mutation AddRestesSalaires($username: String!, $amount: Float!, $nb_jours: Float, $date: String!) {
    addRestesSalaires(username: $username, amount: $amount, nb_jours: $nb_jours, date: $date) { id username montant nb_jours }
  }
`;
const DELETE_RESTES_SALAIRES = gql`
  mutation DeleteRestesSalaires($id: Int!) { deleteRestesSalaires(id: $id) }
`;

const EntryModal = ({ isOpen, onClose, onSubmit, type, employees = [], initialData = null }: any) => {
    const [search, setSearch] = useState('');
    const [amount, setAmount] = useState('');
    const [nbJours, setNbJours] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setSearch(initialData.username);
                setAmount(initialData.montant);
                setNbJours(initialData.nb_jours || '');
            } else {
                setSearch('');
                setAmount('');
                setNbJours('');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const filteredEmployees = employees.filter((e: any) =>
        e.name.toLowerCase().includes(search.toLowerCase())
    );

    const titleMap: any = {
        avance: initialData ? 'Mettre à jour Accompte' : 'Ajouter Accompte',
        doublage: initialData ? 'Mettre à jour Doublage' : 'Ajouter Doublage',
        extra: initialData ? 'Mettre à jour Extra' : 'Ajouter Extra',
        prime: initialData ? 'Mettre à jour Prime' : 'Ajouter Prime',
        restes_salaires: initialData ? 'Mettre à jour Reste Salaire' : 'Ajouter Reste Salaire',
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#e6dace]"
                >
                    <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-[#4a3426] uppercase tracking-tighter">{titleMap[type]}</h3>
                            <button onClick={onClose} className="p-2 hover:bg-[#f9f6f2] rounded-xl transition-colors text-[#bba282]"><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="text-[10px] font-black text-[#bba282] uppercase tracking-[0.2em] mb-2 block ml-1">Employé</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bba282]"><User size={18} /></div>
                                    <input
                                        type="text"
                                        placeholder="Rechercher un employé..."
                                        value={search ?? ''}
                                        onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                                        onFocus={() => setShowDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                        className="w-full h-14 bg-[#fcfaf8] border border-[#e6dace] rounded-2xl pl-12 pr-4 font-bold text-[#4a3426] focus:border-[#c69f6e] outline-none transition-all"
                                    />
                                    {showDropdown && search && filteredEmployees.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-[#e6dace] max-h-48 overflow-y-auto z-[410] custom-scrollbar">
                                            {filteredEmployees.map((emp: any) => (
                                                <button
                                                    key={emp.id}
                                                    onClick={() => { setSearch(emp.name); setShowDropdown(false); }}
                                                    className="w-full text-left px-5 py-3 hover:bg-[#fcfaf8] font-bold text-[#4a3426] border-b border-[#f9f6f2] last:border-0 transition-colors"
                                                >
                                                    {emp.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <label className="text-[10px] font-black text-[#bba282] uppercase tracking-[0.2em] mb-2 block ml-1">Montant (DT)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bba282] font-black">DT</div>
                                    <input
                                        type="number"
                                        placeholder="0.000"
                                        step="0.001"
                                        value={amount ?? ''}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        onFocus={(e) => { if (amount === '0') setAmount(''); }}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full h-16 bg-[#fcfaf8] border border-[#e6dace] rounded-2xl pl-14 pr-4 font-black text-3xl text-[#4a3426] focus:border-[#c69f6e] outline-none transition-all min-w-[220px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {type === 'restes_salaires' && (
                            <div className="relative">
                                <label className="text-[10px] font-black text-[#bba282] uppercase tracking-[0.2em] mb-2 block ml-1">Nombre de jours</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bba282] font-black"><Calendar size={20} /></div>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        step="0.5"
                                        value={nbJours ?? ''}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        onFocus={(e) => { if (nbJours === '0') setNbJours(''); }}
                                        onChange={(e) => setNbJours(e.target.value)}
                                        className="w-full h-14 bg-[#fcfaf8] border border-[#e6dace] rounded-2xl pl-12 pr-4 font-black text-2xl text-[#4a3426] focus:border-[#c69f6e] outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            disabled={!search || !amount || parseFloat(amount) <= 0 || !employees.some((e: any) => e.name === search)}
                            onClick={() => {
                                onSubmit(type, search, amount, nbJours, initialData?.id);
                                onClose();
                            }}
                            className="w-full h-14 bg-[#4a3426] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-[#4a3426]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:grayscale disabled:scale-100"
                        >
                            Valider l'entrée
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

interface ChiffrePageProps {
    role: 'admin' | 'caissier';
    onLogout: () => void;
}

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, color = 'brown', alert = false }: any) => {
    if (!isOpen) return null;
    const colors: { [key: string]: string } = {
        brown: 'bg-[#4a3426] hover:bg-[#38261b]',
        red: 'bg-red-500 hover:bg-red-600',
        green: 'bg-[#2d6a4f] hover:bg-[#1b4332]'
    };
    const backdropColors: { [key: string]: string } = {
        brown: 'bg-black/40',
        red: 'bg-red-600/90',
        green: 'bg-[#2d6a4f]/60'
    };
    const headerColors: { [key: string]: string } = {
        brown: 'bg-[#4a3426]',
        red: 'bg-red-500',
        green: 'bg-[#2d6a4f]'
    };
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-[300] ${backdropColors[color]} backdrop-blur-md flex items-center justify-center p-4 text-left`}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-white/20"
                >
                    <div className={`p-6 ${headerColors[color]} text-white`}>
                        <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <p className="text-sm font-bold text-[#8c8279] uppercase tracking-wide leading-relaxed">
                            {message}
                        </p>
                        <div className="flex gap-3">
                            {!alert && (
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-12 bg-[#f9f6f2] text-[#8c8279] rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#ece6df] transition-all"
                                >
                                    Annuler
                                </button>
                            )}
                            <button
                                onClick={() => { if (onConfirm) onConfirm(); onClose(); }}
                                className={`flex-1 h-12 ${colors[color]} text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg`}
                            >
                                {alert ? 'OK' : 'Confirmer'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const HistoryModal = ({ isOpen, onClose, type, startDate, endDate, targetName }: any) => {
    const { data: historyData, loading, error } = useQuery(GET_CHIFFRES_RANGE, {
        variables: { startDate, endDate },
        skip: !isOpen,
        fetchPolicy: 'network-only'
    });

    if (!isOpen) return null;

    if (error) {
        console.error("History Query Error:", error);
    }

    const titleMap: any = {
        avance: 'Liste des Accomptes',
        doublage: 'Liste des Doublages',
        extra: 'Liste des Extras',
        prime: 'Liste des Primes',
        divers: 'Dépenses Divers',
        admin: 'Dépenses Administratif',
        supplier: 'Dépenses Fournisseur'
    };

    const detailsKeyMap: any = {
        avance: 'avances_details',
        doublage: 'doublages_details',
        extra: 'extras_details',
        prime: 'primes_details',
        divers: 'diponce_divers',
        admin: 'diponce_admin',
        supplier: 'diponce',
        restes_salaires: 'restes_salaires_details'
    };

    // Grouping logic
    const groupedData: any = {};
    let globalTotal = 0;

    historyData?.getChiffresByRange?.forEach((chiffre: any) => {
        let details = [];
        const isJsonType = ['divers', 'admin', 'supplier'].includes(type);

        if (isJsonType) {
            try {
                details = JSON.parse(chiffre[detailsKeyMap[type]] || '[]');
            } catch (e) { details = []; }
            // Normalize for logic reuse (some use 'supplier', some 'designation')
            details = details.map((d: any) => ({
                ...d,
                username: d.designation || d.supplier,
                montant: d.amount
            }));
        } else {
            details = chiffre[detailsKeyMap[type]] || [];
        }

        details.forEach((item: any) => {
            if (!item.username || !item.montant) return;

            if (!groupedData[item.username]) {
                groupedData[item.username] = {
                    username: item.username,
                    total: 0,
                    entries: []
                };
            }
            const amount = parseFloat(item.montant);
            groupedData[item.username].total += amount;
            globalTotal += amount;

            // Safe Date Formatting
            const formattedDate = formatDisplayDate(item.date || chiffre.date);

            groupedData[item.username].entries.push({
                date: formattedDate,
                amount,
                nb_jours: item.nb_jours,
                created_at: item.created_at
            });
        });
    });

    let employeesList = Object.values(groupedData).map((emp: any) => ({
        ...emp,
        entries: emp.entries.sort((a: any, b: any) => {
            const [da, ma, ya] = a.date.split('/').map(Number);
            const [db, mb, yb] = b.date.split('/').map(Number);
            const timeA = new Date(ya, ma - 1, da).getTime();
            const timeB = new Date(yb, mb - 1, db).getTime();
            if (timeA !== timeB) return timeB - timeA;
            if (a.created_at && b.created_at) {
                const tA = new Date(typeof a.created_at === 'string' ? a.created_at.replace(' ', 'T') : a.created_at).getTime();
                const tB = new Date(typeof b.created_at === 'string' ? b.created_at.replace(' ', 'T') : b.created_at).getTime();
                if (!isNaN(tA) && !isNaN(tB)) return tB - tA;
            }
            return 0;
        })
    })).sort((a: any, b: any) => b.total - a.total);

    if (targetName) {
        employeesList = employeesList.filter((e: any) => e.username.toLowerCase() === targetName.toLowerCase());
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-[#e6dace] flex flex-col max-h-[90vh]"
                >
                    <div className="p-8 space-y-4 border-b border-[#f9f6f2]">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-[#fcfaf8] rounded-2xl text-[#c69f6e]">
                                    <LayoutDashboard size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-[#4a3426] tracking-tighter uppercase">
                                    {targetName ? `Historique: ${targetName}` : titleMap[type]}
                                </h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-[#f9f6f2] rounded-xl transition-colors text-[#bba282]"><X size={24} /></button>
                        </div>
                        <p className="text-[#8c8279] font-medium pl-1">{type === 'restes_salaires' ? 'Restes Salaires' : (type?.charAt(0).toUpperCase() + type?.slice(1) + 's')} groupés par employé</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4 bg-[#fcfaf8]/50">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="animate-spin text-[#c69f6e]" size={40} />
                                <p className="text-[#8c8279] font-bold uppercase tracking-widest text-xs">Chargement de l'historique...</p>
                            </div>
                        ) : employeesList.length > 0 ? (
                            employeesList.map((emp: any, i: number) => (
                                <div key={i} className="bg-white p-6 rounded-[2rem] border border-[#e6dace]/50 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-[#f9f6f2] rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                                <span className="text-xl font-black text-[#c69f6e] uppercase">{emp.username.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-[#4a3426] capitalize">{emp.username}</h4>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-[#c69f6e]">{emp.total.toFixed(3)} <span className="text-xs">DT</span></span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {emp.entries.map((entry: any, di: number) => (
                                            <div key={di} className="flex justify-between items-center bg-[#fcfaf8] border border-[#e6dace] rounded-xl px-4 py-3 shadow-sm">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-[#4a3426]">{entry.date}</span>
                                                    {formatDisplayTime(entry.created_at) && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={10} className="text-[#c69f6e]" />
                                                            <span className="text-[9px] font-medium text-[#8c8279]">
                                                                {formatDisplayTime(entry.created_at)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-sm font-black text-[#c69f6e]">{entry.amount.toFixed(3)} DT</span>
                                                    {entry.nb_jours > 0 && <span className="text-[9px] font-bold text-[#8c8279] uppercase tracking-wider">{entry.nb_jours} Jours</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 opacity-40 italic">Aucune donnée trouvée pour cette période</div>
                        )}
                    </div>

                    <div className="p-8 bg-white border-t border-[#f9f6f2] flex justify-between items-center">
                        <span className="text-sm font-black text-[#8c8279] uppercase tracking-widest">Total Global</span>
                        <span className="text-3xl font-black text-[#4a3426]">{globalTotal.toFixed(3)} <span className="text-sm font-bold">DT</span></span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default function ChiffrePage({ role, onLogout }: ChiffrePageProps) {
    // Global State
    const [date, setDate] = useState<string>('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        setDate(`${y}-${m}-${d}`);
    }, []);

    // GraphQL
    const { data: chiffreData, refetch: refetchChiffre } = useQuery(GET_CHIFFRE, {
        variables: { date },
        skip: !date
    });
    const { data: suppliersData, refetch: refetchSuppliers } = useQuery(GET_SUPPLIERS);
    const { data: designationsData, refetch: refetchDesignations } = useQuery(GET_DESIGNATIONS);
    const [saveChiffre, { loading: saving }] = useMutation(SAVE_CHIFFRE);
    const [unlockChiffre, { loading: unlocking }] = useMutation(UNLOCK_CHIFFRE);
    const [upsertSupplier] = useMutation(UPSERT_SUPPLIER);
    const [upsertDesignation] = useMutation(UPSERT_DESIGNATION);
    const [unpayInvoice] = useMutation(UNPAY_INVOICE);
    const { data: employeesData, refetch: refetchEmployees } = useQuery(GET_EMPLOYEES);

    const [upsertEmployee] = useMutation(UPSERT_EMPLOYEE);
    const [updateEmployee] = useMutation(UPDATE_EMPLOYEE);
    const [deleteEmployee] = useMutation(DELETE_EMPLOYEE);
    const [addAvance] = useMutation(ADD_AVANCE);
    const [deleteAvance] = useMutation(DELETE_AVANCE);
    const [addDoublage] = useMutation(ADD_DOUBLAGE);
    const [deleteDoublage] = useMutation(DELETE_DOUBLAGE);
    const [addExtra] = useMutation(ADD_EXTRA);
    const [deleteExtra] = useMutation(DELETE_EXTRA);
    const [addPrime] = useMutation(ADD_PRIME);
    const [deletePrime] = useMutation(DELETE_PRIME);
    const [addRestesSalaires] = useMutation(ADD_RESTES_SALAIRES);
    const [deleteRestesSalaires] = useMutation(DELETE_RESTES_SALAIRES);

    // Dashboard States
    const [recetteCaisse, setRecetteCaisse] = useState('0');
    const [expenses, setExpenses] = useState<{
        supplier: string,
        amount: string,
        details: string,
        invoices: string[],
        photo_cheque?: string,
        photo_verso?: string,
        paymentMethod: string,
        isFromFacturation?: boolean,
        invoiceId?: number,
        doc_type?: string,
        doc_number?: string,
        hasRetenue?: boolean,
        originalAmount?: string
    }[]>([
        { supplier: '', amount: '0', details: '', invoices: [], photo_cheque: '', photo_verso: '', paymentMethod: 'Espèces', doc_type: 'BL', hasRetenue: false, originalAmount: '0' }
    ]);
    const [expensesDivers, setExpensesDivers] = useState<{
        designation: string,
        amount: string,
        details: string,
        invoices: string[],
        paymentMethod: string,
        isFromFacturation?: boolean,
        invoiceId?: number,
        doc_type?: string,
        hasRetenue?: boolean,
        originalAmount?: string
    }[]>([
        { designation: '', amount: '0', details: '', invoices: [], paymentMethod: 'Espèces', doc_type: 'BL', hasRetenue: false, originalAmount: '0' }
    ]);
    const [expensesAdmin, setExpensesAdmin] = useState<{
        designation: string,
        amount: string,
        paymentMethod: string
    }[]>([
        { designation: 'Riadh', amount: '0', paymentMethod: 'Espèces' },
        { designation: 'Malika', amount: '0', paymentMethod: 'Espèces' },
        { designation: 'Salaires', amount: '0', paymentMethod: 'Espèces' }
    ]);
    const [tpe, setTpe] = useState('0');
    const [tpe2, setTpe2] = useState('0');
    const [cheque, setCheque] = useState('0');
    const [especes, setEspeces] = useState('0');
    const [ticketsRestaurant, setTicketsRestaurant] = useState('0');
    const [extra, setExtra] = useState('0');
    const [primes, setPrimes] = useState('0');
    const [offres, setOffres] = useState('0');

    // Bey Details (Now Local)
    const [avancesList, setAvancesList] = useState<{ id?: number, username: string, montant: string, created_at?: string }[]>([]);
    const [doublagesList, setDoublagesList] = useState<{ id?: number, username: string, montant: string, created_at?: string }[]>([]);
    const [extrasList, setExtrasList] = useState<{ id?: number, username: string, montant: string, created_at?: string }[]>([]);
    const [primesList, setPrimesList] = useState<{ id?: number, username: string, montant: string, created_at?: string }[]>([]);
    const [offresList, setOffresList] = useState<{ name: string, amount: string }[]>([]);
    const [isOffresExpanded, setIsOffresExpanded] = useState(false);
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
    const [photoZoom, setPhotoZoom] = useState(1);
    const [caissePhotos, setCaissePhotos] = useState<string[]>([]);
    const [restesSalairesList, setRestesSalairesList] = useState<{ id?: number, username: string, montant: string, nb_jours?: number, created_at?: string }[]>([]);

    // UI States
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [showConfirm, setShowConfirm] = useState<any>(null);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [designationSearch, setDesignationSearch] = useState('');
    const [showSupplierDropdown, setShowSupplierDropdown] = useState<number | null>(null);
    const [showDiversDropdown, setShowDiversDropdown] = useState<number | null>(null);
    const [showEntryModal, setShowEntryModal] = useState<any>(null); // { type: 'avance' | 'doublage' | 'extra' | 'prime', data: any }
    const [showEmployeeList, setShowEmployeeList] = useState(false);
    const [isAddingEmployee, setIsAddingEmployee] = useState(false);
    const [newEmpName, setNewEmpName] = useState('');
    const [newEmpDept, setNewEmpDept] = useState('');
    const [showHistoryModal, setShowHistoryModal] = useState<any>(null); // { type: 'avance' | 'doublage' | 'extra' | 'prime' }
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [newEmployeeModalName, setNewEmployeeModalName] = useState('');
    const [employeeDepartment, setEmployeeDepartment] = useState('');
    const [showDeptSuggestions, setShowDeptSuggestions] = useState(false);
    const [viewingInvoices, setViewingInvoices] = useState<string[] | null>(null);
    const [viewingInvoicesTarget, setViewingInvoicesTarget] = useState<{ index: number, type: 'expense' | 'divers' } | null>(null);
    const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<'all' | number>('all');
    const [imgZoom, setImgZoom] = useState(1);
    const [imgRotation, setImgRotation] = useState(0);

    const resetView = () => {
        setImgZoom(1);
        setImgRotation(0);
    };

    useEffect(() => {
        if (!viewingInvoices) resetView();
    }, [viewingInvoices]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [showDiversModal, setShowDiversModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [hideRecetteCaisse, setHideRecetteCaisse] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Modal Details States
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [modalDetailsTarget, setModalDetailsTarget] = useState<{ index: number, type: 'expense' | 'divers' } | null>(null);
    const [tempDetails, setTempDetails] = useState('');
    const [lastFocusedValue, setLastFocusedValue] = useState('');

    const [showJournalierSuggestions, setShowJournalierSuggestions] = useState(false);

    const journalierMasterSuggestions = useMemo(() => {
        const sList = (suppliersData?.getSuppliers || []).map((s: any) => s.name);
        const dList = (designationsData?.getDesignations || []).map((d: any) => d.name);
        const eList = (employeesData?.getEmployees || []).map((e: any) => e.name);
        return { suppliers: sList, divers: dList, employees: eList };
    }, [suppliersData, designationsData, employeesData]);

    const commonDesignations = designationsData?.getDesignations?.map((d: any) => d.name) || ["Fruits", "khodhra", "Entretien", "Outils", "Transport", "Petit déjeuner", "Divers"];

    // Helper to get raw state data
    const getCurrentState = () => ({
        recetteCaisse,
        expenses,
        tpe,
        tpe2,
        cheque,
        especes,
        ticketsRestaurant,
        extra,
        primes,
        avancesList,
        doublagesList,
        extrasList,
        primesList,
        restesSalairesList,
        expensesDivers,
        expensesAdmin,
        offres
    });



    // Load Data
    useEffect(() => {
        if (chiffreData?.getChiffreByDate) {
            const c = chiffreData.getChiffreByDate;


            setAvancesList(c.avances_details || []);
            setDoublagesList(c.doublages_details || []);
            setExtrasList(c.extras_details || []);
            setPrimesList(c.primes_details || []);
            setRestesSalairesList(c.restes_salaires_details || []);
            setIsLocked(c.is_locked || false);

            // Update editable fields
            if (!hasInteracted) {
                setRecetteCaisse(c.recette_de_caisse);
                setExpenses(JSON.parse(c.diponce || '[]').map((e: any) => ({ ...e, details: e.details || '' })));
                setTpe(c.tpe);
                setTpe2(c.tpe2 || '0');
                setCheque(c.cheque_bancaire);
                setEspeces(c.espaces);
                setTicketsRestaurant(c.tickets_restaurant || '0');
                setExtra(c.extra || '0');
                setPrimes(c.primes || '0');
                setOffres(c.offres || '0');
                setOffresList(JSON.parse(c.offres_data || '[]'));
                // Handle both old single photo format and new array format
                try {
                    const parsed = JSON.parse(c.caisse_photo || '[]');
                    setCaissePhotos(Array.isArray(parsed) ? parsed : (c.caisse_photo ? [c.caisse_photo] : []));
                } catch {
                    setCaissePhotos(c.caisse_photo ? [c.caisse_photo] : []);
                }
                setExpensesDivers(JSON.parse(c.diponce_divers || '[]').map((d: any) => ({ ...d, details: d.details || '' })));

                let adminData = JSON.parse(c.diponce_admin || '[]');
                if (adminData.length === 0) {
                    adminData = [
                        { designation: 'Riadh', amount: '0', paymentMethod: 'Espèces' },
                        { designation: 'Malika', amount: '0', paymentMethod: 'Espèces' },
                        { designation: 'Salaires', amount: '0', paymentMethod: 'Espèces' }
                    ];
                }
                setExpensesAdmin(adminData);
            } else {
                // Merge logic: ensure items from Facturation are always up-to-date even in draft mode
                const dbExpenses = JSON.parse(c.diponce || '[]');
                const dbExpensesDivers = JSON.parse(c.diponce_divers || '[]');

                setExpenses(prev => {
                    const nonFacturationItems = prev.filter(e => !e.isFromFacturation);
                    const dbFacturationItems = dbExpenses.filter((e: any) => e.isFromFacturation);
                    return [...nonFacturationItems, ...dbFacturationItems];
                });

                setExpensesDivers(prev => {
                    const nonFacturationItems = prev.filter(d => !d.isFromFacturation);
                    const dbFacturationItems = dbExpensesDivers.filter((d: any) => d.isFromFacturation);
                    return [...nonFacturationItems, ...dbFacturationItems];
                });
            }
        } else {
            // Check for draft even if no server data
            const savedDraft = localStorage.getItem(`chiffre_draft_${date}`);
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    if (draft.date === date) {
                        const d = draft.data;
                        setRecetteCaisse(d.recetteCaisse);
                        setTpe(d.tpe);
                        setTpe2(d.tpe2 || '0');
                        setCheque(d.cheque);
                        setEspeces(d.especes);
                        setTicketsRestaurant(d.ticketsRestaurant);
                        setExtra(d.extra);
                        setPrimes(d.primes);
                        setAvancesList(d.avancesList);
                        setDoublagesList(d.doublagesList);
                        setExtrasList(d.extrasList);
                        setPrimesList(d.primesList);
                        setRestesSalairesList(d.restesSalairesList || []);
                        setOffres(d.offres || '0');
                        setOffresList(d.offresList || []);
                        setExpenses(d.expenses.map((e: any) => ({ ...e, details: e.details || '' })));
                        setExpensesDivers((d.expensesDivers || []).map((dv: any) => ({ ...dv, details: dv.details || '' })));
                        setExpensesAdmin(d.expensesAdmin || [
                            { designation: 'Riadh', amount: '0', paymentMethod: 'Espèces' },
                            { designation: 'Malika', amount: '0', paymentMethod: 'Espèces' },
                            { designation: 'Salaires', amount: '0', paymentMethod: 'Espèces' }
                        ]);
                        if (!d.expensesDivers) setExpensesDivers([{ designation: '', amount: '0', details: '', invoices: [], paymentMethod: 'Espèces', doc_type: 'BL' }]);
                        setCaissePhotos(d.caissePhotos || []);
                        setHasInteracted(true); // Treat as interacted since we are resuming a custom session
                        setToast({ msg: 'Reprise de votre saisie en cours', type: 'success' });
                        setTimeout(() => setToast(null), 3000);
                        return;
                    }
                } catch (e) { }
            }

            // Reset if no data found for date and no draft
            setRecetteCaisse('0');
            setExpenses([{ supplier: '', amount: '0', details: '', invoices: [], photo_cheque: '', photo_verso: '', paymentMethod: 'Espèces', doc_type: 'BL' }]);
            setTpe('0');
            setCheque('0');
            setEspeces('0');
            setTicketsRestaurant('0');
            setExtra('0');
            setPrimes('0');
            setOffres('0');
            setAvancesList([]);
            setDoublagesList([]);
            setExtrasList([]);
            setPrimesList([]);
            setExpensesDivers([{ designation: '', amount: '0', details: '', invoices: [], paymentMethod: 'Espèces', doc_type: 'BL' }]);
            setExpensesAdmin([
                { designation: 'Riadh', amount: '0', paymentMethod: 'Espèces' },
                { designation: 'Malika', amount: '0', paymentMethod: 'Espèces' },
                { designation: 'Salaires', amount: '0', paymentMethod: 'Espèces' }
            ]);
            setCaissePhotos([]);
            setIsLocked(false);
            setHasInteracted(false);
        }
    }, [chiffreData, date]);

    // Auto-save Draft to LocalStorage
    useEffect(() => {
        if (!date || !hasInteracted) return;

        const timer = setTimeout(() => {
            const state = {
                recetteCaisse,
                expenses,
                tpe,
                tpe2,
                cheque,
                especes,
                ticketsRestaurant,
                extra,
                primes,
                avancesList,
                doublagesList,
                extrasList,
                primesList,
                restesSalairesList,
                expensesDivers,
                expensesAdmin,
                offres,
                offresList,
                caissePhotos
            };
            const draft = {
                date,
                timestamp: new Date().toISOString(),
                data: state
            };
            localStorage.setItem(`chiffre_draft_${date}`, JSON.stringify(draft));
        }, 500); // Debounce save

        return () => clearTimeout(timer);
    }, [
        recetteCaisse, expenses, tpe, tpe2, cheque, especes, ticketsRestaurant,
        extra, primes, avancesList, doublagesList, extrasList, primesList,
        restesSalairesList, expensesDivers, expensesAdmin, offres, offresList, caissePhotos, date, hasInteracted
    ]);

    // Calculations
    const acompte = avancesList.reduce((acc, curr) => acc + (parseFloat(curr.montant) || 0), 0);
    const doublage = doublagesList.reduce((acc, curr) => acc + (parseFloat(curr.montant) || 0), 0);
    const extraTotal = extrasList.reduce((acc, curr) => acc + (parseFloat(curr.montant) || 0), 0);
    const primesTotal = primesList.reduce((acc, curr) => acc + (parseFloat(curr.montant) || 0), 0);
    const restesSalairesTotal = restesSalairesList.reduce((acc, curr) => acc + (parseFloat(curr.montant) || 0), 0);

    const totalExpensesDynamic = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const totalExpensesDivers = expensesDivers.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const totalExpensesAdmin = expensesAdmin.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const totalExpenses = totalExpensesDynamic + totalExpensesDivers + totalExpensesAdmin + acompte + doublage + extraTotal + primesTotal + restesSalairesTotal;
    const recetteNett = (parseFloat(recetteCaisse) || 0) - totalExpenses;

    // Auto-balance logic
    useEffect(() => {
        const net = (parseFloat(recetteCaisse) || 0) - totalExpenses;
        const t = parseFloat(tpe) || 0;
        const t2 = parseFloat(tpe2) || 0;
        const c = parseFloat(cheque) || 0;
        const tr = parseFloat(ticketsRestaurant) || 0;
        const remainder = net - t - t2 - c - tr;
        let espVal = remainder.toFixed(3);
        if (espVal.endsWith('.000')) espVal = espVal.replace('.000', '');
        setEspeces(espVal);
    }, [recetteCaisse, totalExpenses, tpe, tpe2, cheque, ticketsRestaurant]);


    // Handlers
    const handleDetailChange = (index: number, field: string, value: any) => {
        setHasInteracted(true);
        const newExpenses = [...expenses];
        (newExpenses[index] as any)[field] = value;
        setExpenses(newExpenses);
    };

    const handleDiversChange = (index: number, field: string, value: any) => {
        setHasInteracted(true);
        const newDivers = [...expensesDivers];
        (newDivers[index] as any)[field] = value;
        setExpensesDivers(newDivers);
    };


    const handleAdminChange = (index: number, field: string, value: any) => {
        setHasInteracted(true);
        const newAdmin = [...expensesAdmin];
        (newAdmin[index] as any)[field] = value;
        setExpensesAdmin(newAdmin);
    };

    const handleAddExpense = () => {
        if (isLocked) {
            setShowConfirm({
                type: 'alert',
                title: 'INTERDIT',
                message: 'Cette date est verrouillée. Impossible d’ajouter des dépenses.',
                color: 'red',
                alert: true
            });
            return;
        }
        setHasInteracted(true);
        setExpenses([...expenses, { supplier: '', amount: '0', details: '', invoices: [], photo_cheque: '', photo_verso: '', paymentMethod: 'Espèces', doc_type: 'BL' }]);
    };
    const handleAddDivers = (designation?: string) => {
        if (isLocked) {
            setShowConfirm({
                type: 'alert',
                title: 'INTERDIT',
                message: 'Cette date est verrouillée. Impossible d’ajouter des dépenses.',
                color: 'red',
                alert: true
            });
            return;
        }
        setHasInteracted(true);
        setExpensesDivers([...expensesDivers, { designation: designation || '', amount: '0', details: '', invoices: [], paymentMethod: 'Espèces', doc_type: 'BL' }]);
    };

    const handleEntrySubmit = async (type: string, username: string, amount: string, nbJours?: string, id?: number) => {
        if (isLocked) return;
        try {
            // If ID is present, delete the old entry first (Simulate Update)
            if (id) {
                if (type === 'avance') await deleteAvance({ variables: { id } });
                if (type === 'doublage') await deleteDoublage({ variables: { id } });
                if (type === 'extra') await deleteExtra({ variables: { id } });
                if (type === 'prime') await deletePrime({ variables: { id } });
                if (type === 'restes_salaires') await deleteRestesSalaires({ variables: { id } });
            }

            // New employees are now added only via the dedicated "Ajouter Employé" button
            // So we don't upsert here anymore to maintain a clean directory

            if (type === 'avance') await addAvance({ variables: { username, amount: parseFloat(amount), date } });
            if (type === 'doublage') await addDoublage({ variables: { username, amount: parseFloat(amount), date } });
            if (type === 'extra') await addExtra({ variables: { username, amount: parseFloat(amount), date } });
            if (type === 'prime') await addPrime({ variables: { username, amount: parseFloat(amount), date } });
            if (type === 'restes_salaires') await addRestesSalaires({ variables: { username, amount: parseFloat(amount), nb_jours: nbJours ? parseFloat(nbJours) : 0, date } });

            refetchChiffre();
            setToast({ msg: id ? 'Mis à jour avec succès' : 'Ajouté avec succès', type: 'success' });
            setTimeout(() => setToast(null), 3000);
        } catch (e) {
            console.error(e);
            setToast({ msg: 'Erreur lors de l’opération', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleDeleteEntry = async (type: string, id: number) => {
        if (isLocked) {
            setShowConfirm({
                type: 'alert',
                title: 'INTERDIT',
                message: 'Cette date est verrouillée. Impossible de supprimer.',
                color: 'red',
                alert: true
            });
            return;
        }

        setShowConfirm({
            type: 'delete',
            title: 'Supprimer',
            message: 'Voulez-vous vraiment supprimer cet élément ?',
            color: 'red',
            onConfirm: async () => {
                try {
                    if (type === 'avance') await deleteAvance({ variables: { id } });
                    if (type === 'doublage') await deleteDoublage({ variables: { id } });
                    if (type === 'extra') await deleteExtra({ variables: { id } });
                    if (type === 'prime') await deletePrime({ variables: { id } });
                    if (type === 'restes_salaires') await deleteRestesSalaires({ variables: { id } });

                    refetchChiffre();
                    setToast({ msg: 'Supprimé avec succès', type: 'success' });
                    setTimeout(() => setToast(null), 3000);
                } catch (e) {
                    console.error(e);
                }
            }
        });
    };
    const handleToggleRetenue = (index: number, type: 'expense' | 'divers') => {
        if (isLocked) return;
        setHasInteracted(true);
        if (type === 'expense') {
            const newExpenses = [...expenses];
            const item = newExpenses[index];
            const currentAmount = parseFloat(item.amount) || 0;
            if (!item.hasRetenue) {
                const original = item.amount;
                const net = (currentAmount * 0.99).toFixed(3);
                newExpenses[index] = { ...item, hasRetenue: true, originalAmount: original, amount: net };
            } else {
                newExpenses[index] = { ...item, hasRetenue: false, amount: item.originalAmount || item.amount };
            }
            setExpenses(newExpenses);
        } else {
            const newDivers = [...expensesDivers];
            const item = newDivers[index];
            const currentAmount = parseFloat(item.amount) || 0;
            if (!item.hasRetenue) {
                const original = item.amount;
                const net = (currentAmount * 0.99).toFixed(3);
                newDivers[index] = { ...item, hasRetenue: true, originalAmount: original, amount: net };
            } else {
                newDivers[index] = { ...item, hasRetenue: false, amount: item.originalAmount || item.amount };
            }
            setExpensesDivers(newDivers);
        }
    };

    const handleRemoveExpense = (index: number) => {
        if (isLocked) {
            setShowConfirm({
                type: 'alert',
                title: 'INTERDIT',
                message: 'Cette date est verrouillée. Impossible de supprimer cette dépense.',
                color: 'red',
                alert: true
            });
            return;
        }

        const expense = expenses[index];
        if (expense.isFromFacturation && expense.invoiceId) {
            setShowConfirm({
                type: 'unpay',
                title: 'Annuler Payement',
                message: `Cette dépense provient d'une facture. Voulez-vous vraiment l'enlever ? Elle redeviendra "non payée" dans la facturation.`,
                color: 'red',
                onConfirm: async () => {
                    try {
                        await unpayInvoice({ variables: { id: expense.invoiceId } });
                        setHasInteracted(true);
                        setExpenses(expenses.filter((_, i) => i !== index));
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
        } else {
            setHasInteracted(true);
            setExpenses(expenses.filter((_, i) => i !== index));
        }
    };
    const handleRemoveDivers = (index: number) => {
        if (isLocked) {
            setShowConfirm({
                type: 'alert',
                title: 'INTERDIT',
                message: 'Cette date est verrouillée. Impossible de supprimer cette dépense.',
                color: 'red',
                alert: true
            });
            return;
        }
        setHasInteracted(true);
        setExpensesDivers(expensesDivers.filter((_, i) => i !== index));
    };

    const handleOffresChange = (index: number, field: string, value: string) => {
        if (isLocked) return;
        const list = [...offresList];
        (list[index] as any)[field] = value;
        setOffresList(list);
        setOffres(list.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0).toString());
        setHasInteracted(true);
    };

    const handleAddOffre = () => {
        if (isLocked) return;
        setOffresList([...offresList, { name: '', amount: '0' }]);
        setHasInteracted(true);
    };

    const handleRemoveOffre = (index: number) => {
        if (isLocked) return;
        const list = [...offresList];
        list.splice(index, 1);
        setOffresList(list);
        setOffres(list.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0).toString());
        setHasInteracted(true);
    };

    const handleShareInvoice = async (img: string) => {
        try {
            const response = await fetch(img);
            const blob = await response.blob();
            const file = new File([blob], 'recu.png', { type: blob.type });

            // 1. Try Native Share (Best for Mobile: WhatsApp, FB, etc.)
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Reçu Riadh Bey',
                    text: 'Voici un reçu de la caisse Riadh Bey'
                });
                return;
            }

            // 2. Try Clipboard Copy (Best for Desktop: allows Ctrl+V into WhatsApp/FB)
            if (navigator.clipboard && window.ClipboardItem) {
                try {
                    const data = [new ClipboardItem({ [blob.type]: blob })];
                    await navigator.clipboard.write(data);
                    setToast({ msg: '📸 Image copiée ! Collez-la (Ctrl+V) dans WhatsApp/FB', type: 'success' });
                    setTimeout(() => setToast(null), 3000);
                    return;
                } catch (err) {
                    console.warn('Clipboard write failed', err);
                }
            }

            // 3. Fallback: Download
            const link = document.createElement('a');
            link.href = img;
            link.download = 'recu.png';
            link.click();
            setToast({ msg: 'Téléchargement lancé', type: 'success' });
            setTimeout(() => setToast(null), 3000);
        } catch (e) {
            console.error('Share failed', e);
            setToast({ msg: 'Échec du partage', type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleDeleteInvoice = (idx: number) => {
        if (!viewingInvoicesTarget || !viewingInvoices) return;
        const newInvoices = [...viewingInvoices];
        newInvoices.splice(idx, 1);

        if (viewingInvoicesTarget.type === 'divers') {
            const list = [...expensesDivers];
            list[viewingInvoicesTarget.index].invoices = newInvoices;
            setExpensesDivers(list);
        } else {
            const list = [...expenses];
            list[viewingInvoicesTarget.index].invoices = newInvoices;
            setExpenses(list);
        }
        setViewingInvoices(newInvoices.length > 0 ? newInvoices : null);
        if (newInvoices.length === 0) setViewingInvoicesTarget(null);
    };

    const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'recto' | 'verso' = 'invoice', isDivers: boolean = false) => {
        setHasInteracted(true);
        const files = e.target.files;
        if (!files) return;

        if (type === 'invoice') {
            const loaders = Array.from(files).map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            });
            const base64s = await Promise.all(loaders);
            if (type === 'invoice') {
                if (isDivers === true) {
                    const newDivers = [...expensesDivers];
                    newDivers[index].invoices = [...newDivers[index].invoices, ...base64s];
                    setExpensesDivers(newDivers);
                } else {
                    const newExpenses = [...expenses];
                    newExpenses[index].invoices = [...newExpenses[index].invoices, ...base64s];
                    setExpenses(newExpenses);
                }
            }
        } else {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const newExpenses = [...expenses];
                if (type === 'recto') newExpenses[index].photo_cheque = reader.result as string;
                if (type === 'verso') newExpenses[index].photo_verso = reader.result as string;
                setExpenses(newExpenses);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddNewSupplier = async (name: string) => {
        if (!name.trim()) return;
        try {
            await upsertSupplier({ variables: { name: name.trim() } });
            setToast({ msg: `Fournisseur "${name}" ajouté`, type: 'success' });
            setNewSupplierName('');
            setShowSupplierModal(false);
            setTimeout(() => setToast(null), 3000);
            refetchSuppliers(); // Only refetch suppliers, not the whole data
        } catch (e) {
            setToast({ msg: "Erreur lors de l'ajout", type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleSave = async () => {
        if (isLocked) {
            setShowConfirm({
                type: 'alert',
                title: 'INTERDIT',
                message: 'Cette session est verrouillée. Impossible de modifier les données.',
                color: 'red',
                alert: true
            });
            return;
        }

        // Helper to ensure values are never empty strings
        const ensureValue = (val: string | null | undefined) => {
            if (val === '' || val === null || val === undefined) return '0';
            return val;
        };

        try {
            await saveChiffre({
                variables: {
                    date,
                    recette_de_caisse: ensureValue(recetteCaisse),
                    total_diponce: totalExpenses.toString(),
                    diponce: JSON.stringify(expenses),
                    recette_net: recetteNett.toString(),
                    tpe: ensureValue(tpe),
                    tpe2: ensureValue(tpe2),
                    cheque_bancaire: ensureValue(cheque),
                    espaces: ensureValue(especes),
                    tickets_restaurant: ensureValue(ticketsRestaurant),
                    extra: ensureValue(extra),
                    primes: ensureValue(primes),
                    offres: ensureValue(offres),
                    offres_data: JSON.stringify(offresList),
                    caisse_photo: JSON.stringify(caissePhotos),
                    diponce_divers: JSON.stringify(expensesDivers),
                    diponce_admin: JSON.stringify(expensesAdmin),
                    payer: role
                }
            });
            setToast({ msg: 'Session enregistrée avec succès', type: 'success' });
            localStorage.removeItem(`chiffre_draft_${date}`); // Clear draft on save
            setHasInteracted(false); // Validated state matches server
            setTimeout(() => setToast(null), 3000);
            refetchChiffre();
        } catch (e) {
            console.error(e);
            setToast({ msg: "Erreur lors de l'enregistrement", type: 'error' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    // Suppliers for dropdown
    const suppliers = suppliersData?.getSuppliers || [];
    const filteredSuppliers = suppliers.filter((s: any) => s.name.toLowerCase().includes(supplierSearch.toLowerCase()));

    // Date Navigation
    const changeMonth = (delta: number) => {
        const parts = date.split('-');
        const curr = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        curr.setMonth(curr.getMonth() + delta);

        const y = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, '0');
        const dd = String(curr.getDate()).padStart(2, '0');
        setDate(`${y}-${mm}-${dd}`);
    };

    const shiftDate = (daysCount: number) => {
        const parts = date.split('-');
        const current = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        current.setDate(current.getDate() + daysCount);

        const y = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        const newDateStr = `${y}-${mm}-${dd}`;
        if (role !== 'admin') {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const target = new Date(newDateStr);
            const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const yesterdayZero = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
            const targetZero = new Date(target.getFullYear(), target.getMonth(), target.getDate());
            if (targetZero < yesterdayZero || targetZero > todayZero) return;
        }
        setDate(newDateStr);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const generateCalendarDays = (currentDateStr: string) => {
        const curr = new Date(currentDateStr);
        const startDay = new Date(curr.getFullYear(), curr.getMonth(), 1).getDay();
        const daysInMonth = new Date(curr.getFullYear(), curr.getMonth() + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };

    if (!isClient) return null;

    // --- SUB-COMPONENTS ---

    const getDepartment = (name: string) => {
        if (!employeesData?.getEmployees) return null;
        const emp = employeesData.getEmployees.find((e: any) => e.name.toLowerCase() === name.toLowerCase());
        return emp?.department;
    };

    return (
        <div className="min-h-screen bg-[#f8f5f2] text-[#2d241e] font-sans flex">
            {/* Styles */}
            <style jsx global>{`
                .luxury-shadow { box-shadow: 0 20px 40px -10px rgba(60, 45, 30, 0.08); }
                .gold-gradient { background: linear-gradient(135deg, #c69f6e 0%, #a67c52 100%); }
            `}</style>

            {/* Sidebar */}
            <Sidebar role={role} />

            {/* Main Content */}
            <div className="flex-1 min-w-0 pb-32">

                {/* Header */}
                <header className={`sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#e6dace] py-4 px-4 md:px-12 flex justify-between items-center transition-all duration-300`}>

                    <h2 className="text-xl font-black text-[#4a3426] uppercase tracking-widest">
                        Journalier
                    </h2>

                    <div className="flex items-center gap-4 ml-auto">
                        {date && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => shiftDate(-1)}
                                    className={`p-2 rounded-full hover:bg-[#ebdccf] text-[#8c8279] hover:text-[#4a3426] transition-all ${role !== 'admin' && new Date(date) <= new Date(Date.now() - 86400000 * 2) ? 'opacity-0 pointer-events-none w-0 p-0 overflow-hidden' : ''}`}
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div
                                    className={`relative group ${role === 'admin' ? 'cursor-pointer' : ''}`}
                                    onClick={() => role === 'admin' && setShowCalendar(true)}
                                >
                                    <div className={`flex items-center gap-3 bg-[#f4ece4] px-5 py-2.5 rounded-2xl transition-all border border-transparent ${role === 'admin' ? 'group-hover:bg-[#e6dace] group-hover:border-[#c69f6e]/30' : ''}`}>
                                        <Calendar size={18} className="text-[#c69f6e]" />
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[10px] font-bold text-[#8c8279] uppercase tracking-wider hidden xs:block">Date Sélectionnée</span>
                                            <span className="text-xs sm:text-sm font-bold text-[#4a3426] capitalize mt-0.5">
                                                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => shiftDate(1)}
                                    className={`p-2 rounded-full hover:bg-[#ebdccf] text-[#8c8279] hover:text-[#4a3426] transition-all ${role !== 'admin' && (() => {
                                        const now = new Date();
                                        const ty = now.getFullYear();
                                        const tm = String(now.getMonth() + 1).padStart(2, '0');
                                        const td = String(now.getDate()).padStart(2, '0');
                                        return date >= `${ty}-${tm}-${td}`;
                                    })() ? 'opacity-0 pointer-events-none w-0 p-0 overflow-hidden' : ''}`}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                        <div className="w-px h-8 bg-[#e6dace] mx-2"></div>
                    </div>
                </header>

                <main className="w-full max-w-full px-4 md:px-8 lg:px-12 mt-6 md:mt-8">
                    <div className="space-y-6">
                        {/* 1. Recette De Caisse (Hero) */}
                        <section className="bg-[#f0faf5] rounded-[2.5rem] p-6 md:p-10 lg:p-12 luxury-shadow border border-[#d1fae5] relative overflow-hidden">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-4 relative z-10 w-full max-w-4xl mx-auto">
                                {/* Date Side */}
                                <div className="text-center md:text-left flex flex-col gap-1">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <div className="text-[#2d6a4f] text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-40">Session du</div>
                                        {isLocked && (
                                            <div className="flex items-center gap-1.5 text-red-600 text-[10px] font-black uppercase tracking-widest">
                                                <LockIcon size={12} /> Verrouillée
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#2d6a4f] leading-none tracking-tighter flex items-center gap-4">
                                        <span className="md:hidden">
                                            {new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        </span>
                                        <span className="hidden md:inline">
                                            {new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Amount Side */}
                                <div className="flex flex-col items-center md:items-end w-full">
                                    <div className="bg-white/40 md:bg-transparent p-6 md:p-0 rounded-[2rem] border border-white md:border-transparent w-full md:w-auto">
                                        <div className="flex items-center justify-center md:justify-end gap-2 mb-2 text-[#8c8279]">
                                            <Wallet size={16} className="text-[#2d6a4f]" strokeWidth={2.5} />
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#4a3426]">Recette Caisse</span>
                                            <button
                                                onClick={() => setHideRecetteCaisse(!hideRecetteCaisse)}
                                                className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors text-[#bba282]"
                                            >
                                                {hideRecetteCaisse ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>

                                            {/* Photo Caisse Controls - Up to 3 photos */}
                                            <div className="flex items-center gap-2 ml-4 border-l pl-4 border-[#4a3426]/10">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    id="caisse-photo-upload"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file && caissePhotos.length < 3) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setCaissePhotos(prev => [...prev, reader.result as string]);
                                                                setHasInteracted(true);
                                                                setToast({ msg: 'Photo caisse ajoutée', type: 'success' });
                                                                setTimeout(() => setToast(null), 3000);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                />

                                                {/* Show existing photos */}
                                                <div className="flex items-center gap-1.5">
                                                    {caissePhotos.map((photo, index) => (
                                                        <div key={index} className="relative group">
                                                            <div
                                                                className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#c69f6e]/30 cursor-pointer"
                                                                onClick={() => setViewingPhoto(photo)}
                                                            >
                                                                <Image
                                                                    src={photo}
                                                                    alt={`Caisse ${index + 1}`}
                                                                    fill
                                                                    className="object-cover group-hover:scale-110 transition-transform"
                                                                />
                                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Maximize2 size={10} className="text-white" />
                                                                </div>
                                                            </div>
                                                            {!isLocked && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setCaissePhotos(prev => prev.filter((_, i) => i !== index));
                                                                        setHasInteracted(true);
                                                                        setToast({ msg: 'Photo supprimée', type: 'success' });
                                                                        setTimeout(() => setToast(null), 3000);
                                                                    }}
                                                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                                >
                                                                    <X size={10} className="text-white" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* Add photo button - show only if less than 3 photos */}
                                                    {caissePhotos.length < 3 && !isLocked && (
                                                        <label
                                                            htmlFor="caisse-photo-upload"
                                                            className="cursor-pointer w-8 h-8 rounded-lg border-2 border-dashed border-[#2d6a4f]/30 flex items-center justify-center hover:bg-[#2d6a4f]/5 hover:border-[#2d6a4f]/50 transition-all"
                                                            title={`Ajouter photo (${caissePhotos.length}/3)`}
                                                        >
                                                            <Camera size={14} className="text-[#2d6a4f]/60" />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {hideRecetteCaisse ? (
                                            <div className="text-6xl md:text-7xl lg:text-8xl font-black text-[#4a3426] py-1">
                                                ********
                                            </div>
                                        ) : (
                                            <div
                                                className="flex items-baseline justify-center md:justify-end gap-3"
                                                onClick={() => {
                                                    if (isLocked) {
                                                        setShowConfirm({
                                                            type: 'alert',
                                                            title: 'INTERDIT',
                                                            message: 'Cette date est verrouillée. Impossible de modifier la recette.',
                                                            color: 'red',
                                                            alert: true
                                                        });
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={recetteCaisse ?? ''}
                                                    disabled={isLocked}
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                    onFocus={(e) => { if (recetteCaisse === '0') setRecetteCaisse(''); }}
                                                    onBlur={(e) => { if (e.target.value === '' || e.target.value === null) setRecetteCaisse('0'); }}
                                                    onChange={(e) => { setRecetteCaisse(e.target.value); setHasInteracted(true); }}
                                                    className={`text-5xl md:text-6xl lg:text-7xl font-black bg-transparent text-[#4a3426] outline-none placeholder-[#e6dace] text-center md:text-right w-full md:w-auto min-w-[280px] ${isLocked ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}
                                                    placeholder="0"
                                                />
                                                <span className="text-xl md:text-2xl lg:text-3xl font-black text-[#c69f6e] shrink-0">DT</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* NEW: Offres Card (Detailed) */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-6 luxury-shadow border border-[#e6dace]/50 transition-all"
                        >
                            <div className="flex flex-col">
                                {/* Header / Summary View */}
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setIsOffresExpanded(!isOffresExpanded)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#c69f6e]/10 flex items-center justify-center text-[#c69f6e]">
                                            <Tag size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-[#4a3426] uppercase tracking-tight">Offres</h3>
                                            {!isOffresExpanded && (
                                                <div className="flex items-baseline gap-2 mt-1">
                                                    <span className="text-xl font-black text-[#4a3426]">{parseFloat(offres).toFixed(3)}</span>
                                                    <span className="text-xs font-bold text-[#c69f6e]">DT</span>
                                                </div>
                                            )}
                                            {isOffresExpanded && (
                                                <p className="text-[10px] font-black text-[#bba282] uppercase tracking-[0.2em]">Montant des offres (Informationnel)</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full transition-transform duration-300 ${isOffresExpanded ? 'rotate-180 bg-[#c69f6e]/10 text-[#c69f6e]' : 'text-[#bba282]'}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isOffresExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-6 border-t border-[#e6dace]/50 mt-4 space-y-4">
                                                <div
                                                    className="flex justify-between items-center bg-[#fcfaf8] p-3 rounded-2xl border border-[#e6dace]/50 hover:bg-[#f0faf5] hover:border-[#2d6a4f]/30 transition-all cursor-pointer group/total"
                                                    onClick={() => setShowHistoryModal({ isOpen: true, type: 'offres' })}
                                                >
                                                    <span className="text-xs font-black text-[#8c8279] uppercase tracking-widest pl-2 group-hover/total:text-[#2d6a4f]">Total Offres</span>
                                                    <span className="text-2xl font-black text-[#4a3426]">{parseFloat(offres).toFixed(3)} <span className="text-sm text-[#c69f6e]">DT</span></span>
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddOffre();
                                                        }}
                                                        disabled={isLocked}
                                                        className={`flex items-center gap-2 px-6 py-2 bg-white border border-[#e6dace] rounded-full text-[11px] font-bold uppercase tracking-widest text-[#c69f6e] shadow-sm hover:shadow-md hover:bg-[#fcfaf8] transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <Plus size={14} />
                                                        Ajouter Offre
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {offresList.map((offre, index) => (
                                                        <div key={index} className="flex flex-col md:flex-row items-center gap-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Nom du bénéficiaire"
                                                                value={offre.name ?? ''}
                                                                disabled={isLocked}
                                                                onChange={(e) => handleOffresChange(index, 'name', e.target.value)}
                                                                className={`flex-1 min-w-[120px] bg-white border border-[#e6dace] rounded-xl h-12 px-4 font-bold text-[#4a3426] outline-none focus:border-[#c69f6e] ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                            />
                                                            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                                                                <div className="relative w-full md:w-32 lg:w-44">
                                                                    <input
                                                                        type="number"
                                                                        step="0.001"
                                                                        value={offre.amount ?? ''}
                                                                        disabled={isLocked}
                                                                        onFocus={(e) => { if (offre.amount === '0') handleOffresChange(index, 'amount', ''); }}
                                                                        onBlur={(e) => { if (offre.amount === '') handleOffresChange(index, 'amount', '0'); }}
                                                                        onChange={(e) => handleOffresChange(index, 'amount', e.target.value)}
                                                                        className={`w-full bg-white border border-[#e6dace] rounded-xl h-12 pl-8 md:pl-8 pr-4 font-black text-lg outline-none focus:border-[#c69f6e] text-center ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                                    />
                                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#bba282] text-[10px] font-black">DT</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveOffre(index)}
                                                                    disabled={isLocked}
                                                                    className={`w-12 h-12 rounded-xl border border-red-200 text-red-300 hover:text-red-500 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {offresList.length === 0 && (
                                                        <div className="text-center py-6 text-[#8c8279] opacity-40 text-xs italic border border-dashed border-[#e6dace] rounded-2xl">
                                                            Aucune offre enregistrée
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.section>

                        {/* 1. Dépenses Fournisseur */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-[#4a3426] flex items-center gap-2">
                                    <div className="bg-[#4a3426] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</div>
                                    <span>Dépenses Fournisseur</span>
                                </h3>
                                <button
                                    onClick={() => {
                                        if (isLocked) return;
                                        setNewSupplierName('');
                                        setShowSupplierModal(true);
                                    }}
                                    className={`flex items-center gap-2 px-6 py-2 bg-white border border-[#e6dace] rounded-full text-[11px] font-bold uppercase tracking-widest text-[#c69f6e] shadow-sm hover:shadow-md hover:bg-[#fcfaf8] transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Plus size={14} />
                                    <span className="hidden xs:inline">Ajouter Fournisseur</span>
                                    <span className="xs:hidden">Fournisseur</span>
                                </button>
                            </div>

                            <section className="bg-white rounded-[2rem] p-6 luxury-shadow border border-[#e6dace]/50 space-y-4">
                                <div className="space-y-3">
                                    {expenses.map((expense, index) => (
                                        <div key={index} className={`group flex flex-col p-2 rounded-xl transition-all border ${expense.isFromFacturation ? 'bg-[#f0faf5]/50 border-[#d1e7dd]' : 'hover:bg-[#f9f6f2] border-transparent hover:border-[#e6dace]'}`}>
                                            <div className="flex flex-col md:flex-row items-center gap-2 w-full">
                                                <div className="w-full md:w-28 lg:w-36 xl:w-48 relative shrink-0">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        placeholder="0.000"
                                                        disabled={isLocked}
                                                        value={expense.amount ?? ''}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                        onFocus={(e) => { if (expense.amount === '0') handleDetailChange(index, 'amount', ''); }}
                                                        onChange={(e) => handleDetailChange(index, 'amount', e.target.value)}
                                                        className={`w-full bg-white border border-[#e6dace] rounded-xl h-14 pl-7 md:pl-6 pr-10 md:pr-10 xl:pr-16 font-black text-lg outline-none focus:border-[#c69f6e] text-center ${isLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    />
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#bba282] text-[9px] font-black">DT</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleRetenue(index, 'expense')}
                                                        className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 px-1.5 xl:px-3 rounded-lg text-[9px] xl:text-xs font-black transition-all ${expense.hasRetenue ? 'bg-orange-500 text-white shadow-lg' : 'bg-[#f4ece4] text-[#8c8279] hover:bg-[#e6dace]'} ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    >
                                                        1%
                                                    </button>
                                                </div>
                                                {/* BL/Facture Selector */}
                                                <div className="flex-1 w-full relative min-w-[100px]">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                        <Search className="text-[#bba282] cursor-pointer hover:text-[#c69f6e] transition-colors hidden xl:block" size={16} onClick={() => expense.supplier && setShowHistoryModal({ type: "supplier", targetName: expense.supplier })} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Fournisseur..."
                                                        value={expense.supplier ?? ''}
                                                        disabled={isLocked}
                                                        onFocus={() => {
                                                            setShowSupplierDropdown(index);
                                                            setSupplierSearch(expense.supplier);
                                                            setLastFocusedValue(expense.supplier);
                                                        }}
                                                        onBlur={() => setTimeout(() => setShowSupplierDropdown(null), 200)}
                                                        onChange={(e) => { handleDetailChange(index, 'supplier', e.target.value); setSupplierSearch(e.target.value); }}
                                                        className={`w-full bg-white border border-[#e6dace] rounded-xl h-12 xl:pl-12 pl-4 pr-10 focus:border-[#c69f6e] outline-none font-medium transition-all ${isLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (isLocked) return;
                                                            setShowSupplierDropdown(showSupplierDropdown === index ? null : index);
                                                        }}
                                                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#bba282] hover:text-[#c69f6e] transition-colors ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    >
                                                        <ChevronDown size={18} />
                                                    </button>
                                                    {showSupplierDropdown === index && (
                                                        <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-xl z-50 mt-1 max-h-48 overflow-y-auto border border-[#e6dace]">
                                                            {filteredSuppliers.map((s: any) => (
                                                                <div key={s.id} className="p-3 hover:bg-[#f9f6f2] cursor-pointer" onClick={() => { handleDetailChange(index, 'supplier', s.name); setShowSupplierDropdown(null); }}>
                                                                    {s.name}
                                                                </div>
                                                            ))}
                                                            {filteredSuppliers.length === 0 && supplierSearch && (
                                                                <div className="p-4 text-center text-[#bba282] text-xs italic">
                                                                    Aucun fournisseur trouvé
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex bg-[#f4ece4] p-1 rounded-xl gap-1 border border-[#e6dace]/50 shrink-0">
                                                    {['BL', 'Facture'].map((t) => (
                                                        <button
                                                            key={t}
                                                            type="button"
                                                            disabled={isLocked}
                                                            onClick={() => handleDetailChange(index, 'doc_type', t)}
                                                            className={`px-1.5 lg:px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${expense.doc_type === t ? (t === 'Facture' ? 'bg-[#3182ce]' : 'bg-[#e53e3e]') + ' text-white shadow-sm' : 'text-[#8c8279] hover:bg-white/50'} ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                        >
                                                            {t === 'Facture' ? 'Fact' : 'BL'}
                                                        </button>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setModalDetailsTarget({ index, type: 'expense' });
                                                        setTempDetails(expense.details || '');
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className={`h-12 xl:w-32 w-12 rounded-xl border flex items-center justify-center gap-2 transition-all shrink-0 ${expense.details ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]' : 'bg-[#fcfaf8] text-[#bba282] border-[#e6dace] hover:border-[#c69f6e] hover:text-[#c69f6e]'} ${isLocked && !expense.details ? 'cursor-not-allowed opacity-50' : ''}`}
                                                >
                                                    <FileText size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none hidden xl:inline">{expense.details ? 'Détails OK' : 'Détails'}</span>
                                                </button>


                                                <div className="flex items-center gap-1 w-full md:w-auto shrink-0 justify-end">
                                                    <div className="flex items-center gap-1">
                                                        {expense.invoices && expense.invoices.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setViewingInvoices(expense.invoices);
                                                                    setViewingInvoicesTarget({ index, type: 'expense' });
                                                                }}
                                                                className="h-12 w-12 flex items-center justify-center gap-2 rounded-xl bg-[#2d6a4f] text-white hover:bg-[#1f4b36] transition-all shadow-sm"
                                                            >
                                                                <Eye size={16} />
                                                                <span className="text-[10px] font-black">{expense.invoices.length}</span>
                                                            </button>
                                                        )}

                                                        {!isLocked && (
                                                            <label
                                                                className={`h-12 ${expense.invoices && expense.invoices.length > 0 ? 'w-12 text-blue-500 border-blue-200 hover:bg-blue-50' : 'w-12 xl:w-32 border-[#c69f6e]/30 text-[#c69f6e] hover:bg-[#c69f6e]/5 hover:border-[#c69f6e]'} rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all relative text-[10px]`}
                                                            >
                                                                <UploadCloud size={16} />
                                                                {(!expense.invoices || expense.invoices.length === 0) && <span className="font-black uppercase tracking-widest hidden xl:inline">Photo</span>}
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    accept="image/*,.pdf"
                                                                    className="hidden"
                                                                    onChange={(e) => handleFileUpload(index, e, 'invoice')}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-1">
                                                        {expense.paymentMethod === 'Chèque' && (
                                                            <>
                                                                <label
                                                                    onClick={(e) => {
                                                                        if (expense.photo_cheque) {
                                                                            setViewingInvoices([expense.photo_cheque]);
                                                                            e.preventDefault();
                                                                        }
                                                                    }}
                                                                    className={`h-12 w-12 xl:w-20 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors relative whitespace-nowrap text-[10px] ${expense.photo_cheque ? 'border-[#c69f6e] text-[#c69f6e] bg-[#c69f6e]/5' : 'border-red-200 text-red-300 hover:bg-red-50'}`}
                                                                >
                                                                    <UploadCloud size={14} />
                                                                    <span className="font-black uppercase tracking-widest hidden xl:inline">{expense.photo_cheque ? 'Recto' : 'Recto'}</span>
                                                                    <input type="file" accept="image/*,.pdf" disabled={isLocked} className="hidden" onChange={(e) => handleFileUpload(index, e, 'recto')} />
                                                                </label>
                                                                <label
                                                                    onClick={(e) => {
                                                                        if (expense.photo_verso) {
                                                                            setViewingInvoices([expense.photo_verso]);
                                                                            e.preventDefault();
                                                                        }
                                                                        if (isLocked) e.preventDefault();
                                                                    }}
                                                                    className={`h-12 w-12 xl:w-20 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors relative whitespace-nowrap text-[10px] ${expense.photo_verso ? 'border-[#c69f6e] text-[#c69f6e] bg-[#c69f6e]/5' : 'border-red-200 text-red-300 hover:bg-red-50'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <UploadCloud size={14} />
                                                                    <span className="font-black uppercase tracking-widest hidden xl:inline">{expense.photo_verso ? 'Verso' : 'Verso'}</span>
                                                                    <input type="file" accept="image/*,.pdf" disabled={isLocked} className="hidden" onChange={(e) => handleFileUpload(index, e, 'verso')} />
                                                                </label>
                                                            </>
                                                        )}

                                                        <div className="w-12 flex justify-center">
                                                            {(!isLocked || role === 'admin') && (
                                                                <button
                                                                    onClick={() => handleRemoveExpense(index)}
                                                                    className="h-12 w-12 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                                >
                                                                    <Trash2 size={20} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {expense.details && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                        animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                        onClick={() => {
                                                            setModalDetailsTarget({ index, type: 'expense' });
                                                            setTempDetails(expense.details);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="overflow-hidden w-full flex items-center gap-2 cursor-pointer hover:bg-[#fcfaf8]"
                                                    >
                                                        <div className="w-8 flex justify-center text-[#c69f6e]">
                                                            <Sparkles size={14} />
                                                        </div>
                                                        <span className="text-xs text-[#8c8279] font-medium italic">
                                                            {expense.details}
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleAddExpense}
                                    disabled={isLocked}
                                    className={`mt-4 w-full py-3 border-2 border-dashed border-[#e6dace] rounded-xl text-[#bba282] font-bold flex items-center justify-center gap-2 hover:border-[#c69f6e] hover:text-[#c69f6e] transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Plus size={18} /> Nouvelle Ligne
                                </button>
                                <div
                                    className="mt-4 p-4 bg-[#fcfaf8] rounded-2xl flex justify-between items-center border border-[#e6dace]/50 cursor-pointer hover:bg-[#f9f6f2] transition-colors"
                                    onClick={() => setShowHistoryModal({ type: 'supplier' })}
                                >
                                    <span className="text-xs font-black text-[#8c8279] uppercase tracking-widest">Total Dépenses Fournisseur</span>
                                    <span className="text-2xl font-black text-[#4a3426]">{totalExpensesDynamic.toFixed(3)} <span className="text-sm">DT</span></span>
                                </div>
                            </section>
                        </div>

                        {/* 3. Dépenses Divers */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-[#4a3426] flex items-center gap-2">
                                    <div className="bg-[#4a3426] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</div>
                                    <span>Dépenses divers</span>
                                </h3>
                                <button
                                    onClick={() => {
                                        if (isLocked) return;
                                        setShowDiversModal(true);
                                    }}
                                    className={`flex items-center gap-2 px-6 py-2 bg-white border border-[#e6dace] rounded-full text-[11px] font-bold uppercase tracking-widest text-[#c69f6e] shadow-sm hover:shadow-md hover:bg-[#fcfaf8] transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Plus size={14} />
                                    <span className="hidden xs:inline">Ajouter Divers</span>
                                    <span className="xs:hidden">Divers</span>
                                </button>
                            </div>

                            <section className="bg-white rounded-[2rem] p-6 luxury-shadow border border-[#e6dace]/50 space-y-4">
                                <div className="space-y-3">
                                    {expensesDivers.map((divers, index) => (
                                        <div key={index} className="group flex flex-col p-2 rounded-xl transition-all border hover:bg-[#f9f6f2] border-transparent hover:border-[#e6dace]">
                                            <div className="flex flex-col md:flex-row items-center gap-2 w-full">
                                                <div className="w-full md:w-28 lg:w-36 xl:w-48 relative shrink-0">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        placeholder="0.000"
                                                        value={divers.amount ?? ''}
                                                        disabled={isLocked}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                        onFocus={(e) => { if (divers.amount === '0') handleDiversChange(index, 'amount', ''); }}
                                                        onChange={(e) => handleDiversChange(index, 'amount', e.target.value)}
                                                        className={`w-full bg-white border border-[#e6dace] rounded-xl h-14 pl-7 md:pl-6 pr-10 md:pr-10 xl:pr-16 font-black text-lg outline-none focus:border-[#c69f6e] text-center ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    />
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#bba282] text-[9px] font-black">DT</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleRetenue(index, 'divers')}
                                                        className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 px-1.5 xl:px-3 rounded-lg text-[9px] xl:text-xs font-black transition-all ${divers.hasRetenue ? 'bg-orange-500 text-white shadow-lg' : 'bg-[#f4ece4] text-[#8c8279] hover:bg-[#e6dace]'} ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    >
                                                        1%
                                                    </button>
                                                </div>
                                                <div className="flex-1 w-full relative min-w-[100px]">
                                                    <input
                                                        type="text"
                                                        placeholder="Désignation Divers..."
                                                        value={divers.designation ?? ''}
                                                        disabled={isLocked}
                                                        onFocus={() => {
                                                            setShowDiversDropdown(index);
                                                            setDesignationSearch(divers.designation);
                                                        }}
                                                        onBlur={() => setTimeout(() => setShowDiversDropdown(null), 200)}
                                                        onChange={(e) => {
                                                            handleDiversChange(index, 'designation', e.target.value);
                                                            setDesignationSearch(e.target.value);
                                                        }}
                                                        className={`w-full bg-white border border-[#e6dace] rounded-xl h-12 pl-4 pr-10 focus:border-[#c69f6e] outline-none font-medium transition-all ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (isLocked) return;
                                                            setShowDiversDropdown(showDiversDropdown === index ? null : index);
                                                        }}
                                                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#bba282] hover:text-[#c69f6e] transition-colors ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    >
                                                        <ChevronDown size={18} />
                                                    </button>
                                                    {showDiversDropdown === index && (
                                                        <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-xl z-50 mt-1 max-h-48 overflow-y-auto border border-[#e6dace]">
                                                            {commonDesignations
                                                                .filter((d: string) => d.toLowerCase().includes(designationSearch.toLowerCase()))
                                                                .map((d: string) => (
                                                                    <div
                                                                        key={d}
                                                                        className="p-3 hover:bg-[#f9f6f2] cursor-pointer font-medium text-[#4a3426] text-sm"
                                                                        onClick={() => {
                                                                            handleDiversChange(index, 'designation', d);
                                                                            setShowDiversDropdown(null);
                                                                        }}
                                                                    >
                                                                        {d}
                                                                    </div>
                                                                ))
                                                            }
                                                            {commonDesignations.filter((d: string) => d.toLowerCase().includes(designationSearch.toLowerCase())).length === 0 && designationSearch && (
                                                                <div className="p-4 text-center text-[#bba282] text-xs italic">
                                                                    Aucune désignation trouvée
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex bg-[#f4ece4] p-1 rounded-xl gap-1 border border-[#e6dace]/50 shrink-0">
                                                    {['BL', 'Facture'].map((t) => (
                                                        <button
                                                            key={t}
                                                            type="button"
                                                            disabled={isLocked}
                                                            onClick={() => handleDiversChange(index, 'doc_type', t)}
                                                            className={`px-1.5 lg:px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${divers.doc_type === t ? (t === 'Facture' ? 'bg-[#3182ce]' : 'bg-[#e53e3e]') + ' text-white shadow-sm' : 'text-[#8c8279] hover:bg-white/50'} ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                        >
                                                            {t === 'Facture' ? 'Fact' : 'BL'}
                                                        </button>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setModalDetailsTarget({ index, type: 'divers' });
                                                        setTempDetails(divers.details || '');
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className={`h-12 xl:w-32 w-12 rounded-xl border flex items-center justify-center gap-2 transition-all shrink-0 ${divers.details ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]' : 'bg-[#fcfaf8] text-[#bba282] border-[#e6dace] hover:border-[#c69f6e] hover:text-[#c69f6e]'} ${isLocked && !divers.details ? 'cursor-not-allowed opacity-50' : ''}`}
                                                >
                                                    <FileText size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none hidden xl:inline">{divers.details ? 'Détails OK' : 'Détails'}</span>
                                                </button>


                                                <div className="flex items-center gap-1 w-full md:w-auto shrink-0 justify-end">
                                                    <div className="flex items-center gap-1">
                                                        {divers.invoices && divers.invoices.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setViewingInvoices(divers.invoices);
                                                                    setViewingInvoicesTarget({ index, type: 'divers' });
                                                                }}
                                                                className="h-12 w-12 flex items-center justify-center gap-2 rounded-xl bg-[#2d6a4f] text-white hover:bg-[#1f4b36] transition-all shadow-sm"
                                                            >
                                                                <Eye size={16} />
                                                                <span className="text-[10px] font-black">{divers.invoices.length}</span>
                                                            </button>
                                                        )}

                                                        {!isLocked && (
                                                            <label
                                                                className={`h-12 ${divers.invoices && divers.invoices.length > 0 ? 'w-12 text-blue-500 border-blue-200 hover:bg-blue-50' : 'w-12 xl:w-32 border-[#c69f6e]/30 text-[#c69f6e] hover:bg-[#c69f6e]/5 hover:border-[#c69f6e]'} rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all relative text-[10px]`}
                                                            >
                                                                <UploadCloud size={16} />
                                                                {(!divers.invoices || divers.invoices.length === 0) && <span className="font-black uppercase tracking-widest hidden xl:inline">Photo</span>}
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    accept="image/*,.pdf"
                                                                    className="hidden"
                                                                    onChange={(e) => handleFileUpload(index, e, 'invoice', true)}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                    <div className="w-12 flex justify-center">
                                                        {(!isLocked || role === 'admin') && (
                                                            <button onClick={() => handleRemoveDivers(index)} className="h-12 w-12 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                                <Trash2 size={20} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {divers.details && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                        animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                        onClick={() => {
                                                            setModalDetailsTarget({ index, type: 'divers' });
                                                            setTempDetails(divers.details);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="overflow-hidden w-full flex items-center gap-2 cursor-pointer hover:bg-[#fcfaf8]"
                                                    >
                                                        <div className="w-8 flex justify-center text-[#c69f6e]">
                                                            <Sparkles size={14} />
                                                        </div>
                                                        <span className="text-xs text-[#8c8279] font-medium italic">
                                                            {divers.details}
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleAddDivers()}
                                    disabled={isLocked}
                                    className={`mt-4 w-full py-3 border-2 border-dashed border-[#e6dace] rounded-xl text-[#bba282] font-bold flex items-center justify-center gap-2 hover:border-[#c69f6e] hover:text-[#c69f6e] transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Plus size={18} /> Nouvelle Ligne (Divers)
                                </button>
                                <div className="mt-4 p-4 bg-[#fcfaf8] rounded-2xl flex justify-between items-center border border-[#e6dace]/50">
                                    <span className="text-xs font-black text-[#8c8279] uppercase tracking-widest">Total Dépenses Divers</span>
                                    <span className="text-2xl font-black text-[#4a3426]">{totalExpensesDivers.toFixed(3)} <span className="text-sm">DT</span></span>
                                </div>
                            </section>
                        </div>

                        {/* 3. Fixes Grid */}
                        {/* 4. Dépenses Administratif */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-[#4a3426] flex items-center gap-2">
                                    <div className="bg-[#4a3426] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</div>
                                    <span>Dépenses Administratif</span>
                                </h3>
                            </div>

                            <section className="bg-white rounded-[2rem] p-6 luxury-shadow border border-[#e6dace]/50 space-y-4">
                                <div className="space-y-3">
                                    {expensesAdmin.map((admin, index) => (
                                        <div key={index} className="group flex flex-col p-2 rounded-xl transition-all border hover:bg-[#f9f6f2] border-transparent hover:border-[#e6dace]">
                                            <div className="flex flex-col md:flex-row items-center gap-3 w-full">
                                                <div className="w-full md:w-32 lg:w-48 relative shrink-0">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        placeholder="0.000"
                                                        value={admin.amount ?? ''}
                                                        disabled={isLocked}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                        onFocus={(e) => { if (admin.amount === '0') handleAdminChange(index, 'amount', ''); }}
                                                        onChange={(e) => handleAdminChange(index, 'amount', e.target.value)}
                                                        className={`w-full bg-white border border-[#e6dace] rounded-xl h-14 pl-8 md:pl-8 pr-4 lg:pr-4 font-black text-lg outline-none focus:border-[#c69f6e] text-center ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    />
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#bba282] text-[10px] font-black">DT</span>
                                                </div>

                                                <div className="flex-1 w-full relative min-w-[120px]">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                        <Users
                                                            className="text-[#bba282] cursor-pointer hover:text-[#c69f6e] transition-colors"
                                                            size={16}
                                                            onClick={() => admin.designation && setShowHistoryModal({ type: 'admin', targetName: admin.designation })}
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={admin.designation ?? ''}
                                                        readOnly
                                                        className="w-full bg-[#f9f6f2] border border-[#e6dace] rounded-xl h-12 pl-10 pr-4 outline-none font-bold text-[#4a3426] opacity-70 cursor-not-allowed"
                                                    />
                                                </div>

                                                <div className="hidden md:flex items-center gap-2 lg:gap-4 shrink-0">
                                                    <div className="w-8 lg:w-32"></div> {/* Spacing for Détails button */}
                                                    <div className="w-8 lg:w-24"></div> {/* Spacing for Reçu button */}
                                                    <div className="w-12"></div> {/* Spacing for Trash button */}
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-4 bg-[#fcfaf8] rounded-2xl flex justify-between items-center border border-[#e6dace]/50">
                                    <span className="text-xs font-black text-[#8c8279] uppercase tracking-widest">Total Dépenses Administratif</span>
                                    <span className="text-2xl font-black text-[#4a3426]">{totalExpensesAdmin.toFixed(3)} <span className="text-sm">DT</span></span>
                                </div>
                            </section>
                        </div>
                        {/* Employee Related Actions Section */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-[#4a3426] flex items-center gap-2">
                                <div className="bg-[#4a3426] text-white w-8 h-8 rounded-full flex items-center justify-center text-xs">3</div>
                                Personnels
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowEmployeeList(true)}
                                    className="flex items-center gap-2 px-6 py-2 bg-white border border-[#e6dace] rounded-full text-[11px] font-bold uppercase tracking-widest text-[#8c8279] shadow-sm hover:shadow-md hover:bg-[#fcfaf8] transition-all"
                                >
                                    <List size={14} />
                                    Liste
                                </button>
                                <button
                                    onClick={() => {
                                        if (isLocked) return;
                                        setNewEmployeeModalName('');
                                        setShowEmployeeModal(true);
                                    }}
                                    className={`flex items-center gap-2 px-6 py-2 bg-white border border-[#e6dace] rounded-full text-[11px] font-bold uppercase tracking-widest text-[#c69f6e] shadow-sm hover:shadow-md hover:bg-[#fcfaf8] transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Plus size={14} />
                                    <span className="hidden xs:inline">Ajouter Employé</span>
                                    <span className="xs:hidden">Employé</span>
                                </button>
                            </div>
                        </div>

                        {/* 3. Fixes Grid (2x2) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 2.2 Accompte */}
                            <div className="bg-white rounded-[2rem] p-6 luxury-shadow relative overflow-hidden border border-[#e6dace]/50">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="cursor-pointer group/title"
                                            onClick={() => setShowHistoryModal({ type: 'avance' })}
                                        >
                                            <h4 className="font-bold text-[#4a3426] text-xs uppercase tracking-wider group-hover/title:text-[#c69f6e] transition-colors">ACCOMPTE</h4>
                                            <p className="text-[9px] font-bold text-[#8c8279] uppercase tracking-tighter opacity-70">Avances sur salaires</p>
                                        </div>
                                        <button
                                            disabled={isLocked}
                                            onClick={() => setShowEntryModal({ type: 'avance' })}
                                            className="text-[#c69f6e] hover:scale-110 transition-transform disabled:opacity-30"
                                        >
                                            <PlusCircle size={22} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                    <span
                                        className="bg-[#f4ece4] text-[#4a3426] px-4 py-2 rounded-2xl font-black text-xl cursor-pointer hover:bg-[#e6dace] transition-colors"
                                        onClick={() => setShowHistoryModal({ type: 'avance' })}
                                    >
                                        {acompte.toFixed(3)} <span className="text-xs">DT</span>
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-[#4a3426]">
                                    {avancesList.length > 0 ? avancesList.map((a, i) => (
                                        <div key={i} className="flex justify-between p-3 bg-[#f9f6f2] rounded-2xl items-center group">
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col">
                                                    <span
                                                        className="font-bold text-[#4a3426] cursor-pointer hover:text-[#c69f6e] transition-colors"
                                                        onClick={() => setShowHistoryModal({ type: 'avance', targetName: a.username })}
                                                    >
                                                        {a.username}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {formatDisplayTime(a.created_at) && (
                                                            <div className="flex items-center gap-1 opacity-60">
                                                                <Clock size={10} className="text-[#a67c52]" />
                                                                <span className="text-[9px] font-bold text-[#8c8279]">
                                                                    {formatDisplayTime(a.created_at)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {getDepartment(a.username) && (
                                                            <span className="text-[10px] font-black text-[#8c8279] uppercase tracking-wider bg-[#f4ece4] px-2 py-0.5 rounded-lg border border-[#e6dace]/50">
                                                                {getDepartment(a.username)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <b className="font-black text-[#4a3426]">{parseFloat(a.montant).toFixed(3)}</b>
                                                {!isLocked && (
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => setShowEntryModal({ type: 'avance', data: a })}
                                                            className="text-[#c69f6e] hover:text-[#4a3426] transition-colors"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => a.id && handleDeleteEntry('avance', a.id)}
                                                            className="text-red-300 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center py-4 text-[#8c8279] italic opacity-50">Aucune avance</p>
                                    )}
                                </div>
                            </div>

                            {/* 2.3 Doublage */}
                            <div className="bg-white rounded-[2rem] p-6 luxury-shadow relative overflow-hidden border border-[#e6dace]/50">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="cursor-pointer group/title"
                                            onClick={() => setShowHistoryModal({ type: 'doublage' })}
                                        >
                                            <h4 className="font-bold text-[#4a3426] text-xs uppercase tracking-wider group-hover/title:text-[#c69f6e] transition-colors">DOUBLAGE</h4>
                                            <p className="text-[9px] font-bold text-[#8c8279] uppercase tracking-tighter opacity-70">Heures supplémentaires</p>
                                        </div>
                                        <button
                                            disabled={isLocked}
                                            onClick={() => setShowEntryModal({ type: 'doublage' })}
                                            className="text-[#c69f6e] hover:scale-110 transition-transform disabled:opacity-30"
                                        >
                                            <PlusCircle size={22} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                    <span
                                        className="bg-[#f4ece4] text-[#4a3426] px-4 py-2 rounded-2xl font-black text-xl cursor-pointer hover:bg-[#e6dace] transition-colors"
                                        onClick={() => setShowHistoryModal({ type: 'doublage' })}
                                    >
                                        {doublage.toFixed(3)} <span className="text-xs">DT</span>
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-[#4a3426]">
                                    {doublagesList.length > 0 ? doublagesList.map((a, i) => (
                                        <div key={i} className="flex justify-between p-3 bg-[#f9f6f2] rounded-2xl items-center group">
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col">
                                                    <span
                                                        className="font-bold text-[#4a3426] cursor-pointer hover:text-[#c69f6e] transition-colors"
                                                        onClick={() => setShowHistoryModal({ type: 'doublage', targetName: a.username })}
                                                    >
                                                        {a.username}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {formatDisplayTime(a.created_at) && (
                                                            <div className="flex items-center gap-1 opacity-60">
                                                                <Clock size={10} className="text-[#a67c52]" />
                                                                <span className="text-[9px] font-bold text-[#8c8279]">
                                                                    {formatDisplayTime(a.created_at)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {getDepartment(a.username) && (
                                                            <span className="text-[10px] font-black text-[#8c8279] uppercase tracking-wider bg-[#f4ece4] px-2 py-0.5 rounded-lg border border-[#e6dace]/50">
                                                                {getDepartment(a.username)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <b className="font-black text-[#4a3426]">{parseFloat(a.montant).toFixed(3)}</b>
                                                {!isLocked && (
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => setShowEntryModal({ type: 'doublage', data: a })}
                                                            className="text-[#c69f6e] hover:text-[#4a3426] transition-colors"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => a.id && handleDeleteEntry('doublage', a.id)}
                                                            className="text-red-300 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center py-4 text-[#8c8279] italic opacity-50">Aucun doublage</p>
                                    )}
                                </div>
                            </div>

                            {/* 2.4 Extra */}
                            <div className="bg-white rounded-[2rem] p-6 luxury-shadow relative overflow-hidden border border-[#e6dace]/50">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <Zap size={16} className="text-[#c69f6e]" />
                                        <div
                                            className="cursor-pointer group/title"
                                            onClick={() => setShowHistoryModal({ type: 'extra' })}
                                        >
                                            <h4 className="font-bold text-[#4a3426] text-xs uppercase tracking-wider group-hover/title:text-[#c69f6e] transition-colors">EXTRA</h4>
                                            <p className="text-[9px] font-bold text-[#8c8279] uppercase tracking-tighter opacity-70">Main d'œuvre occasionnelle</p>
                                        </div>
                                        <button
                                            disabled={isLocked}
                                            onClick={() => setShowEntryModal({ type: 'extra' })}
                                            className="text-[#c69f6e] hover:scale-110 transition-transform disabled:opacity-30"
                                        >
                                            <PlusCircle size={22} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                    <span
                                        className="bg-[#f4ece4] text-[#4a3426] px-4 py-2 rounded-2xl font-black text-xl cursor-pointer hover:bg-[#e6dace] transition-colors"
                                        onClick={() => setShowHistoryModal({ type: 'extra' })}
                                    >
                                        {extraTotal.toFixed(3)} <span className="text-xs">DT</span>
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-[#4a3426]">
                                    {extrasList.length > 0 ? extrasList.map((a, i) => (
                                        <div key={i} className="flex justify-between p-3 bg-[#f9f6f2] rounded-2xl items-center group">
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col">
                                                    <span
                                                        className="font-bold text-[#4a3426] cursor-pointer hover:text-[#c69f6e] transition-colors"
                                                        onClick={() => setShowHistoryModal({ type: 'extra', targetName: a.username })}
                                                    >
                                                        {a.username}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {formatDisplayTime(a.created_at) && (
                                                            <div className="flex items-center gap-1 opacity-60">
                                                                <Clock size={10} className="text-[#a67c52]" />
                                                                <span className="text-[9px] font-bold text-[#8c8279]">
                                                                    {formatDisplayTime(a.created_at)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {getDepartment(a.username) && (
                                                            <span className="text-[10px] font-black text-[#8c8279] uppercase tracking-wider bg-[#f4ece4] px-2 py-0.5 rounded-lg border border-[#e6dace]/50">
                                                                {getDepartment(a.username)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <b className="font-black text-[#4a3426]">{parseFloat(a.montant).toFixed(3)}</b>
                                                {!isLocked && (
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => setShowEntryModal({ type: 'extra', data: a })}
                                                            className="text-[#c69f6e] hover:text-[#4a3426] transition-colors"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => a.id && handleDeleteEntry('extra', a.id)}
                                                            className="text-red-300 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center py-4 text-[#8c8279] italic opacity-50">Aucun extra</p>
                                    )}
                                </div>
                            </div>

                            {/* 2.5 Primes */}
                            <div className="bg-white rounded-[2rem] p-6 luxury-shadow relative overflow-hidden border border-[#e6dace]/50">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <Sparkles size={16} className="text-[#2d6a4f]" />
                                        <div
                                            className="cursor-pointer group/title"
                                            onClick={() => setShowHistoryModal({ type: 'prime' })}
                                        >
                                            <h4 className="font-bold text-[#4a3426] text-xs uppercase tracking-wider group-hover/title:text-[#c69f6e] transition-colors">PRIMES</h4>
                                            <p className="text-[9px] font-bold text-[#8c8279] uppercase tracking-tighter opacity-70">Récompenses & bonus</p>
                                        </div>
                                        <button
                                            disabled={isLocked}
                                            onClick={() => setShowEntryModal({ type: 'prime' })}
                                            className="text-[#c69f6e] hover:scale-110 transition-transform disabled:opacity-30"
                                        >
                                            <PlusCircle size={22} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                    <span
                                        className="bg-[#f1f8f4] text-[#2d6a4f] px-4 py-2 rounded-2xl font-black text-xl cursor-pointer hover:bg-[#d8e9df] transition-colors"
                                        onClick={() => setShowHistoryModal({ type: 'prime' })}
                                    >
                                        {primesTotal.toFixed(3)} <span className="text-xs">DT</span>
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-[#4a3426]">
                                    {primesList.length > 0 ? primesList.map((p, i) => (
                                        <div key={i} className="flex justify-between p-3 bg-[#f9f6f2] rounded-2xl items-center group">
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col">
                                                    <span
                                                        className="font-bold text-[#4a3426] cursor-pointer hover:text-[#c69f6e] transition-colors"
                                                        onClick={() => setShowHistoryModal({ type: 'prime', targetName: p.username })}
                                                    >
                                                        {p.username}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {formatDisplayTime(p.created_at) && (
                                                            <div className="flex items-center gap-1 opacity-60">
                                                                <Clock size={10} className="text-[#a67c52]" />
                                                                <span className="text-[9px] font-bold text-[#8c8279]">
                                                                    {formatDisplayTime(p.created_at)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {getDepartment(p.username) && (
                                                            <span className="text-[10px] font-black text-[#8c8279] uppercase tracking-wider bg-[#f4ece4] px-2 py-0.5 rounded-lg border border-[#e6dace]/50">
                                                                {getDepartment(p.username)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <b className="font-black text-[#4a3426]">{parseFloat(p.montant).toFixed(3)}</b>
                                                {!isLocked && (
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => setShowEntryModal({ type: 'prime', data: p })}
                                                            className="text-[#c69f6e] hover:text-[#4a3426] transition-colors"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => p.id && handleDeleteEntry('prime', p.id)}
                                                            className="text-red-300 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center py-4 text-[#8c8279] italic opacity-50">Aucune prime</p>
                                    )}
                                </div>
                            </div>

                            {/* 2.6 Restes Salaires */}
                            <div className="bg-white rounded-[2rem] p-6 luxury-shadow relative overflow-hidden border border-[#e6dace]/50">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <Wallet size={16} className="text-[#a67c52]" />
                                        <div
                                            className="cursor-pointer group/title"
                                            onClick={() => setShowHistoryModal({ type: 'restes_salaires' })}
                                        >
                                            <h4 className="font-bold text-[#4a3426] text-xs uppercase tracking-wider group-hover/title:text-[#c69f6e] transition-colors">RESTES SALAIRES</h4>
                                            <p className="text-[9px] font-bold text-[#8c8279] uppercase tracking-tighter opacity-70">Salaires</p>
                                        </div>
                                        <button
                                            disabled={isLocked}
                                            onClick={() => setShowEntryModal({ type: 'restes_salaires' })}
                                            className="text-[#c69f6e] hover:scale-110 transition-transform disabled:opacity-30"
                                        >
                                            <PlusCircle size={22} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                    <span
                                        className="bg-[#f2efe9] text-[#a67c52] px-4 py-2 rounded-2xl font-black text-xl cursor-pointer hover:bg-[#e6dace] transition-colors"
                                        onClick={() => setShowHistoryModal({ type: 'restes_salaires' })}
                                    >
                                        {restesSalairesList.reduce((acc, curr) => acc + (parseFloat(curr.montant) || 0), 0).toFixed(3)} <span className="text-xs">DT</span>
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-[#4a3426]">
                                    {restesSalairesList.length > 0 ? restesSalairesList.map((p, i) => (
                                        <div key={i} className="flex justify-between p-3 bg-[#f9f6f2] rounded-2xl items-center group">
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col">
                                                    <span
                                                        className="font-bold text-[#4a3426] cursor-pointer hover:text-[#c69f6e] transition-colors"
                                                        onClick={() => setShowHistoryModal({ type: 'restes_salaires', targetName: p.username })}
                                                    >
                                                        {p.username}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {formatDisplayTime(p.created_at) && (
                                                            <div className="flex items-center gap-1">
                                                                <Clock size={10} className="text-[#a67c52]" />
                                                                <span className="text-[9px] font-bold text-[#8c8279]">
                                                                    {formatDisplayTime(p.created_at)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {getDepartment(p.username) && (
                                                            <span className="text-[9px] font-black text-[#8c8279] uppercase tracking-wider bg-[#f4ece4] px-1.5 py-0.5 rounded-md border border-[#e6dace]/50">
                                                                {getDepartment(p.username)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {p.nb_jours && p.nb_jours > 0 && <span className="text-[10px] font-bold text-[#8c8279] bg-white px-2 py-1 rounded-lg border border-[#e6dace]/50">{p.nb_jours}j</span>}
                                                <b className="font-black text-[#4a3426]">{parseFloat(p.montant).toFixed(3)}</b>
                                                {!isLocked && (
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => setShowEntryModal({ type: 'restes_salaires', data: p })}
                                                            className="text-[#c69f6e] hover:text-[#4a3426] transition-colors"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => p.id && handleDeleteEntry('restes_salaires', p.id)}
                                                            className="text-red-300 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center py-4 text-[#8c8279] italic opacity-50">Aucun reste salaire</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 4. TOTALS & RÉPARTITION SUMMARY BOX */}
                        <div className="bg-[#1b4332] rounded-[2.5rem] luxury-shadow relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-32 -mb-32"></div>

                            {/* Totals Row */}
                            <div className="p-8 border-b border-white/10 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-1 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                                        <div className="flex items-center gap-2 opacity-70 mb-2 text-white">
                                            <Calculator size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Total Dépenses</span>
                                            <button
                                                onClick={() => setHideRecetteCaisse(!hideRecetteCaisse)}
                                                className="ml-auto p-1 hover:bg-white/10 rounded-full transition-colors"
                                            >
                                                {hideRecetteCaisse ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                        <div className="flex items-baseline gap-3 text-white mt-1">
                                            {hideRecetteCaisse ? (
                                                <span className="text-5xl md:text-6xl font-black tracking-tighter">********</span>
                                            ) : (
                                                <span className="text-5xl md:text-6xl font-black tracking-tighter">{totalExpenses.toFixed(3)}</span>
                                            )}
                                            <span className="text-xl md:text-2xl font-medium opacity-50 uppercase">DT</span>
                                        </div>
                                        {!hideRecetteCaisse && (
                                            <div className="text-[10px] md:text-xs opacity-40 mt-1 text-white">
                                                (Fournisseurs: {totalExpensesDynamic.toFixed(3)} + Divers: {totalExpensesDivers.toFixed(3)} + Admin: {totalExpensesAdmin.toFixed(3)} + Fixes: {(acompte + doublage + extraTotal + primesTotal + restesSalairesList.reduce((acc, curr) => acc + (parseFloat(curr.montant) || 0), 0)).toFixed(3)})
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 md:pt-0 md:pl-4">
                                        <div className="flex items-center gap-2 opacity-70 mb-2 text-white">
                                            <TrendingUp size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Recette Nette</span>
                                        </div>
                                        <div className="flex items-baseline gap-3 mt-1">
                                            {hideRecetteCaisse ? (
                                                <span className={`text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[#c69f6e]`}>
                                                    ********
                                                </span>
                                            ) : (
                                                <span className={`text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter transition-all duration-500 ${recetteNett >= 0 ? 'text-[#c69f6e]' : 'text-red-400'}`}>
                                                    {recetteNett.toFixed(3)}
                                                </span>
                                            )}
                                            <span className="text-2xl md:text-3xl font-medium opacity-50 text-white uppercase font-black">DT</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Répartition Section */}
                            <div className="p-8 pt-6 relative z-10">
                                <h3 className="font-black text-white/80 mb-6 flex items-center gap-3 uppercase text-xs tracking-[0.2em]">
                                    <Receipt size={16} /> Répartition Finale
                                    <button
                                        onClick={() => setHideRecetteCaisse(!hideRecetteCaisse)}
                                        className="ml-auto p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        {hideRecetteCaisse ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </h3>

                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="flex flex-col gap-4 w-full lg:w-1/4">
                                        {[
                                            { label: 'TPE 1', icon: CreditCard, val: tpe, set: setTpe },
                                            { label: 'TPE 2', icon: CreditCard, val: tpe2, set: setTpe2 },
                                        ].map((m, i) => (
                                            <div key={i} className="relative">
                                                <label className="text-xs font-black uppercase tracking-[0.15em] text-white/50 ml-2 mb-2 block">{m.label}</label>
                                                <div className="relative">
                                                    <m.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                                    {hideRecetteCaisse ? (
                                                        <div className="w-full h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-2xl text-white">
                                                            ********
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            disabled={isLocked}
                                                            value={m.val ?? ''}
                                                            onWheel={(e) => e.currentTarget.blur()}
                                                            onFocus={(e) => { if (m.val === '0') m.set(''); }}
                                                            onBlur={(e) => { if (e.target.value === '' || e.target.value === null) m.set('0'); }}
                                                            onChange={(e) => { m.set(e.target.value); setHasInteracted(true); }}
                                                            className={`w-full h-20 rounded-2xl pl-11 pr-3 font-black text-2xl md:text-3xl text-white outline-none transition-all shadow-inner ${isLocked ? 'bg-white/20 border-white/30 cursor-not-allowed' : 'bg-white/10 border border-white/10 focus:bg-white/20 focus:border-white/40'}`}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:w-3/4">
                                        {[
                                            { label: 'Espèces', icon: Coins, val: especes, set: setEspeces },
                                            { label: 'Chèque', icon: Wallet, val: cheque, set: setCheque },
                                            { label: 'Ticket Restaurant', icon: Receipt, val: ticketsRestaurant, set: setTicketsRestaurant }
                                        ].map((m, i) => (
                                            <div key={i} className="relative">
                                                <label className="text-xs font-black uppercase tracking-[0.15em] text-white/50 ml-2 mb-2 block">{m.label}</label>
                                                <div className="relative">
                                                    <m.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                                    {hideRecetteCaisse ? (
                                                        <div className="w-full h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-2xl text-white">
                                                            ********
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            disabled={m.label === 'Espèces' || isLocked}
                                                            value={m.val ?? ''}
                                                            onWheel={(e) => e.currentTarget.blur()}
                                                            onFocus={(e) => { if (m.val === '0') m.set(''); }}
                                                            onBlur={(e) => { if (e.target.value === '' || e.target.value === null) m.set('0'); }}
                                                            onChange={(e) => { m.set(e.target.value); setHasInteracted(true); }}
                                                            className={`w-full h-20 rounded-2xl pl-11 pr-3 font-black text-2xl md:text-3xl text-white outline-none transition-all shadow-inner ${(m.label === 'Espèces' || isLocked) ? 'bg-white/20 border-white/30 cursor-not-allowed' : 'bg-white/10 border border-white/10 focus:bg-white/20 focus:border-white/40'}`}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div >

                        {/* Centered Save Button (Integrated in content) */}
                        < div className="flex flex-col items-center gap-4 pt-8" >
                            {isLocked && (
                                <div className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-bold animate-pulse">
                                    <LockIcon size={18} />
                                    Cette session est clôturée et verrouillée
                                </div>
                            )
                            }
                            <div className="flex gap-4 w-full max-w-md">
                                {isLocked && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await unlockChiffre({ variables: { date } });
                                                setToast({ msg: 'Session déverrouillée', type: 'success' });
                                                setTimeout(() => setToast(null), 3000);
                                                refetchChiffre();
                                            } catch (e) {
                                                setToast({ msg: 'Échec du déverrouillage', type: 'error' });
                                                setTimeout(() => setToast(null), 3000);
                                            }
                                        }}
                                        disabled={unlocking}
                                        className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-8 py-5 rounded-[2.5rem] flex items-center gap-3 font-black text-lg transition-all border border-white/20 shadow-xl"
                                    >
                                        {unlocking ? <Loader2 className="animate-spin" /> : <UnlockIcon size={24} />} Déverrouiller
                                    </button>
                                )}
                                <button
                                    onClick={handleSave}
                                    className={`${isLocked ? 'bg-gray-500/50 opacity-50 hover:bg-red-500' : 'gold-gradient'} text-white px-12 py-5 rounded-[2.5rem] shadow-2xl shadow-[#c69f6e]/30 flex items-center gap-3 font-black text-xl hover:scale-105 active:scale-95 transition-all flex-1 justify-center border border-white/20`}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : (isLocked ? <LockIcon size={24} /> : <Save size={24} />)}
                                    {isLocked ? 'Session Clôturée' : 'Enregistrer la Session'}
                                </button>
                            </div>
                        </div>
                    </div>
                </main >
            </div >

            {/* Toast */}
            <AnimatePresence>
                {
                    toast && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-6 left-0 right-0 mx-auto w-max z-50 px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-[#2d6a4f] text-white' : 'bg-red-600 text-white'}`}>{toast.msg}</motion.div>
                    )
                }
            </AnimatePresence >

            {/* Image Modal - Same style as facturation page */}
            <AnimatePresence>
                {
                    viewingInvoices && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 overflow-y-auto no-scrollbar"
                            onClick={() => { setViewingInvoices(null); setViewingInvoicesTarget(null); setSelectedInvoiceIndex('all'); resetView(); }}
                        >
                            <div className="w-full max-w-6xl space-y-8 py-10" onClick={e => e.stopPropagation()}>
                                {/* Header */}
                                <div className="flex justify-between items-center text-white mb-4">
                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-4">
                                            <Receipt size={32} className="text-[#c69f6e]" /> Reçus & Factures
                                        </h2>
                                        <p className="text-sm font-bold opacity-60 uppercase tracking-[0.3em]">{viewingInvoices.length} document{viewingInvoices.length > 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* Add Photo Button */}
                                        {viewingInvoicesTarget && (
                                            <label className={`flex items-center gap-3 px-6 py-3 ${isLocked && role !== 'admin' ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-[#2d6a4f] hover:bg-[#1b4332] cursor-pointer'} text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all`}>
                                                <Plus size={18} /> Ajouter Photo
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*,.pdf"
                                                    disabled={isLocked && role !== 'admin'}
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const files = e.target.files;
                                                        if (!files) return;
                                                        const loaders = Array.from(files).map(file => {
                                                            return new Promise<string>((resolve) => {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => resolve(reader.result as string);
                                                                reader.readAsDataURL(file);
                                                            });
                                                        });
                                                        const base64s = await Promise.all(loaders);

                                                        if (viewingInvoicesTarget.type === 'divers') {
                                                            const newDivers = [...expensesDivers];
                                                            const currentInvoices = newDivers[viewingInvoicesTarget.index].invoices || [];
                                                            newDivers[viewingInvoicesTarget.index].invoices = [...currentInvoices, ...base64s];
                                                            setExpensesDivers(newDivers);
                                                            setViewingInvoices(newDivers[viewingInvoicesTarget.index].invoices);
                                                        } else {
                                                            const newExpenses = [...expenses];
                                                            const currentInvoices = newExpenses[viewingInvoicesTarget.index].invoices || [];
                                                            newExpenses[viewingInvoicesTarget.index].invoices = [...currentInvoices, ...base64s];
                                                            setExpenses(newExpenses);
                                                            setViewingInvoices(newExpenses[viewingInvoicesTarget.index].invoices);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}
                                        {/* Zoom Controls */}
                                        <div className="flex bg-white/10 rounded-2xl p-1 gap-1 border border-white/10">
                                            <button onClick={() => setImgZoom(prev => Math.max(0.5, prev - 0.25))} className="w-10 h-10 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all text-white" title="Zoom Arrière"><ZoomOut size={20} /></button>
                                            <div className="w-16 flex items-center justify-center font-black text-xs tabular-nums text-[#c69f6e]">{Math.round(imgZoom * 100)}%</div>
                                            <button onClick={() => setImgZoom(prev => Math.min(4, prev + 0.25))} className="w-10 h-10 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all text-white" title="Zoom Avant"><ZoomIn size={20} /></button>
                                            <div className="w-px h-6 bg-white/10 self-center mx-1"></div>
                                            <button onClick={() => setImgRotation(prev => prev + 90)} className="w-10 h-10 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all text-white" title="Tourner"><RotateCcw size={20} /></button>
                                            <button onClick={resetView} className="w-10 h-10 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all text-white" title="Réinitialiser"><Maximize2 size={20} /></button>
                                        </div>
                                        {/* Close Button */}
                                        <button onClick={() => { setViewingInvoices(null); setViewingInvoicesTarget(null); setSelectedInvoiceIndex('all'); resetView(); }} className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all text-white"><X size={32} /></button>
                                    </div>
                                </div>

                                {/* Photos Grid */}
                                {viewingInvoices.length > 0 ? (
                                    <>
                                        <div className={`grid ${selectedInvoiceIndex === 'all' ? (viewingInvoices.length === 1 ? 'grid-cols-1' : viewingInvoices.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3') : 'grid-cols-1'} gap-6 items-start pb-32`}>
                                            {viewingInvoices.map((img, idx) => {
                                                if (selectedInvoiceIndex !== 'all' && selectedInvoiceIndex !== idx) return null;

                                                return (
                                                    <div key={idx} className={`space-y-3 ${selectedInvoiceIndex !== 'all' ? 'max-w-4xl mx-auto w-full' : ''}`}>
                                                        <div className={`flex ${selectedInvoiceIndex === 'all' ? 'flex-col sm:flex-row' : 'flex-row'} justify-between items-start sm:items-center gap-3 bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 backdrop-blur-sm`}>
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-[#c69f6e] text-white w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-xs font-black shadow-lg flex-shrink-0">
                                                                    {idx + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Document {idx + 1} / {viewingInvoices.length}</p>
                                                                    <p className="text-[8px] sm:text-[9px] font-bold text-[#c69f6e] uppercase tracking-widest mt-0.5">{img.toLowerCase().includes('.pdf') ? 'Fichier PDF' : 'Image Reçue'}</p>
                                                                </div>
                                                            </div>
                                                            <div className={`flex items-center gap-2 ${selectedInvoiceIndex === 'all' ? 'w-full sm:w-auto' : ''}`}>
                                                                <a href={img} download target="_blank" className={`flex items-center justify-center gap-1.5 sm:gap-2 h-8 sm:h-10 px-2.5 sm:px-4 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black text-white/80 transition-all bg-white/5 hover:bg-white/10 uppercase tracking-wider sm:tracking-widest border border-white/10 ${selectedInvoiceIndex === 'all' ? 'flex-1 sm:flex-none' : ''}`}>
                                                                    <Download size={12} className="text-[#c69f6e] sm:hidden" /><Download size={14} className="text-[#c69f6e] hidden sm:block" /> <span className="hidden sm:inline">Télécharger</span>
                                                                </a>
                                                                <button onClick={() => handleShareInvoice(img)} className={`flex items-center justify-center gap-1.5 sm:gap-2 h-8 sm:h-10 px-2.5 sm:px-4 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black text-white/80 transition-all bg-white/5 hover:bg-white/10 uppercase tracking-wider sm:tracking-widest border border-white/10 ${selectedInvoiceIndex === 'all' ? 'flex-1 sm:flex-none' : ''}`}>
                                                                    <Share2 size={12} className="text-[#c69f6e] sm:hidden" /><Share2 size={14} className="text-[#c69f6e] hidden sm:block" /> <span className="hidden sm:inline">Partager</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (isLocked && role !== 'admin') {
                                                                            setShowConfirm({
                                                                                type: 'alert',
                                                                                title: 'INTERDIT',
                                                                                message: 'Cette date est verrouillée. Impossible de supprimer ce reçu.',
                                                                                color: 'red',
                                                                                alert: true
                                                                            });
                                                                            return;
                                                                        }
                                                                        handleDeleteInvoice(idx);
                                                                        if (selectedInvoiceIndex === idx) setSelectedInvoiceIndex('all');
                                                                    }}
                                                                    className={`flex items-center gap-2 h-10 px-4 rounded-xl text-[9px] font-black text-red-400 transition-all bg-red-500/5 hover:bg-red-500/10 uppercase tracking-widest border border-red-500/20 ${isLocked && role !== 'admin' ? 'opacity-50' : ''}`}
                                                                >
                                                                    <Trash2 size={14} /> Supprimer
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={`${selectedInvoiceIndex === 'all' ? 'aspect-[4/3] max-h-[40vh] sm:max-h-[50vh] hover:border-[#c69f6e]/50 hover:shadow-[0_0_30px_rgba(198,159,110,0.2)] transition-all' : 'h-[75vh]'} bg-black/40 rounded-xl sm:rounded-[2rem] lg:rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden group relative flex items-center justify-center`}
                                                            onWheel={(e) => {
                                                                if (selectedInvoiceIndex !== 'all') {
                                                                    e.preventDefault();
                                                                    if (e.deltaY < 0) setImgZoom(prev => Math.min(4, prev + 0.1));
                                                                    else setImgZoom(prev => Math.max(0.2, prev - 0.1));
                                                                }
                                                            }}
                                                            onClick={() => {
                                                                if (selectedInvoiceIndex === 'all') {
                                                                    setSelectedInvoiceIndex(idx);
                                                                    resetView();
                                                                }
                                                            }}
                                                        >
                                                            <motion.div
                                                                className={`w-full h-full flex items-center justify-center p-3 sm:p-4 lg:p-6 ${selectedInvoiceIndex === 'all' ? 'cursor-pointer' : (imgZoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in')}`}
                                                                animate={{
                                                                    scale: selectedInvoiceIndex === 'all' ? 1 : imgZoom,
                                                                    rotate: selectedInvoiceIndex === 'all' ? 0 : imgRotation
                                                                }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                                drag={selectedInvoiceIndex !== 'all' && imgZoom > 1}
                                                                dragConstraints={{ left: -1500, right: 1500, top: -1500, bottom: 1500 }}
                                                                dragElastic={0.1}
                                                            >
                                                                {img.startsWith('data:application/pdf') || img.toLowerCase().includes('.pdf') ? (
                                                                    <iframe
                                                                        src={img}
                                                                        className="w-full h-full rounded-xl sm:rounded-2xl border-none bg-white"
                                                                        title="Document PDF"
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={img}
                                                                        draggable="false"
                                                                        className="max-w-full max-h-full rounded-xl sm:rounded-2xl object-contain shadow-2xl"
                                                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                                                    />
                                                                )}
                                                            </motion.div>
                                                            {selectedInvoiceIndex !== 'all' && (
                                                                <div className="absolute top-8 left-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <span className="bg-black/80 backdrop-blur-xl text-[10px] font-black text-[#c69f6e] px-6 py-3 rounded-full border border-[#c69f6e]/30 shadow-2xl uppercase tracking-[0.2em]">
                                                                        Zoom: {Math.round(imgZoom * 100)}% • Molette pour ajuster
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Floating Zoom Controls - Only when viewing single photo */}
                                        {selectedInvoiceIndex !== 'all' && (
                                            <div
                                                className="fixed top-6 left-1/2 -translate-x-1/2 z-[300]"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <div className="flex bg-black/80 p-1.5 sm:p-2 rounded-2xl sm:rounded-[2rem] border border-white/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] items-center gap-1">
                                                    <button
                                                        onClick={() => setImgZoom(prev => Math.max(0.5, prev - 0.25))}
                                                        className="w-9 h-9 sm:w-11 sm:h-11 hover:bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all text-white"
                                                    >
                                                        <ZoomOut size={18} className="sm:hidden" />
                                                        <ZoomOut size={22} className="hidden sm:block" />
                                                    </button>
                                                    <div className="w-12 sm:w-16 flex items-center justify-center font-black text-[10px] sm:text-xs tabular-nums text-[#c69f6e]">
                                                        {Math.round(imgZoom * 100)}%
                                                    </div>
                                                    <button
                                                        onClick={() => setImgZoom(prev => Math.min(4, prev + 0.25))}
                                                        className="w-9 h-9 sm:w-11 sm:h-11 hover:bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all text-white"
                                                    >
                                                        <ZoomIn size={18} className="sm:hidden" />
                                                        <ZoomIn size={22} className="hidden sm:block" />
                                                    </button>
                                                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                                                    <button
                                                        onClick={() => setImgRotation(prev => prev + 90)}
                                                        className="w-9 h-9 sm:w-11 sm:h-11 hover:bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all text-white"
                                                    >
                                                        <RotateCcw size={18} className="sm:hidden" />
                                                        <RotateCcw size={22} className="hidden sm:block" />
                                                    </button>
                                                    <button
                                                        onClick={resetView}
                                                        className="w-9 h-9 sm:w-11 sm:h-11 hover:bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all text-white"
                                                    >
                                                        <Maximize2 size={18} className="sm:hidden" />
                                                        <Maximize2 size={22} className="hidden sm:block" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Floating Bottom Selector Bar */}
                                        {viewingInvoices.length > 1 && (
                                            <div
                                                className="fixed bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 z-[300]"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <div className="flex bg-black/80 p-1.5 sm:p-2 rounded-2xl sm:rounded-[2.5rem] border border-white/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] items-center gap-1 group/bar">
                                                    <button
                                                        onClick={() => { setSelectedInvoiceIndex('all'); resetView(); }}
                                                        className={`px-4 sm:px-8 h-10 sm:h-14 rounded-xl sm:rounded-[1.8rem] text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest transition-all flex items-center gap-2 sm:gap-3 ${selectedInvoiceIndex === 'all' ? 'bg-[#c69f6e] text-white shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                                    >
                                                        <LayoutGrid size={16} className="sm:hidden" />
                                                        <LayoutGrid size={20} className="hidden sm:block" />
                                                        Tous
                                                    </button>
                                                    <div className="w-px h-6 sm:h-8 bg-white/10 mx-1 sm:mx-2" />
                                                    <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[60vw] sm:max-w-[50vw]">
                                                        {viewingInvoices.map((_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => { setSelectedInvoiceIndex(i); resetView(); }}
                                                                className={`px-4 sm:px-8 h-10 sm:h-14 rounded-xl sm:rounded-[1.8rem] text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest transition-all whitespace-nowrap ${selectedInvoiceIndex === i ? 'bg-[#c69f6e] text-white shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                                            >
                                                                Photo {i + 1}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="h-[70vh] bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 italic font-bold uppercase tracking-widest">
                                        <div className="text-center">
                                            <UploadCloud size={60} className="mx-auto mb-4 opacity-40" />
                                            <p>Aucun reçu attaché</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence>

            {/* Admin Calendar Modal */}
            <AnimatePresence>
                {
                    showCalendar && role === 'admin' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-[2px] flex items-start justify-center pt-24" onClick={() => setShowCalendar(false)}>
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: -20 }} className="bg-white rounded-3xl p-6 shadow-2xl border border-[#c69f6e]/20 w-80" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-6">
                                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-[#f4ece4] rounded-full text-[#4a3426]"><ChevronLeft size={18} /></button>
                                    <h3 className="text-lg font-bold text-[#4a3426] capitalize">{new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
                                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-[#f4ece4] rounded-full text-[#4a3426]"><ChevronRight size={18} /></button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">{['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (<span key={i} className="text-xs font-bold text-[#bba282] uppercase">{d}</span>))}</div>
                                <div className="grid grid-cols-7 gap-1">
                                    {generateCalendarDays(date).map((day, i) => {
                                        if (!day) return <div key={i}></div>;
                                        const isSelected = new Date(date).getDate() === day;
                                        return (<button key={i} onClick={() => {
                                            const parts = date.split('-');
                                            const newD = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, day);
                                            const ny = newD.getFullYear();
                                            const nm = String(newD.getMonth() + 1).padStart(2, '0');
                                            const nd = String(newD.getDate()).padStart(2, '0');
                                            setDate(`${ny}-${nm}-${nd}`);
                                            setShowCalendar(false);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }} className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${isSelected ? 'bg-[#4a3426] text-white shadow-lg' : 'text-[#4a3426] hover:bg-[#f4ece4] hover:text-[#c69f6e]'}`}>{day}</button>);
                                    })}
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Click outside to close dropdowns */}
            {showSupplierDropdown !== null && <div className="fixed inset-0 z-40" onClick={() => setShowSupplierDropdown(null)} />}
            {showDiversDropdown !== null && <div className="fixed inset-0 z-40" onClick={() => setShowDiversDropdown(null)} />}

            {/* Supplier Modal */}
            {/* Details Modal */}
            <AnimatePresence>
                {showDetailsModal && modalDetailsTarget && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowDetailsModal(false);
                                setModalDetailsTarget(null);
                            }}
                            className="absolute inset-0 bg-[#4a3426]/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="relative bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-[#e6dace] overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-[#fcfaf8] p-4 rounded-2xl text-[#c69f6e] border border-[#e6dace]">
                                    <Sparkles size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#4a3426] tracking-tight">Ajouter des détails</h3>
                                    <p className="text-[10px] text-[#c69f6e] font-black uppercase tracking-[0.2em] mt-1">
                                        {modalDetailsTarget.type === 'divers'
                                            ? `Catégorie : ${expensesDivers[modalDetailsTarget.index]?.designation || ''}`
                                            : `Fournisseur : ${expenses[modalDetailsTarget.index]?.supplier || ''}`}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8c8279] ml-1">Précisions (ex: Fruits → Pommes)</label>
                                    <div className="relative">
                                        <textarea
                                            autoFocus
                                            value={tempDetails ?? ''}
                                            readOnly={isLocked}
                                            onChange={(e) => !isLocked && setTempDetails(e.target.value)}
                                            onClick={() => {
                                                if (isLocked) {
                                                    setShowConfirm({
                                                        type: 'alert',
                                                        title: 'INTERDIT',
                                                        message: 'Cette date est verrouillée. Impossible de modifier les détails.',
                                                        color: 'red',
                                                        alert: true
                                                    });
                                                }
                                            }}
                                            placeholder={isLocked ? "Aucun détail supplémentaire." : "Notez ici les détails de la dépense..."}
                                            className={`w-full bg-[#fcfaf8] border border-[#e6dace] rounded-3xl p-6 text-base font-bold text-[#4a3426] focus:border-[#c69f6e] outline-none min-h-[160px] resize-none transition-all shadow-inner placeholder-[#bba282]/30 ${isLocked ? 'cursor-default opacity-80' : ''}`}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            setModalDetailsTarget(null);
                                        }}
                                        className="flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] text-[#8c8279] hover:bg-[#f9f6f2] border border-[#e6dace] transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (isLocked) {
                                                setShowDetailsModal(false);
                                                setModalDetailsTarget(null);
                                                return;
                                            }
                                            if (modalDetailsTarget.type === 'divers') {
                                                const newDivers = [...expensesDivers];
                                                newDivers[modalDetailsTarget.index].details = tempDetails;
                                                setExpensesDivers(newDivers);
                                            } else {
                                                const newExpenses = [...expenses];
                                                newExpenses[modalDetailsTarget.index].details = tempDetails;
                                                setExpenses(newExpenses);
                                            }
                                            setShowDetailsModal(false);
                                            setModalDetailsTarget(null);
                                            setHasInteracted(true);
                                        }}
                                        className={`flex-[2] py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] text-white shadow-xl transition-all ${isLocked ? 'bg-[#8c8279] hover:bg-[#4a3426]' : 'bg-[#c69f6e] hover:bg-[#b08d5d] shadow-[#c69f6e]/20'}`}
                                    >
                                        {isLocked ? 'Fermer' : 'Enregistrer les détails'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewingPhoto && (
                    <div
                        className="fixed inset-0 z-[600] flex items-center justify-center overflow-hidden"
                        onWheel={(e) => {
                            e.preventDefault();
                            const delta = e.deltaY > 0 ? -0.1 : 0.1;
                            setPhotoZoom(Math.max(0.5, Math.min(3, photoZoom + delta)));
                        }}
                    >
                        <div
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                            onClick={() => {
                                setViewingPhoto(null);
                                setPhotoZoom(1);
                            }}
                        />

                        {/* Hidden file input for adding photos */}
                        <input
                            type="file"
                            accept="image/*"
                            id="caisse-photo-modal-upload"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && caissePhotos.length < 3) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        const newPhoto = reader.result as string;
                                        setCaissePhotos(prev => [...prev, newPhoto]);
                                        setViewingPhoto(newPhoto);
                                        setHasInteracted(true);
                                        setToast({ msg: 'Photo ajoutée', type: 'success' });
                                        setTimeout(() => setToast(null), 3000);
                                    };
                                    reader.readAsDataURL(file);
                                }
                                e.target.value = '';
                            }}
                        />

                        {/* Draggable & Zoomable Image Container */}
                        <motion.div
                            className="relative w-full h-full flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.img
                                drag
                                dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                                dragElastic={0.05}
                                whileTap={{ cursor: "grabbing" }}
                                initial={{ scale: 0.9 }}
                                animate={{ scale: photoZoom }}
                                exit={{ scale: 0.9 }}
                                src={viewingPhoto}
                                alt="Caisse Full"
                                className="max-w-[90vw] max-h-[70vh] object-contain cursor-grab shadow-2xl shadow-black/50 touch-none"
                                style={{ scale: photoZoom }}
                            />
                        </motion.div>

                        {/* Top Controls */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
                            {/* Zoom Percentage Display */}
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
                                <span className="text-white text-sm font-bold">
                                    {Math.round(photoZoom * 100)}%
                                </span>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setViewingPhoto(null);
                                    setPhotoZoom(1);
                                }}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Bottom Panel with Photos, Add Button, and Delete */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
                            {/* Recette Info */}
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Recette Caisse</span>
                                <span className="text-xl font-black text-white">
                                    {parseFloat(recetteCaisse || '0').toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                                </span>
                                <span className="text-xs font-bold text-[#c69f6e]">DT</span>
                            </div>

                            {/* Photos Thumbnails + Add Button */}
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3">
                                {/* Existing Photos */}
                                {caissePhotos.map((photo, index) => (
                                    <div
                                        key={index}
                                        onClick={() => { setViewingPhoto(photo); setPhotoZoom(1); }}
                                        className={`relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer transition-all ${viewingPhoto === photo ? 'ring-2 ring-[#c69f6e] ring-offset-2 ring-offset-black' : 'opacity-60 hover:opacity-100'}`}
                                    >
                                        <Image
                                            src={photo}
                                            alt={`Photo ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center py-0.5">
                                            <span className="text-[8px] font-black text-white">{index + 1}/{caissePhotos.length}</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Photo Button - only if less than 3 photos and not locked */}
                                {caissePhotos.length < 3 && !isLocked && (
                                    <label
                                        htmlFor="caisse-photo-modal-upload"
                                        className="w-14 h-14 rounded-xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#c69f6e] hover:bg-white/5 transition-all"
                                    >
                                        <Plus size={20} className="text-white/60" />
                                        <span className="text-[8px] font-black text-white/40 mt-0.5">{caissePhotos.length}/3</span>
                                    </label>
                                )}

                                {/* Delete Current Photo Button */}
                                {!isLocked && viewingPhoto && caissePhotos.includes(viewingPhoto) && (
                                    <>
                                        <div className="w-px h-10 bg-white/20 mx-1" />
                                        <button
                                            onClick={() => {
                                                const currentIndex = caissePhotos.indexOf(viewingPhoto);
                                                setCaissePhotos(prev => prev.filter(p => p !== viewingPhoto));
                                                setHasInteracted(true);
                                                // Switch to another photo or close
                                                if (caissePhotos.length > 1) {
                                                    const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
                                                    const nextPhoto = caissePhotos.filter(p => p !== viewingPhoto)[nextIndex];
                                                    setViewingPhoto(nextPhoto || null);
                                                } else {
                                                    setViewingPhoto(null);
                                                }
                                                setPhotoZoom(1);
                                                setToast({ msg: 'Photo supprimée', type: 'success' });
                                                setTimeout(() => setToast(null), 3000);
                                            }}
                                            className="w-14 h-14 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/40 transition-all"
                                        >
                                            <Trash2 size={20} className="text-red-400" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Selection Modals Divers */}
            <AnimatePresence>
                {(showSupplierModal || showDiversModal || showEmployeeModal) && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                            onClick={() => {
                                setShowSupplierModal(false);
                                setShowDiversModal(false);
                                setShowEmployeeModal(false);
                                setDesignationSearch('');
                                setNewSupplierName('');
                                setNewEmployeeModalName('');
                            }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[3rem] w-full max-w-sm shadow-2xl border border-white/20 p-10"
                        >
                            <div className="space-y-8">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-[#fcfaf8] border border-[#e6dace] rounded-3xl flex items-center justify-center text-[#c69f6e]">
                                        <Plus size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-[#4a3426]">
                                            {showSupplierModal ? 'Nouveau Fournisseur' : showEmployeeModal ? 'Nouveau Employé' : 'Nouvelle Désignation'}
                                        </h3>
                                        <p className="text-sm font-bold text-[#8c8279] opacity-60">
                                            {showSupplierModal ? 'Ajoutez un nouveau partenaire à votre liste.' : showEmployeeModal ? 'Ajoutez un nouveau collaborateur à votre liste.' : 'Ajoutez une nouvelle désignation à votre liste.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#bba282]" size={20} />
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder={showSupplierModal ? "Nom du fournisseur..." : showEmployeeModal ? "Nom de l'employé..." : "Nom de la désignation..."}
                                                value={showSupplierModal ? newSupplierName : showEmployeeModal ? newEmployeeModalName : designationSearch}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (showSupplierModal) setNewSupplierName(v);
                                                    else if (showEmployeeModal) setNewEmployeeModalName(v);
                                                    else setDesignationSearch(v);
                                                    setShowJournalierSuggestions(true);
                                                }}
                                                onFocus={() => setShowJournalierSuggestions(true)}
                                                className={`w-full h-16 bg-[#fcfaf8] border ${(showSupplierModal && journalierMasterSuggestions.suppliers.some((n: string) => n.toLowerCase() === newSupplierName.trim().toLowerCase())) ||
                                                    (showEmployeeModal && journalierMasterSuggestions.employees.some((n: string) => n.toLowerCase() === newEmployeeModalName.trim().toLowerCase())) ||
                                                    (showDiversModal && journalierMasterSuggestions.divers.some((n: string) => n.toLowerCase() === designationSearch.trim().toLowerCase()))
                                                    ? 'border-red-400' : 'border-[#e6dace]'
                                                    } rounded-2xl pl-14 pr-6 font-bold text-[#4a3426] focus:border-[#c69f6e] outline-none transition-all placeholder-[#bba282]/50`}
                                            />

                                            {/* Proactive Alert Text */}
                                            {(
                                                (showSupplierModal && newSupplierName.trim() && journalierMasterSuggestions.suppliers.some((n: string) => n.toLowerCase() === newSupplierName.trim().toLowerCase())) ||
                                                (showEmployeeModal && newEmployeeModalName.trim() && journalierMasterSuggestions.employees.some((n: string) => n.toLowerCase() === newEmployeeModalName.trim().toLowerCase())) ||
                                                (showDiversModal && designationSearch.trim() && journalierMasterSuggestions.divers.some((n: string) => n.toLowerCase() === designationSearch.trim().toLowerCase()))
                                            ) && (
                                                    <div className="absolute -bottom-6 left-1 flex items-center gap-1 text-[10px] font-black text-red-500 uppercase">
                                                        <AlertCircle size={12} /> Cet élément existe déjà (Redondance détectée)
                                                    </div>
                                                )}

                                            <AnimatePresence>
                                                {showJournalierSuggestions && (showSupplierModal ? newSupplierName.trim() : showEmployeeModal ? newEmployeeModalName.trim() : designationSearch.trim()).length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute z-[100] top-16 left-0 right-0 mt-3 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#e6dace] max-h-52 overflow-y-auto no-scrollbar"
                                                    >
                                                        {(showSupplierModal ? journalierMasterSuggestions.suppliers : showEmployeeModal ? journalierMasterSuggestions.employees : journalierMasterSuggestions.divers)
                                                            .filter((name: string) => (name || '').toLowerCase().includes(((showSupplierModal ? newSupplierName : showEmployeeModal ? newEmployeeModalName : designationSearch) || '').toLowerCase()))
                                                            .map((name: string, i: number) => (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (showSupplierModal) setNewSupplierName(name);
                                                                        else if (showEmployeeModal) setNewEmployeeModalName(name);
                                                                        else setDesignationSearch(name);
                                                                        setShowJournalierSuggestions(false);
                                                                    }}
                                                                    className="w-full text-left px-5 py-3 hover:bg-[#fcfaf8] text-sm font-bold text-[#4a3426] border-b border-[#f4ece4] last:border-0 transition-colors"
                                                                >
                                                                    {name}
                                                                </button>
                                                            ))
                                                        }
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            {showJournalierSuggestions && <div className="fixed inset-0 z-[90]" onClick={() => setShowJournalierSuggestions(false)} />}
                                        </div>

                                        {showEmployeeModal && (
                                            <div className={`relative animate-in fade-in slide-in-from-top-4 duration-300 ${showJournalierSuggestions && (showEmployeeModal ? newEmployeeModalName.trim() : '').length > 0 ? 'mt-32' : 'mt-4'}`}>
                                                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-[#bba282]" size={20} />
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Département (optionnel)..."
                                                        value={employeeDepartment ?? ''}
                                                        onChange={(e) => {
                                                            setEmployeeDepartment(e.target.value);
                                                            setShowDeptSuggestions(true);
                                                        }}
                                                        onFocus={() => setShowDeptSuggestions(true)}
                                                        className="w-full h-16 bg-[#fcfaf8] border border-[#e6dace] rounded-2xl pl-14 pr-14 font-bold text-[#4a3426] focus:border-[#c69f6e] outline-none transition-all placeholder-[#bba282]/50"
                                                    />

                                                    <button
                                                        onClick={async () => {
                                                            const { value: dept } = await MySwal.fire({
                                                                title: 'Ajouter Département',
                                                                input: 'text',
                                                                inputPlaceholder: 'Nom du département...',
                                                                showCancelButton: true,
                                                                confirmButtonText: 'Ajouter',
                                                                cancelButtonText: 'Annuler',
                                                                confirmButtonColor: '#4a3426',
                                                                background: '#fff',
                                                                customClass: {
                                                                    title: 'text-lg font-black uppercase text-[#4a3426]',
                                                                    confirmButton: 'rounded-xl font-bold uppercase tracking-widest text-xs py-3',
                                                                    cancelButton: 'rounded-xl font-bold uppercase tracking-widest text-xs py-3'
                                                                }
                                                            });
                                                            if (dept) setEmployeeDepartment(dept);
                                                        }}
                                                        className="absolute right-3 p-2 bg-[#f4ece4] rounded-xl text-[#c69f6e] hover:bg-[#e6dace] transition-colors z-[105]"
                                                    >
                                                        <Plus size={18} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {showDeptSuggestions && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="absolute z-[110] top-16 left-0 right-0 mt-3 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#e6dace] max-h-40 overflow-y-auto no-scrollbar"
                                                            >
                                                                {Array.from(new Set(employeesData?.getEmployees?.map((e: any) => e.department).filter(Boolean) as string[]))
                                                                    .filter(dept => dept.toLowerCase().includes(employeeDepartment.toLowerCase()))
                                                                    .map((dept, i) => (
                                                                        <button
                                                                            key={i}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setEmployeeDepartment(dept);
                                                                                setShowDeptSuggestions(false);
                                                                            }}
                                                                            className="w-full text-left px-5 py-3 hover:bg-[#fcfaf8] text-sm font-bold text-[#4a3426] border-b border-[#f4ece4] last:border-0 transition-colors"
                                                                        >
                                                                            {dept}
                                                                        </button>
                                                                    ))
                                                                }
                                                                {employeeDepartment.trim() && !Array.from(new Set(employeesData?.getEmployees?.map((e: any) => e.department).filter(Boolean) as string[])).some(d => d.toLowerCase() === employeeDepartment.toLowerCase()) && (
                                                                    <div className="px-5 py-3 text-[10px] font-black text-[#c69f6e] uppercase bg-[#fcfaf8]">
                                                                        Nouveau Département
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                    {showDeptSuggestions && <div className="fixed inset-0 z-[100]" onClick={() => setShowDeptSuggestions(false)} />}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex gap-4 transition-all duration-300 relative z-[100] ${(showJournalierSuggestions && (
                                        (showSupplierModal && newSupplierName.trim().length > 0) ||
                                        (showDiversModal && designationSearch.trim().length > 0)
                                    )) || (showDeptSuggestions) ? 'mt-40' : ''
                                        }`}>
                                        <button
                                            onClick={() => {
                                                setShowSupplierModal(false);
                                                setShowDiversModal(false);
                                                setShowEmployeeModal(false);
                                                setDesignationSearch('');
                                                setNewSupplierName('');
                                                setNewEmployeeModalName('');
                                                setEmployeeDepartment('');
                                            }}
                                            className="flex-1 h-14 rounded-2xl border border-[#e6dace] text-[#8c8279] font-black uppercase text-xs tracking-[0.2em] hover:bg-[#fcfaf8] transition-all"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={async () => {
                                                // Close any open suggestions first
                                                setShowJournalierSuggestions(false);
                                                setShowDeptSuggestions(false);

                                                const val = showSupplierModal ? newSupplierName : showEmployeeModal ? newEmployeeModalName : designationSearch;
                                                if (!val.trim()) return;

                                                const currentList = showSupplierModal ? journalierMasterSuggestions.suppliers : showEmployeeModal ? journalierMasterSuggestions.employees : journalierMasterSuggestions.divers;
                                                const isDuplicate = currentList.some((n: string) => n.toLowerCase() === val.trim().toLowerCase());

                                                if (isDuplicate) {
                                                    MySwal.fire({
                                                        title: 'Élément Existant',
                                                        text: `"${val.trim()}" existe déjà dans votre liste.`,
                                                        icon: 'warning',
                                                        confirmButtonColor: '#4a3426',
                                                        confirmButtonText: "D'accord"
                                                    });
                                                    return;
                                                }

                                                try {
                                                    if (showSupplierModal) {
                                                        await upsertSupplier({ variables: { name: val.trim() } });
                                                        refetchSuppliers();
                                                        setShowSupplierModal(false);
                                                        setNewSupplierName('');
                                                    } else if (showEmployeeModal) {
                                                        await upsertEmployee({ variables: { name: val.trim(), department: employeeDepartment.trim() || null } });
                                                        refetchEmployees();
                                                        setShowEmployeeModal(false);
                                                        setNewEmployeeModalName('');
                                                        setEmployeeDepartment('');
                                                    } else {
                                                        await upsertDesignation({ variables: { name: val.trim() } });
                                                        refetchDesignations();
                                                        setShowDiversModal(false);
                                                        setDesignationSearch('');
                                                    }
                                                    setToast({ msg: 'Ajouté avec succès', type: 'success' });
                                                    setTimeout(() => setToast(null), 3000);
                                                } catch (e) {
                                                    setToast({ msg: "Erreur lors de l'ajout", type: 'error' });
                                                    setTimeout(() => setToast(null), 3000);
                                                }
                                            }}
                                            disabled={showSupplierModal ? !newSupplierName.trim() : showEmployeeModal ? !newEmployeeModalName.trim() : !designationSearch.trim()}
                                            className="flex-1 h-14 rounded-2xl bg-[#e2d6c9] text-[#4a3426] font-black uppercase text-xs tracking-[0.2em] hover:bg-[#d6c7b8] transition-all shadow-md disabled:opacity-50"
                                        >
                                            Confirmer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <EntryModal
                isOpen={!!showEntryModal}
                onClose={() => setShowEntryModal(null)}
                onSubmit={handleEntrySubmit}
                type={showEntryModal?.type}
                initialData={showEntryModal?.data}
                employees={employeesData?.getEmployees}
            />

            <HistoryModal
                isOpen={!!showHistoryModal}
                onClose={() => setShowHistoryModal(null)}
                type={showHistoryModal?.type}
                targetName={showHistoryModal?.targetName}
                startDate={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`}
                endDate={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()).padStart(2, '0')}`}
            />

            <AnimatePresence>
                {showEmployeeList && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowEmployeeList(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#e6dace]"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-xl font-black text-[#4a3426] uppercase tracking-tighter">Annuaire Employés</h3>
                                        <button
                                            onClick={() => {
                                                setIsAddingEmployee(!isAddingEmployee);
                                                setNewEmpName('');
                                                setNewEmpDept('');
                                            }}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isAddingEmployee ? 'bg-[#4a3426] text-white' : 'bg-[#f4ece4] text-[#c69f6e] hover:bg-[#ece6df]'}`}
                                        >
                                            {isAddingEmployee ? <X size={14} /> : <Plus size={14} />}
                                            {isAddingEmployee ? 'Annuler' : 'Nouveau'}
                                        </button>
                                    </div>
                                    <button onClick={() => setShowEmployeeList(false)} className="p-2 hover:bg-[#f9f6f2] rounded-xl transition-colors text-[#bba282]"><X size={20} /></button>
                                </div>

                                {isAddingEmployee && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="bg-[#fcfaf8] border border-[#e6dace] rounded-3xl p-6 space-y-4"
                                    >
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <label className="text-[10px] font-black text-[#bba282] uppercase tracking-[0.2em] mb-2 block ml-1">Nom de l'Employé</label>
                                                <input
                                                    type="text"
                                                    value={newEmpName}
                                                    onChange={(e) => setNewEmpName(e.target.value)}
                                                    placeholder="Prénom Nom..."
                                                    className={`w-full h-12 bg-white border ${employeesData?.getEmployees?.some((emp: any) => emp.name.toLowerCase() === newEmpName.trim().toLowerCase()) ? 'border-red-400' : 'border-[#e6dace]'} rounded-2xl px-4 font-bold text-[#4a3426] focus:border-[#c69f6e] outline-none transition-all`}
                                                />
                                                {newEmpName.trim() && employeesData?.getEmployees?.some((emp: any) => emp.name.toLowerCase() === newEmpName.trim().toLowerCase()) && (
                                                    <p className="text-[9px] font-black text-red-500 uppercase mt-2 ml-1 flex items-center gap-1">
                                                        <AlertCircle size={10} /> Cet employé existe déjà
                                                    </p>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <label className="text-[10px] font-black text-[#bba282] uppercase tracking-[0.2em] mb-2 block ml-1">Département</label>
                                                <input
                                                    type="text"
                                                    value={newEmpDept}
                                                    onChange={(e) => setNewEmpDept(e.target.value)}
                                                    placeholder="Cuisine, Salle, etc..."
                                                    className={`w-full h-12 bg-white border ${employeesData?.getEmployees?.some((emp: any) => emp.department?.toLowerCase() === newEmpDept.trim().toLowerCase()) ? 'border-[#c69f6e]' : 'border-[#e6dace]'} rounded-2xl px-4 font-bold text-[#4a3426] focus:border-[#c69f6e] outline-none transition-all`}
                                                />
                                                {newEmpDept.trim() && employeesData?.getEmployees?.some((emp: any) => emp.department?.toLowerCase() === newEmpDept.trim().toLowerCase()) && (
                                                    <p className="text-[9px] font-black text-[#c69f6e] uppercase mt-2 ml-1 flex items-center gap-1">
                                                        <Check size={10} /> Département existant (Redondance évitée)
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {Array.from(new Set(employeesData?.getEmployees?.map((e: any) => e.department).filter(Boolean))).map((dept: any) => (
                                                        <button
                                                            key={dept}
                                                            onClick={() => setNewEmpDept(dept)}
                                                            className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border transition-all ${newEmpDept === dept ? 'bg-[#c69f6e] text-white border-[#c69f6e]' : 'bg-white text-[#8c8279] border-[#e6dace] hover:border-[#c69f6e]'}`}
                                                        >
                                                            {dept}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            disabled={!newEmpName.trim() || employeesData?.getEmployees?.some((emp: any) => emp.name.toLowerCase() === newEmpName.trim().toLowerCase())}
                                            onClick={async () => {
                                                try {
                                                    await upsertEmployee({
                                                        variables: {
                                                            name: newEmpName.trim(),
                                                            department: newEmpDept.trim() || null
                                                        }
                                                    });
                                                    setNewEmpName('');
                                                    setNewEmpDept('');
                                                    setIsAddingEmployee(false);
                                                    refetchEmployees();
                                                    MySwal.fire({
                                                        icon: 'success',
                                                        title: 'Ajouté !',
                                                        text: 'L\'employé a été ajouté avec succès.',
                                                        timer: 1500,
                                                        showConfirmButton: false,
                                                        background: '#fff',
                                                        customClass: { title: 'text-lg font-black uppercase text-[#4a3426]' }
                                                    });
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }}
                                            className="w-full h-12 bg-[#4a3426] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[#4a3426]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:scale-100"
                                        >
                                            Ajouter l'employé
                                        </button>
                                    </motion.div>
                                )}

                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bba282]"><Search size={16} /></div>
                                    <input
                                        type="text"
                                        placeholder="Filtrer la liste..."
                                        value={employeeSearch}
                                        onChange={(e) => setEmployeeSearch(e.target.value)}
                                        className="w-full h-10 bg-[#fcfaf8] border border-[#e6dace] rounded-xl pl-10 pr-4 text-xs font-bold text-[#4a3426] focus:border-[#c69f6e] outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-3 max-h-[45vh] overflow-y-auto custom-scrollbar pr-2">
                                    {employeesData?.getEmployees?.filter((e: any) =>
                                        e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                                        (e.department && e.department.toLowerCase().includes(employeeSearch.toLowerCase()))
                                    ).map((emp: any) => (
                                        <div key={emp.id} className="flex justify-between items-center p-4 bg-[#fcfaf8] rounded-2xl border border-[#e6dace]/30 group hover:border-[#c69f6e]/30 transition-all">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[#4a3426]">{emp.name}</span>
                                                {emp.department && (
                                                    <span className="text-[10px] font-black text-[#8c8279] uppercase tracking-wider bg-[#f4ece4] px-2 py-0.5 rounded-lg border border-[#e6dace]/50">
                                                        {emp.department}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={async () => {
                                                        const { value: formValues } = await MySwal.fire({
                                                            title: 'Modifier Employé',
                                                            html:
                                                                `<input id="swal-input1" class="swal2-input" placeholder="Nom" value="${emp.name}">` +
                                                                `<input id="swal-input2" class="swal2-input" placeholder="Département" value="${emp.department || ''}">`,
                                                            focusConfirm: false,
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Enregistrer',
                                                            cancelButtonText: 'Annuler',
                                                            confirmButtonColor: '#4a3426',
                                                            background: '#fff',
                                                            customClass: {
                                                                title: 'text-lg font-black uppercase text-[#4a3426]',
                                                                confirmButton: 'rounded-xl font-bold uppercase tracking-widest text-xs py-3',
                                                                cancelButton: 'rounded-xl font-bold uppercase tracking-widest text-xs py-3'
                                                            },
                                                            preConfirm: () => {
                                                                return [
                                                                    (document.getElementById('swal-input1') as HTMLInputElement).value,
                                                                    (document.getElementById('swal-input2') as HTMLInputElement).value
                                                                ]
                                                            }
                                                        });

                                                        if (formValues) {
                                                            const [newName, newDept] = formValues;
                                                            if (newName && (newName.trim() !== emp.name || newDept.trim() !== (emp.department || ''))) {
                                                                try {
                                                                    await updateEmployee({ variables: { id: emp.id, name: newName.trim(), department: newDept.trim() || null } });
                                                                    await refetchEmployees();
                                                                    await MySwal.fire({
                                                                        icon: 'success',
                                                                        title: 'Succès',
                                                                        text: 'Employé mis à jour avec succès',
                                                                        timer: 1500,
                                                                        showConfirmButton: false
                                                                    });
                                                                } catch (error) {
                                                                    console.error('Update error:', error);
                                                                    await MySwal.fire({
                                                                        icon: 'error',
                                                                        title: 'Erreur',
                                                                        text: 'Une erreur est survenue lors de la mise à jour'
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 text-[#c69f6e] hover:bg-[#f4ece4] rounded-lg transition-colors"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const result = await MySwal.fire({
                                                            title: 'Supprimer ?',
                                                            text: "Cette action est irréversible.",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Oui, supprimer',
                                                            cancelButtonText: 'Annuler',
                                                            confirmButtonColor: '#ef4444',
                                                            background: '#fff',
                                                            customClass: {
                                                                title: 'text-lg font-black uppercase text-[#4a3426]',
                                                                confirmButton: 'rounded-xl font-bold uppercase tracking-widest text-xs py-3',
                                                                cancelButton: 'rounded-xl font-bold uppercase tracking-widest text-xs py-3'
                                                            }
                                                        });
                                                        if (result.isConfirmed) {
                                                            await deleteEmployee({ variables: { id: emp.id } });
                                                            refetchEmployees();
                                                        }
                                                    }}
                                                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!employeesData?.getEmployees || employeesData.getEmployees.length === 0) && (
                                        <div className="text-center py-12 opacity-40 italic">Aucun employé enregistré</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={!!showConfirm}
                onClose={() => setShowConfirm(null)}
                onConfirm={showConfirm?.onConfirm}
                title={showConfirm?.title || ''}
                message={showConfirm?.message || ''}
                color={showConfirm?.color || 'blue'}
                alert={showConfirm?.alert || showConfirm?.type === 'alert'}
            />
        </div >
    );
}

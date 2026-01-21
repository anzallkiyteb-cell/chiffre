'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
    CreditCard, Loader2, Search, Calendar,
    ArrowUpRight, Download, Filter, User, FileText,
    TrendingUp, Receipt, Wallet, UploadCloud, Coins, Banknote,
    ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Image as ImageIcon, Ticket,
    Clock, CheckCircle2, Check, Eye, EyeOff, Edit2, Trash2, X, Layout, Plus,
    Truck, Sparkles, Calculator, Zap, Award, ZoomIn, ZoomOut, RotateCw, Maximize2,
    Bookmark, AlertCircle, LayoutGrid, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { BarChart, Bar, Cell, ResponsiveContainer } from 'recharts';

// --- Helper Components & Utilities ---

const formatDateToDisplay = (dateStr: string) => {
    if (!dateStr) return 'JJ/MM/AAAA';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
};

const PremiumDatePicker = ({ value, onChange, label, align = 'left' }: { value: string, onChange: (val: string) => void, label: string, align?: 'left' | 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const days = [];

        // Offset for Monday start (0 is Sunday, 1 is Monday...)
        const offset = firstDay === 0 ? 6 : firstDay - 1;
        for (let i = 0; i < offset; i++) days.push(null);

        const lastDay = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= lastDay; i++) days.push(new Date(year, month, i));

        return days;
    }, [viewDate]);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/50 hover:bg-white border border-[#e6dace] rounded-xl px-3 py-2 transition-all min-w-[130px] group w-full"
            >
                <Calendar size={14} className="text-[#c69f6e]" />
                <span className="text-[11px] font-black text-[#4a3426] tracking-tight truncate">
                    {formatDateToDisplay(value)}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-3 bg-white rounded-3xl shadow-2xl border border-[#e6dace] p-5 z-[110] w-72`}
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
                                    const dStr = `${y}-${m}-${d}`;

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
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const PremiumMonthPicker = ({ value, onChange, align = 'left' }: { value: string, onChange: (val: string) => void, align?: 'left' | 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(parseInt(value?.split('-')[0]) || new Date().getFullYear());

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const currentMonthIdx = parseInt(value?.split('-')[1]) - 1;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-4 bg-white border border-[#e6dace] rounded-xl px-6 h-10 transition-all min-w-[200px] hover:shadow-sm group shadow-sm"
            >
                <span className="text-[11px] font-black text-[#4a3426] uppercase tracking-widest">
                    {!isNaN(currentMonthIdx) ? `${months[currentMonthIdx]} ${value.split('-')[0]}` : 'Sélectionner Mois'}
                </span>
                <Calendar size={16} className="text-[#c69f6e]" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-3 bg-white rounded-[2rem] shadow-2xl border border-[#e6dace] p-6 z-[110] w-72`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <button
                                    type="button"
                                    onClick={() => setViewYear(viewYear - 1)}
                                    className="p-2 hover:bg-[#fcfaf8] rounded-xl text-[#8c8279] transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-sm font-black text-[#4a3426] tracking-tighter">
                                    {viewYear}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setViewYear(viewYear + 1)}
                                    className="p-2 hover:bg-[#fcfaf8] rounded-xl text-[#8c8279] transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {months.map((m, i) => {
                                    const mStr = String(i + 1).padStart(2, '0');
                                    const isSelected = value === `${viewYear}-${mStr}`;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                onChange(`${viewYear}-${mStr}`);
                                                setIsOpen(false);
                                            }}
                                            className={`
                                                py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                                                ${isSelected
                                                    ? 'bg-[#c69f6e] text-white shadow-lg shadow-[#c69f6e]/20'
                                                    : 'text-[#4a3426] hover:bg-[#fcfaf8] border border-transparent hover:border-[#e6dace]/30'
                                                }
                                            `}
                                        >
                                            {m.substring(0, 4)}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- End Helper Components ---

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

const UPSERT_SUPPLIER = gql`
  mutation UpsertSupplier($name: String!) {
    upsertSupplier(name: $name) {
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

const GET_PAYMENT_DATA = gql`
  query GetPaymentData($month: String, $startDate: String!, $endDate: String!) {
    getPaidUsers(month: $month, startDate: $startDate, endDate: $endDate) {
      username
      amount
    }
    getPaymentStats(month: $month, startDate: $startDate, endDate: $endDate) {
      totalRecetteNette
      totalFacturesPayees
      totalTPE
      totalCheque
      totalCash
      totalBankDeposits
      totalRecetteCaisse
      totalExpenses
      totalRiadhExpenses
      totalUnpaidInvoices
      totalTicketsRestaurant
      totalRestesSalaires
    }
    getBankDeposits(month: $month, startDate: $startDate, endDate: $endDate) {
      id
      amount
      date
      type
    }
    getInvoices(month: $month, startDate: $startDate, endDate: $endDate) {
      id
      supplier_name
      amount
      date
      photo_url
      photo_cheque_url
      photo_verso_url
      photos
      payment_method
      paid_date
      category
      origin
      payer
      status
      doc_type
      doc_number
    }
    getChiffresByRange(startDate: $startDate, endDate: $endDate) {
      date
      recette_de_caisse
      recette_net
      total_diponce
      tpe
      tpe2
      espaces
      cheque_bancaire
      tickets_restaurant
      diponce
      diponce_divers
      diponce_admin
      avances_details { id username montant created_at }
      doublages_details { id username montant created_at }
      extras_details { id username montant created_at }
      primes_details { id username montant created_at }
      restes_salaires_details { id username montant created_at }
    }
    getSalaryRemainders(month: $month) {
      id
      employee_name
      amount
      month
      status
      updated_at
    }
    getEmployees {
      id
      name
      department
    }
  }
`;

const ADD_BANK_DEPOSIT = gql`
  mutation AddBankDeposit($amount: String!, $date: String!, $type: String) {
    addBankDeposit(amount: $amount, date: $date, type: $type) {
      id
    }
  }
`;

const UPDATE_BANK_DEPOSIT = gql`
  mutation UpdateBankDeposit($id: Int!, $amount: String!, $date: String!, $type: String) {
    updateBankDeposit(id: $id, amount: $amount, date: $date, type: $type) {
      id
    }
  }
`;

const DELETE_BANK_DEPOSIT = gql`
  mutation DeleteBankDeposit($id: Int!) {
    deleteBankDeposit(id: $id)
  }
`;

const ADD_PAID_INVOICE = gql`
  mutation AddPaidInvoice($supplier_name: String!, $amount: String!, $date: String!, $photo_url: String, $photo_cheque_url: String, $photo_verso_url: String, $payment_method: String!, $paid_date: String!, $payer: String, $doc_type: String, $doc_number: String, $category: String) {
    addPaidInvoice(supplier_name: $supplier_name, amount: $amount, date: $date, photo_url: $photo_url, photo_cheque_url: $photo_cheque_url, photo_verso_url: $photo_verso_url, payment_method: $payment_method, paid_date: $paid_date, payer: $payer, doc_type: $doc_type, doc_number: $doc_number, category: $category) {
      id
    }
  }
`;

const DELETE_INVOICE = gql`
  mutation DeleteInvoice($id: Int!) {
    deleteInvoice(id: $id)
  }
`;

const PAY_INVOICE = gql`
  mutation PayInvoice($id: Int!, $payment_method: String!, $paid_date: String!, $photo_cheque_url: String, $photo_verso_url: String, $payer: String) {
    payInvoice(id: $id, payment_method: $payment_method, paid_date: $paid_date, photo_cheque_url: $photo_cheque_url, photo_verso_url: $photo_verso_url, payer: $payer) {
      id
      status
      paid_date
    }
  }
`;

const UNPAY_INVOICE = gql`
  mutation UnpayInvoice($id: Int!) {
    unpayInvoice(id: $id) {
        id
        status
        paid_date
    }
  }
`;

const UPDATE_INVOICE = gql`
  mutation UpdateInvoice($id: Int!, $supplier_name: String, $amount: String, $date: String, $payment_method: String, $paid_date: String, $category: String, $doc_type: String, $doc_number: String) {
    updateInvoice(id: $id, supplier_name: $supplier_name, amount: $amount, date: $date, payment_method: $payment_method, paid_date: $paid_date, category: $category, doc_type: $doc_type, doc_number: $doc_number) {
      id
    }
  }
`;

const GET_INVOICES = gql`
  query GetInvoices($supplierName: String, $startDate: String, $endDate: String, $payer: String) {
    getInvoices(supplierName: $supplierName, startDate: $startDate, endDate: $endDate, payer: $payer) {
      id
      supplier_name
      amount
      date
      photo_url
      photo_cheque_url
      photo_verso_url
      status
      payment_method
      paid_date
      photos
      doc_type
      doc_number
      payer
      origin
      category
      updated_at
    }
  }
`;

const GET_SALARY_REMAINDERS = gql`
  query GetSalaryRemainders($month: String) {
    getSalaryRemainders(month: $month) {
      id
      employee_name
      amount
      month
      status
    }
  }
`;

const UPSERT_SALARY_REMAINDER = gql`
  mutation UpsertSalaryRemainder($employee_name: String!, $amount: Float!, $month: String!, $status: String) {
    upsertSalaryRemainder(employee_name: $employee_name, amount: $amount, month: $month, status: $status) {
      id
      employee_name
      amount
      month
      status
      updated_at
    }
  }
`;

const DELETE_SALARY_REMAINDER = gql`
  mutation DeleteSalaryRemainder($id: Int!) {
    deleteSalaryRemainder(id: $id)
  }
`;

export default function PaiementsPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ role: 'admin' | 'caissier', full_name: string } | null>(null);
    const [initializing, setInitializing] = useState(true);

    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Date Range State
    const [month, setMonth] = useState<string | null>(currentMonthStr);
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [activeFilter, setActiveFilter] = useState<'month' | 'week' | 'year' | 'custom'>('month');

    const [search, setSearch] = useState('');
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(today.getFullYear());

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const ty = today.getFullYear();
    const tm = String(today.getMonth() + 1).padStart(2, '0');
    const td = String(today.getDate()).padStart(2, '0');
    const todayStr = `${ty}-${tm}-${td}`;

    // Forms State
    const [bankAmount, setBankAmount] = useState('');
    const [bankDate, setBankDate] = useState(todayStr);
    const [showBankForm, setShowBankForm] = useState(false);
    const [editingDeposit, setEditingDeposit] = useState<any>(null);

    const [expName, setExpName] = useState('');
    const [expAmount, setExpAmount] = useState('');
    const [expDate, setExpDate] = useState(todayStr);
    const [expMethod, setExpMethod] = useState('Espèces');
    const [expDocType, setExpDocType] = useState('Facture');
    const [expPhoto, setExpPhoto] = useState('');
    const [expCategory, setExpCategory] = useState('');
    const [expPhotoCheque, setExpPhotoCheque] = useState('');
    const [expPhotoVerso, setExpPhotoVerso] = useState('');
    const [expInvoiceNumber, setExpInvoiceNumber] = useState('');
    const [showExpForm, setShowExpForm] = useState(false);
    const [showSalaryRemaindersModal, setShowSalaryRemaindersModal] = useState(false);
    const [editingSalaryId, setEditingSalaryId] = useState<number | string | null>(null);
    const [successSalaryId, setSuccessSalaryId] = useState<number | string | null>(null);
    const [salaryRemainderMonth, setSalaryRemainderMonth] = useState(currentMonthStr);
    const [salaryRemainderMode, setSalaryRemainderMode] = useState<'global' | 'employee'>('employee');
    const [salaryRemainderSearch, setSalaryRemainderSearch] = useState('');
    const [showAllEmployees, setShowAllEmployees] = useState(false);
    const [editingHistoryItem, setEditingHistoryItem] = useState<any>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [viewingData, setViewingData] = useState<any>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<string>('');

    // Master List Suggestions
    const [showExpSuggestions, setShowExpSuggestions] = useState(false);
    const [showAddMasterModal, setShowAddMasterModal] = useState(false);
    const [masterItemName, setMasterItemName] = useState('');

    const { data: suppliersData, refetch: refetchSuppliers } = useQuery(GET_SUPPLIERS);
    const { data: designationsData, refetch: refetchDesignations } = useQuery(GET_DESIGNATIONS);
    const [upsertSupplier] = useMutation(UPSERT_SUPPLIER);
    const [upsertDesignation] = useMutation(UPSERT_DESIGNATION);

    // Unpaid Invoices Modal State & Logic
    const [showUnpaidModal, setShowUnpaidModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState<any>(null);
    const [viewingUnpaidPhoto, setViewingUnpaidPhoto] = useState<any>(null);
    const [paymentDetails, setPaymentDetails] = useState({
        method: '',
        date: todayStr,
        photo_cheque_url: '',
        photo_verso_url: ''
    });
    const [imgZoom, setImgZoom] = useState(1);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [imgRotation, setImgRotation] = useState(0);
    const [bankTransactionType, setBankTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
    const [unpaidSearchFilter, setUnpaidSearchFilter] = useState('');
    const [unpaidCategoryFilter, setUnpaidCategoryFilter] = useState<'Tous' | 'Fournisseur' | 'Divers'>('Tous');
    const [unpaidDateRange, setUnpaidDateRange] = useState({ start: '', end: '' });

    const resetView = () => {
        setImgZoom(1);
        setImgRotation(0);
    };

    useEffect(() => {
        if (viewingData) resetView();
    }, [viewingData]);

    const { data: unpaidData, refetch: refetchUnpaid } = useQuery(GET_INVOICES, {
        pollInterval: 10000
    });

    const allFilteredUnpaid = useMemo(() => {
        return (unpaidData?.getInvoices || [])
            .filter((inv: any) => inv.status !== 'paid')
            .filter((inv: any) => {
                // Category filter
                if (unpaidCategoryFilter !== 'Tous') {
                    const invCat = (inv.category || 'Fournisseur').toLowerCase().trim();
                    const filterCat = unpaidCategoryFilter.toLowerCase().trim();
                    if (invCat !== filterCat) return false;
                }

                // Search filter (Supplier or Amount)
                if (unpaidSearchFilter) {
                    const searchLower = unpaidSearchFilter.toLowerCase();
                    const supplierMatch = inv.supplier_name?.toLowerCase().includes(searchLower);
                    const amountMatch = inv.amount?.toString().includes(unpaidSearchFilter);
                    if (!supplierMatch && !amountMatch) return false;
                }

                // Date range filter
                if (unpaidDateRange.start || unpaidDateRange.end) {
                    const invDate = new Date(inv.date);
                    if (unpaidDateRange.start) {
                        const startDate = new Date(unpaidDateRange.start);
                        if (invDate < startDate) return false;
                    }
                    if (unpaidDateRange.end) {
                        const endDate = new Date(unpaidDateRange.end);
                        if (invDate > endDate) return false;
                    }
                }

                return true;
            })
            .sort((a: any, b: any) => {
                const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
                if (dateDiff !== 0) return dateDiff;
                return parseInt(b.id) - parseInt(a.id);
            });
    }, [unpaidData, unpaidCategoryFilter, unpaidSearchFilter, unpaidDateRange]);

    // History Modal State
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showExpensesDetails, setShowExpensesDetails] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
    const [payerType, setPayerType] = useState<'all' | 'caisse' | 'riadh'>('all');
    const [historySearch, setHistorySearch] = useState('');
    const [historyDateRange, setHistoryDateRange] = useState({ start: '', end: '' });
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<{ name: string, category: string, subtitle: string, total: number, items: any[] } | null>(null);
    const [activeSegment, setActiveSegment] = useState<any>(null);
    const [activeCAProfitSegment, setActiveCAProfitSegment] = useState<'expenses' | 'personnel' | 'admin' | 'reste' | null>(null);
    const [hideAmounts, setHideAmounts] = useState(false);

    const maskAmount = (val: number | string, decimals = 3) => {
        if (hideAmounts) return '****';
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return num.toLocaleString('fr-FR', { minimumFractionDigits: decimals }).replace(/\s/g, ',');
    };

    const { data: historyData, refetch: refetchHistory } = useQuery(GET_INVOICES, {
        variables: { payer: 'riadh', startDate: '', endDate: '' },
        pollInterval: 5000,
    });

    const [execPayInvoice] = useMutation(PAY_INVOICE);
    const [execDeleteInvoice] = useMutation(DELETE_INVOICE);
    const [execUnpayInvoice] = useMutation(UNPAY_INVOICE);
    const [execUpdateInvoice] = useMutation(UPDATE_INVOICE);

    const handlePaySubmit = async () => {
        if (!showPayModal) return;

        if (!paymentDetails.method) {
            Swal.fire({
                icon: 'warning',
                title: 'Opération Interdite',
                text: 'Veuillez sélectionner un mode de paiement avant de confirmer.',
                confirmButtonColor: '#ef4444'
            });
            return;
        }

        try {
            await execPayInvoice({
                variables: {
                    id: parseInt(showPayModal.id),
                    payment_method: paymentDetails.method,
                    paid_date: paymentDetails.date,
                    photo_cheque_url: paymentDetails.photo_cheque_url,
                    photo_verso_url: paymentDetails.photo_verso_url,
                    payer: 'riadh'
                }
            });
            await refetchUnpaid();
            await refetch();
            setShowPayModal(null);
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Facture marquée comme payée',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (e) {
            console.error(e);
            Swal.fire('Erreur', 'Impossible de payer la facture', 'error');
        }
    };

    const handleDelete = async (inv: any) => {
        const isDirect = inv.origin === 'direct_expense';
        Swal.fire({
            title: isDirect ? 'Supprimer la dépense?' : 'Annuler le paiement?',
            text: isDirect
                ? "Cette dépense (Directe) sera définitivement supprimée de la base de données."
                : "Cette facture retournera dans la liste des non payés (Facturation).",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDirect ? '#ef4444' : '#f59e0b',
            cancelButtonColor: '#8c8279',
            confirmButtonText: isDirect ? 'Oui, supprimer' : 'Oui, remettre en non payé',
            cancelButtonText: 'Annuler'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (isDirect) {
                        await execDeleteInvoice({ variables: { id: parseInt(inv.id) } });
                        Swal.fire({
                            icon: 'success',
                            title: 'Supprimé!',
                            text: 'La dépense a été retirée définitivement.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } else {
                        await execUnpayInvoice({ variables: { id: parseInt(inv.id) } });
                        Swal.fire({
                            icon: 'success',
                            title: 'Annulé!',
                            text: 'Le paiement est annulé, la facture est de nouveau non payée.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        await refetchUnpaid();
                    }
                    await refetch();
                    await refetchHistory();
                } catch (e) {
                    console.error(e);
                    Swal.fire('Erreur', 'Une erreur est survenue lors de l\'opération', 'error');
                }
            }
        });
    };

    useEffect(() => {
        const savedUser = localStorage.getItem('bb_user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            if (parsed.role !== 'admin') {
                router.push('/');
            } else {
                setUser(parsed);
            }
        } else {
            router.push('/');
        }
        setInitializing(false);
    }, [router]);

    const handleEditInvoice = (inv: any) => {
        setEditingHistoryItem({
            ...inv,
            id: inv.id,
            origin: inv.origin,
            category: inv.category
        });
        setExpName(inv.supplier_name || '');
        setExpAmount(inv.amount ? inv.amount.toString() : '');
        setExpDate(inv.date || todayStr);
        setExpPhoto(inv.photo_url || '');
        setExpPhotoCheque(inv.photo_cheque_url || '');
        setExpPhotoVerso(inv.photo_verso_url || '');
        setExpMethod(inv.payment_method || 'Espèces');
        setExpDocType(inv.doc_type || 'Facture');
        setExpInvoiceNumber(inv.doc_number || '');
        setExpCategory(inv.category || 'Fournisseur');
        setShowExpForm(true);
        setShowUnpaidModal(false);
        // Scroll to the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const effectiveDateRange = useMemo(() => {
        if (activeFilter === 'month' && month) {
            const firstday = `${month}-01`;
            const [y, m] = month.split('-');
            const lastD = new Date(parseInt(y), parseInt(m), 0).getDate();
            const lastday = `${y}-${m}-${String(lastD).padStart(2, '0')}`;
            return { start: firstday, end: lastday };
        }
        return dateRange;
    }, [activeFilter, month, dateRange]);

    const safeParse = (val: any) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        const clean = val.toString().replace(/\s/g, '').replace(',', '.');
        return parseFloat(clean) || 0;
    };

    const { data, loading, refetch } = useQuery(GET_PAYMENT_DATA, {
        variables: {
            month: activeFilter === 'month' ? month : null,
            startDate: effectiveDateRange.start,
            endDate: effectiveDateRange.end
        },
        fetchPolicy: 'cache-and-network',
        pollInterval: 10000
    });

    useEffect(() => {
        refetchHistory();
    }, [activeFilter, month, dateRange]);

    const computedStats = useMemo(() => {
        const source = (payerType === 'riadh') ? [] : (data?.getChiffresByRange || []);
        const allInvoices = (data?.getInvoices || []);
        const riadhInvoicesRaw = allInvoices.filter((inv: any) => inv.status === 'paid' && inv.payer === 'riadh');
        const riadhExpenses = (payerType === 'caisse') ? [] : riadhInvoicesRaw;
        const riadhTotal = riadhExpenses.reduce((acc: number, inv: any) => acc + safeParse(inv.amount), 0);

        const bankExpenses = allInvoices
            .filter((inv: any) => inv.status === 'paid' && (inv.payment_method === 'Chèque' || inv.payment_method === 'TPE (Carte)' || inv.payment_method === 'Virement'))
            .reduce((acc: number, inv: any) => acc + safeParse(inv.amount), 0);

        const cashExpenses = allInvoices
            .filter((inv: any) => inv.status === 'paid' && inv.payment_method === 'Espèces' && (inv.origin !== 'daily_sheet'))
            .reduce((acc: number, inv: any) => acc + safeParse(inv.amount), 0);

        const ticketsExpenses = allInvoices
            .filter((inv: any) => inv.status === 'paid' && inv.payment_method === 'Ticket Restaurant' && (inv.origin !== 'daily_sheet'))
            .reduce((acc: number, inv: any) => acc + safeParse(inv.amount), 0);

        const aggregated = source.reduce((acc: any, curr: any) => ({
            chiffreAffaire: acc.chiffreAffaire + safeParse(curr.recette_de_caisse),
            reste: acc.reste + safeParse(curr.recette_net),
            cash: acc.cash + safeParse(curr.espaces),
            tpe: acc.tpe + safeParse(curr.tpe) + safeParse(curr.tpe2),
            cheque: acc.cheque + safeParse(curr.cheque_bancaire),
            tickets: acc.tickets + safeParse(curr.tickets_restaurant),
            expenses: acc.expenses + safeParse(curr.total_diponce)
        }), { chiffreAffaire: 0, reste: 0, cash: 0, tpe: 0, cheque: 0, tickets: 0, expenses: 0 });

        const pendingRemaindersTotal = (payerType === 'riadh') ? 0 : (data?.getSalaryRemainders || []).reduce((acc: number, r: any) => acc + safeParse(r.amount), 0);
        const bankDepositsTotal = (payerType === 'riadh') ? 0 : (data?.getBankDeposits || []).reduce((acc: number, d: any) => acc + safeParse(d.amount), 0);

        // Base Cash (Available from Sales/Espaces only)
        // Note: backend data?.getPaymentStats?.totalCash is now (sum of espaces - directCashExpenses)
        const totalEspaces = aggregated.chiffreAffaire > 0
            ? aggregated.cash
            : (payerType === 'riadh' ? 0 : (safeParse(data?.getPaymentStats?.totalCash) + cashExpenses));

        // Add Riadh's expenses and Pending Remainders
        const finalExpenses = (aggregated.expenses || (payerType === 'riadh' ? 0 : safeParse(data?.getPaymentStats?.totalExpenses))) + riadhTotal + pendingRemaindersTotal;

        // Final Reste (Net Revenue/Profit)
        const baseReste = (payerType === 'riadh') ? 0 : (aggregated.reste || safeParse(data?.getPaymentStats?.totalRecetteNette));
        const finalReste = baseReste - riadhTotal - pendingRemaindersTotal;

        // Final Cash = (Total Espaces) - (Pending Salary Remainders) - (Cash Expenses) - (Bank Transfers)
        const finalCash = totalEspaces - pendingRemaindersTotal - cashExpenses - bankDepositsTotal;

        // Final Tickets = (Gross Tickets) - (Ticket Expenses)
        const grossTickets = aggregated.chiffreAffaire > 0
            ? aggregated.tickets
            : (payerType === 'riadh' ? 0 : (safeParse(data?.getPaymentStats?.totalTicketsRestaurant) + ticketsExpenses));
        const finalTickets = grossTickets - ticketsExpenses;

        // Apply previews if forms are open
        let previewExpenses = finalExpenses;
        let previewReste = finalReste;
        let previewCash = finalCash;
        let previewTpe = (payerType === 'riadh') ? 0 : (aggregated.tpe || safeParse(data?.getPaymentStats?.totalTPE));
        let previewCheque = (payerType === 'riadh') ? 0 : (aggregated.cheque || safeParse(data?.getPaymentStats?.totalCheque));
        let previewTickets = (payerType === 'riadh') ? 0 : (finalTickets);

        // Expense Form Preview
        if (showExpForm && (parseFloat(expAmount) || 0) > 0) {
            const amount = parseFloat(expAmount) || 0;
            previewExpenses += amount;
            previewReste -= amount;
            if (expMethod === 'Espèces') previewCash -= amount;
            else if (['Chèque', 'TPE (Carte)'].includes(expMethod)) previewCheque -= amount;
            else if (expMethod === 'Ticket Restaurant') previewTickets -= amount;
        }

        // Payment Modal Preview
        if (showPayModal && (parseFloat(showPayModal.amount) || 0) > 0) {
            const amount = parseFloat(showPayModal.amount) || 0;
            previewExpenses += amount;
            previewReste -= amount;
            // Force deduction based on current selected method
            const currentMethod = paymentDetails.method;
            if (currentMethod === 'Espèces') previewCash -= amount;
            else if (['Chèque', 'Virement', 'TPE (Carte)'].includes(currentMethod)) previewCheque -= amount;
            else if (currentMethod === 'Ticket Restaurant') previewTickets -= amount;
        }

        let previewBankDeposits = bankDepositsTotal;
        if (showBankForm && (parseFloat(bankAmount) || 0) > 0) {
            const amount = parseFloat(bankAmount) || 0;
            if (bankTransactionType === 'deposit') {
                previewCash -= amount;
                previewBankDeposits += amount;
            } else if (bankTransactionType === 'withdraw') {
                previewCash += amount;
                previewBankDeposits -= amount;
            }
        }

        const finalBancaire = previewTpe + previewBankDeposits + previewCheque - bankExpenses;

        return {
            chiffreAffaire: (payerType === 'riadh') ? 0 : (aggregated.chiffreAffaire || safeParse(data?.getPaymentStats?.totalRecetteCaisse)),
            reste: previewReste,
            cash: previewCash,
            tpe: previewTpe,
            cheque: previewCheque,
            tickets: previewTickets,
            expenses: previewExpenses,
            bancaire: finalBancaire,
            bankExpenses
        };
    }, [data, payerType, showExpForm, expAmount, expMethod, showPayModal, paymentDetails, showBankForm, bankAmount, bankTransactionType]);

    const hasNegativeValues = computedStats.reste < 0 || computedStats.cash < 0 || computedStats.bancaire < 0 || computedStats.tickets < 0;

    const setThisWeek = () => {
        const now = new Date();
        const first = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1); // Monday

        const firstD = new Date(new Date().setDate(first));
        const fy = firstD.getFullYear();
        const fm = String(firstD.getMonth() + 1).padStart(2, '0');
        const fd = String(firstD.getDate()).padStart(2, '0');
        const firstday = `${fy}-${fm}-${fd}`;

        const lastday = todayStr;

        setDateRange({ start: firstday, end: lastday });
        setActiveFilter('week');
        setMonth(null);
    };

    const setThisYear = () => {
        const now = new Date();
        const firstday = `${now.getFullYear()}-01-01`;
        const lastday = todayStr;

        setDateRange({ start: firstday, end: lastday });
        setActiveFilter('year');
        setMonth(null);
    };

    const handleCustomDateChange = (type: 'start' | 'end', val: string) => {
        setDateRange(prev => ({ ...prev, [type]: val }));
        setActiveFilter('custom');
        setMonth(null);
    };

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const [addBankDeposit, { loading: addingBank }] = useMutation(ADD_BANK_DEPOSIT);
    const [updateBankDeposit] = useMutation(UPDATE_BANK_DEPOSIT);
    const [deleteBankDeposit] = useMutation(DELETE_BANK_DEPOSIT);
    const [addPaidInvoice, { loading: addingExp }] = useMutation(ADD_PAID_INVOICE);
    const [upsertSalaryRemainder] = useMutation(UPSERT_SALARY_REMAINDER);
    const [deleteSalaryRemainder] = useMutation(DELETE_SALARY_REMAINDER);

    const filteredUsers = useMemo(() => {
        if (!data?.getPaidUsers) return [];
        return data.getPaidUsers.filter((u: any) =>
            u.username.toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search]);

    const stats = data?.getPaymentStats || {
        totalRecetteNette: 0,
        totalFacturesPayees: 0,
        totalUnpaidInvoices: 0,
        totalTPE: 0,
        totalCheque: 0,
        totalCash: 0,
        totalBankDeposits: 0,
        totalRecetteCaisse: 0,
        totalExpenses: 0,
        totalRiadhExpenses: 0,
        totalTicketsRestaurant: 0,
        totalRestesSalaires: 0
    };

    const miniChartData = useMemo(() => {
        if (!data?.getChiffresByRange) return [];
        return [...data.getChiffresByRange]
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-31)
            .map((d: any) => ({
                name: d.date,
                value: parseFloat(d.recette_net || 0)
            }));
    }, [data]);

    const expenseDetails = useMemo(() => {
        const sourceData = (payerType === 'riadh') ? [] : (data?.getChiffresByRange || []);
        if (!data) return {
            fournisseurs: [], divers: [], administratif: [],
            avances: [], doublages: [], extras: [], primes: [], restesSalaires: [], remainders: []
        };
        const base = {
            fournisseurs: [], divers: [], administratif: [],
            avances: [], doublages: [], extras: [], primes: [], restesSalaires: [], remainders: []
        };

        // Aggregation from Daily Sheets (using sourceData which can be getChiffresByRange)
        const agg = sourceData.reduce((acc: any, curr: any) => {
            const d_raw: any[] = [];
            try { d_raw.push(...JSON.parse(curr.diponce || '[]')); } catch (e) { }

            const v_raw: any[] = [];
            try { v_raw.push(...JSON.parse(curr.diponce_divers || '[]')); } catch (e) { }

            const a_raw: any[] = [];
            try { a_raw.push(...JSON.parse(curr.diponce_admin || '[]')); } catch (e) { }

            // Distribute merged items from d_raw if they have a specific category
            const f_final = [...d_raw.filter(i => !i.isFromFacturation || (i.category !== 'Divers' && i.category !== 'Administratif'))];
            const v_final = [...v_raw, ...d_raw.filter(i => i.isFromFacturation && i.category === 'Divers')];
            const a_final = [...a_raw, ...d_raw.filter(i => i.isFromFacturation && i.category === 'Administratif')];

            return {
                ...acc,
                fournisseurs: [...acc.fournisseurs, ...f_final.map((i: any) => ({ ...i, date: curr.date }))],
                divers: [...acc.divers, ...v_final.map((i: any) => ({ ...i, date: curr.date }))],
                administratif: [...acc.administratif, ...a_final.map((i: any) => ({ ...i, date: curr.date }))],
                avances: [...acc.avances, ...curr.avances_details.map((i: any) => ({ ...i, date: curr.date }))],
                doublages: [...acc.doublages, ...curr.doublages_details.map((i: any) => ({ ...i, date: curr.date }))],
                extras: [...acc.extras, ...curr.extras_details.map((i: any) => ({ ...i, date: curr.date }))],
                primes: [...acc.primes, ...curr.primes_details.map((i: any) => ({ ...i, date: curr.date }))],
                restesSalaires: [...acc.restesSalaires, ...(curr.restes_salaires_details || []).map((i: any) => ({ ...i, date: curr.date }))]
            };
        }, { ...base });

        // Add Pending Salary Remainders (from Restes Salaires module)
        if (payerType !== 'riadh') {
            const pendingRemainders = data?.getSalaryRemainders || [];
            pendingRemainders.forEach((r: any) => {
                // Convert updated_at to proper date string if it's a timestamp
                let dateStr = new Date().toISOString();
                if (r.updated_at) {
                    const timestamp = Number(r.updated_at);
                    if (!isNaN(timestamp)) {
                        dateStr = new Date(timestamp).toISOString();
                    } else if (typeof r.updated_at === 'string') {
                        dateStr = r.updated_at;
                    }
                }

                agg.restesSalaires.push({
                    username: r.employee_name,
                    montant: r.amount,
                    date: dateStr,
                    updated_at: dateStr,
                    isPending: true
                });
            });
        }

        // Add Riadh's paid invoices
        const riadhInvoices = (payerType === 'caisse') ? [] : (data?.getInvoices || []).filter((inv: any) => inv.status === 'paid' && inv.payer === 'riadh');
        riadhInvoices.forEach((inv: any) => {
            let invPhotos = [];
            try {
                invPhotos = typeof inv.photos === 'string' ? JSON.parse(inv.photos) : (Array.isArray(inv.photos) ? inv.photos : []);
            } catch (e) {
                invPhotos = inv.photo_url ? [inv.photo_url] : [];
            }
            if (invPhotos.length === 0 && inv.photo_url) invPhotos = [inv.photo_url];

            const item = {
                supplier: inv.supplier_name,
                designation: inv.supplier_name,
                amount: inv.amount,
                paymentMethod: inv.payment_method,
                invoices: invPhotos,
                photo_cheque: inv.photo_cheque_url,
                photo_verso: inv.photo_verso_url,
                isFromFacturation: true,
                invoiceId: inv.id,
                doc_type: inv.doc_type,
                doc_number: inv.doc_number,
                category: inv.category,
                date: inv.paid_date || inv.date,
                doc_date: inv.date,
                paid_date: inv.paid_date
            };
            if (inv.category === 'Divers') agg.divers.push(item);
            else if (inv.category === 'Administratif') agg.administratif.push(item);
            else agg.fournisseurs.push(item);
        });

        // Invoices are already merged in the backend via getChiffresByRange.
        // Manual merging is removed to prevent double counting.

        const groupingFunction = (list: any[], nameKey: string, amountKey: string) => {
            const map = new Map<string, { total: number, items: any[] }>();
            list.forEach(item => {
                const name = item[nameKey];
                if (!name) return;
                const amt = parseFloat(item[amountKey] || '0');
                if (!map.has(name)) map.set(name, { total: 0, items: [] });
                const current = map.get(name)!;
                current.total += amt;
                current.items.push({
                    ...item,
                    amount: amt,
                    date: item.date || item.created_at || item.updated_at
                });
            });
            return Array.from(map.entries())
                .map(([name, d]) => ({
                    name,
                    amount: d.total,
                    items: d.items.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                }))
                .filter(x => x.amount > 0)
                .sort((a, b) => b.amount - a.amount);
        };

        const aggParsed = {
            fournisseurs: agg.fournisseurs.map((i: any) => ({ ...i, amount: safeParse(i.amount) })),
            divers: agg.divers.map((i: any) => ({ ...i, amount: safeParse(i.amount) })),
            administratif: agg.administratif.map((i: any) => ({ ...i, amount: safeParse(i.amount) })),
            avances: agg.avances.map((i: any) => ({ ...i, montant: safeParse(i.montant) })),
            doublages: agg.doublages.map((i: any) => ({ ...i, montant: safeParse(i.montant) })),
            extras: agg.extras.map((i: any) => ({ ...i, montant: safeParse(i.montant) })),
            primes: agg.primes.map((i: any) => ({ ...i, montant: safeParse(i.montant) })),
            restesSalaires: agg.restesSalaires.map((i: any) => ({ ...i, montant: safeParse(i.montant) }))
        };

        return {
            fournisseurs: groupingFunction(aggParsed.fournisseurs, 'supplier', 'amount'),
            divers: groupingFunction(aggParsed.divers, 'designation', 'amount'),
            administratif: groupingFunction(aggParsed.administratif, 'designation', 'amount'),
            avances: groupingFunction(aggParsed.avances, 'username', 'montant'),
            doublages: groupingFunction(aggParsed.doublages, 'username', 'montant'),
            extras: groupingFunction(aggParsed.extras, 'username', 'montant'),
            primes: groupingFunction(aggParsed.primes, 'username', 'montant'),
            remainders: groupingFunction(aggParsed.restesSalaires, 'username', 'montant')
        };
    }, [data, payerType]);

    const totals = useMemo(() => {
        const f_total = expenseDetails.fournisseurs.reduce((a: number, b: any) => a + b.amount, 0);
        const d_total = expenseDetails.divers.reduce((a: number, b: any) => a + b.amount, 0);
        const a_total = expenseDetails.administratif.reduce((a: number, b: any) => a + b.amount, 0);

        const p_total = expenseDetails.avances.reduce((a: number, b: any) => a + b.amount, 0) +
            expenseDetails.doublages.reduce((a: number, b: any) => a + b.amount, 0) +
            expenseDetails.extras.reduce((a: number, b: any) => a + b.amount, 0) +
            expenseDetails.primes.reduce((a: number, b: any) => a + b.amount, 0) +
            expenseDetails.remainders.reduce((a: number, b: any) => a + b.amount, 0);

        return {
            fournisseurs: f_total,
            divers: d_total,
            administratif: a_total,
            personnel: p_total,
            expenses: f_total + d_total, // "Dépenses" without personnel/admin
            salaries: p_total,
            global: f_total + d_total + a_total + p_total
        };
    }, [expenseDetails]);

    const masterSuggestions = useMemo(() => {
        const sList = (suppliersData?.getSuppliers || []).map((s: any) => s.name);
        const dList = (designationsData?.getDesignations || []).map((d: any) => d.name);
        return { suppliers: sList, divers: dList };
    }, [suppliersData, designationsData]);

    const chartData = useMemo(() => {
        const categories = [
            { label: 'Fournisseurs', value: expenseDetails.fournisseurs.reduce((a: number, b: any) => a + b.amount, 0), color: '#ef4444' }, // Red
            { label: 'Divers', value: expenseDetails.divers.reduce((a: number, b: any) => a + b.amount, 0), color: '#f59e0b' },      // Amber
            { label: 'Administratif', value: expenseDetails.administratif.reduce((a: number, b: any) => a + b.amount, 0), color: '#10b981' }, // Emerald
            {
                label: 'Salaires + Avances',
                value: expenseDetails.avances.reduce((a: number, b: any) => a + b.amount, 0) +
                    expenseDetails.remainders.reduce((a: number, b: any) => a + b.amount, 0),
                color: '#6366f1'
            },     // Indigo (Merged Avances + Remainders)
            { label: 'Doublage', value: expenseDetails.doublages.reduce((a: number, b: any) => a + b.amount, 0), color: '#78716c' },  // Stone/Gray
            { label: 'Extras', value: expenseDetails.extras.reduce((a: number, b: any) => a + b.amount, 0), color: '#ec4899' },      // Pink
            { label: 'Primes', value: expenseDetails.primes.reduce((a: number, b: any) => a + b.amount, 0), color: '#06b6d4' }       // Cyan
        ];

        const total = categories.reduce((acc, cat) => acc + cat.value, 0) || 1;
        let cumulativeValue = 0;

        return categories.map(cat => {
            const percentage = (cat.value / total);
            const startOffset = (cumulativeValue / total);
            cumulativeValue += cat.value;
            return { ...cat, percentage, startOffset };
        }).filter(c => c.value > 0);
    }, [expenseDetails]);

    useEffect(() => {
        if (showExpensesDetails) {
            if (chartData.length > 0 && !activeSegment) {
                const fournisseurs = chartData.find(s => s.label === 'Fournisseurs');
                if (fournisseurs) {
                    setActiveSegment(fournisseurs);
                } else {
                    setActiveSegment(chartData[0]);
                }
            }
        } else {
            setActiveSegment(null);
        }
    }, [showExpensesDetails, chartData, activeSegment]);

    // Selection & Long Press Logic for Expenses Modal
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const longPressTimer = useRef<any>(null);
    const isLongPress = useRef(false);

    const startPress = (idx: number) => {
        isLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            setSelectedCategories(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
        }, 500);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedCategories([]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const cancelPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const selectedTotal = selectedCategories.reduce((acc, idx) => {
        const cats = [
            { items: expenseDetails.fournisseurs },
            { items: expenseDetails.avances },
            { items: expenseDetails.primes },
            { items: expenseDetails.divers },
            { items: expenseDetails.doublages },
            { items: expenseDetails.remainders },
            { items: expenseDetails.administratif },
            { items: expenseDetails.extras },
        ];
        const target = cats[idx];
        return acc + (target?.items || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    }, 0);

    const handleCardClick = (idx: number, cat: any, labelMap: any, hasItems: boolean) => {
        if (isLongPress.current) return; // Ignore click if it was a long press

        // If we are in "Selection Mode" (some items selected), simple click toggles selection instead of expanding
        if (selectedCategories.length > 0) {
            setSelectedCategories(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
            return;
        }

        // Normal Behavior
        const seg = chartData.find(s => s.label === labelMap[cat.title]);
        if (seg) setActiveSegment(seg);

        if (!hasItems) return;
        setExpandedCategories(prev =>
            (prev || []).includes(idx) ? (prev || []).filter((i: number) => i !== idx) : [...(prev || []), idx]
        );
    };

    const handleBankSubmit = async () => {
        if (!bankAmount || !bankDate) return;
        try {
            const rawAmount = Math.abs(parseFloat(bankAmount));
            const finalAmount = bankTransactionType === 'withdraw' ? -rawAmount : rawAmount;

            if (editingDeposit) {
                await updateBankDeposit({
                    variables: {
                        id: parseInt(editingDeposit.id),
                        amount: finalAmount.toString(),
                        date: bankDate,
                        type: bankTransactionType
                    }
                });
                setEditingDeposit(null);
            } else {
                await addBankDeposit({
                    variables: {
                        amount: finalAmount.toString(),
                        date: bankDate,
                        type: bankTransactionType
                    }
                });
            }
            setBankAmount('');
            setShowBankForm(false);
            refetch();
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: editingDeposit ? 'Transaction mise à jour' : (bankTransactionType === 'withdraw' ? 'Retrait effectué' : 'Versement effectué'),
                timer: 1500,
                showConfirmButton: false
            });
        } catch (e) {
            console.error(e);
            Swal.fire('Erreur', 'Une erreur est survenue', 'error');
        }
    };

    const handleEditDepositClick = (d: any) => {
        if (showBankForm) {
            setShowBankForm(false);
            setEditingDeposit(null);
            setBankAmount('');
        } else {
            setEditingDeposit(d);
            setBankAmount(d.amount);
            setBankDate(d.date);
            setShowBankForm(true);
        }
    };

    const handleAddMasterItem = async () => {
        if (!masterItemName.trim()) return;
        try {
            if (expCategory === 'Divers') {
                await upsertDesignation({ variables: { name: masterItemName.trim() } });
                refetchDesignations();
            } else {
                await upsertSupplier({ variables: { name: masterItemName.trim() } });
                refetchSuppliers();
            }
            setExpName(masterItemName.trim());
            setShowAddMasterModal(false);
            setMasterItemName('');
            Swal.fire({
                title: 'Enregistré!',
                text: `${expCategory === 'Divers' ? 'Désignation' : 'Fournisseur'} ajouté avec succès.`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error adding master item:", err);
            Swal.fire('Erreur', "Impossible d'ajouter l'élément", 'error');
        }
    };

    const handleEditHistoryItemClick = (inv: any) => {
        if (showExpForm) {
            setShowExpForm(false);
            setEditingHistoryItem(null);
            setExpName('');
            setExpAmount('');
        } else {
            setEditingHistoryItem(inv);
            setExpName(inv.supplier_name);
            setExpAmount(inv.amount);
            setExpDate(inv.date);
            setExpMethod(inv.payment_method);
            setExpDocType(inv.doc_type || 'Facture');
            setExpInvoiceNumber(inv.doc_number || '');
            setShowExpForm(true);
            setShowHistoryModal(false);
        }
    };

    const handleDeleteDeposit = (d: any) => {
        Swal.fire({
            title: 'Êtes-vous sûr?',
            text: "Ce versement sera supprimé définitivement.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteBankDeposit({ variables: { id: parseInt(d.id) } });
                    refetch();
                    Swal.fire('Supprimé!', 'Versement supprimé avec succès.', 'success');
                } catch (e) {
                    console.error(e);
                    Swal.fire('Erreur', 'Impossible de supprimer', 'error');
                }
            }
        });
    };

    const handleExpSubmit = async () => {
        if (!expName || !expAmount || !expDate) return;
        if (!expCategory && !editingHistoryItem) {
            Swal.fire('Catégorie requise', 'Veuillez sélectionner une catégorie (Fournisseur ou Divers)', 'warning');
            return;
        }
        try {
            if (editingHistoryItem) {
                await execUpdateInvoice({
                    variables: {
                        id: parseInt(editingHistoryItem.id),
                        supplier_name: expName,
                        amount: expAmount,
                        date: expDate,
                        payment_method: expMethod,
                        paid_date: expDate,
                        doc_type: expDocType,
                        doc_number: expInvoiceNumber,
                        category: expCategory || editingHistoryItem.category
                    }
                });
                Swal.fire('Mis à jour!', 'Dépense mise à jour avec succès.', 'success');
                setEditingHistoryItem(null);
            } else {
                await addPaidInvoice({
                    variables: {
                        supplier_name: expName,
                        amount: expAmount,
                        date: expDate,
                        photo_url: expPhoto,
                        photo_cheque_url: expPhotoCheque,
                        photo_verso_url: expPhotoVerso,
                        payment_method: expMethod,
                        paid_date: expDate,
                        payer: 'riadh',
                        doc_type: expDocType,
                        doc_number: expInvoiceNumber,
                        category: expCategory
                    }
                });
                Swal.fire('Ajouté!', 'Dépense ajoutée avec succès.', 'success');
            }
            setExpName('');
            setExpAmount('');
            setExpPhoto('');
            setExpPhotoCheque('');
            setExpPhotoVerso('');
            setExpInvoiceNumber('');
            setExpCategory('');
            setShowExpForm(false);
            refetch();
            refetchHistory();
        } catch (e) {
            console.error(e);
            Swal.fire('Erreur', 'Une erreur est survenue lors de l\'enregistrement', 'error');
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'recto' | 'verso' = 'invoice') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === 'recto') setExpPhotoCheque(reader.result as string);
            else if (type === 'verso') setExpPhotoVerso(reader.result as string);
            else setExpPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    if (initializing || !user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
            <Loader2 className="animate-spin text-[#c69f6e]" size={40} />
        </div>
    );

    return (
        <div className={`flex min-h-screen transition-colors duration-700 ${hasNegativeValues ? 'bg-[#80201E]' : 'bg-[#f8f5f2]'}`}>
            <Sidebar role={user.role} />

            <div className="flex-1 min-w-0 pb-24 lg:pb-0">
                <header className={`sticky top-0 z-30 backdrop-blur-md border-b py-6 px-4 md:px-8 flex flex-col md:flex-row items-center gap-6 transition-colors duration-700 ${hasNegativeValues ? 'bg-[#80201E]/90 border-red-900/40' : 'bg-white/90 border-[#e6dace]'}`}>
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <h1 className={`text-xl md:text-2xl font-black tracking-tight transition-colors duration-700 ${hasNegativeValues ? 'text-white' : 'text-[#4a3426]'}`}>Finances</h1>

                        {/* Mobile Filter Toggle Button */}
                        <button
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                            className={`md:hidden flex items-center justify-center w-10 h-10 rounded-xl border shadow-sm transition-all ${
                                hasNegativeValues
                                    ? 'bg-[#942c2a] border-red-900/40 text-white'
                                    : 'bg-white border-[#e6dace] text-[#4a3426]'
                            }`}
                        >
                            <motion.div
                                animate={{ rotate: mobileFiltersOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={20} />
                            </motion.div>
                        </button>
                    </div>

                    <div className={`flex-1 flex-col md:flex-row items-center justify-center gap-3 w-full ${mobileFiltersOpen ? 'flex' : 'hidden md:flex'}`}>
                        <div className={`flex rounded-2xl p-1 border shadow-sm w-full md:w-auto transition-colors duration-700 ${hasNegativeValues ? 'bg-[#942c2a] border-red-900/40' : 'bg-white border-[#e6dace]'}`}>
                            <button
                                onClick={() => {
                                    setActiveFilter('month');
                                    setMonth(currentMonthStr);
                                }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'month' ? 'bg-[#4a3426] text-white shadow-md' : 'text-[#8c8279] hover:bg-gray-50'}`}
                            >
                                Ce Mois
                            </button>
                            <button
                                onClick={setThisWeek}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'week' ? 'bg-[#4a3426] text-white shadow-md' : 'text-[#8c8279] hover:bg-gray-50'}`}
                            >
                                Cette Semaine
                            </button>
                            <button
                                onClick={setThisYear}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'year' ? 'bg-[#4a3426] text-white shadow-md' : 'text-[#8c8279] hover:bg-gray-50'}`}
                            >
                                Cette Année
                            </button>
                        </div>

                        {/* SOURCE FILTER: Payer Par */}
                        <div className={`flex rounded-2xl p-1 border shadow-sm w-full md:w-auto transition-colors duration-700 ${hasNegativeValues ? 'bg-[#942c2a] border-red-900/40' : 'bg-white border-[#e6dace]'}`}>
                            {[
                                { id: 'all', label: 'Tout' },
                                { id: 'caisse', label: 'Caisse' },
                                { id: 'riadh', label: 'Riadh' }
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setPayerType(p.id as any)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${payerType === p.id ? 'bg-[#c69f6e] text-white shadow-md' : 'text-[#8c8279] hover:bg-gray-50'}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <div className="relative">
                                <PremiumMonthPicker
                                    value={month || ''}
                                    onChange={(val) => {
                                        setActiveFilter('month');
                                        setMonth(val);
                                    }}
                                    align="right"
                                />

                            </div>

                            <div className={`flex items-center gap-3 rounded-3xl p-1.5 border shadow-sm transition-colors duration-700 ${hasNegativeValues ? 'bg-[#942c2a] border-red-900/40' : 'bg-white border-[#e6dace]'}`}>
                                <PremiumDatePicker
                                    label="Début"
                                    value={dateRange.start}
                                    onChange={(val) => handleCustomDateChange('start', val)}
                                />
                                <span className="text-[#c69f6e] font-black text-[12px] opacity-30">→</span>
                                <PremiumDatePicker
                                    label="Fin"
                                    value={dateRange.end}
                                    onChange={(val) => handleCustomDateChange('end', val)}
                                    align="right"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">
                    {/* Financial Summary Grid - 3 Columns */}
                    <div className="flex flex-col gap-4 mb-12">
                        {/* 1. Chiffre d'Affaire */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-[#56b350] p-8 rounded-[2.5rem] shadow-lg relative overflow-hidden group hover:scale-[1.005] transition-all text-white h-44 flex flex-col justify-center cursor-default"
                        >
                            <div className="relative z-10 flex items-center justify-between gap-8">
                                <div>
                                    <div className="flex items-center gap-4 text-white/90 mb-4 uppercase text-[11px] font-bold tracking-[0.2em]">
                                        <div className="flex items-center gap-3">
                                            <FileText size={18} /> Chiffre d'Affaire
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setHideAmounts(!hideAmounts);
                                            }}
                                            className="w-8 h-8 bg-black/20 hover:bg-black/40 rounded-lg flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/5"
                                            title={hideAmounts ? "Afficher les montants" : "Masquer les montants"}
                                        >
                                            {hideAmounts ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                    </div>
                                    <h3 className="text-6xl font-black tracking-tighter mb-2">
                                        {maskAmount(computedStats.chiffreAffaire)}
                                    </h3>
                                    <span className="text-lg font-bold opacity-80 block uppercase tracking-widest">DT</span>
                                </div>

                                <div className="hidden lg:flex items-center gap-6 bg-white/10 backdrop-blur-md rounded-[2.5rem] p-6 pr-10 border border-white/20">
                                    <div className="relative w-28 h-28 flex-shrink-0">
                                        <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                                            {/* Border/Background circle */}
                                            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="transparent" />

                                            {(() => {
                                                const total = computedStats.chiffreAffaire || 1;
                                                const depPerc = (totals.expenses / total) * 100;
                                                const personnelPerc = (totals.personnel / total) * 100;
                                                const adminPerc = (totals.administratif / total) * 100;
                                                const restePerc = (computedStats.reste / total) * 100;

                                                const circum = 2 * Math.PI * 40;

                                                const depDash = (depPerc / 100) * circum - (depPerc > 0 ? 2 : 0);
                                                const personnelDash = (personnelPerc / 100) * circum - (personnelPerc > 0 ? 2 : 0);
                                                const adminDash = (adminPerc / 100) * circum - (adminPerc > 0 ? 2 : 0);
                                                const resteDash = (restePerc / 100) * circum - (restePerc > 0 ? 2 : 0);

                                                return (
                                                    <>
                                                        {/* Dépenses (Fournisseurs + Divers) - Red */}
                                                        {depPerc > 0 && (
                                                            <motion.circle
                                                                cx="50" cy="50" r="40"
                                                                stroke="#ef4444"
                                                                strokeWidth={activeCAProfitSegment === 'expenses' ? 16 : 12}
                                                                fill="transparent"
                                                                strokeDasharray={`${Math.max(0, depDash)} ${circum}`}
                                                                initial={{ strokeDashoffset: circum }}
                                                                animate={{ strokeDashoffset: 0, scale: activeCAProfitSegment === 'expenses' ? 1.1 : 1 }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                strokeLinecap="round"
                                                                style={{ cursor: 'pointer', transformOrigin: 'center' }}
                                                                pointerEvents="visibleStroke"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveCAProfitSegment(activeCAProfitSegment === 'expenses' ? null : 'expenses');
                                                                }}
                                                            />
                                                        )}
                                                        {/* Personnel - Amber */}
                                                        {personnelPerc > 0 && (
                                                            <motion.circle
                                                                cx="50" cy="50" r="40"
                                                                stroke="#f59e0b"
                                                                strokeWidth={activeCAProfitSegment === 'personnel' ? 16 : 12}
                                                                fill="transparent"
                                                                strokeDasharray={`${Math.max(0, personnelDash)} ${circum}`}
                                                                initial={{ strokeDashoffset: circum }}
                                                                animate={{
                                                                    strokeDashoffset: - (depPerc / 100) * circum,
                                                                    scale: activeCAProfitSegment === 'personnel' ? 1.1 : 1
                                                                }}
                                                                transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                                                                strokeLinecap="round"
                                                                style={{ cursor: 'pointer', transformOrigin: 'center' }}
                                                                pointerEvents="visibleStroke"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveCAProfitSegment(activeCAProfitSegment === 'personnel' ? null : 'personnel');
                                                                }}
                                                            />
                                                        )}
                                                        {/* Administratif - Emerald */}
                                                        {adminPerc > 0 && (
                                                            <motion.circle
                                                                cx="50" cy="50" r="40"
                                                                stroke="#a855f7"
                                                                strokeWidth={activeCAProfitSegment === 'admin' ? 16 : 12}
                                                                fill="transparent"
                                                                strokeDasharray={`${Math.max(0, adminDash)} ${circum}`}
                                                                initial={{ strokeDashoffset: circum }}
                                                                animate={{
                                                                    strokeDashoffset: - ((depPerc + personnelPerc) / 100) * circum,
                                                                    scale: activeCAProfitSegment === 'admin' ? 1.1 : 1
                                                                }}
                                                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                                                strokeLinecap="round"
                                                                style={{ cursor: 'pointer', transformOrigin: 'center' }}
                                                                pointerEvents="visibleStroke"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveCAProfitSegment(activeCAProfitSegment === 'admin' ? null : 'admin');
                                                                }}
                                                            />
                                                        )}
                                                        {/* Reste - Blue */}
                                                        {restePerc > 0 && (
                                                            <motion.circle
                                                                cx="50" cy="50" r="40"
                                                                stroke="#0154A2"
                                                                strokeWidth={activeCAProfitSegment === 'reste' ? 16 : 12}
                                                                fill="transparent"
                                                                strokeDasharray={`${Math.max(0, resteDash)} ${circum}`}
                                                                initial={{ strokeDashoffset: circum }}
                                                                animate={{
                                                                    strokeDashoffset: - ((depPerc + personnelPerc + adminPerc) / 100) * circum,
                                                                    scale: activeCAProfitSegment === 'reste' ? 1.1 : 1
                                                                }}
                                                                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                                                strokeLinecap="round"
                                                                style={{ cursor: 'pointer', transformOrigin: 'center' }}
                                                                pointerEvents="visibleStroke"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveCAProfitSegment(activeCAProfitSegment === 'reste' ? null : 'reste');
                                                                }}
                                                            />
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                                            <span className="text-[10px] font-black opacity-60 uppercase mb-[-2px]">
                                                {(() => {
                                                    if (activeCAProfitSegment === 'expenses') return 'Dép.';
                                                    if (activeCAProfitSegment === 'personnel') return 'Pers.';
                                                    if (activeCAProfitSegment === 'admin') return 'Adm.';
                                                    return 'Rest.';
                                                })()}
                                            </span>
                                            <span className="text-xl font-black">
                                                {(() => {
                                                    if (hideAmounts) return '***';
                                                    const total = computedStats.chiffreAffaire || 1;
                                                    if (activeCAProfitSegment === 'expenses') return Math.round((totals.expenses / total) * 100) + '%';
                                                    if (activeCAProfitSegment === 'personnel') return Math.round((totals.personnel / total) * 100) + '%';
                                                    if (activeCAProfitSegment === 'admin') return Math.round((totals.administratif / total) * 100) + '%';
                                                    return Math.round((computedStats.reste / total) * 100) + '%';
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveCAProfitSegment(activeCAProfitSegment === 'expenses' ? null : 'expenses');
                                            }}
                                            className={`flex items-center gap-2 transition-all ${activeCAProfitSegment === 'expenses' ? 'scale-110 translate-x-1' : 'opacity-80'}`}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${activeCAProfitSegment === 'expenses' ? 'text-[#ef4444] text-[10px]' : 'text-white'}`}>
                                                Dépenses: {hideAmounts ? '***' : Math.round((totals.expenses / (computedStats.chiffreAffaire || 1)) * 100) + '%'}
                                            </span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveCAProfitSegment(activeCAProfitSegment === 'personnel' ? null : 'personnel');
                                            }}
                                            className={`flex items-center gap-2 transition-all ${activeCAProfitSegment === 'personnel' ? 'scale-110 translate-x-1' : 'opacity-80'}`}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${activeCAProfitSegment === 'personnel' ? 'text-[#f59e0b] text-[10px]' : 'text-white'}`}>
                                                Personnel: {hideAmounts ? '***' : Math.round((totals.personnel / (computedStats.chiffreAffaire || 1)) * 100) + '%'}
                                            </span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveCAProfitSegment(activeCAProfitSegment === 'admin' ? null : 'admin');
                                            }}
                                            className={`flex items-center gap-2 transition-all ${activeCAProfitSegment === 'admin' ? 'scale-110 translate-x-1' : 'opacity-80'}`}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.3)]" />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${activeCAProfitSegment === 'admin' ? 'text-[#a855f7] text-[10px]' : 'text-white'}`}>
                                                Admin: {hideAmounts ? '***' : Math.round((totals.administratif / (computedStats.chiffreAffaire || 1)) * 100) + '%'}
                                            </span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveCAProfitSegment(activeCAProfitSegment === 'reste' ? null : 'reste');
                                            }}
                                            className={`flex items-center gap-2 transition-all ${activeCAProfitSegment === 'reste' ? 'scale-110 translate-x-1' : 'opacity-80'}`}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-[#0154A2] shadow-[0_0_8px_rgba(1,84,162,0.3)]" />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${activeCAProfitSegment === 'reste' ? 'text-[#0154A2] text-[10px]' : 'text-white'}`}>
                                                Reste: {hideAmounts ? '***' : (computedStats.chiffreAffaire > 0 ? Math.round((computedStats.reste / computedStats.chiffreAffaire) * 100) : 0) + '%'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute right-8 bottom-[-20%] opacity-15 group-hover:scale-110 transition-transform duration-500 text-white">
                                <Wallet size={200} />
                            </div>
                        </motion.div>

                        {/* 2. Total Dépenses - RED */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            onClick={() => setShowExpensesDetails(true)}
                            className="bg-[#ef4444] p-8 rounded-[2.5rem] shadow-lg relative overflow-hidden group hover:scale-[1.005] transition-all text-white h-44 flex flex-col justify-center cursor-pointer"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-white/90 mb-4 uppercase text-[11px] font-bold tracking-[0.2em]">
                                    <Banknote size={18} /> Total Dépenses
                                </div>
                                <h3 className="text-6xl font-black tracking-tighter mb-2">
                                    {maskAmount(computedStats.expenses)}
                                </h3>
                                <span className="text-lg font-bold opacity-80 block uppercase tracking-widest">DT</span>
                            </div>
                            <div className="absolute right-8 bottom-[-20%] opacity-15 group-hover:scale-110 transition-transform duration-500 text-white">
                                <Banknote size={200} />
                            </div>
                        </motion.div>

                        {/* 3. Reste */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className={`${computedStats.reste < 0 ? 'bg-[#80201E]' : 'bg-[#0154A2]'} p-8 rounded-[2.5rem] shadow-lg relative overflow-hidden group hover:scale-[1.005] transition-all text-white h-44 flex flex-col justify-center cursor-default`}
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-white/90 mb-4 uppercase text-[11px] font-bold tracking-[0.2em]">
                                    <TrendingUp size={18} /> Reste
                                </div>
                                <h3 className="text-6xl font-black tracking-tighter mb-2">
                                    {maskAmount(computedStats.reste)}
                                </h3>
                                <span className="text-lg font-bold opacity-80 block uppercase tracking-widest">DT</span>
                            </div>
                            <div className="absolute right-8 bottom-[-20%] opacity-15 group-hover:scale-110 transition-transform duration-500 text-white">
                                <TrendingUp size={200} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Stats Grid with reactive key for immediate updates */}
                    <div key={`stats-${showPayModal?.id || 'none'}-${paymentDetails.method}-${showExpForm}-${expAmount}-${expMethod}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 4. Total Cash */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className={`${computedStats.cash < 0 ? 'bg-[#80201E]' : 'bg-[#f59e0b]'} p-8 rounded-[2rem] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all text-white h-40 flex flex-col justify-center`}
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-white/90 mb-2 uppercase text-[10px] font-bold tracking-widest">
                                    <Coins size={14} /> Total Cash
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter">
                                    {maskAmount(computedStats.cash)}
                                </h3>
                                <span className="text-sm font-bold opacity-70">DT</span>
                            </div>
                            <div className="absolute right-4 bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500 text-white">
                                <Coins size={80} />
                            </div>
                        </motion.div>

                        {/* 5. Bancaire */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className={`${computedStats.bancaire < 0 ? 'bg-[#80201E]' : 'bg-[#3b82f6]'} p-8 rounded-[2rem] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all text-white h-40 flex flex-col justify-center`}
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-white/90 mb-2 uppercase text-[10px] font-bold tracking-widest">
                                    <CreditCard size={14} /> Bancaire (TPE + Vers. + Chèques)
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter">
                                    {maskAmount(computedStats.bancaire)}
                                </h3>
                                <span className="text-sm font-bold opacity-70">DT</span>
                            </div>
                            <div className="absolute right-4 bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500 text-white">
                                <CreditCard size={80} />
                            </div>
                        </motion.div>

                        {/* 6. Ticket Restaurant */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className={`${computedStats.tickets < 0 ? 'bg-[#80201E]' : 'bg-[#8b5cf6]'} p-8 rounded-[2rem] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all text-white h-40 flex flex-col justify-center`}
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-white/90 mb-2 uppercase text-[10px] font-bold tracking-widest">
                                    <Ticket size={14} /> Ticket Restaurant
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter">
                                    {maskAmount(computedStats.tickets)}
                                </h3>
                                <span className="text-sm font-bold opacity-70">DT</span>
                            </div>
                            <div className="absolute right-4 bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500 text-white">
                                <Ticket size={80} />
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Middle: Salaries/Payments List */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Nouvelle Dépense Section */}
                            <div className="bg-white p-4 md:p-6 rounded-[2.5rem] luxury-shadow border border-[#e6dace]/50">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                                    <h3 className="text-lg font-black text-[#4a3426] flex items-center gap-2">
                                        <div className={editingHistoryItem ? "bg-blue-500 p-2 rounded-xl text-white" : "bg-red-500 p-2 rounded-xl text-white"}>
                                            <Receipt size={18} />
                                        </div>
                                        {editingHistoryItem ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
                                    </h3>
                                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                                        {showExpForm && (
                                            <button
                                                onClick={() => {
                                                    setMasterItemName(expName);
                                                    setShowAddMasterModal(true);
                                                }}
                                                className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all h-10 flex items-center justify-center gap-2 shadow-sm w-full md:w-auto"
                                            >
                                                <Plus size={14} />
                                                <span>Ajouter {expCategory === 'Divers' ? 'Désignation' : 'Fournisseur'}</span>
                                            </button>
                                        )}
                                        {!showExpForm && (
                                            <div className="flex flex-col items-stretch md:items-end gap-2 md:gap-1 w-full md:w-auto">
                                                <button
                                                    onClick={() => {
                                                        refetchUnpaid();
                                                        setShowUnpaidModal(true);
                                                    }}
                                                    className="text-[10px] font-black uppercase tracking-widest bg-red-50 border-2 border-red-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center md:justify-start gap-2 shadow-sm"
                                                >
                                                    <Clock size={14} className="text-red-500" />
                                                    <span className="flex items-baseline gap-1">
                                                        <span className="text-xs">Total non payé:</span>
                                                        <span className="text-sm font-black">
                                                            {maskAmount(unpaidData?.getInvoices?.filter((inv: any) => inv.status !== 'paid')
                                                                .reduce((sum: number, inv: any) => sum + parseFloat(inv.amount || 0), 0) || 0)}
                                                        </span>
                                                        <span className="text-[9px]">DT</span>
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowHistoryModal(true);
                                                        refetchHistory();
                                                    }}
                                                    className="w-full h-14 md:h-18 py-3 md:py-5 text-[14px] md:text-[16px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] bg-[#f4ece4] border-2 border-[#e6dace] text-[#c69f6e] rounded-2xl hover:bg-[#ebdccf] transition-all flex items-center justify-center gap-3 md:gap-5 shadow-xl group active:scale-[0.98]"
                                                >
                                                    <Clock size={20} className="md:hidden" strokeWidth={3} />
                                                    <Clock size={24} className="hidden md:block" strokeWidth={3} />
                                                    <span className="flex items-center gap-2 md:gap-4">
                                                        Historique Riadh
                                                        {(historyData?.getInvoices?.filter((inv: any) => inv.payer === 'riadh').length || 0) > 0 && (
                                                            <span className="bg-[#c69f6e] text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[12px] md:text-[14px] font-black min-w-[30px] md:min-w-[36px] shadow-lg shadow-[#c69f6e]/30 border-2 border-white/30">
                                                                {historyData?.getInvoices?.filter((inv: any) => inv.payer === 'riadh').length}
                                                            </span>
                                                        )}
                                                    </span>
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (showExpForm) {
                                                    setEditingHistoryItem(null);
                                                    setExpName('');
                                                    setExpAmount('');
                                                    setExpPhoto('');
                                                    setExpPhotoCheque('');
                                                    setExpPhotoVerso('');
                                                    setExpInvoiceNumber('');
                                                }
                                                setShowExpForm(!showExpForm);
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-500 px-4 py-2 rounded-xl hover:bg-red-100 transition-all h-10 border border-red-100 shadow-sm w-full md:w-auto"
                                        >
                                            {showExpForm ? 'Annuler' : 'Ajouter une dépense'}
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {showExpForm && (expMethod === 'Espèces' || expMethod === 'Ticket Restaurant' || ['Chèque', 'TPE (Carte)'].includes(expMethod)) && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            className="mb-4"
                                        >
                                            {expMethod === 'Espèces' && (
                                                <div className="bg-[#f59e0b] p-6 rounded-[2rem] shadow-lg relative overflow-hidden text-white h-32 flex flex-col justify-center">
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-2 text-white/90 mb-2 uppercase text-[10px] font-bold tracking-widest">
                                                            <Coins size={14} /> Total Cash (Prévision)
                                                        </div>
                                                        <h3 className="text-4xl font-black tracking-tighter">
                                                            {maskAmount(computedStats.cash)}
                                                        </h3>
                                                        <span className="text-sm font-bold opacity-70">DT</span>
                                                    </div>
                                                    <div className="absolute right-4 bottom-[-10%] opacity-10 text-white"><Coins size={80} /></div>
                                                </div>
                                            )}
                                            {expMethod === 'Ticket Restaurant' && (
                                                <div className="bg-[#8b5cf6] p-6 rounded-[2rem] shadow-lg relative overflow-hidden text-white h-32 flex flex-col justify-center">
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-2 text-white/90 mb-2 uppercase text-[10px] font-bold tracking-widest">
                                                            <Ticket size={14} /> Ticket Restaurant (Prévision)
                                                        </div>
                                                        <h3 className="text-4xl font-black tracking-tighter">
                                                            {maskAmount(computedStats.tickets)}
                                                        </h3>
                                                        <span className="text-sm font-bold opacity-70">DT</span>
                                                    </div>
                                                    <div className="absolute right-4 bottom-[-10%] opacity-10 text-white"><Ticket size={80} /></div>
                                                </div>
                                            )}
                                            {['Chèque', 'TPE (Carte)'].includes(expMethod) && (
                                                <div className="bg-[#3b82f6] p-6 rounded-[2rem] shadow-lg relative overflow-hidden text-white h-32 flex flex-col justify-center">
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-2 text-white/90 mb-2 uppercase text-[10px] font-bold tracking-widest">
                                                            <CreditCard size={14} /> Bancaire (Prévision)
                                                        </div>
                                                        <h3 className="text-4xl font-black tracking-tighter">
                                                            {maskAmount(computedStats.bancaire)}
                                                        </h3>
                                                        <span className="text-sm font-bold opacity-70">DT</span>
                                                    </div>
                                                    <div className="absolute right-4 bottom-[-10%] opacity-10 text-white"><CreditCard size={80} /></div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {showExpForm && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                            className="grid grid-cols-1 gap-4 mb-6 p-6 bg-red-50/30 rounded-3xl border border-red-100"
                                        >
                                            {/* Category Selection */}
                                            <div className="flex flex-col gap-2 mb-2">
                                                <label className="text-[10px] font-black text-red-700/50 uppercase ml-1">Choisir une Catégorie <span className="text-red-500">*</span></label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        { id: 'Fournisseur', label: 'Fournisseur', icon: Truck },
                                                        { id: 'Divers', label: 'Divers', icon: Sparkles }
                                                    ].map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => setExpCategory(cat.id)}
                                                            className={`flex items-center justify-center gap-2 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${expCategory === cat.id
                                                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 ring-4 ring-red-500/10'
                                                                : 'bg-white border border-red-100 text-red-400 hover:bg-white/80'
                                                                }`}
                                                        >
                                                            <cat.icon size={16} />
                                                            {cat.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-[10px] font-black text-red-700/50 uppercase ml-1">Nom / Libellé</label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={expName}
                                                                onChange={(e) => {
                                                                    setExpName(e.target.value);
                                                                    setShowExpSuggestions(true);
                                                                }}
                                                                onFocus={() => setShowExpSuggestions(true)}
                                                                className="w-full h-11 bg-white border border-red-100 rounded-xl px-4 font-bold text-sm outline-none focus:border-red-400"
                                                                placeholder="....."
                                                            />
                                                            <AnimatePresence>
                                                                {showExpSuggestions && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: 10 }}
                                                                        className="absolute z-[100] left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#e6dace]/50 max-h-60 overflow-y-auto no-scrollbar custom-scrollbar"
                                                                    >
                                                                        {(expCategory === 'Divers' ? masterSuggestions.divers : masterSuggestions.suppliers)
                                                                            .filter((name: string) => (name || '').toLowerCase().includes((expName || '').toLowerCase()))
                                                                            .map((name: string, i: number) => (
                                                                                <button
                                                                                    key={i}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setExpName(name);
                                                                                        setShowExpSuggestions(false);
                                                                                    }}
                                                                                    className="w-full text-left px-5 py-3 hover:bg-[#fcfaf8] text-sm font-bold text-[#4a3426] border-b border-[#f4ece4] last:border-0 transition-colors flex items-center justify-between"
                                                                                >
                                                                                    <span>{name}</span>
                                                                                    <CheckCircle2 size={14} className="text-green-500 opacity-0 group-hover:opacity-100" />
                                                                                </button>
                                                                            ))
                                                                        }
                                                                        {expName && !(expCategory === 'Divers' ? masterSuggestions.divers : masterSuggestions.suppliers).some((n: string) => n.toLowerCase() === expName.toLowerCase()) && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setMasterItemName(expName);
                                                                                    setShowAddMasterModal(true);
                                                                                    setShowExpSuggestions(false);
                                                                                }}
                                                                                className="w-full text-left px-5 py-4 bg-red-50/50 hover:bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-3 border-t border-red-100"
                                                                            >
                                                                                <div className="w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-md">
                                                                                    <Plus size={14} />
                                                                                </div>
                                                                                <span>Enregistrer "{expName}" dans la liste</span>
                                                                            </button>
                                                                        )}
                                                                        {(expCategory === 'Divers' ? masterSuggestions.divers : masterSuggestions.suppliers)
                                                                            .filter((name: string) => (name || '').toLowerCase().includes((expName || '').toLowerCase())).length === 0 && !expName && (
                                                                                <div className="p-8 text-center text-[#8c8279] italic text-xs">
                                                                                    Commencez à taper pour rechercher...
                                                                                </div>
                                                                            )
                                                                        }
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                            {showExpSuggestions && <div className="fixed inset-0 z-[90]" onClick={() => setShowExpSuggestions(false)} />}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                                                        <div>
                                                            <label className="text-[10px] font-black text-red-700/50 uppercase ml-1">Montant (DT)</label>
                                                            <input
                                                                type="number"
                                                                step="0.001"
                                                                value={expAmount}
                                                                onChange={(e) => setExpAmount(e.target.value)}
                                                                onWheel={(e) => e.currentTarget.blur()}
                                                                className="w-full h-12 bg-white border border-red-100 rounded-xl px-4 font-black text-xl outline-none focus:border-red-400 min-w-[180px]"
                                                                placeholder="0.000"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-red-700/50 uppercase ml-1">Date</label>
                                                            <PremiumDatePicker
                                                                label="Date"
                                                                value={expDate}
                                                                onChange={setExpDate}
                                                                align="right"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-[10px] font-black text-red-700/50 uppercase ml-1">Mode de Paiement</label>
                                                        <select
                                                            value={expMethod}
                                                            onChange={(e) => setExpMethod(e.target.value)}
                                                            className="w-full h-11 bg-white border border-red-100 rounded-xl px-4 font-bold text-sm outline-none focus:border-red-400 appearance-none"
                                                        >
                                                            <option value="Espèces">💵 Espèces</option>
                                                            <option value="Chèque">✍️ Chèque</option>
                                                            <option value="TPE (Carte)">💳 TPE (Carte)</option>
                                                            <option value="Ticket Restaurant">🎫 T. Restaurant</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-red-700/50 uppercase ml-1">Numéro du document</label>
                                                        <input
                                                            type="text"
                                                            value={expInvoiceNumber}
                                                            onChange={(e) => setExpInvoiceNumber(e.target.value)}
                                                            className="w-full h-11 bg-white border border-red-100 rounded-xl px-4 font-bold text-sm outline-none focus:border-red-400"
                                                            placeholder="Ex: 001/2026..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-red-700/50 uppercase ml-1">Type de Document</label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpDocType('Facture')}
                                                                className={`flex-1 h-11 rounded-xl font-bold text-xs transition-all ${expDocType === 'Facture'
                                                                    ? (editingHistoryItem ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-red-500 text-white shadow-lg shadow-red-500/30')
                                                                    : (editingHistoryItem ? 'bg-white border border-blue-100 text-blue-500 hover:bg-blue-50' : 'bg-white border border-red-100 text-red-400 hover:bg-red-50')
                                                                    }`}
                                                            >
                                                                📄 Facture
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpDocType('BL')}
                                                                className={`flex-1 h-11 rounded-xl font-bold text-xs transition-all ${expDocType === 'BL'
                                                                    ? (editingHistoryItem ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-red-500 text-white shadow-lg shadow-red-500/30')
                                                                    : (editingHistoryItem ? 'bg-white border border-blue-100 text-blue-500 hover:bg-blue-50' : 'bg-white border border-red-100 text-red-400 hover:bg-red-50')
                                                                    }`}
                                                            >
                                                                📋 BL
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-[10px] font-black text-red-700/50 uppercase ml-1">Facture / Bon (Photo)</label>
                                                            <label className="flex items-center justify-center gap-2 h-11 w-full bg-white border border-red-100 rounded-xl cursor-pointer hover:bg-red-50 transition-all font-bold text-[10px] text-red-500 text-center px-1">
                                                                <UploadCloud size={14} />
                                                                {expPhoto ? 'Facture OK' : 'Joindre Facture'}
                                                                <input type="file" className="hidden" onChange={(e) => handlePhotoUpload(e, 'invoice')} />
                                                            </label>
                                                        </div>

                                                        {expMethod === 'Chèque' && (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="text-[10px] font-black text-red-700/50 uppercase ml-1">Chèque (Recto)</label>
                                                                    <label className="flex items-center justify-center gap-2 h-11 w-full bg-white border border-red-100 rounded-xl cursor-pointer hover:bg-red-50 transition-all font-bold text-[10px] text-red-500 text-center px-1">
                                                                        <UploadCloud size={14} />
                                                                        {expPhotoCheque ? 'Recto OK' : 'Joindre'}
                                                                        <input type="file" className="hidden" onChange={(e) => handlePhotoUpload(e, 'recto')} />
                                                                    </label>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black text-red-700/50 uppercase ml-1">Chèque (Verso)</label>
                                                                    <label className="flex items-center justify-center gap-2 h-11 w-full bg-white border border-red-100 rounded-xl cursor-pointer hover:bg-red-50 transition-all font-bold text-[10px] text-red-500 text-center px-1">
                                                                        <UploadCloud size={14} />
                                                                        {expPhotoVerso ? 'Verso OK' : 'Joindre'}
                                                                        <input type="file" className="hidden" onChange={(e) => handlePhotoUpload(e, 'verso')} />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={handleExpSubmit}
                                                        disabled={addingExp || !expCategory}
                                                        className={`w-full h-11 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg md:mt-auto transition-all ${!expCategory
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : editingHistoryItem
                                                                ? 'bg-blue-600 shadow-blue-500/20 hover:bg-blue-700'
                                                                : 'bg-red-500 shadow-red-500/20 hover:bg-red-600'
                                                            }`}
                                                    >
                                                        {addingExp ? <Loader2 size={16} className="animate-spin mx-auto" /> : (editingHistoryItem ? 'Enregistrer les modifications' : 'Enregistrer la Dépense')}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-6">
                                    {/* Dernières Dépenses */}


                                </div>
                            </div>


                        </div>
                        {/* Bancaire Section */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-[2.5rem] luxury-shadow border border-[#e6dace]/50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <h3 className="text-lg font-black text-[#4a3426] flex items-center gap-2">
                                        <div className="bg-[#4a3426] p-2 rounded-xl text-white">
                                            <TrendingUp size={18} />
                                        </div>
                                        Bancaire
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (showBankForm && bankTransactionType === 'deposit') {
                                                    setShowBankForm(false);
                                                } else {
                                                    setShowBankForm(true);
                                                    setBankTransactionType('deposit');
                                                    setBankAmount('');
                                                    setBankDate(todayStr);
                                                    setEditingDeposit(null);
                                                }
                                            }}
                                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all ${showBankForm && bankTransactionType === 'deposit'
                                                ? 'bg-[#4a3426] text-white shadow-md'
                                                : 'bg-[#f4ece4] text-[#c69f6e] hover:bg-[#ebdccf]'
                                                }`}
                                        >
                                            {showBankForm && bankTransactionType === 'deposit' ? 'Fermer' : 'Verser à la banque'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (showBankForm && bankTransactionType === 'withdraw') {
                                                    setShowBankForm(false);
                                                } else {
                                                    setShowBankForm(true);
                                                    setBankTransactionType('withdraw');
                                                    setBankAmount('');
                                                    setBankDate(todayStr);
                                                    setEditingDeposit(null);
                                                }
                                            }}
                                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all ${showBankForm && bankTransactionType === 'withdraw'
                                                ? 'bg-red-500 text-white shadow-md'
                                                : 'bg-red-50 text-red-500 hover:bg-red-100'
                                                }`}
                                        >
                                            {showBankForm && bankTransactionType === 'withdraw' ? 'Fermer' : 'Retrait de banque'}
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {showBankForm && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="mb-6"
                                        >
                                            <div className="space-y-3 p-4 bg-[#fcfaf8] rounded-3xl border border-[#e6dace]/50">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                                    <div className="flex-1 min-w-0">
                                                        <label className="text-[10px] font-black text-[#8c8279] uppercase ml-1">Montant (DT)</label>
                                                        <input
                                                            type="number"
                                                            step="0.001"
                                                            value={bankAmount}
                                                            onChange={(e) => setBankAmount(e.target.value)}
                                                            onWheel={(e) => e.currentTarget.blur()}
                                                            className="w-full h-12 bg-white border border-[#e6dace] rounded-xl px-4 font-black text-xl outline-none focus:border-[#c69f6e]"
                                                            placeholder="0.000"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <label className="text-[10px] font-black text-[#8c8279] uppercase ml-1">Date</label>
                                                        <PremiumDatePicker
                                                            label="Date"
                                                            value={bankDate}
                                                            onChange={setBankDate}
                                                            align="right"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleBankSubmit}
                                                    disabled={addingBank}
                                                    className={`w-full h-11 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg ${bankTransactionType === 'withdraw'
                                                        ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600'
                                                        : 'bg-[#4a3426] shadow-[#4a3426]/20 hover:bg-[#604432]'
                                                        }`}
                                                >
                                                    {addingBank ? <Loader2 size={16} className="animate-spin mx-auto" /> : (editingDeposit ? 'Mettre à jour' : (bankTransactionType === 'withdraw' ? 'Confirmer le Retrait' : 'Confirmer le Versement'))}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-[#8c8279] uppercase tracking-widest px-2">Derniers versements</h4>
                                    {data?.getBankDeposits?.length > 0 ? (
                                        data.getBankDeposits
                                            .filter((d: any) => editingDeposit?.id !== d.id)
                                            .slice(0, 5)
                                            .map((d: any) => (
                                                <div key={d.id} className="flex justify-between items-center p-4 bg-[#fcfaf8] rounded-2xl border border-transparent hover:border-[#e6dace] transition-all group">
                                                    <div>
                                                        <p className={`text-sm font-black text-[15px] ${parseFloat(d.amount) < 0 ? 'text-red-500' : 'text-[#4a3426]'}`}>
                                                            {parseFloat(d.amount) < 0 ? 'Retrait' : 'Versement'} : {maskAmount(Math.abs(parseFloat(d.amount)))} DT
                                                        </p>
                                                        <p className="text-[10px] font-bold text-[#8c8279] uppercase tracking-tighter">{new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="hidden group-hover:flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleEditDepositClick(d)}
                                                                className="w-8 h-8 rounded-lg bg-white border border-[#e6dace] text-[#c69f6e] flex items-center justify-center hover:bg-[#c69f6e] hover:text-white transition-all"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDeposit(d)}
                                                                className="w-8 h-8 rounded-lg bg-white border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                        {parseFloat(d.amount) < 0 ? (
                                                            <div className="bg-red-50 p-2 rounded-xl text-red-500 transform rotate-180">
                                                                <ArrowUpRight size={16} />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-green-100 p-2 rounded-xl text-green-600">
                                                                <TrendingUp size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-center py-8 text-xs font-bold text-[#8c8279] italic">Aucun versement enregistré</p>
                                    )}
                                </div>


                            </div>
                        </div>

                    </div>
                    {/* Restes Salaires Section */}
                    <div className="bg-[#fcfaf8] rounded-[2.5rem] p-4 md:p-8 shadow-sm border border-[#e6dace]/50">
                        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#c69f6e] shadow-sm border border-[#e6dace]/50 shrink-0">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#4a3426] tracking-tight uppercase">Restes Salaires</h2>
                                    <p className="text-[10px] font-bold text-[#bba282] uppercase tracking-[0.1em]">Gestion des reliquats</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full lg:w-auto">
                                <div className="w-full md:w-auto">
                                    <PremiumMonthPicker
                                        value={salaryRemainderMonth}
                                        onChange={(val) => setSalaryRemainderMonth(val)}
                                    />
                                </div>

                                <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-[#e6dace]/50 shadow-sm">
                                    <button
                                        onClick={() => setSalaryRemainderMode('global')}
                                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${salaryRemainderMode === 'global' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'text-[#8c8279] hover:bg-red-50'}`}
                                    >
                                        Global
                                    </button>
                                    <button
                                        onClick={() => setSalaryRemainderMode('employee')}
                                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${salaryRemainderMode === 'employee' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'text-[#8c8279] hover:bg-red-50'}`}
                                    >
                                        Employés
                                    </button>
                                </div>

                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c69f6e]" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Filtrer employé..."
                                        value={salaryRemainderSearch}
                                        onChange={(e) => setSalaryRemainderSearch(e.target.value)}
                                        className="w-full h-12 bg-white border border-[#e6dace]/60 rounded-2xl pl-11 pr-4 text-xs font-bold text-[#4a3426] focus:border-[#c69f6e] outline-none transition-all placeholder:text-[#8c8279]/50 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {salaryRemainderMode === 'global' ? (
                            <div className="flex justify-center py-12">
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-red-500/5 border border-red-100 w-full max-w-md text-center group">
                                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50/50">
                                        <Banknote size={32} />
                                    </div>
                                    <h3 className="text-sm font-black text-[#8c8279] uppercase tracking-widest mb-6">Montant Global ({salaryRemainderMonth})</h3>
                                    <div className="relative">
                                        <input
                                            id="global-salary-input"
                                            key={`${salaryRemainderMonth}-${(data?.getSalaryRemainders || []).find((r: any) => r.employee_name === 'Restes Salaires')?.amount || 0}-${editingSalaryId === 'global'}`}
                                            type="number"
                                            step="0.001"
                                            disabled={editingSalaryId !== 'global'}
                                            defaultValue={(data?.getSalaryRemainders || []).find((r: any) => r.employee_name === 'Restes Salaires')?.amount || 0}
                                            onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                                            onBlur={(e) => e.target.value === '' && (e.target.value = '0')}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Escape') setEditingSalaryId(null);
                                                if (e.key === 'Enter') document.getElementById('global-save-btn')?.click();
                                            }}
                                            className="w-full text-center text-4xl md:text-5xl font-black text-[#4a3426] outline-none border-b-2 border-[#e6dace] focus:border-red-400 pb-2 bg-transparent transition-colors min-w-[250px] disabled:opacity-100"
                                        />
                                        <span className="text-xs font-black text-[#c69f6e] mt-2 block mb-6">DT</span>

                                        <div className="flex gap-2 mt-6">
                                            <button
                                                id="global-save-btn"
                                                onClick={async () => {
                                                    if (editingSalaryId !== 'global') {
                                                        setEditingSalaryId('global');
                                                        setTimeout(() => document.getElementById('global-salary-input')?.focus(), 10);
                                                        return;
                                                    }

                                                    const input = document.getElementById('global-salary-input') as HTMLInputElement;
                                                    const val = parseFloat(input?.value || '0');
                                                    await upsertSalaryRemainder({
                                                        variables: {
                                                            employee_name: 'Restes Salaires',
                                                            amount: val || 0,
                                                            month: salaryRemainderMonth,
                                                            status: 'CONFIRMÉ'
                                                        }
                                                    });
                                                    await refetch();
                                                    setEditingSalaryId(null);
                                                    setSuccessSalaryId('global');
                                                    setTimeout(() => setSuccessSalaryId(null), 2000);
                                                }}
                                                className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-md active:scale-95 border-2 ${successSalaryId === 'global' ? 'bg-green-500 text-white border-green-500 shadow-green-500/30' :
                                                    editingSalaryId === 'global' ? 'bg-[#c69f6e] text-white border-[#c69f6e]' :
                                                        'bg-white border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500'}`}
                                            >
                                                {successSalaryId === 'global' ? (
                                                    <span className="flex items-center gap-2 justify-center">ENREGISTRÉ <Check size={16} strokeWidth={3} /></span>
                                                ) : editingSalaryId === 'global' ? 'Enregistrer' : 'Modifier'}
                                            </button>
                                            {editingSalaryId === 'global' && !successSalaryId && (
                                                <button
                                                    onClick={() => setEditingSalaryId(null)}
                                                    className="px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest bg-white border-2 border-gray-100 text-gray-400 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                                                >
                                                    Annuler
                                                </button>
                                            )}
                                        </div>
                                        <div className="mt-8 space-y-3">
                                            {(() => {
                                                const globals = (data?.getSalaryRemainders || []).filter((r: any) => r.employee_name === 'Restes Salaires').sort((a: any, b: any) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
                                                if (globals.length === 0) return null;
                                                return globals.map((g: any) => (
                                                    <div key={g.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-red-100 shadow-sm group hover:border-red-200 transition-colors">
                                                        <div className="flex flex-col items-start">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="font-black text-xl text-[#4a3426]">{maskAmount(g.amount)}</span>
                                                                <span className="text-[10px] font-bold text-[#c69f6e] uppercase">DT</span>
                                                            </div>
                                                            {g.updated_at && (
                                                                <p className="text-[9px] font-bold text-green-600/70 mt-1 flex items-center gap-1">
                                                                    <CheckCircle2 size={10} />
                                                                    {new Date(Number(g.updated_at) || g.updated_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                Swal.fire({
                                                                    title: 'Supprimer?',
                                                                    text: 'Voulez-vous supprimer ce montant?',
                                                                    icon: 'warning',
                                                                    showCancelButton: true,
                                                                    confirmButtonColor: '#ef4444',
                                                                    cancelButtonColor: '#8c8279',
                                                                    confirmButtonText: 'Oui'
                                                                }).then(async (result) => {
                                                                    if (result.isConfirmed) {
                                                                        await deleteSalaryRemainder({ variables: { id: parseInt(g.id) } });
                                                                        await refetch();
                                                                    }
                                                                });
                                                            }}
                                                            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-center md:justify-end">
                                    <button
                                        onClick={() => setShowAllEmployees(!showAllEmployees)}
                                        className="w-full md:w-auto px-8 py-3 bg-white border border-[#e6dace] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#8c8279] hover:bg-[#c69f6e] hover:text-white hover:border-[#c69f6e] transition-all shadow-sm flex items-center justify-center gap-3"
                                    >
                                        {showAllEmployees ? (
                                            <>
                                                <ChevronUp size={16} /> Masquer la liste
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown size={16} /> Voir la liste
                                            </>
                                        )}
                                    </button>
                                </div>

                                {showAllEmployees && (
                                    <div className="overflow-x-auto rounded-3xl border border-[#e6dace]/30 bg-white no-scrollbar">
                                        <table className="w-full text-left border-collapse min-w-[600px]">
                                            <thead>
                                                <tr className="bg-[#fcfaf8] border-b border-[#e6dace]/30">
                                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#8c8279] uppercase tracking-[0.2em]">Employé</th>
                                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#8c8279] uppercase tracking-[0.2em] text-center">Montant</th>
                                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#8c8279] uppercase tracking-[0.2em] text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e6dace]/10">
                                                {(() => {
                                                    const employees = data?.getEmployees || [];
                                                    const remainders = data?.getSalaryRemainders || [];
                                                    const filtered = employees.filter((emp: any) => emp.name.toLowerCase().includes(salaryRemainderSearch.toLowerCase()));

                                                    if (filtered.length === 0) {
                                                        return (
                                                            <tr>
                                                                <td colSpan={3} className="px-8 py-12 text-center text-[#8c8279] italic font-bold opacity-50">Aucun employé trouvé</td>
                                                            </tr>
                                                        );
                                                    }

                                                    return filtered.map((emp: any) => {
                                                        const rem = remainders.find((r: any) => r.employee_name === emp.name);
                                                        const initials = emp.name.split(' ').map((n: any) => n[0]).join('').toUpperCase().substring(0, 2);
                                                        return (
                                                            <tr key={emp.id} className="hover:bg-[#fcfaf8]/50 transition-colors group">
                                                                <td className="px-6 md:px-8 py-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-full bg-[#f4ece4] flex items-center justify-center text-[10px] font-black text-[#c69f6e] group-hover:scale-110 transition-transform shrink-0">{initials}</div>
                                                                        <span className="font-black text-[#4a3426] tracking-tight text-sm truncate">{emp.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 md:px-8 py-4">
                                                                    <div className="flex items-center justify-center gap-2 relative">
                                                                        <input
                                                                            id={`salary-input-${emp.id}`}
                                                                            type="number"
                                                                            step="0.001"
                                                                            disabled={editingSalaryId !== emp.id}
                                                                            key={`${emp.id}-${rem?.amount || 0}-${editingSalaryId === emp.id}`}
                                                                            defaultValue={rem?.amount || 0}
                                                                            onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                                                                            onBlur={(e) => e.target.value === '' && (e.target.value = '0')}
                                                                            onWheel={(e) => e.currentTarget.blur()}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Escape') setEditingSalaryId(null);
                                                                                if (e.key === 'Enter') document.getElementById(`save-btn-${emp.id}`)?.click();
                                                                            }}
                                                                            className={`w-44 text-center font-black bg-transparent outline-none border-b transition-colors text-xl ${editingSalaryId === emp.id ? 'border-[#c69f6e] text-[#4a3426]' : (rem && rem.amount > 0 ? 'text-green-600 border-green-200' : 'text-[#4a3426] border-transparent')} disabled:opacity-100 placeholder:opacity-50`}
                                                                        />
                                                                        <span className={`text-[10px] font-black mt-1 ${rem && rem.amount > 0 ? 'text-green-600/60' : 'text-[#4a3426]/40'}`}>DT</span>
                                                                        {rem && rem.amount > 0 && (
                                                                            <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-green-500">
                                                                                <CheckCircle2 size={16} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 md:px-8 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            id={`save-btn-${emp.id}`}
                                                                            onClick={async () => {
                                                                                if (editingSalaryId !== emp.id) {
                                                                                    setEditingSalaryId(emp.id);
                                                                                    setTimeout(() => {
                                                                                        document.getElementById(`salary-input-${emp.id}`)?.focus();
                                                                                    }, 10);
                                                                                    return;
                                                                                }

                                                                                const input = document.getElementById(`salary-input-${emp.id}`) as HTMLInputElement;
                                                                                const val = parseFloat(input?.value || '0');
                                                                                await upsertSalaryRemainder({
                                                                                    variables: {
                                                                                        employee_name: emp.name,
                                                                                        amount: val || 0,
                                                                                        month: salaryRemainderMonth,
                                                                                        status: 'CONFIRMÉ'
                                                                                    }
                                                                                });
                                                                                await refetch();
                                                                                setEditingSalaryId(null);
                                                                                setSuccessSalaryId(emp.id);
                                                                                setTimeout(() => setSuccessSalaryId(null), 2000);
                                                                            }}
                                                                            className={`inline-flex items-center justify-center h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${successSalaryId === emp.id ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/30 scale-110 px-2' :
                                                                                editingSalaryId === emp.id ? 'bg-[#c69f6e] text-white border-[#c69f6e] shadow-md shadow-[#c69f6e]/20' :
                                                                                    (rem && rem.amount > 0 ? 'bg-white text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300' : 'bg-white text-[#4a3426] border-[#e6dace] hover:bg-[#2d6a4f] hover:text-white hover:border-[#2d6a4f]')}`}
                                                                        >
                                                                            {successSalaryId === emp.id ? (
                                                                                <Check size={16} strokeWidth={3} />
                                                                            ) : editingSalaryId === emp.id ? 'Enregistrer' : (rem && rem.amount > 0 ? 'Modifier' : 'Sauvegarder')}
                                                                        </button>

                                                                        {editingSalaryId === emp.id && !successSalaryId && (
                                                                            <button
                                                                                onClick={() => setEditingSalaryId(null)}
                                                                                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 flex items-center justify-center transition-all border border-gray-100"
                                                                                title="Annuler (Esc)"
                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                        )}

                                                                        {rem && rem.amount > 0 && (
                                                                            <button
                                                                                onClick={async () => {
                                                                                    Swal.fire({
                                                                                        title: 'Supprimer?',
                                                                                        text: 'Voulez-vous supprimer ce montant?',
                                                                                        icon: 'warning',
                                                                                        showCancelButton: true,
                                                                                        confirmButtonColor: '#ef4444',
                                                                                        cancelButtonColor: '#8c8279',
                                                                                        confirmButtonText: 'Oui'
                                                                                    }).then(async (result) => {
                                                                                        if (result.isConfirmed) {
                                                                                            await deleteSalaryRemainder({
                                                                                                variables: {
                                                                                                    id: parseInt(rem.id)
                                                                                                }
                                                                                            });
                                                                                            await refetch();
                                                                                            const input = document.getElementById(`salary-input-${emp.id}`) as HTMLInputElement;
                                                                                            if (input) input.value = "0";
                                                                                        }
                                                                                    });
                                                                                }}
                                                                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 flex items-center justify-center transition-all shadow-sm active:scale-95"
                                                                                title="Supprimer"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    });
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* Modal Visionneuse Photo */}
                <AnimatePresence>
                    {selectedInvoice && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#4a3426]/90 backdrop-blur-sm"
                                onClick={() => setSelectedInvoice(null)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                                className="relative bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl"
                            >
                                <div className="p-6 border-b border-[#e6dace] flex justify-between items-center bg-[#fcfaf8]">
                                    <div>
                                        <h3 className="text-xl font-black text-[#4a3426]">{selectedInvoice.supplier_name}</h3>
                                        <p className="text-xs font-bold text-[#8c8279] uppercase tracking-widest">
                                            {selectedInvoice.amount} DT • {selectedInvoice.payment_method}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedInvoice(null)}
                                        className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-[#4a3426] hover:bg-red-50 hover:text-red-500 transition-all font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                                    {/* Facture Section */}
                                    <div className="space-y-2 text-center">
                                        <p className="text-[10px] font-black text-[#8c8279] uppercase tracking-[0.2em]">Facture / Bon</p>
                                        {selectedInvoice.photo_url ? (
                                            <div className="rounded-2xl overflow-hidden border border-[#e6dace] shadow-lg">
                                                <img src={selectedInvoice.photo_url} alt="Facture" className="w-full h-auto" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center bg-[#fcfaf8] rounded-2xl h-48 text-[#8c8279] font-bold italic text-[10px] border-2 border-dashed border-[#e6dace]">
                                                Aucune facture réglée
                                            </div>
                                        )}
                                    </div>

                                    {/* Chèque Sections */}
                                    {selectedInvoice.payment_method === 'Chèque' && (
                                        <>
                                            <div className="space-y-2 text-center">
                                                <p className="text-[10px] font-black text-[#8c8279] uppercase tracking-[0.2em]">Chèque Recto</p>
                                                {selectedInvoice.photo_cheque_url ? (
                                                    <div className="rounded-2xl overflow-hidden border border-[#e6dace] shadow-lg">
                                                        <img src={selectedInvoice.photo_cheque_url} alt="Recto" className="w-full h-auto" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center bg-[#fcfaf8] rounded-2xl h-48 text-[#8c8279] font-bold italic text-[10px] border-2 border-dashed border-[#e6dace]">
                                                        Aucune photo recto
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 text-center">
                                                <p className="text-[10px] font-black text-[#8c8279] uppercase tracking-[0.2em]">Chèque Verso</p>
                                                {selectedInvoice.photo_verso_url ? (
                                                    <div className="rounded-2xl overflow-hidden border border-[#e6dace] shadow-lg">
                                                        <img src={selectedInvoice.photo_verso_url} alt="Verso" className="w-full h-auto" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center bg-[#fcfaf8] rounded-2xl h-48 text-[#8c8279] font-bold italic text-[10px] border-2 border-dashed border-[#e6dace]">
                                                        Aucune photo verso
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Unpaid Invoices List Modal */}
                <AnimatePresence>
                    {showUnpaidModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-[#4a3426]/60 backdrop-blur-md flex items-center justify-center p-4"
                            onClick={() => setShowUnpaidModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-[#f9f6f2] rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 flex flex-col"
                            >
                                <div className="p-8 bg-white border-b border-[#f0e6dd] shrink-0 space-y-8">
                                    <div className="flex items-center justify-between gap-8">
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="w-14 h-14 bg-red-50 rounded-[1.25rem] flex items-center justify-center text-[#ef4444] shadow-sm border border-red-100">
                                                <Clock size={28} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-[#4a3426] uppercase tracking-tighter flex items-center gap-3">
                                                    Factures Non Payées
                                                    <span className="bg-[#ef4444] text-white px-3 py-1 rounded-xl text-sm font-black shadow-lg shadow-red-500/20">
                                                        {allFilteredUnpaid.length}
                                                    </span>
                                                </h2>
                                                <p className="text-[11px] font-black text-[#8c8279] uppercase tracking-[0.2em] opacity-60">Suivi des reliquats et dépenses</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-3 bg-[#fff1f1] px-5 py-3 rounded-[1.25rem] border border-red-100/50 shrink-0">
                                                <span className="text-[11px] font-black uppercase text-[#ef4444] tracking-widest">Total:</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-[#ef4444] tracking-tighter">
                                                        {maskAmount(allFilteredUnpaid.reduce((sum: number, inv: any) => sum + parseFloat(inv.amount || 0), 0)).replace(',', '.')}
                                                    </span>
                                                    <span className="text-[11px] font-black text-[#ef4444]">DT</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setShowUnpaidModal(false)}
                                                className="w-14 h-14 rounded-[1.25rem] bg-[#fcfaf8] hover:bg-red-50 text-[#8c8279] hover:text-[#ef4444] transition-all flex items-center justify-center border-2 border-[#f0e6dd] shadow-sm active:scale-90"
                                            >
                                                <X size={24} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row items-center gap-6">
                                        {/* Category Filter Pills */}
                                        <div className="flex items-center bg-[#fcfaf8] border-2 border-[#f0e6dd] p-1.5 rounded-full shadow-sm shrink-0">
                                            {[
                                                { id: 'Tous', label: 'Tous', icon: LayoutGrid },
                                                { id: 'Fournisseur', label: 'Fournisseur', icon: Package },
                                                { id: 'Divers', label: 'Divers', icon: Banknote }
                                            ].map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setUnpaidCategoryFilter(cat.id as any)}
                                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${unpaidCategoryFilter === cat.id
                                                        ? 'bg-[#4a3426] text-white shadow-md'
                                                        : 'text-[#8c8279] hover:bg-white hover:text-[#4a3426]'
                                                        }`}
                                                >
                                                    <cat.icon size={14} strokeWidth={2.5} />
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Search Filter - Centered */}
                                        <div className="flex-1 max-w-xl relative group">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8c8279] group-focus-within:text-red-400 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Rechercher par fournisseur..."
                                                value={unpaidSearchFilter}
                                                onChange={(e) => setUnpaidSearchFilter(e.target.value)}
                                                className="w-full h-14 pl-14 pr-5 bg-[#fcfaf8] border-2 border-[#f0e6dd] rounded-[1.25rem] text-sm font-bold text-[#4a3426] placeholder:text-[#8c8279]/30 focus:border-red-200 focus:bg-white outline-none transition-all shadow-sm"
                                            />
                                        </div>

                                        {/* Date Filters - Right side */}
                                        <div className="flex items-center gap-3 shrink-0 bg-[#fcfaf8] p-2 rounded-[1.25rem] border-2 border-[#f0e6dd]">
                                            <div className="w-40">
                                                <PremiumDatePicker
                                                    label="Début"
                                                    value={unpaidDateRange.start}
                                                    onChange={(val) => setUnpaidDateRange(prev => ({ ...prev, start: val }))}
                                                />
                                            </div>
                                            <span className="text-[#c69f6e] font-black text-sm opacity-20">→</span>
                                            <div className="w-40">
                                                <PremiumDatePicker
                                                    label="Fin"
                                                    value={unpaidDateRange.end}
                                                    onChange={(val) => setUnpaidDateRange(prev => ({ ...prev, end: val }))}
                                                    align="right"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {allFilteredUnpaid.map((inv: any) => (
                                            <motion.div
                                                key={inv.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-[#fff3f3] rounded-[3rem] border-4 border-white overflow-hidden shadow-2xl shadow-red-500/5 hover:shadow-red-500/15 transition-all p-8 flex flex-col gap-6 relative group"
                                            >
                                                {/* Top Badges */}
                                                <div className="flex flex-wrap gap-2.5">
                                                    <span className="px-5 py-2 bg-[#ef4444] text-white rounded-[1rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-500/30">
                                                        <Clock size={14} strokeWidth={3} /> Non Payé
                                                    </span>
                                                    <span className="px-5 py-2 bg-white text-[#ef4444] border-2 border-red-50 rounded-[1rem] text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                        {inv.doc_type || 'Facture'}
                                                    </span>
                                                    <span className="px-5 py-2 bg-[#eef2ff] text-[#4f46e5] border-2 border-[#e0e7ff] rounded-[1rem] text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                        {inv.category || 'Fournisseur'}
                                                    </span>
                                                </div>

                                                {/* Main Row: Supplier & Amount */}
                                                <div className="flex justify-between items-end gap-4">
                                                    <h3 className="font-black text-3xl text-[#4a3426] tracking-tighter leading-none" title={inv.supplier_name}>
                                                        {inv.supplier_name}
                                                    </h3>
                                                    <div className="text-right">
                                                        <div className="flex items-baseline justify-end gap-1.5">
                                                            <span className="text-4xl font-black text-[#ef4444] tracking-tighter leading-none">
                                                                {maskAmount(inv.amount).replace(',', '.')}
                                                            </span>
                                                            <span className="text-xs font-black text-[#ef4444] uppercase tracking-tighter">DT</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Date Highlight Box */}
                                                <div className="inline-flex items-center gap-3 px-5 py-3 bg-white border-2 border-red-50 rounded-[1.25rem] self-start shadow-sm">
                                                    <Calendar size={16} className="text-[#ef4444]" strokeWidth={2.5} />
                                                    <span className="text-[11px] font-black text-[#ef4444] uppercase tracking-[0.15em]">
                                                        Reçu le: <span className="text-[#4a3426] ml-1.5">{new Date(inv.date).toLocaleDateString('fr-FR')}</span>
                                                    </span>
                                                </div>

                                                {/* Photo/Doc Link */}
                                                <div className="flex items-center gap-3 min-h-[1.5rem] px-2">
                                                    {inv.photo_url ? (
                                                        <button
                                                            onClick={() => setViewingUnpaidPhoto(inv)}
                                                            className="flex items-center gap-2.5 text-[10px] font-black text-[#ef4444] hover:text-[#dc2626] transition-all uppercase tracking-[0.2em] group/doc"
                                                        >
                                                            <Eye size={16} className="group-hover/doc:scale-110 transition-transform" />
                                                            Voir le document
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-[#8c8279]/30 italic uppercase tracking-widest flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-[#8c8279]/30 rounded-full" /> Sans photo jointe
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Footer Actions */}
                                                <div className="flex gap-4 mt-auto pt-4 items-center">
                                                    <button
                                                        onClick={() => {
                                                            setPaymentDetails({
                                                                method: '',
                                                                date: todayStr,
                                                                photo_cheque_url: '',
                                                                photo_verso_url: ''
                                                            });
                                                            setShowPayModal(inv);
                                                        }}
                                                        className="flex-1 h-16 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-[1.5rem] font-black uppercase text-sm tracking-[0.15em] shadow-xl shadow-red-500/40 flex items-center justify-center gap-3 transition-all active:scale-[0.98] group/pay"
                                                    >
                                                        <CheckCircle2 size={20} strokeWidth={3} className="group-hover/pay:scale-110 transition-transform" />
                                                        À Payer
                                                    </button>

                                                    <div className="flex gap-2.5">
                                                        <button
                                                            onClick={() => handleEditInvoice(inv)}
                                                            className="w-14 h-14 bg-white border-2 border-[#f0e6dd] rounded-[1.25rem] flex items-center justify-center text-[#8c8279] hover:bg-[#fcfaf8] hover:text-[#4a3426] hover:border-[#4a3426] transition-all shadow-md active:scale-90 group/edit"
                                                            title="Modifier"
                                                        >
                                                            <Edit2 size={22} strokeWidth={2.5} className="group-hover/edit:rotate-12 transition-transform" />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(inv)}
                                                            className="w-14 h-14 bg-white border-2 border-red-50 rounded-[1.25rem] flex items-center justify-center text-[#ef4444]/60 hover:bg-[#ef4444] hover:text-white hover:border-[#ef4444] transition-all shadow-md active:scale-90 group/del"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 size={22} strokeWidth={2.5} className="group-hover/del:scale-110 transition-transform" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    {allFilteredUnpaid.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-64 text-[#8c8279] opacity-50 space-y-4">
                                            {unpaidSearchFilter || unpaidDateRange.start || unpaidDateRange.end || unpaidCategoryFilter !== 'Tous' ? (
                                                <>
                                                    <Search size={48} />
                                                    <p className="font-bold italic">Aucun résultat trouvé pour ces filtres</p>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={48} />
                                                    <p className="font-bold italic">Aucune facture non payée</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Payment Modal */}
                <AnimatePresence>
                    {showPayModal && (
                        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#4a3426]/80 backdrop-blur-sm"
                                onClick={() => setShowPayModal(null)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl"
                            >
                                <div className="bg-[#10b981] p-6 text-white text-center relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h3 className="text-lg font-black uppercase tracking-widest mb-1">Règlement Facture</h3>
                                        <p className="text-sm font-medium opacity-90">{showPayModal.supplier_name}</p>
                                        <div className="mt-4 text-4xl font-black tracking-tighter">
                                            {parseFloat(showPayModal.amount).toFixed(3)} <span className="text-lg opacity-80">DT</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                        <CheckCircle2 size={150} />
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8c8279] mb-1 block ml-1">Mode de paiement</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Espèces', 'Chèque', 'TPE (Carte)', 'Ticket Restaurant', 'Virement'].map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setPaymentDetails({ ...paymentDetails, method: m })}
                                                    className={`h-10 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center px-2 ${paymentDetails.method === m
                                                        ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30'
                                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'} ${m === 'Virement' ? 'col-span-2' : ''}`}
                                                >
                                                    {m === 'Espèces' && '💵 '}
                                                    {m === 'Chèque' && '✍️ '}
                                                    {m === 'TPE (Carte)' && '💳 '}
                                                    {m === 'Ticket Restaurant' && '🎫 '}
                                                    {m === 'Virement' && '🏦 '}
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Balance Preview */}
                                    <AnimatePresence>
                                        {showPayModal && (paymentDetails.method === 'Espèces' || paymentDetails.method === 'Ticket Restaurant' || ['Chèque', 'Virement', 'TPE (Carte)'].includes(paymentDetails.method)) && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                className="space-y-2"
                                            >
                                                {paymentDetails.method === 'Espèces' && (
                                                    <div className="bg-[#f59e0b] p-4 rounded-2xl shadow-lg relative overflow-hidden text-white h-28 flex flex-col justify-center">
                                                        <div className="relative z-10">
                                                            <div className="flex items-center gap-2 text-white/90 mb-1 uppercase text-[10px] font-bold tracking-widest">
                                                                <Coins size={14} /> Total Cash (Après Paiement)
                                                            </div>
                                                            <h3 className="text-3xl font-black tracking-tighter">
                                                                {maskAmount(computedStats.cash)}
                                                            </h3>
                                                            <span className="text-sm font-bold opacity-70">DT</span>
                                                        </div>
                                                        <div className="absolute right-4 bottom-[-10%] opacity-10 text-white"><Coins size={80} /></div>
                                                    </div>
                                                )}
                                                {['Chèque', 'Virement', 'TPE (Carte)'].includes(paymentDetails.method) && (
                                                    <div className="bg-[#3b82f6] p-4 rounded-2xl shadow-lg relative overflow-hidden text-white h-28 flex flex-col justify-center">
                                                        <div className="relative z-10">
                                                            <div className="flex items-center gap-2 text-white/90 mb-1 uppercase text-[10px] font-bold tracking-widest">
                                                                <CreditCard size={14} /> {paymentDetails.method === 'TPE (Carte)' ? 'TPE' : 'Bancaire'} (Après Paiement)
                                                            </div>
                                                            <h3 className="text-3xl font-black tracking-tighter">
                                                                {maskAmount(paymentDetails.method === 'TPE (Carte)' ? computedStats.tpe : computedStats.bancaire)}
                                                            </h3>
                                                            <span className="text-sm font-bold opacity-70">DT</span>
                                                        </div>
                                                        <div className="absolute right-4 bottom-[-10%] opacity-10 text-white"><CreditCard size={80} /></div>
                                                    </div>
                                                )}
                                                {paymentDetails.method === 'Ticket Restaurant' && (
                                                    <div className="bg-[#8b5cf6] p-4 rounded-2xl shadow-lg relative overflow-hidden text-white h-28 flex flex-col justify-center">
                                                        <div className="relative z-10">
                                                            <div className="flex items-center gap-2 text-white/90 mb-1 uppercase text-[10px] font-bold tracking-widest">
                                                                <Ticket size={14} /> Ticket Restaurant (Après Paiement)
                                                            </div>
                                                            <h3 className="text-3xl font-black tracking-tighter">
                                                                {maskAmount(computedStats.tickets)}
                                                            </h3>
                                                            <span className="text-sm font-bold opacity-70">DT</span>
                                                        </div>
                                                        <div className="absolute right-4 bottom-[-10%] opacity-10 text-white"><Ticket size={80} /></div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8c8279] mb-1 block ml-1">Date de paiement</label>
                                        <input
                                            type="date"
                                            value={paymentDetails.date}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, date: e.target.value })}
                                            className="w-full h-10 bg-[#f9f6f2] border border-[#e6dace] rounded-xl px-4 font-bold text-[#4a3426] focus:border-[#10b981] outline-none text-sm"
                                        />
                                    </div>
                                    {paymentDetails.method === 'Chèque' && (
                                        <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 text-center">
                                            <p className="text-xs text-yellow-700 font-bold mb-2">Photos Chèque (Optionnel)</p>
                                            <div className="flex gap-2 justify-center">
                                                <input
                                                    type="file"
                                                    id="cheque-recto-unpaid"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setPaymentDetails({ ...paymentDetails, photo_cheque_url: reader.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('cheque-recto-unpaid')?.click()}
                                                    className={`px-3 py-1 border rounded-lg text-[10px] font-bold uppercase transition-all ${paymentDetails.photo_cheque_url
                                                        ? 'bg-green-500 text-white border-green-600 shadow-md'
                                                        : 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50'
                                                        }`}
                                                >
                                                    {paymentDetails.photo_cheque_url ? '✓ Recto' : 'Recto'}
                                                </button>

                                                <input
                                                    type="file"
                                                    id="cheque-verso-unpaid"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setPaymentDetails({ ...paymentDetails, photo_verso_url: reader.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('cheque-verso-unpaid')?.click()}
                                                    className={`px-3 py-1 border rounded-lg text-[10px] font-bold uppercase transition-all ${paymentDetails.photo_verso_url
                                                        ? 'bg-green-500 text-white border-green-600 shadow-md'
                                                        : 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50'
                                                        }`}
                                                >
                                                    {paymentDetails.photo_verso_url ? '✓ Verso' : 'Verso'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePaySubmit}
                                        className={`w-full h-12 rounded-xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 ${!paymentDetails.method
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-400/20'
                                            : 'bg-[#10b981] hover:bg-[#059669] text-white shadow-xl shadow-[#10b981]/20 group'
                                            }`}
                                    >
                                        <CheckCircle2 size={18} /> Confirmer le paiement
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Photo Viewer for Unpaid Invoices */}
                <AnimatePresence>
                    {viewingUnpaidPhoto && (
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setViewingUnpaidPhoto(null)}>
                            <div className="relative max-w-4xl max-h-[90vh] w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
                                <div className="absolute top-4 right-4 z-10">
                                    <button onClick={() => setViewingUnpaidPhoto(null)} className="bg-black/50 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-all"><ChevronRight className="rotate-90" /></button>
                                </div>
                                <div className="h-[80vh] flex items-center justify-center p-4">
                                    <img src={viewingUnpaidPhoto.photo_url} className="max-w-full max-h-full object-contain rounded-lg" />
                                </div>
                                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent text-white text-center">
                                    <p className="font-bold">{viewingUnpaidPhoto.supplier_name}</p>
                                    <p className="text-xs opacity-70">{viewingUnpaidPhoto.amount} DT - {viewingUnpaidPhoto.date}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div >

            {/* History Modal for Riadh */}
            <AnimatePresence>
                {
                    showHistoryModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-[#4a3426]/60 backdrop-blur-md flex items-center justify-center p-4"
                            onClick={() => setShowHistoryModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-[#f9f6f2] rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 flex flex-col"
                            >
                                <div className="p-6 bg-white border-b border-[#e6dace] shrink-0">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-black text-[#4a3426] uppercase tracking-tight flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#f4ece4] rounded-xl flex items-center justify-center text-[#c69f6e]">
                                                <Clock size={22} />
                                            </div>
                                            Historique Dépenses (Riadh)
                                            <span className="bg-[#ef4444] text-white px-3 py-1 rounded-xl text-sm font-black shadow-lg shadow-red-500/20">
                                                {historyData?.getInvoices?.filter((inv: any) => inv.payer === 'riadh').length || 0}
                                            </span>
                                        </h2>
                                        <button onClick={() => setShowHistoryModal(false)} className="w-10 h-10 rounded-full hover:bg-[#fcfaf8] flex items-center justify-center text-[#8c8279] transition-colors">
                                            <ChevronRight size={24} className="rotate-90" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8279]" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Rechercher par nom..."
                                                value={historySearch}
                                                onChange={(e) => setHistorySearch(e.target.value)}
                                                className="w-full h-12 pl-12 pr-4 bg-[#fcfaf8] border border-[#e6dace] rounded-xl font-medium text-[#4a3426] placeholder:text-[#8c8279]/50 focus:border-[#c69f6e] focus:ring-2 focus:ring-[#c69f6e]/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <PremiumDatePicker
                                                    label="Début"
                                                    value={historyDateRange.start}
                                                    onChange={(val) => setHistoryDateRange(prev => ({ ...prev, start: val }))}
                                                />
                                            </div>
                                            <span className="text-[#c69f6e] font-black text-sm opacity-30 mt-5">→</span>
                                            <div className="flex-1">
                                                <PremiumDatePicker
                                                    label="Fin"
                                                    value={historyDateRange.end}
                                                    onChange={(val) => setHistoryDateRange(prev => ({ ...prev, end: val }))}
                                                    align="right"
                                                />
                                            </div>
                                            {(historyDateRange.start || historyDateRange.end) && (
                                                <button
                                                    onClick={() => setHistoryDateRange({ start: '', end: '' })}
                                                    className="mt-5 px-3 h-10 bg-[#f4ece4] text-[#c69f6e] rounded-xl text-xs font-bold hover:bg-[#ebdccf] transition-all"
                                                >
                                                    Réinitialiser
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                    <div className="space-y-4">
                                        {(() => {
                                            const riadhInvoices = historyData?.getInvoices?.filter((inv: any) => inv.payer === 'riadh') || [];
                                            const filteredHistory = riadhInvoices.filter((inv: any) => {
                                                if (historySearch) {
                                                    const searchLower = historySearch.toLowerCase();
                                                    const supplierMatch = inv.supplier_name?.toLowerCase().includes(searchLower);
                                                    const amountMatch = inv.amount?.toString().includes(historySearch);
                                                    if (!supplierMatch && !amountMatch) return false;
                                                }
                                                if (historyDateRange.start) {
                                                    if (new Date(inv.date) < new Date(historyDateRange.start)) return false;
                                                }
                                                if (historyDateRange.end) {
                                                    if (new Date(inv.date) > new Date(historyDateRange.end)) return false;
                                                }
                                                return true;
                                            });

                                            if (filteredHistory.length > 0) {
                                                return filteredHistory
                                                    .sort((a: any, b: any) => {
                                                        const timeA = new Date(a.updated_at || a.date).getTime();
                                                        const timeB = new Date(b.updated_at || b.date).getTime();
                                                        const timeDiff = timeB - timeA;
                                                        if (timeDiff !== 0) return timeDiff;
                                                        return parseInt(b.id) - parseInt(a.id);
                                                    })
                                                    .map((inv: any) => (
                                                        <div key={inv.id} className="group relative bg-[#fdfaf8] p-8 rounded-[2.5rem] border border-[#e6dace]/50 hover:bg-white hover:border-[#c69f6e] hover:shadow-2xl hover:shadow-[#c69f6e]/10 transition-all duration-500">
                                                            {/* Top: Supplier Name */}
                                                            <div className="flex justify-center mb-8">
                                                                <h3 className="font-extrabold text-[#4a3426] text-[22px] uppercase tracking-[0.2em] group-hover:text-[#c69f6e] transition-colors">
                                                                    {inv.supplier_name}
                                                                </h3>
                                                            </div>

                                                            <div className="flex items-center gap-12">
                                                                {/* 1. Actions & Amount */}
                                                                <div className="flex items-center gap-6 min-w-[200px]">
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => handleDelete(inv)}
                                                                            className="w-10 h-10 rounded-2xl bg-white border border-red-100 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center justify-center transition-all duration-300 shadow-sm"
                                                                            title="Supprimer"
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleEditHistoryItemClick(inv)}
                                                                            className="w-10 h-10 rounded-2xl bg-white border border-blue-100 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 flex items-center justify-center transition-all duration-300 shadow-sm"
                                                                            title="Modifier"
                                                                        >
                                                                            <Edit2 size={18} />
                                                                        </button>
                                                                    </div>
                                                                    <div className="flex-1 flex flex-col justify-center">
                                                                        <div className="font-black text-[#4a3426] text-2xl tabular-nums leading-none tracking-tighter">
                                                                            {maskAmount(inv.amount)}
                                                                            <span className="text-[10px] text-[#c69f6e] ml-1 uppercase">dt</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 2. Document Details (Center) */}
                                                                <div className="flex-1 flex flex-col items-center gap-3">
                                                                    {inv.doc_type && (
                                                                        <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${inv.doc_type === 'Facture' ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>
                                                                            {inv.doc_type}
                                                                        </span>
                                                                    )}
                                                                    {(inv.photo_url || inv.photo_cheque_url || (inv.photos && inv.photos !== '[]')) ? (
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedSupplier(inv.supplier_name);
                                                                                const normalized = {
                                                                                    ...inv,
                                                                                    photos: inv.photos,
                                                                                    photo_url: inv.photo_url,
                                                                                    photo_cheque_url: inv.photo_cheque_url,
                                                                                    photo_verso_url: inv.photo_verso_url,
                                                                                    paymentMethod: inv.payment_method
                                                                                };
                                                                                setViewingData(normalized);
                                                                            }}
                                                                            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#4a3426] text-[#4a3426] hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all border border-[#4a3426]/10 shadow-sm"
                                                                        >
                                                                            <ImageIcon size={14} />
                                                                            <span>Justificatif</span>
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-[10px] font-bold text-[#8c8279]/30 uppercase italic">Aucune Pièce</span>
                                                                    )}
                                                                </div>

                                                                {/* 3. Payment Context & Dates */}
                                                                <div className="flex items-center gap-10 min-w-[320px] justify-end">
                                                                    <div className="flex flex-col items-end gap-3 text-right">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-[9px] font-extrabold text-[#4a3426]/60 uppercase tracking-widest bg-[#f4ece4] px-3 py-1 rounded-full">{inv.payment_method}</span>
                                                                            {inv.origin === 'direct_expense' ? (
                                                                                <span className="text-[8px] font-black text-red-500 border border-red-100 px-2 py-1 rounded-lg bg-red-50 uppercase tracking-tighter">Nouveau Règlement</span>
                                                                            ) : (
                                                                                <span className="text-[8px] font-black text-blue-500 border border-blue-100 px-2 py-1 rounded-lg bg-blue-50 uppercase tracking-tighter">Ancien Règlement</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-6">
                                                                            <div className="flex flex-col items-end">
                                                                                <span className="text-[7.5px] font-black text-[#c69f6e] uppercase tracking-widest mb-1">Reçue le</span>
                                                                                <span className="text-[12px] font-black text-[#4a3426] uppercase">
                                                                                    {new Date(inv.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                                </span>
                                                                            </div>
                                                                            <div className="w-px h-6 bg-[#e6dace]"></div>
                                                                            <div className="flex flex-col items-end">
                                                                                <span className="text-[7.5px] font-black text-green-600 uppercase tracking-widest mb-1">Payée le</span>
                                                                                <span className="text-[12px] font-black text-[#4a3426] uppercase">
                                                                                    {new Date(inv.paid_date || inv.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-16 h-16 rounded-[2rem] bg-white border border-[#e6dace] flex items-center justify-center text-[#c69f6e] group-hover:bg-[#4a3426] group-hover:text-white transition-all duration-500 shadow-sm group-hover:rotate-12">
                                                                        <Receipt size={30} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ));
                                            } else {
                                                return (
                                                    <div className="text-center py-12 text-[#8c8279] font-bold italic opacity-50">
                                                        Aucun résultat correspondant
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Expenses Details Modal - IMAGE 0 STYLE */}
            {/* Expenses Details Modal - IMAGE 0 STYLE */}
            <AnimatePresence>
                {
                    showExpensesDetails && (
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white/60 backdrop-blur-xl"
                                onClick={() => setShowExpensesDetails(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-[#fcfaf8] w-full max-w-[95vw] md:max-w-[85vw] h-auto max-h-[96vh] rounded-[2rem] md:rounded-[4rem] shadow-[0_30px_100px_rgba(74,52,38,0.15)] overflow-hidden border border-white flex flex-col"
                            >
                                {/* Modal Header */}
                                <div className="p-4 md:p-12 pb-4 md:pb-10 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-4 md:gap-8 overflow-y-auto lg:overflow-visible no-scrollbar flex-shrink-0 relative">
                                    <button
                                        onClick={() => setShowExpensesDetails(false)}
                                        className="absolute top-5 right-5 lg:static w-10 h-10 md:w-14 md:h-14 bg-white rounded-2xl flex items-center justify-center text-[#8c8279] hover:bg-red-50 hover:text-red-500 transition-all border border-[#e6dace]/30 shadow-sm shrink-0 z-[10]"
                                    >
                                        <X size={20} className="md:size-7" />
                                    </button>

                                    <div className="w-full lg:flex-1 flex flex-col items-center lg:items-start text-center lg:text-left pt-6 lg:pt-0">
                                        <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-[#4a3426] tracking-tighter leading-none mb-1 md:mb-2">Détails des Dépenses</h2>

                                        <p className="text-[#c69f6e] font-black text-[7px] md:text-[9px] uppercase tracking-[0.4em] mb-4 md:mb-6">Récapitulatif financier complet</p>

                                        {/* Dynamic Legend */}
                                        <div className="flex flex-wrap justify-center lg:grid lg:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-1 md:gap-y-2 mt-1">
                                            {chartData.map((cat, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2 group cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveSegment(activeSegment?.label === cat.label ? null : cat);
                                                    }}
                                                >
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                                    <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${activeSegment?.label === cat.label ? 'text-[#4a3426]' : 'text-[#8c8279]/60 hover:text-[#8c8279]'}`}>
                                                        {cat.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="w-full lg:flex-[2] grid grid-cols-3 gap-2 md:gap-3 px-0 lg:px-4">
                                        {/* 1. Chiffre d'Affaire */}
                                        <div className="bg-[#56b350] p-3 lg:p-5 rounded-xl lg:rounded-3xl shadow-md relative overflow-hidden text-white flex flex-col justify-center min-h-[70px] lg:min-h-[110px]">
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-1.5 text-white/90 mb-0.5 md:mb-1 uppercase text-[6px] lg:text-[8px] font-bold tracking-[0.1em] md:tracking-[0.2em]">
                                                    <FileText size={8} className="md:size-3" /> CA
                                                </div>
                                                <div className="flex items-baseline gap-0.5">
                                                    <h3 className="text-xs md:text-xl lg:text-2xl font-black tracking-tighter">
                                                        {maskAmount(computedStats.chiffreAffaire, 0)}
                                                    </h3>
                                                    <span className="text-[6px] md:text-[10px] font-bold opacity-80 uppercase">DT</span>
                                                </div>
                                            </div>
                                            <Wallet className="absolute right-[-10%] bottom-[-20%] opacity-20 text-white w-12 lg:w-20 h-12 lg:h-20" />
                                        </div>

                                        {/* 2. Total Dépenses - RED (CENTER) */}
                                        <div className="bg-[#ef4444] p-3 lg:p-5 rounded-xl lg:rounded-3xl shadow-md relative overflow-hidden text-white flex flex-col justify-center min-h-[70px] lg:min-h-[110px]">
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-1.5 text-white/90 mb-0.5 md:mb-1 uppercase text-[6px] lg:text-[8px] font-bold tracking-[0.1em] md:tracking-[0.2em]">
                                                    <Banknote size={8} className="md:size-3" /> DEP
                                                </div>
                                                <div className="flex items-baseline gap-0.5">
                                                    <h3 className="text-xs md:text-xl lg:text-2xl font-black tracking-tighter">
                                                        {maskAmount(totals.global, 0)}
                                                    </h3>
                                                    <span className="text-[6px] md:text-[10px] font-bold opacity-80 uppercase">DT</span>
                                                </div>
                                            </div>
                                            <Banknote className="absolute right-[-10%] bottom-[-20%] opacity-20 text-white w-12 lg:w-20 h-12 lg:h-20" />
                                        </div>

                                        {/* 3. Reste */}
                                        <div className="bg-[#0154A2] p-3 lg:p-5 rounded-xl lg:rounded-3xl shadow-md relative overflow-hidden text-white flex flex-col justify-center min-h-[70px] lg:min-h-[110px]">
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-1.5 text-white/90 mb-0.5 md:mb-1 uppercase text-[6px] lg:text-[8px] font-bold tracking-[0.1em] md:tracking-[0.2em]">
                                                    <TrendingUp size={8} className="md:size-3" /> RST
                                                </div>
                                                <div className="flex items-baseline gap-0.5">
                                                    <h3 className="text-xs md:text-xl lg:text-2xl font-black tracking-tighter">
                                                        {maskAmount(computedStats.reste, 0)}
                                                    </h3>
                                                    <span className="text-[6px] md:text-[10px] font-bold opacity-80 uppercase">DT</span>
                                                </div>
                                            </div>
                                            <TrendingUp className="absolute right-[-10%] bottom-[-20%] opacity-20 text-white w-12 lg:w-20 h-12 lg:h-20" />
                                        </div>

                                        {/* Dynamic Sum Selection Display */}
                                        <AnimatePresence>
                                            {selectedCategories.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                    className="col-span-3 mt-1"
                                                >
                                                    <div className="bg-[#fcfaf8] border border-[#e6dace] rounded-3xl p-3 flex items-center justify-between shadow-sm">
                                                        <div className="flex items-center gap-4 pl-2">
                                                            <span className="text-[10px] font-black text-[#2d6a4f] uppercase tracking-widest bg-[#2d6a4f]/10 px-3 py-1.5 rounded-xl">SOMME :</span>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-3xl font-black text-[#2d6a4f] tracking-tighter leading-none">{maskAmount(selectedTotal)}</span>
                                                                <span className="text-xs font-bold text-[#2d6a4f]/60 uppercase">DT</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedCategories([])}
                                                            className="flex items-center gap-2 px-4 py-2.5 bg-[#e6dace]/20 hover:bg-[#e6dace]/40 hover:text-red-500 border border-[#e6dace] hover:border-red-200 rounded-2xl text-[10px] font-black text-[#8c8279] uppercase tracking-wider transition-all active:scale-95 group"
                                                        >
                                                            <X size={14} className="group-hover:rotate-90 transition-transform" />
                                                            ECHAP
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="w-full lg:flex-1 flex items-center justify-center lg:justify-end">
                                        {/* MEGA-POWERFUL High-Performance Donut Chart - CLICK INTERACTION */}
                                        <div className="relative w-36 h-36 md:w-48 md:h-48 lg:w-64 lg:h-64 flex-shrink-0 group">
                                            <svg
                                                className="w-full h-full -rotate-90 overflow-visible"
                                                viewBox="0 0 100 100"
                                                onClick={() => setActiveSegment(null)}
                                            >
                                                <circle cx="50" cy="50" r="38" stroke="#f3f0ec" strokeWidth="6" fill="transparent" style={{ cursor: 'pointer' }} />
                                                {chartData.map((segment, i) => {
                                                    const circum = 238.76;
                                                    const dashLen = Math.max(0, (segment.percentage * circum) - 2);
                                                    return (
                                                        <motion.circle
                                                            key={i}
                                                            cx="50" cy="50" r="38"
                                                            stroke={segment.color}
                                                            strokeWidth={activeSegment?.label === segment.label ? 12 : 8}
                                                            fill="transparent"
                                                            strokeDasharray={`${dashLen} ${circum}`}
                                                            initial={{ strokeDashoffset: circum }}
                                                            animate={{
                                                                strokeDashoffset: - (segment.startOffset * circum),
                                                                scale: activeSegment?.label === segment.label ? 1.05 : 1
                                                            }}
                                                            style={{
                                                                cursor: 'pointer',
                                                                transformOrigin: 'center'
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveSegment(activeSegment?.label === segment.label ? null : segment);
                                                            }}
                                                            transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                                                            strokeLinecap="round"
                                                            exit={{ strokeDashoffset: circum, transition: { duration: 0.2 } }}
                                                        />
                                                    );
                                                })}
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                                                {selectedCategories.length > 0 ? (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
                                                        <span className="text-lg lg:text-4xl font-black text-[#2d6a4f] leading-none block mb-0.5">
                                                            {maskAmount(selectedTotal, 0)}
                                                        </span>
                                                        <span className="text-[6px] lg:text-[9px] font-black text-[#c69f6e] uppercase tracking-[0.1em] md:tracking-[0.2em] block">
                                                            SÉLECTION
                                                        </span>
                                                    </motion.div>
                                                ) : activeSegment ? (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
                                                        <span className="text-lg lg:text-4xl font-black text-[#4a3426] leading-none block mb-0.5">
                                                            {hideAmounts ? '***' : Math.round(activeSegment.percentage * 100) + '%'}
                                                        </span>
                                                        <span className="text-[6px] lg:text-[9px] font-black text-[#c69f6e] uppercase tracking-[0.1em] md:tracking-[0.2em] block leading-none mb-1">
                                                            {activeSegment.label}
                                                        </span>
                                                        <span className="text-[7px] lg:text-[11px] font-black text-[#4a3426]/60 block leading-none">
                                                            {maskAmount(activeSegment.value)}
                                                        </span>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                        <span className="text-[10px] lg:text-[16px] font-black text-[#4a3426] leading-none block mb-0.5">DÉPENSES</span>
                                                        <span className="text-[6px] lg:text-[9px] font-black text-[#c69f6e] uppercase tracking-[0.2em] md:tracking-[0.4em] block">TOTALES</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Content - Grid Layout */}
                                <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-8 md:pb-12 custom-scrollbar no-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
                                        {[
                                            { title: 'DÉPENSES FOURNISSEURS', subtitle: 'MARCHANDISES & SERVICES', icon: Truck, color: 'text-red-500', iconBg: 'bg-red-50', dotColor: '#ef4444', items: expenseDetails.fournisseurs },
                                            { title: 'ACCOMPTE', subtitle: 'AVANCES SUR SALAIRES', icon: Calculator, color: 'text-[#6366f1]', iconBg: 'bg-[#6366f1]/5', dotColor: '#6366f1', items: expenseDetails.avances },
                                            { title: 'PRIMES', subtitle: 'RÉCOMPENSES & BONUS', icon: Award, color: 'text-[#06b6d4]', iconBg: 'bg-[#06b6d4]/5', dotColor: '#06b6d4', items: expenseDetails.primes },
                                            { title: 'DÉPENSES DIVERS', subtitle: 'FRAIS EXCEPTIONNELS', icon: Sparkles, color: 'text-[#f59e0b]', iconBg: 'bg-[#f59e0b]/5', dotColor: '#f59e0b', items: expenseDetails.divers },
                                            { title: 'DOUBLAGE', subtitle: 'HEURES SUPPLÉMENTAIRES', icon: TrendingUp, color: 'text-[#78716c]', iconBg: 'bg-[#78716c]/5', dotColor: '#78716c', items: expenseDetails.doublages },
                                            { title: 'RESTES SALAIRES', subtitle: 'SALAIRES EN ATTENTE', icon: Banknote, color: 'text-[#6366f1]', iconBg: 'bg-[#6366f1]/5', dotColor: '#6366f1', items: expenseDetails.remainders, badge: 'EN ATTENTE' },
                                            { title: 'DÉPENSES ADMINISTRATIF', subtitle: 'LOYERS, FACTURES & BUREAUX', icon: Layout, color: 'text-[#10b981]', iconBg: 'bg-[#10b981]/5', dotColor: '#10b981', items: expenseDetails.administratif },
                                            { title: 'EXTRA', subtitle: "MAIN D'ŒUVRE OCCASIONNELLE", icon: Zap, color: 'text-[#ec4899]', iconBg: 'bg-[#ec4899]/5', dotColor: '#ec4899', items: expenseDetails.extras },
                                        ].map((cat, idx) => {
                                            const total = (cat.items || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
                                            const labelMap: Record<string, string> = {
                                                'DÉPENSES FOURNISSEURS': 'Fournisseurs',
                                                'ACCOMPTE': 'Salaires + Avances',
                                                'PRIMES': 'Primes',
                                                'DÉPENSES DIVERS': 'Divers',
                                                'DOUBLAGE': 'Doublage',
                                                'RESTES SALAIRES': 'Salaires + Avances',
                                                'DÉPENSES ADMINISTRATIF': 'Administratif',
                                                'EXTRA': 'Extras'
                                            };
                                            const isActive = activeSegment?.label === labelMap[cat.title];
                                            const isExpanded = expandedCategories.includes(idx);
                                            const isSelected = selectedCategories.includes(idx);
                                            const hasItems = (cat.items || []).length > 0;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`group bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border transition-all duration-300 ${isSelected ? 'border-[#2d6a4f] ring-4 ring-[#2d6a4f]/10 shadow-xl bg-[#2d6a4f]/5' : (isExpanded || isActive) ? 'border-[#c69f6e] ring-4 ring-[#c69f6e]/5 shadow-xl' : 'border-[#e6dace]/20 hover:border-[#c69f6e]/30 shadow-sm shadow-[#4a3426]/5'} ${isActive || isSelected ? 'scale-[1.02]' : ''}`}
                                                >
                                                    {/* Category Header Card */}
                                                    <div
                                                        onMouseDown={() => startPress(idx)}
                                                        onTouchStart={() => startPress(idx)}
                                                        onMouseUp={cancelPress}
                                                        onMouseLeave={cancelPress}
                                                        onTouchEnd={cancelPress}
                                                        onClick={() => handleCardClick(idx, cat, labelMap, hasItems)}
                                                        className={`p-4 lg:p-6 flex items-center justify-between cursor-pointer select-none rounded-[1.5rem] lg:rounded-[2.5rem] transition-colors ${!hasItems ? 'cursor-default' : ''} ${isSelected ? 'bg-white/50' : 'hover:bg-[#fcfaf8]'}`}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-14 h-14 rounded-2xl ${cat.iconBg} flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                                                                <cat.icon size={26} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2.5 h-2.5 rounded-full mb-1.5 shadow-sm" style={{ backgroundColor: cat.dotColor }} />
                                                                    <p className="text-[11px] font-black text-[#4a3426] uppercase tracking-tight leading-none mb-1.5">{cat.title}</p>
                                                                    {isSelected && <CheckCircle2 size={14} className="text-[#2d6a4f] mb-1.5 animate-in fade-in zoom-in duration-300" />}
                                                                    {cat.badge && (
                                                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter bg-red-50 border border-red-100 px-1.5 py-0.5 rounded ml-1">{cat.badge}</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[9px] font-bold text-[#8c8279]/50 uppercase tracking-tighter leading-none">{cat.subtitle}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-2xl font-black text-[#4a3426] leading-none mb-1">{maskAmount(total)}</p>
                                                                <p className="text-[10px] font-black text-[#c69f6e] uppercase tracking-widest opacity-60">DT</p>
                                                            </div>
                                                            {hasItems && (
                                                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-[#c69f6e] border-[#c69f6e] text-white rotate-180' : 'bg-white border-[#e6dace] text-[#8c8279] group-hover:border-[#c69f6e]'}`}>
                                                                    <ChevronDown size={16} strokeWidth={3} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Expanded Items List */}
                                                    <AnimatePresence>
                                                        {isExpanded && hasItems && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden border-t border-[#e6dace]/30 bg-[#fcfaf8]/50 rounded-b-[2.5rem]"
                                                            >
                                                                <div className="p-4 space-y-2">
                                                                    {(cat.items || []).map((item: any, i: number) => (
                                                                        <button
                                                                            key={i}
                                                                            onClick={() => {
                                                                                setSelectedSupplier(item.name);
                                                                                setSelectedEmployeeDetails({
                                                                                    name: item.name,
                                                                                    category: cat.title,
                                                                                    subtitle: cat.subtitle,
                                                                                    total: item.amount,
                                                                                    items: item.items
                                                                                });
                                                                            }}
                                                                            className="w-full flex justify-between items-center px-6 py-4 bg-white rounded-2xl border border-transparent hover:border-[#c69f6e]/30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-md transition-all active:scale-[0.98]"
                                                                        >
                                                                            <span className="text-[11px] font-black text-[#4a3426] uppercase tracking-tight">{item.name}</span>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-sm font-black text-[#4a3426]">{maskAmount(item.amount)}</span>
                                                                                <span className="text-[9px] font-black text-[#c69f6e]/30 uppercase tracking-widest">DT</span>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Supplier Details Modal - IMAGE 1 STYLE */}
            <AnimatePresence>
                {
                    selectedEmployeeDetails && (
                        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#4a3426]/40 backdrop-blur-md"
                                onClick={() => setSelectedEmployeeDetails(null)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-5xl bg-[#fdfaf7] rounded-[3.5rem] shadow-2xl overflow-hidden border border-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header Section */}
                                <div className="bg-[#4a3426] p-10 flex items-center justify-between rounded-t-[3.5rem]">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                                            <ImageIcon className="text-white/60" size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none mb-3">
                                                {selectedEmployeeDetails.name}
                                            </h2>
                                            <div className="flex items-center gap-3">
                                                <span className="w-2 h-2 rounded-full bg-[#c69f6e]"></span>
                                                <p className="text-sm font-black text-white/50 uppercase tracking-[0.3em] leading-none pt-0.5">
                                                    {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] leading-none">Total Mensuel</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-white tracking-tighter">
                                                {maskAmount(selectedEmployeeDetails.total)}
                                            </span>
                                            <span className="text-lg font-black text-[#c69f6e]">DT</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedEmployeeDetails(null)}
                                        className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/20 group"
                                    >
                                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </div>

                                {/* Cards Grid */}
                                <div className="p-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {selectedEmployeeDetails.items.map((item: any, i: number) => {
                                            const isRestesSalaires = selectedEmployeeDetails.category === 'RESTES SALAIRES';
                                            const itemDate = item.date || item.created_at || item.updated_at;
                                            const displayDate = itemDate ? new Date(itemDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase() : '';

                                            return (
                                                <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-[#e6dace]/30 shadow-[0_10px_40px_rgba(74,52,38,0.03)] flex flex-col h-full hover:shadow-xl transition-all group">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex flex-col items-end gap-1">
                                                            {isRestesSalaires ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[8px] font-black text-[#c69f6e] uppercase tracking-widest">Date</span>
                                                                    <span className="text-[10px] font-black text-[#8c8279] uppercase tracking-widest">
                                                                        {displayDate}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[8px] font-black text-[#c69f6e] uppercase tracking-widest">Reçue le</span>
                                                                        <span className="text-[10px] font-black text-[#8c8279] uppercase tracking-widest">
                                                                            {new Date(item.doc_date || item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Réglée le</span>
                                                                        <span className="text-[10px] font-black text-[#4a3426] uppercase tracking-widest">
                                                                            {new Date(item.paid_date || item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black text-[#4a3426] leading-none mb-1">{maskAmount(item.amount)}</p>
                                                            <p className="text-[8px] font-black text-[#c69f6e] uppercase tracking-widest opacity-60">DT</p>
                                                        </div>
                                                    </div>

                                                    {!isRestesSalaires && (
                                                        <div className="flex flex-wrap gap-2 mb-8">
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                                <span className="text-[9px] font-black text-green-600 uppercase tracking-wider leading-none">Règlement Effectué</span>
                                                            </div>
                                                            <div className="px-3 py-1.5 bg-[#fdfaf7] border border-[#e6dace]/40 rounded-lg">
                                                                <span className="text-[9px] font-black text-[#8c8279] uppercase tracking-wider leading-none">{item.paymentMethod || item.payment_method || 'ESPÈCES'}</span>
                                                            </div>
                                                            {item.doc_type && (
                                                                <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${item.doc_type === 'Facture' ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${item.doc_type === 'Facture' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                                                                    <span className={`text-[9px] font-black uppercase tracking-wider leading-none ${item.doc_type === 'Facture' ? 'text-blue-600' : 'text-orange-600'}`}>
                                                                        {item.doc_type}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}


                                                    {!isRestesSalaires && (
                                                        <div className="mt-auto">
                                                            {(() => {
                                                                const hasLegacy = !!(item.photo_url && item.photo_url.length > 5);
                                                                const hasCheque = !!((item.photo_cheque || item.photo_cheque_url || '').length > 5 || (item.photo_verso || item.photo_verso_url || '').length > 5);
                                                                const hasGallery = Array.isArray(item.invoices) && item.invoices.length > 0;
                                                                const hasNewPhotos = !!(item.photos && item.photos !== '[]' && item.photos.length > 5);

                                                                if (hasLegacy || hasCheque || hasGallery || hasNewPhotos) {
                                                                    return (
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedSupplier(selectedEmployeeDetails.name);
                                                                                // Normalize for viewer
                                                                                const normalized = {
                                                                                    ...item,
                                                                                    photos: Array.isArray(item.invoices) ? JSON.stringify(item.invoices) : (item.photos || '[]'),
                                                                                    photo_cheque_url: item.photo_cheque || item.photo_cheque_url,
                                                                                    photo_verso_url: item.photo_verso || item.photo_verso_url,
                                                                                    paymentMethod: item.paymentMethod || item.payment_method
                                                                                };
                                                                                setViewingData(normalized);
                                                                            }}
                                                                            className="w-full py-4 bg-[#4a3426] hover:bg-[#c69f6e] text-white rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#4a3426]/10"
                                                                        >
                                                                            <Eye size={16} />
                                                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] pt-0.5">Justificatifs</span>
                                                                        </button>
                                                                    );
                                                                }
                                                                return (
                                                                    <div className="w-full py-4 bg-[#fcfaf8] rounded-2xl border border-dashed border-[#e6dace] flex items-center justify-center">
                                                                        <span className="text-[10px] font-black text-[#8c8279]/30 uppercase tracking-[0.2em]">Aucun Visuel</span>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Viewing Data Modal (Photos) - EXACT LOGIC FROM DASHBOARD/FACTURATION */}
            <AnimatePresence>
                {
                    viewingData && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 overflow-y-auto no-scrollbar"
                            onClick={() => setViewingData(null)}
                        >
                            <div className="w-full max-w-6xl space-y-8 py-10" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center text-white mb-4">
                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tight">{selectedSupplier}</h2>
                                        <p className="text-sm font-bold opacity-60 uppercase tracking-[0.3em]">
                                            {maskAmount(viewingData.amount)} DT • {viewingData.payment_method || viewingData.paymentMethod}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex bg-white/10 rounded-2xl p-1 gap-1 border border-white/10">
                                            <button onClick={() => setImgZoom(prev => Math.max(0.5, prev - 0.25))} className="w-10 h-10 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all" title="Zoom Arrière"><ZoomOut size={20} /></button>
                                            <div className="w-16 flex items-center justify-center font-black text-xs tabular-nums text-[#c69f6e]">{Math.round(imgZoom * 100)}%</div>
                                            <button onClick={() => setImgZoom(prev => Math.min(4, prev + 0.25))} className="w-10 h-10 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all" title="Zoom Avant"><ZoomIn size={20} /></button>
                                            <div className="w-px h-6 bg-white/10 self-center mx-1"></div>
                                            <button onClick={() => setImgRotation(prev => prev + 90)} className="w-10 h-10 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all" title="Tourner"><RotateCw size={20} /></button>
                                            <button onClick={resetView} className="w-10 h-10 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all" title="Réinitialiser"><Maximize2 size={20} /></button>
                                        </div>
                                        <button onClick={() => setViewingData(null)} className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"><X size={32} /></button>
                                    </div>
                                </div>

                                <div className={`grid grid-cols-1 ${['Chèque', 'Cheque'].includes(viewingData.paymentMethod || viewingData.payment_method) ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-8`}>
                                    {/* Photo Facture */}
                                    <div className="space-y-8">
                                        {(() => {
                                            let gallery: string[] = [];
                                            try {
                                                const rawPhotos = viewingData.photos;
                                                if (rawPhotos && rawPhotos !== 'null' && rawPhotos !== '[]') {
                                                    const parsed = typeof rawPhotos === 'string' ? JSON.parse(rawPhotos) : rawPhotos;
                                                    gallery = Array.isArray(parsed) ? parsed : [];
                                                }
                                            } catch (e) {
                                                gallery = [];
                                            }

                                            const allPhotos = [...gallery];
                                            if (viewingData.photo_url && viewingData.photo_url.length > 5 && !allPhotos.includes(viewingData.photo_url)) {
                                                allPhotos.unshift(viewingData.photo_url);
                                            }

                                            if (allPhotos.length === 0) {
                                                return (
                                                    <div className="h-[70vh] bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 italic font-bold uppercase tracking-widest">Sans Facture</div>
                                                );
                                            }

                                            return allPhotos.map((photo, pIdx) => (
                                                <div key={pIdx} className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">Document {pIdx + 1} / Facture</p>
                                                        <a href={photo} download target="_blank" className="flex items-center gap-2 text-[9px] font-black text-[#c69f6e] uppercase tracking-widest hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                            <Download size={12} /> Télécharger
                                                        </a>
                                                    </div>
                                                    <div
                                                        className="bg-black rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden group h-[70vh] relative"
                                                        onWheel={(e) => {
                                                            if (e.deltaY < 0) setImgZoom(prev => Math.min(4, prev + 0.1));
                                                            else setImgZoom(prev => Math.max(0.5, prev - 0.1));
                                                        }}
                                                    >
                                                        <motion.div
                                                            className={`w-full h-full flex items-center justify-center p-4 ${imgZoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
                                                            animate={{ scale: imgZoom, rotate: imgRotation }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                            drag={imgZoom > 1}
                                                            dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                                                            dragElastic={0.1}
                                                        >
                                                            <img
                                                                src={photo}
                                                                draggable="false"
                                                                className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
                                                                alt={`Facture ${pIdx + 1}`}
                                                                style={{ pointerEvents: imgZoom > 1 ? 'none' : 'auto', userSelect: 'none' }}
                                                            />
                                                        </motion.div>
                                                        <div className="absolute top-6 left-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="bg-black/60 backdrop-blur-md text-[10px] font-black text-[#c69f6e] px-4 py-2 rounded-full border border-[#c69f6e]/20 shadow-lg uppercase tracking-widest">Loupe: {Math.round(imgZoom * 100)}% • Molette pour zoomer</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>

                                    {/* Photos Chèque */}
                                    {['Chèque', 'Cheque'].includes(viewingData.paymentMethod || viewingData.payment_method) && (
                                        <>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">Chèque Recto</p>
                                                    {viewingData.photo_cheque_url && (
                                                        <a href={viewingData.photo_cheque_url} download target="_blank" className="flex items-center gap-2 text-[9px] font-black text-[#c69f6e] uppercase tracking-widest hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                            <Download size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                                {viewingData.photo_cheque_url ? (
                                                    <div
                                                        className="bg-black rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden h-[70vh] relative"
                                                        onWheel={(e) => {
                                                            if (e.deltaY < 0) setImgZoom(prev => Math.min(4, prev + 0.1));
                                                            else setImgZoom(prev => Math.max(0.5, prev - 0.1));
                                                        }}
                                                    >
                                                        <motion.div
                                                            className={`w-full h-full flex items-center justify-center p-4 ${imgZoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
                                                            animate={{ scale: imgZoom, rotate: imgRotation }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                            drag={imgZoom > 1}
                                                            dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                                                            dragElastic={0.1}
                                                        >
                                                            <img
                                                                src={viewingData.photo_cheque_url}
                                                                draggable="false"
                                                                className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
                                                                alt="Chèque Recto"
                                                                style={{ pointerEvents: imgZoom > 1 ? 'none' : 'auto', userSelect: 'none' }}
                                                            />
                                                        </motion.div>
                                                    </div>
                                                ) : (
                                                    <div className="h-[70vh] bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 italic font-bold">Sans Recto</div>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">Chèque Verso</p>
                                                    {viewingData.photo_verso_url && (
                                                        <a href={viewingData.photo_verso_url} download target="_blank" className="flex items-center gap-2 text-[9px] font-black text-[#c69f6e] uppercase tracking-widest hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                            <Download size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                                {viewingData.photo_verso_url ? (
                                                    <div
                                                        className="bg-black rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden h-[70vh] relative"
                                                        onWheel={(e) => {
                                                            if (e.deltaY < 0) setImgZoom(prev => Math.min(4, prev + 0.1));
                                                            else setImgZoom(prev => Math.max(0.5, prev - 0.1));
                                                        }}
                                                    >
                                                        <motion.div
                                                            className={`w-full h-full flex items-center justify-center p-4 ${imgZoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
                                                            animate={{ scale: imgZoom, rotate: imgRotation }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                            drag={imgZoom > 1}
                                                            dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                                                            dragElastic={0.1}
                                                        >
                                                            <img
                                                                src={viewingData.photo_verso_url}
                                                                draggable="false"
                                                                className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
                                                                alt="Chèque Verso"
                                                                style={{ pointerEvents: imgZoom > 1 ? 'none' : 'auto', userSelect: 'none' }}
                                                            />
                                                        </motion.div>
                                                    </div>
                                                ) : (
                                                    <div className="h-[70vh] bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 italic font-bold">Sans Verso</div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
            {/* Add Master Item Modal */}
            <AnimatePresence>
                {
                    showAddMasterModal && (
                        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#4a3426]/60 backdrop-blur-md"
                                onClick={() => setShowAddMasterModal(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-8 pb-4 flex justify-between items-center bg-[#fcfaf8]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                                            {expCategory === 'Divers' ? <Bookmark size={24} /> : <Truck size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-[#4a3426] leading-tight">
                                                Ajouter {expCategory === 'Divers' ? 'Désignation' : 'Fournisseur'}
                                            </h3>
                                            <p className="text-[10px] font-bold text-[#c69f6e] uppercase tracking-widest">Master List Registry</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAddMasterModal(false)} className="w-10 h-10 hover:bg-[#f4ece4] rounded-full flex items-center justify-center text-[#8c8279] transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5 px-1">
                                            <label className="text-[10px] font-black text-[#8c8279] uppercase tracking-[0.2em]">Nom de l'élément</label>
                                            <div className="relative">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder={expCategory === 'Divers' ? "Ex: Fruits, Transit..." : "Ex: Steg, Coca Cola..."}
                                                    value={masterItemName}
                                                    onChange={(e) => setMasterItemName(e.target.value)}
                                                    className="w-full h-14 bg-[#fcfaf8] border-2 border-[#e6dace]/30 focus:border-red-400 rounded-2xl px-5 outline-none font-black text-[#4a3426] transition-all text-lg placeholder:text-[#8c8279]/30"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start">
                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5">
                                                <AlertCircle size={12} />
                                            </div>
                                            <p className="text-[11px] font-bold text-blue-800 leading-relaxed">
                                                Cet élément sera enregistré de manière permanente et apparaîtra dans vos suggestions de recherche.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddMasterItem}
                                        disabled={!masterItemName.trim()}
                                        className="w-full h-16 bg-[#4a3426] text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-[#4a3426]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                    >
                                        <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                                            <Plus size={18} />
                                        </div>
                                        Confirmer l'Ajout
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
    CreditCard, Loader2, Search, Calendar,
    ArrowUpRight, Download, Filter, User, FileText,
    TrendingUp, Receipt, Wallet, UploadCloud, Coins, Banknote,
    ChevronLeft, ChevronRight, ChevronDown, Image as ImageIcon, Ticket,
    Clock, CheckCircle2, Eye, Edit2, Trash2, X, Layout, Plus,
    Truck, Sparkles, Calculator, Zap, Award, ZoomIn, ZoomOut, RotateCw, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

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

// --- End Helper Components ---

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
  mutation AddPaidInvoice($supplier_name: String!, $amount: String!, $date: String!, $photo_url: String, $photo_cheque_url: String, $photo_verso_url: String, $payment_method: String!, $paid_date: String!, $payer: String, $doc_type: String, $category: String) {
    addPaidInvoice(supplier_name: $supplier_name, amount: $amount, date: $date, photo_url: $photo_url, photo_cheque_url: $photo_cheque_url, photo_verso_url: $photo_verso_url, payment_method: $payment_method, paid_date: $paid_date, payer: $payer, doc_type: $doc_type, category: $category) {
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
  mutation UpdateInvoice($id: Int!, $supplier_name: String, $amount: String, $date: String, $payment_method: String, $paid_date: String, $category: String, $doc_type: String) {
    updateInvoice(id: $id, supplier_name: $supplier_name, amount: $amount, date: $date, payment_method: $payment_method, paid_date: $paid_date, category: $category, doc_type: $doc_type) {
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
    const [showExpForm, setShowExpForm] = useState(false);
    const [showSalaryRemaindersModal, setShowSalaryRemaindersModal] = useState(false);
    const [salaryRemainderMonth, setSalaryRemainderMonth] = useState(currentMonthStr);
    const [salaryRemainderMode, setSalaryRemainderMode] = useState<'global' | 'employee'>('employee');
    const [salaryRemainderSearch, setSalaryRemainderSearch] = useState('');
    const [editingHistoryItem, setEditingHistoryItem] = useState<any>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [viewingData, setViewingData] = useState<any>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<string>('');

    // Unpaid Invoices Modal State & Logic
    const [showUnpaidModal, setShowUnpaidModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState<any>(null);
    const [viewingUnpaidPhoto, setViewingUnpaidPhoto] = useState<any>(null);
    const [paymentDetails, setPaymentDetails] = useState({
        method: 'Espèces',
        date: todayStr,
        photo_cheque_url: '',
        photo_verso_url: ''
    });
    const [imgZoom, setImgZoom] = useState(1);
    const [imgRotation, setImgRotation] = useState(0);
    const [bankTransactionType, setBankTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
    const [unpaidSearchFilter, setUnpaidSearchFilter] = useState('');
    const [unpaidDateRange, setUnpaidDateRange] = useState({ start: '', end: '' });

    const resetView = () => {
        setImgZoom(1);
        setImgRotation(0);
    };

    useEffect(() => {
        if (viewingData) resetView();
    }, [viewingData]);

    const { data: unpaidData, refetch: refetchUnpaid } = useQuery(GET_INVOICES, {
        variables: { supplierName: '', startDate: '', endDate: '' },
        pollInterval: 5000
    });

    // History Modal State
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showExpensesDetails, setShowExpensesDetails] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
    const [historySearch, setHistorySearch] = useState('');
    const [historyDateRange, setHistoryDateRange] = useState({ start: '', end: '' });
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<{ name: string, category: string, subtitle: string, total: number, items: any[] } | null>(null);

    const { data: historyData, refetch: refetchHistory } = useQuery(GET_INVOICES, {
        variables: { payer: 'riadh', startDate: '', endDate: '' },
        pollInterval: 5000,
        skip: !showHistoryModal
    });

    const [execPayInvoice] = useMutation(PAY_INVOICE);
    const [execDeleteInvoice] = useMutation(DELETE_INVOICE);
    const [execUnpayInvoice] = useMutation(UNPAY_INVOICE);
    const [execUpdateInvoice] = useMutation(UPDATE_INVOICE);

    const handlePaySubmit = async () => {
        if (!showPayModal) return;
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
                : "Cette facture retournera dans la liste des impayés (Facturation).",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isDirect ? '#ef4444' : '#f59e0b',
            cancelButtonColor: '#8c8279',
            confirmButtonText: isDirect ? 'Oui, supprimer' : 'Oui, remettre en impayé',
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
                            text: 'Le paiement est annulé, la facture est de nouveau impayée.',
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
        const source = data?.getChiffresByRange || [];
        const riadhExpenses = (data?.getInvoices || []).filter((inv: any) => inv.status === 'paid' && inv.payer === 'riadh');
        const riadhTotal = riadhExpenses.reduce((acc: number, inv: any) => acc + safeParse(inv.amount), 0);

        const aggregated = source.reduce((acc: any, curr: any) => ({
            chiffreAffaire: acc.chiffreAffaire + safeParse(curr.recette_de_caisse),
            reste: acc.reste + safeParse(curr.recette_net),
            cash: acc.cash + safeParse(curr.espaces),
            tpe: acc.tpe + safeParse(curr.tpe),
            cheque: acc.cheque + safeParse(curr.cheque_bancaire),
            tickets: acc.tickets + safeParse(curr.tickets_restaurant),
            expenses: acc.expenses + safeParse(curr.total_diponce)
        }), { chiffreAffaire: 0, reste: 0, cash: 0, tpe: 0, cheque: 0, tickets: 0, expenses: 0 });

        const pendingRemaindersTotal = (data?.getSalaryRemainders || []).reduce((acc: number, r: any) => acc + safeParse(r.amount), 0);
        const bankDepositsTotal = (data?.getBankDeposits || []).reduce((acc: number, d: any) => acc + safeParse(d.amount), 0);

        // Base Cash (Available from Sales/Espaces only, before transfers)
        // If we have aggregated data (source), use it. otherwise reconstruct from backend stats (which is TotalCash + BankDeposits)
        const totalEspaces = aggregated.chiffreAffaire > 0
            ? aggregated.cash
            : (safeParse(data?.getPaymentStats?.totalCash) + safeParse(data?.getPaymentStats?.totalBankDeposits));

        // Add Riadh's expenses (excluded from backend daily totals) to aggregated totals for this page only
        // Also add Pending Remainders to Total Expenses
        const finalExpenses = (aggregated.expenses || safeParse(data?.getPaymentStats?.totalExpenses)) + riadhTotal + pendingRemaindersTotal;

        // Subtract Riadh's expenses AND Pending Remainders from Net Revenue
        const finalReste = (aggregated.reste || safeParse(data?.getPaymentStats?.totalRecetteNette)) - riadhTotal - pendingRemaindersTotal;

        // Final Cash = (Total Espaces) - (Net Bank Transfers) - (Pending Salary Remainders)
        // Note: bankDepositsTotal is positive for deposits, negative for withdrawals.
        // Deposit (Positive): Cash decreases (- 100)
        // Withdrawal (Negative): Cash increases (- -100 = +100)
        const finalCash = totalEspaces - bankDepositsTotal - pendingRemaindersTotal;

        return {
            chiffreAffaire: aggregated.chiffreAffaire || safeParse(data?.getPaymentStats?.totalRecetteCaisse),
            reste: finalReste,
            cash: finalCash,
            tpe: aggregated.tpe || safeParse(data?.getPaymentStats?.totalTPE),
            cheque: aggregated.cheque || safeParse(data?.getPaymentStats?.totalCheque),
            tickets: aggregated.tickets || safeParse(data?.getPaymentStats?.totalTicketsRestaurant),
            expenses: finalExpenses
        };
    }, [data]);

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

    const expenseDetails = useMemo(() => {
        const sourceData = data?.getChiffresByRange || [];
        if (!sourceData || sourceData.length === 0) return {
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
        const pendingRemainders = data?.getSalaryRemainders || [];
        pendingRemainders.forEach((r: any) => {
            agg.restesSalaires.push({
                username: r.employee_name,
                montant: r.amount,
                date: r.updated_at || new Date().toISOString(),
                isPending: true
            });
        });

        // Add Riadh's paid invoices (excluded from backend daily merge)
        const riadhInvoices = (data?.getInvoices || []).filter((inv: any) => inv.status === 'paid' && inv.payer === 'riadh');
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
    }, [data]);

    const totals = useMemo(() => {
        const dep = expenseDetails.fournisseurs.reduce((a: number, b: any) => a + b.amount, 0) +
            expenseDetails.divers.reduce((a: number, b: any) => a + b.amount, 0) +
            expenseDetails.administratif.reduce((a: number, b: any) => a + b.amount, 0);

        const sal = expenseDetails.avances.reduce((a: number, b: any) => a + b.amount, 0) +
            expenseDetails.doublages.reduce((a: number, b: any) => a + b.amount, 0) +
            expenseDetails.extras.reduce((a: number, b: any) => a + b.amount, 0) +
            expenseDetails.primes.reduce((a: number, b: any) => a + b.amount, 0) +
            expenseDetails.remainders.reduce((a: number, b: any) => a + b.amount, 0);

        return {
            expenses: dep,
            salaries: sal,
            global: dep + sal
        };
    }, [expenseDetails]);

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
        <div className="flex min-h-screen bg-[#f8f5f2]">
            <Sidebar role={user.role} />

            <div className="flex-1 min-w-0 pb-24 lg:pb-0">
                <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#e6dace] py-6 px-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-[#4a3426] tracking-tight">Finances & Trésorerie</h1>
                        <p className="text-[10px] md:text-xs text-[#8c8279] font-bold uppercase tracking-widest mt-1">Vision Globale & Flux Bancaires</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-white rounded-2xl p-1 border border-[#e6dace] shadow-sm w-full md:w-auto">
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

                        <div className="flex items-center gap-3 bg-white rounded-3xl p-1.5 border border-[#e6dace] shadow-sm">
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

                        <div className="relative">
                            <button
                                onClick={() => setShowMonthPicker(!showMonthPicker)}
                                className={`bg-white border border-[#e6dace] rounded-2xl h-11 px-6 flex items-center gap-3 hover:border-[#c69f6e] transition-all group w-full md:w-auto justify-between md:justify-start ${activeFilter === 'month' ? 'ring-2 ring-[#c69f6e]/20' : ''}`}
                            >
                                <Calendar size={18} className="text-[#c69f6e]" />
                                <span className="font-black text-[#4a3426] uppercase text-[11px] tracking-widest">
                                    {month ? `${months[parseInt(month.split('-')[1]) - 1]} ${month.split('-')[0]}` : 'Sélectionner Mois'}
                                </span>
                            </button>

                            <AnimatePresence>
                                {showMonthPicker && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute top-full right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-2xl border border-[#e6dace] p-6 z-50 overflow-hidden"
                                        >
                                            <div className="flex justify-between items-center mb-6 px-2">
                                                <button
                                                    onClick={() => setPickerYear(v => v - 1)}
                                                    className="p-2 hover:bg-[#fcfaf8] rounded-xl text-[#8c8279] transition-colors"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <span className="text-xl font-black text-[#4a3426] tracking-tighter">{pickerYear}</span>
                                                <button
                                                    onClick={() => setPickerYear(v => v + 1)}
                                                    className="p-2 hover:bg-[#fcfaf8] rounded-xl text-[#8c8279] transition-colors"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                {months.map((m, i) => {
                                                    const currentMonth = `${pickerYear}-${String(i + 1).padStart(2, '0')}`;
                                                    const isActive = month === currentMonth;
                                                    return (
                                                        <button
                                                            key={m}
                                                            onClick={() => {
                                                                setMonth(currentMonth);
                                                                setActiveFilter('month');
                                                                setShowMonthPicker(false);
                                                            }}
                                                            className={`h-10 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${isActive ? 'bg-[#c69f6e] text-white shadow-lg shadow-[#c69f6e]/20' : 'text-[#8c8279] hover:bg-[#fcfaf8] hover:text-[#4a3426] border border-transparent hover:border-[#e6dace]'}`}
                                                        >
                                                            {m.substring(0, 3)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">
                    {/* Financial Summary Grid - 3 Columns */}
                    <div className="space-y-4">
                        {/* 1. Chiffre d'Affaire */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                            className="bg-[#3eb37c] p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:scale-[1.005] transition-all text-white h-56 flex flex-col justify-center"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-white/90 mb-4 uppercase text-[11px] font-bold tracking-[0.2em]">
                                    <FileText size={18} /> Chiffre d'Affaire
                                </div>
                                <h3 className="text-6xl font-black tracking-tighter mb-2">
                                    {computedStats.chiffreAffaire.toLocaleString('fr-FR', { minimumFractionDigits: 3 }).replace(/\s/g, ',')}
                                </h3>
                                <span className="text-xl font-bold opacity-80 block">DT</span>
                            </div>
                            <div className="absolute right-8 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-500 text-white">
                                <Wallet size={160} />
                            </div>
                        </motion.div>

                        {/* 2. Total Dépenses (This now shows the TOTAL Global) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            onClick={() => setShowExpensesDetails(true)}
                            className="bg-[#4b5563] p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:scale-[1.005] transition-all text-white h-56 flex flex-col justify-center cursor-pointer"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-white/90 mb-4 uppercase text-[11px] font-bold tracking-[0.2em]">
                                    <Banknote size={18} /> Total Dépenses
                                </div>
                                <h3 className="text-6xl font-black tracking-tighter mb-2">
                                    {computedStats.expenses.toLocaleString('fr-FR', { minimumFractionDigits: 3 }).replace(/\s/g, ',')}
                                </h3>
                                <span className="text-xl font-bold opacity-80 block">DT</span>
                            </div>
                            <div className="absolute right-8 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-500 text-white">
                                <Banknote size={160} />
                            </div>
                        </motion.div>

                        {/* 3. Reste */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-[#56b350] p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:scale-[1.005] transition-all text-white h-56 flex flex-col justify-center"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-white/90 mb-4 uppercase text-[11px] font-bold tracking-[0.2em]">
                                    <TrendingUp size={18} /> Reste
                                </div>
                                <h3 className="text-6xl font-black tracking-tighter mb-2">
                                    {computedStats.reste.toLocaleString('fr-FR', { minimumFractionDigits: 3 }).replace(/\s/g, ',')}
                                </h3>
                                <span className="text-xl font-bold opacity-80 block">DT</span>
                            </div>
                            <div className="absolute right-8 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-500 text-white">
                                <TrendingUp size={160} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Secondary Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 4. Total Cash */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-[#f59e0b] p-8 rounded-[2rem] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all text-white h-40 flex flex-col justify-center"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-white/90 mb-2 uppercase text-[10px] font-bold tracking-widest">
                                    <Coins size={14} /> Total Cash
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter">{computedStats.cash.toLocaleString('fr-FR', { minimumFractionDigits: 3 }).replace(/\s/g, ',')}</h3>
                                <span className="text-sm font-bold opacity-70">DT</span>
                            </div>
                            <div className="absolute right-4 bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500 text-white">
                                <Coins size={80} />
                            </div>
                        </motion.div>

                        {/* 5. Bancaire */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="bg-[#3b82f6] p-8 rounded-[2rem] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all text-white h-40 flex flex-col justify-center"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-white/90 mb-2 uppercase text-[10px] font-bold tracking-widest">
                                    <CreditCard size={14} /> Bancaire (TPE + Vers. + Chèques)
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter">
                                    {(computedStats.tpe + (data?.getPaymentStats?.totalBankDeposits || 0) + computedStats.cheque).toLocaleString('fr-FR', { minimumFractionDigits: 3 }).replace(/\s/g, ',')}
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
                            className="bg-[#8b5cf6] p-8 rounded-[2rem] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all text-white h-40 flex flex-col justify-center"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-white/90 mb-2 uppercase text-[10px] font-bold tracking-widest">
                                    <Ticket size={14} /> Ticket Restaurant
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter">
                                    {(computedStats.tickets).toLocaleString('fr-FR', { minimumFractionDigits: 3 }).replace(/\s/g, ',')}
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
                            <div className="bg-white p-6 rounded-[2.5rem] luxury-shadow border border-[#e6dace]/50">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-black text-[#4a3426] flex items-center gap-2">
                                        <div className={editingHistoryItem ? "bg-blue-500 p-2 rounded-xl text-white" : "bg-red-500 p-2 rounded-xl text-white"}>
                                            <Receipt size={18} />
                                        </div>
                                        {editingHistoryItem ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {!showExpForm && (
                                            <div className="flex flex-col items-end gap-1">
                                                <button
                                                    onClick={() => {
                                                        refetchUnpaid();
                                                        setShowUnpaidModal(true);
                                                    }}
                                                    className="text-[10px] font-black uppercase tracking-widest bg-red-50 border-2 border-red-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm"
                                                >
                                                    <Clock size={14} className="text-red-500" />
                                                    <span className="flex items-baseline gap-1">
                                                        <span className="text-xs">Total Impayé:</span>
                                                        <span className="text-sm font-black">
                                                            {(unpaidData?.getInvoices?.filter((inv: any) => inv.status !== 'paid')
                                                                .reduce((sum: number, inv: any) => sum + parseFloat(inv.amount || 0), 0) || 0)
                                                                .toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                                                        </span>
                                                        <span className="text-[9px]">DT</span>
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowHistoryModal(true);
                                                        refetchHistory();
                                                    }}
                                                    className="w-full text-[10px] font-black uppercase tracking-widest bg-[#f4ece4] border border-[#e6dace] text-[#c69f6e] py-1.5 rounded-lg hover:bg-[#ebdccf] transition-all flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    <Clock size={12} />
                                                    <span>Historique Riadh</span>
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
                                                }
                                                setShowExpForm(!showExpForm);
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-500 px-3 py-2 rounded-xl hover:bg-red-100 transition-all h-10"
                                        >
                                            {showExpForm ? 'Annuler' : 'Ajouter une dépense'}
                                        </button>
                                    </div>
                                </div>

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
                                                        <input
                                                            type="text"
                                                            value={expName}
                                                            onChange={(e) => setExpName(e.target.value)}
                                                            className="w-full h-11 bg-white border border-red-100 rounded-xl px-4 font-bold text-sm outline-none focus:border-red-400"
                                                            placeholder="Ex: Facture STEG..."
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 items-end">
                                                        <div>
                                                            <label className="text-[10px] font-black text-red-700/50 uppercase ml-1">Montant (DT)</label>
                                                            <input
                                                                type="number"
                                                                value={expAmount}
                                                                onChange={(e) => setExpAmount(e.target.value)}
                                                                className="w-full h-11 bg-white border border-red-100 rounded-xl px-4 font-black text-lg outline-none focus:border-red-400"
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
                                                        disabled={addingExp}
                                                        className={`w-full h-11 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg md:mt-auto ${editingHistoryItem ? 'bg-blue-600 shadow-blue-500/20' : 'bg-red-500 shadow-red-500/20'}`}
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
                                <div className="flex justify-between items-center mb-6">
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
                                            {showBankForm && bankTransactionType === 'withdraw' ? 'Fermer' : 'Retirer Cash'}
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
                                                <div className="grid grid-cols-2 gap-3 items-end">
                                                    <div>
                                                        <label className="text-[10px] font-black text-[#8c8279] uppercase ml-1">Montant (DT)</label>
                                                        <input
                                                            type="number"
                                                            value={bankAmount}
                                                            onChange={(e) => setBankAmount(e.target.value)}
                                                            className="w-full h-11 bg-white border border-[#e6dace] rounded-xl px-4 font-black text-lg outline-none focus:border-[#c69f6e]"
                                                            placeholder="0.000"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
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
                                                            {parseFloat(d.amount) < 0 ? 'Retrait' : 'Versement'} : {Math.abs(parseFloat(d.amount)).toFixed(3)} DT
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
                    <div className="bg-[#f9f6f2] rounded-[2.5rem] p-8 shadow-sm border border-[#e6dace]/50">
                        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <User className="text-[#c69f6e]" size={24} />
                                <h2 className="text-xl font-black text-[#4a3426] tracking-tight">Restes Salaires</h2>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex bg-[#fcfaf8] border border-[#e6dace] rounded-xl p-1 shadow-inner h-10 items-center">
                                    <input
                                        type="month"
                                        value={salaryRemainderMonth}
                                        onChange={(e) => setSalaryRemainderMonth(e.target.value)}
                                        className="bg-transparent px-3 py-1 text-xs font-black text-[#4a3426] outline-none h-full"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSalaryRemainderMode('global')}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${salaryRemainderMode === 'global' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                    >
                                        Global
                                    </button>
                                    <button
                                        onClick={() => setSalaryRemainderMode('employee')}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${salaryRemainderMode === 'employee' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                    >
                                        Employés
                                    </button>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c69f6e]" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Filtrer employé..."
                                        value={salaryRemainderSearch}
                                        onChange={(e) => setSalaryRemainderSearch(e.target.value)}
                                        className="w-64 h-10 bg-white border border-[#e6dace] rounded-xl pl-10 pr-4 text-xs font-bold text-[#4a3426] focus:border-[#c69f6e] outline-none transition-all placeholder:text-[#8c8279]/50 shadow-sm"
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
                                            key={salaryRemainderMonth}
                                            type="number"
                                            step="0.001"
                                            defaultValue={0}
                                            className="w-full text-center text-5xl font-black text-[#4a3426] outline-none border-b-2 border-[#e6dace] focus:border-red-400 pb-2 bg-transparent transition-colors"
                                        />
                                        <span className="text-xs font-black text-[#c69f6e] mt-2 block mb-6">DT</span>

                                        <div className="flex gap-2 mt-6">
                                            <button
                                                id="global-save-btn"
                                                onClick={async () => {
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
                                                    if (input) input.value = '';
                                                    const btn = document.getElementById('global-save-btn');
                                                    if (btn) {
                                                        const originalText = btn.innerHTML;
                                                        btn.innerHTML = '<span class="flex items-center gap-2 justify-center">ENREGISTRÉ <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>';
                                                        btn.classList.add('bg-green-500', 'text-white', 'border-green-500', 'shadow-green-500/30');
                                                        btn.classList.remove('bg-white', 'text-red-500', 'border-red-200');
                                                        setTimeout(() => {
                                                            btn.innerHTML = originalText;
                                                            btn.classList.remove('bg-green-500', 'text-white', 'border-green-500', 'shadow-green-500/30');
                                                            btn.classList.add('bg-white', 'text-red-500', 'border-red-200');
                                                        }, 2000);
                                                    }
                                                }}
                                                className="flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest bg-white border-2 border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-md active:scale-95"
                                            >
                                                Sauvegarder
                                            </button>
                                        </div>
                                        <div className="mt-8 space-y-3">
                                            {(() => {
                                                const globals = (data?.getSalaryRemainders || []).filter((r: any) => r.employee_name === 'Restes Salaires').sort((a: any, b: any) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
                                                if (globals.length === 0) return null;
                                                return globals.map((g: any) => (
                                                    <div key={g.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-red-100 shadow-sm group hover:border-red-200 transition-colors">
                                                        <div className="flex flex-col items-start">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="font-black text-xl text-[#4a3426]">{g.amount}</span>
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
                            <div className="overflow-hidden rounded-3xl border border-[#e6dace]/30 bg-white">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#fcfaf8] border-b border-[#e6dace]/30">
                                            <th className="px-8 py-5 text-[10px] font-black text-[#8c8279] uppercase tracking-[0.2em]">Employé</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-[#8c8279] uppercase tracking-[0.2em] text-center">Montant</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-[#8c8279] uppercase tracking-[0.2em] text-right">Action</th>
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
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full bg-[#f4ece4] flex items-center justify-center text-[10px] font-black text-[#c69f6e] group-hover:scale-110 transition-transform">{initials}</div>
                                                                <span className="font-black text-[#4a3426] tracking-tight text-sm">{emp.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center justify-center gap-2 relative">
                                                                <input
                                                                    id={`salary-input-${emp.id}`}
                                                                    type="number"
                                                                    step="0.001"
                                                                    defaultValue={rem?.amount || 0}
                                                                    className={`w-32 text-center font-black bg-transparent outline-none border-b transition-colors text-lg ${rem && rem.amount > 0 ? 'text-green-600 border-green-200 focus:border-green-500' : 'text-[#4a3426] border-transparent focus:border-[#c69f6e]'}`}
                                                                />
                                                                <span className={`text-[10px] font-black mt-1 ${rem && rem.amount > 0 ? 'text-green-600/60' : 'text-[#4a3426]/40'}`}>DT</span>
                                                                {rem && rem.amount > 0 && (
                                                                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-green-500">
                                                                        <CheckCircle2 size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    id={`save-btn-${emp.id}`}
                                                                    onClick={async () => {
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
                                                                        const btn = document.getElementById(`save-btn-${emp.id}`);
                                                                        if (btn) {
                                                                            const originalContent = btn.innerHTML;
                                                                            const originalClasses = btn.className;

                                                                            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                                                                            btn.className = "w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30 transition-all scale-110";

                                                                            setTimeout(() => {
                                                                                btn.innerHTML = originalContent;
                                                                                btn.className = originalClasses;
                                                                            }, 2000);
                                                                        }
                                                                    }}
                                                                    className={`inline-flex items-center justify-center h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${rem && rem.amount > 0
                                                                        ? 'bg-white text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300'
                                                                        : 'bg-white text-[#4a3426] border-[#e6dace] hover:bg-[#2d6a4f] hover:text-white hover:border-[#2d6a4f]'}`}
                                                                >
                                                                    {rem && rem.amount > 0 ? 'Modifier' : 'Sauvegarder'}
                                                                </button>

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
                                <div className="p-4 bg-white border-b border-[#e6dace] shrink-0">
                                    <div className="flex flex-col md:flex-row items-center gap-4">
                                        <div className="flex items-center gap-3 shrink-0">
                                            <h2 className="text-lg font-black text-[#4a3426] uppercase tracking-tight flex items-center gap-2">
                                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                                                    <Clock size={16} />
                                                </div>
                                                Factures Non Payées
                                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs border border-red-100">
                                                    {unpaidData?.getInvoices?.filter((inv: any) => inv.status !== 'paid').length || 0}
                                                </span>
                                            </h2>
                                        </div>

                                        <div className="h-8 w-[1px] bg-[#e6dace] hidden md:block"></div>

                                        <div className="flex items-center gap-2 whitespace-nowrap bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 shrink-0">
                                            <span className="text-[10px] font-bold uppercase text-red-400">Total:</span>
                                            <span className="text-sm font-black text-red-600">
                                                {(unpaidData?.getInvoices?.filter((inv: any) => inv.status !== 'paid')
                                                    .reduce((sum: number, inv: any) => sum + parseFloat(inv.amount || 0), 0) || 0)
                                                    .toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                                            </span>
                                            <span className="text-[10px] font-bold text-red-400">DT</span>
                                        </div>

                                        <div className="flex-1 flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                                            <div className="relative min-w-[200px] flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8279]" size={14} />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher..."
                                                    value={unpaidSearchFilter}
                                                    onChange={(e) => setUnpaidSearchFilter(e.target.value)}
                                                    className="w-full h-9 pl-9 pr-3 bg-[#fcfaf8] border border-[#e6dace] rounded-lg text-xs font-bold text-[#4a3426] placeholder:text-[#8c8279]/50 focus:border-red-300 focus:ring-1 focus:ring-red-100 outline-none transition-all"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="w-32">
                                                    <PremiumDatePicker
                                                        label="Début"
                                                        value={unpaidDateRange.start}
                                                        onChange={(val) => setUnpaidDateRange(prev => ({ ...prev, start: val }))}
                                                    />
                                                </div>
                                                <span className="text-[#c69f6e] font-black text-xs opacity-30">→</span>
                                                <div className="w-32">
                                                    <PremiumDatePicker
                                                        label="Fin"
                                                        value={unpaidDateRange.end}
                                                        onChange={(val) => setUnpaidDateRange(prev => ({ ...prev, end: val }))}
                                                        align="right"
                                                    />
                                                </div>
                                                {(unpaidDateRange.start || unpaidDateRange.end) && (
                                                    <button
                                                        onClick={() => setUnpaidDateRange({ start: '', end: '' })}
                                                        className="h-9 px-3 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-all"
                                                    >
                                                        RàZ
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <button onClick={() => setShowUnpaidModal(false)} className="w-8 h-8 rounded-full hover:bg-[#fcfaf8] flex items-center justify-center text-[#8c8279] transition-colors shrink-0">
                                            <ChevronRight size={20} className="rotate-90" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {unpaidData?.getInvoices
                                            ?.filter((inv: any) => inv.status !== 'paid')
                                            .filter((inv: any) => {
                                                // Filter by supplier name
                                                if (unpaidSearchFilter) {
                                                    const searchLower = unpaidSearchFilter.toLowerCase();
                                                    const supplierMatch = inv.supplier_name?.toLowerCase().includes(searchLower);
                                                    if (!supplierMatch) return false;
                                                }

                                                // Filter by date range
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
                                            })
                                            .map((inv: any) => (
                                                <motion.div
                                                    key={inv.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-red-50 rounded-[2rem] border-2 border-red-200 overflow-hidden group hover:shadow-xl hover:shadow-red-500/10 transition-all flex flex-col"
                                                >
                                                    <div className="p-5 flex justify-between items-start border-b border-red-100/50 bg-red-100/30">
                                                        <div>
                                                            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit mb-2">
                                                                <Clock size={12} /> Impayé
                                                            </span>
                                                            <h3 className="font-black text-lg text-[#4a3426] tracking-tight leading-tight line-clamp-1" title={inv.supplier_name}>{inv.supplier_name}</h3>
                                                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mt-1">Reçu le {new Date(inv.date).toLocaleDateString('fr-FR')}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xl font-black text-red-600 leading-none">{parseFloat(inv.amount).toFixed(3)}</div>
                                                            <div className="text-[10px] font-bold text-red-400">TND</div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 bg-white flex-1">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-2">
                                                                {inv.photo_url ? (
                                                                    <button onClick={() => setViewingUnpaidPhoto(inv)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase hover:bg-red-100 transition-colors">
                                                                        <Eye size={12} /> Voir
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-gray-300 italic px-2">Sans photo</span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-[#8c8279] bg-[#f9f6f2] px-2 py-1 rounded-md border border-[#e6dace] uppercase">
                                                                {inv.doc_type || 'Facture'} N°{inv.doc_number || '-'}
                                                            </span>
                                                        </div>

                                                        <div className="flex gap-2 mt-auto">
                                                            <button
                                                                onClick={() => setShowPayModal(inv)}
                                                                className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                                            >
                                                                <CheckCircle2 size={14} /> Régler
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(inv)}
                                                                className="w-10 h-10 border border-red-200 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </div>
                                    {(() => {
                                        const unpaidInvoices = unpaidData?.getInvoices?.filter((inv: any) => inv.status !== 'paid') || [];
                                        const filteredInvoices = unpaidInvoices.filter((inv: any) => {
                                            // Filter by supplier name
                                            if (unpaidSearchFilter) {
                                                const searchLower = unpaidSearchFilter.toLowerCase();
                                                const supplierMatch = inv.supplier_name?.toLowerCase().includes(searchLower);
                                                if (!supplierMatch) return false;
                                            }

                                            // Filter by date range
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
                                        });

                                        if (unpaidInvoices.length === 0) {
                                            return (
                                                <div className="flex flex-col items-center justify-center h-64 text-[#8c8279] opacity-50 space-y-4">
                                                    <CheckCircle2 size={48} />
                                                    <p className="font-bold italic">Aucune facture impayée</p>
                                                </div>
                                            );
                                        }

                                        if (filteredInvoices.length === 0) {
                                            return (
                                                <div className="flex flex-col items-center justify-center h-64 text-[#8c8279] opacity-50 space-y-4">
                                                    <Search size={48} />
                                                    <p className="font-bold italic">Aucun résultat trouvé</p>
                                                    <p className="text-xs">Essayez d'ajuster vos filtres</p>
                                                </div>
                                            );
                                        }

                                        return null;
                                    })()}
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
                                        <div className="flex gap-2">
                                            {['Espèces', 'Chèque', 'Virement'].map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setPaymentDetails({ ...paymentDetails, method: m })}
                                                    className={`flex-1 h-10 rounded-xl font-bold text-xs transition-all ${paymentDetails.method === m ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

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
                                                <button className="px-3 py-1 bg-white border border-yellow-200 rounded-lg text-[10px] font-bold text-yellow-600 uppercase">Recto</button>
                                                <button className="px-3 py-1 bg-white border border-yellow-200 rounded-lg text-[10px] font-bold text-yellow-600 uppercase">Verso</button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePaySubmit}
                                        className="w-full h-12 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#10b981]/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
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
                                                    if (!inv.supplier_name.toLowerCase().includes(historySearch.toLowerCase())) return false;
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
                                                                            {parseFloat(inv.amount).toFixed(3)}
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
                                className="relative bg-[#fcfaf8] w-full max-w-[85vw] h-auto max-h-[95vh] rounded-[4rem] shadow-[0_30px_100px_rgba(74,52,38,0.15)] overflow-hidden border border-white flex flex-col"
                            >
                                {/* Modal Header */}
                                <div className="p-12 pb-10 flex items-center justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-5xl font-black text-[#4a3426] tracking-tighter leading-none mb-2">Détails des Dépenses</h2>
                                        <p className="text-[#c69f6e] font-black text-xs uppercase tracking-[0.4em]">Récapitulatif financier complet</p>
                                    </div>

                                    <div className="flex flex-col items-center flex-1">
                                        <p className="text-[10px] font-black text-[#8c8279] uppercase tracking-widest leading-none mb-3 opacity-60">Total Global</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-6xl font-black text-[#4a3426] tracking-tighter">
                                                {totals.global.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                                            </p>
                                            <span className="text-xl font-black text-[#c69f6e]">DT</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex justify-end">
                                        <button
                                            onClick={() => setShowExpensesDetails(false)}
                                            className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#8c8279] hover:bg-red-50 hover:text-red-500 transition-all border border-[#e6dace]/30 shadow-sm"
                                        >
                                            <X size={28} />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Content - Grid Layout */}
                                <div className="flex-1 overflow-y-auto px-12 pb-12 custom-scrollbar no-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                                        {[
                                            { title: 'DÉPENSES FOURNISSEURS', subtitle: 'MARCHANDISES & SERVICES', icon: Truck, color: 'text-[#4a3426]', iconBg: 'bg-[#4a3426]/5', items: expenseDetails.fournisseurs },
                                            { title: 'DÉPENSES DIVERS', subtitle: 'FRAIS EXCEPTIONNELS', icon: Sparkles, color: 'text-[#c69f6e]', iconBg: 'bg-[#c69f6e]/5', items: expenseDetails.divers },
                                            { title: 'DÉPENSES ADMINISTRATIF', subtitle: 'LOYERS, FACTURES & BUREAUX', icon: Layout, color: 'text-[#4a3426]', iconBg: 'bg-[#4a3426]/5', items: expenseDetails.administratif },
                                            { title: 'ACCOMPTE', subtitle: 'AVANCES SUR SALAIRES', icon: Calculator, color: 'text-[#a89284]', iconBg: 'bg-[#a89284]/5', items: expenseDetails.avances },
                                            { title: 'DOUBLAGE', subtitle: 'HEURES SUPPLÉMENTAIRES', icon: TrendingUp, color: 'text-[#4a3426]', iconBg: 'bg-[#4a3426]/5', items: expenseDetails.doublages },
                                            { title: 'EXTRA', subtitle: "MAIN D'ŒUVRE OCCASIONNELLE", icon: Zap, color: 'text-[#c69f6e]', iconBg: 'bg-[#c69f6e]/5', items: expenseDetails.extras },
                                            { title: 'PRIMES', subtitle: 'RÉCOMPENSES & BONUS', icon: Sparkles, color: 'text-[#2d6a4f]', iconBg: 'bg-[#2d6a4f]/5', items: expenseDetails.primes },
                                            { title: 'TOUS EMPLOYÉS', subtitle: 'SALAIRES EN ATTENTE', icon: Banknote, color: 'text-red-500', iconBg: 'bg-red-50', items: expenseDetails.remainders, badge: 'EN ATTENTE' }
                                        ].map((cat, idx) => {
                                            const total = (cat.items || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
                                            // Handle cases where total might be zero but category should be shown (like TOUS EMPLOYÉS)
                                            if (total === 0 && cat.title !== 'TOUS EMPLOYÉS') return null;

                                            const isExpanded = expandedCategories.includes(idx);
                                            const hasItems = (cat.items || []).length > 0;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`group bg-white rounded-[2.5rem] border transition-all duration-300 ${isExpanded ? 'border-[#c69f6e] ring-4 ring-[#c69f6e]/5 shadow-xl' : 'border-[#e6dace]/20 hover:border-[#c69f6e]/30 shadow-sm shadow-[#4a3426]/5'}`}
                                                >
                                                    {/* Category Header Card */}
                                                    <div
                                                        onClick={() => {
                                                            if (!hasItems) return;
                                                            setExpandedCategories(prev =>
                                                                (prev || []).includes(idx) ? (prev || []).filter((i: number) => i !== idx) : [...(prev || []), idx]
                                                            );
                                                        }}
                                                        className={`p-6 flex items-center justify-between cursor-pointer select-none rounded-[2.5rem] transition-colors ${!hasItems ? 'cursor-default' : 'hover:bg-[#fcfaf8]'}`}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-14 h-14 rounded-2xl ${cat.iconBg} flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                                                                <cat.icon size={26} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-[11px] font-black text-[#4a3426] uppercase tracking-tight leading-none mb-1.5">{cat.title}</p>
                                                                    {cat.badge && (
                                                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter bg-red-50 border border-red-100 px-1.5 py-0.5 rounded ml-1">{cat.badge}</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[9px] font-bold text-[#8c8279]/50 uppercase tracking-tighter leading-none">{cat.subtitle}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-2xl font-black text-[#4a3426] leading-none mb-1">{total.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}</p>
                                                                <p className="text-[10px] font-black text-[#c69f6e] uppercase tracking-widest opacity-60">DT</p>
                                                            </div>
                                                            {hasItems && (
                                                                <div className={`text-[#c69f6e] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                                    <ChevronDown size={20} />
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
                                                                                <span className="text-sm font-black text-[#4a3426]">{item.amount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}</span>
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
            </AnimatePresence>

            {/* Supplier Details Modal - IMAGE 1 STYLE */}
            <AnimatePresence>
                {selectedEmployeeDetails && (
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
                                            {selectedEmployeeDetails.total.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
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
                                    {selectedEmployeeDetails.items.map((item: any, i: number) => (
                                        <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-[#e6dace]/30 shadow-[0_10px_40px_rgba(74,52,38,0.03)] flex flex-col h-full hover:shadow-xl transition-all group">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex flex-col items-end gap-1">
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
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-[#4a3426] leading-none mb-1">{item.amount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}</p>
                                                    <p className="text-[8px] font-black text-[#c69f6e] uppercase tracking-widest opacity-60">DT</p>
                                                </div>
                                            </div>

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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                            {viewingData.amount?.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT • {viewingData.payment_method || viewingData.paymentMethod}
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
            </AnimatePresence>
        </div>
    );
}

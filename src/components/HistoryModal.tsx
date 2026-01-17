import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, X, Loader2, Clock } from 'lucide-react';

const GET_CHIFFRES_RANGE = gql`
  query GetChiffresRange($startDate: String!, $endDate: String!) {
    getChiffresByRange(startDate: $startDate, endDate: $endDate) {
      date
      avances_details { id username montant created_at }
      doublages_details { id username montant created_at }
      extras_details { id username montant created_at }
      primes_details { id username montant created_at }
      restes_salaires_details { id username montant nb_jours created_at }
      diponce_divers
      diponce_admin
      diponce
      offres_data
    }
  }
`;

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
        restes_salaires: 'Restes Salaires',
        divers: 'Dépenses Divers',
        admin: 'Dépenses Administratif',
        supplier: 'Dépenses Fournisseur',
        offres: 'Détail des Offres'
    };

    const detailsKeyMap: any = {
        avance: 'avances_details',
        doublage: 'doublages_details',
        extra: 'extras_details',
        prime: 'primes_details',
        restes_salaires: 'restes_salaires_details',
        offres: 'offres_data', // Special handling
        divers: 'diponce_divers',
        admin: 'diponce_admin',
        supplier: 'diponce'
    };

    // Grouping logic - now tracking date-amount pairs
    const groupedData: any = {};
    let globalTotal = 0;

    historyData?.getChiffresByRange?.forEach((chiffre: any) => {
        let details = [];
        const isJsonType = ['divers', 'admin', 'supplier', 'offres'].includes(type);

        if (isJsonType) {
            try {
                details = JSON.parse(chiffre[detailsKeyMap[type]] || '[]');
            } catch (e) { details = []; }
            // Normalize for logic reuse (some use 'supplier', some 'designation')
            details = details.map((d: any) => ({
                ...d,
                username: d.designation || d.supplier || d.name,
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

            // Safe Date Formatting (YYYY-MM-DD -> DD/MM/YYYY)
            const dateParts = (item.date || chiffre.date).split('T')[0].split('-');
            const formattedDate = dateParts.length === 3
                ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
                : (item.date || chiffre.date);

            groupedData[item.username].entries.push({
                date: formattedDate,
                amount: amount,
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
                            type === 'offres' ? (
                                // COMPACT GRID VIEW FOR ALL OFFRES - NO SCROLLING
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {employeesList.map((emp: any, i: number) => (
                                        <div key={i} className="bg-white rounded-2xl border border-[#e6dace]/50 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                            {/* Compact Person Header */}
                                            <div className="bg-gradient-to-r from-[#f0faf5] to-[#fcfaf8] px-4 py-3 border-b border-[#e6dace]/30 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] flex items-center justify-center text-white font-black text-lg shadow-md">
                                                        {emp.username.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-black text-[#4a3426] tracking-tight leading-none">{emp.username}</h4>
                                                        <p className="text-[9px] font-bold text-[#8c8279] uppercase tracking-wider mt-0.5">
                                                            {emp.entries.length} offre{emp.entries.length > 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-white px-3 py-1.5 rounded-xl border border-[#d1fae5] shadow-sm">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-black text-[#2d6a4f] tracking-tighter">{emp.total.toFixed(3)}</span>
                                                        <span className="text-[9px] font-bold text-[#c69f6e]">DT</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Compact Entries List */}
                                            <div className="p-3 space-y-1.5">
                                                {emp.entries.map((entry: any, dIndex: number) => (
                                                    <div
                                                        key={dIndex}
                                                        className="flex justify-between items-center px-3 py-2 bg-[#fcfaf8] hover:bg-[#f0faf5]/50 rounded-lg transition-colors border border-transparent hover:border-[#d1fae5]"
                                                    >
                                                        <span className="text-xs font-bold text-[#4a3426]">{entry.date}</span>
                                                        <span className="text-sm font-black text-[#2d6a4f]">{entry.amount.toFixed(3)} <span className="text-[10px] text-[#c69f6e]">DT</span></span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // ORIGINAL VIEW FOR OTHER TYPES
                                employeesList.map((emp: any, i: number) => (
                                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-[#e6dace]/50 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                                                    {/* Placeholder for avatar, utilizing first letter if no image */}
                                                    <div className="w-full h-full bg-[#f4ece4] flex items-center justify-center text-[#4a3426] font-black text-2xl uppercase">
                                                        {emp.username.charAt(0)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-[#4a3426] tracking-tight mb-1">{emp.username}</h4>
                                                    <p className="text-xs font-serif text-[#8c8279] italic">Dates travaillées:</p>
                                                </div>
                                            </div>
                                            <div className="text-2xl font-black text-[#c69f6e] tracking-tighter">
                                                {emp.total.toFixed(3)} <span className="text-sm">DT</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-4">
                                            {emp.entries.map((entry: any, dIndex: number) => (
                                                <div key={dIndex} className="bg-[#fcfaf8] p-4 rounded-2xl border border-[#e6dace] shadow-sm flex justify-between items-center group/item hover:bg-white hover:shadow-md transition-all">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-[#4a3426] font-bold text-xs">
                                                            {entry.date}
                                                        </div>
                                                        {entry.created_at && (
                                                            <div className="flex items-center gap-1.5 opacity-60">
                                                                <Clock size={10} className="text-[#c69f6e]" />
                                                                <span className="text-[10px] font-medium text-[#8c8279]">
                                                                    {(() => {
                                                                        try {
                                                                            const d = new Date(typeof entry.created_at === 'string' ? entry.created_at.replace(' ', 'T') : entry.created_at);
                                                                            if (isNaN(d.getTime())) return "";
                                                                            return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                                                        } catch (e) { return ""; }
                                                                    })()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-1">
                                                        <div className="text-[#c69f6e] font-black text-sm">
                                                            {entry.amount.toFixed(3)} DT
                                                        </div>
                                                        {entry.nb_jours > 0 && (
                                                            <span className="text-[9px] font-bold text-[#8c8279] uppercase tracking-wider bg-[#f4ece4] px-1.5 py-0.5 rounded">
                                                                {entry.nb_jours} Jours
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <p className="text-[#8c8279] italic font-medium">Aucun historique disponible pour cette période.</p>
                            </div>
                        )}
                        {!loading && employeesList.length > 0 && (
                            <div className="mt-8 p-6 bg-[#4a3426] rounded-[2rem] text-white flex justify-between items-center shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                                <span className="font-bold uppercase tracking-widest text-sm text-white/70 relative z-10">Total de la liste</span>
                                <div className="flex items-baseline gap-2 relative z-10">
                                    <span className="text-4xl font-black tracking-tighter">{employeesList.reduce((acc: number, curr: any) => acc + curr.total, 0).toFixed(3)}</span>
                                    <span className="text-lg font-bold text-[#c69f6e]">DT</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HistoryModal;

'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Sidebar from '@/components/Sidebar';
import {
    Monitor, Users, Shield, Plus, Trash2, Edit2,
    Save, X, Check, Loader2, AlertTriangle, Cpu, Globe,
    ChevronRight, Settings as SettingsIcon, Lock, UserPlus,
    Clock, Activity, Wifi, WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GET_SETTINGS_DATA = gql`
  query GetSettingsData {
    getConnectedDevices {
      id
      ip
      name
      type
      status
      last_seen
    }
    getUsers {
      id
      username
      role
      full_name
    }
  }
`;

const UPSERT_USER = gql`
  mutation UpsertUser($username: String!, $password: String!, $role: String!, $full_name: String) {
    upsertUser(username: $username, password: $password, role: $role, full_name: $full_name) {
      id
      username
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id)
  }
`;

const UPSERT_DEVICE = gql`
  mutation UpsertDevice($ip: String!, $name: String, $type: String) {
    upsertDevice(ip: $ip, name: $name, type: $type) {
      id
      ip
    }
  }
`;

const DELETE_DEVICE = gql`
  mutation DeleteDevice($id: Int!) {
    deleteDevice(id: $id)
  }
`;

export default function SettingsPage() {
    const { data, loading, refetch } = useQuery(GET_SETTINGS_DATA, {
        pollInterval: 10000 // Refresh every 10s to see online status changes
    });
    const [upsertUser] = useMutation(UPSERT_USER);
    const [deleteUser] = useMutation(DELETE_USER);
    const [upsertDevice] = useMutation(UPSERT_DEVICE);
    const [deleteDevice] = useMutation(DELETE_DEVICE);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editingDevice, setEditingDevice] = useState<any>(null);

    // Form States
    const [userForm, setUserForm] = useState({ username: '', password: '', role: 'caissier', full_name: '' });
    const [deviceForm, setDeviceForm] = useState({ ip: '', name: '', type: 'ZKTeco' });

    const handleSaveUser = async () => {
        try {
            await upsertUser({ variables: userForm });
            setIsUserModalOpen(false);
            setUserForm({ username: '', password: '', role: 'caissier', full_name: '' });
            refetch();
        } catch (e) { alert('Error saving user'); }
    };

    const handleSaveDevice = async () => {
        try {
            await upsertDevice({ variables: deviceForm });
            setIsDeviceModalOpen(false);
            setDeviceForm({ ip: '', name: '', type: 'ZKTeco' });
            refetch();
        } catch (e) { alert('Error saving device'); }
    };

    const handleDelete = async (type: 'user' | 'device', id: number) => {
        if (!confirm('Êtes-vous sûr ?')) return;
        try {
            if (type === 'user') await deleteUser({ variables: { id } });
            else await deleteDevice({ variables: { id } });
            refetch();
        } catch (e) { alert('Error deleting'); }
    };

    return (
        <div className="flex bg-[#fcfaf8] min-h-screen">
            <Sidebar role="admin" />

            <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-[#4a3426] rounded-[1.2rem] text-white shadow-xl shadow-[#4a3426]/20">
                                    <SettingsIcon size={24} strokeWidth={2.5} />
                                </div>
                                <h1 className="text-4xl font-black text-[#4a3426] tracking-tighter uppercase italic">Configuration</h1>
                            </div>
                            <p className="text-[#8c8279] font-bold text-sm uppercase tracking-widest pl-1">Hardware & Control Center</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                        {/* Users Management */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <Users className="text-[#c69f6e]" size={20} />
                                    <h2 className="text-xl font-black text-[#4a3426] uppercase tracking-tighter">Gestion Utilisateurs</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingUser(null);
                                        setUserForm({ username: '', password: '', role: 'caissier', full_name: '' });
                                        setIsUserModalOpen(true);
                                    }}
                                    className="p-2.5 bg-white border border-[#e6dace] rounded-xl text-[#c69f6e] hover:bg-[#4a3426] hover:text-white hover:border-[#4a3426] shadow-sm transition-all"
                                >
                                    <UserPlus size={18} />
                                </button>
                            </div>

                            <div className="bg-white rounded-[2rem] border border-[#e6dace] overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-[#fcfaf8] border-b border-[#e6dace]">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-[#8c8279] tracking-widest">Utilisateur</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-[#8c8279] tracking-widest">Statut</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-[#8c8279] tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#f9f6f2]">
                                            {data?.getUsers?.map((u: any) => (
                                                <tr key={u.id} className="group hover:bg-[#fcfaf8] transition-all">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-black uppercase shadow-lg ${u.is_online ? 'bg-green-500 shadow-green-500/20' : 'bg-[#4a3426] shadow-[#4a3426]/20'}`}>
                                                                {u.username.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-[#4a3426] uppercase">{u.username}</p>
                                                                <p className="text-[10px] font-bold text-[#bba282] uppercase">{u.full_name || 'Aucun nom'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${u.is_online ? 'text-green-500' : 'text-[#8c8279] opacity-40'}`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${u.is_online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                                {u.is_online ? 'En Ligne' : 'Hors Ligne'}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-md bg-[#e6dace]/20 text-[#8c8279] text-[8px] font-black uppercase w-fit tracking-tighter">
                                                                {u.role}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUser(u);
                                                                    setUserForm({ ...u, password: '' });
                                                                    setIsUserModalOpen(true);
                                                                }}
                                                                className="p-2 hover:bg-white rounded-lg text-[#bba282] hover:text-[#c69f6e] border border-transparent hover:border-[#e6dace]"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete('user', u.id)}
                                                                className="p-2 hover:bg-red-50 rounded-lg text-red-300 hover:text-red-500 border border-transparent hover:border-red-100"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* Hardware Management */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <Monitor className="text-[#c69f6e]" size={20} />
                                    <h2 className="text-xl font-black text-[#4a3426] uppercase tracking-tighter">Appareils Connectés</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingDevice(null);
                                        setDeviceForm({ ip: '', name: '', type: 'ZKTeco' });
                                        setIsDeviceModalOpen(true);
                                    }}
                                    className="p-2.5 bg-white border border-[#e6dace] rounded-xl text-[#c69f6e] hover:bg-[#4a3426] hover:text-white hover:border-[#4a3426] shadow-sm transition-all"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data?.getConnectedDevices?.map((dev: any) => (
                                    <div key={dev.id} className="bg-white p-5 rounded-[2rem] border border-[#e6dace] shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-2xl ${dev.status === 'online' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                                <Cpu size={24} />
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingDevice(dev);
                                                        setDeviceForm({ ip: dev.ip, name: dev.name, type: dev.type });
                                                        setIsDeviceModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-[#fcfaf8] rounded-xl text-[#bba282]"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete('device', dev.id)}
                                                    className="p-2 hover:bg-red-50 rounded-xl text-red-300 hover:text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-black text-[#4a3426] uppercase line-clamp-1">{dev.name || 'Device'}</h3>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${dev.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {dev.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-[#8c8279] flex items-center gap-1.5 uppercase tracking-widest">
                                                <Globe size={10} /> {dev.ip}
                                            </p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-[#f9f6f2] flex items-center justify-between">
                                            <span className="text-[8px] font-black text-[#bba282] uppercase tracking-[0.2em]">{dev.type}</span>
                                            {dev.last_seen && (
                                                <span className="text-[8px] font-bold text-[#bba282] italic">Vu {new Date(dev.last_seen).toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            {/* User Modal */}
            <AnimatePresence>
                {isUserModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-[#1a110a]/80">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#e6dace]"
                        >
                            <div className="p-8 bg-[#fcfaf8] border-b border-[#e6dace]">
                                <h3 className="text-2xl font-black text-[#4a3426] uppercase tracking-tighter italic">
                                    {editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
                                </h3>
                            </div>
                            <div className="p-8 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#bba282] ml-1">Identifiant</label>
                                    <input
                                        value={userForm.username}
                                        onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                                        className="w-full h-14 bg-[#fcfaf8] border border-[#e6dace] rounded-2xl px-5 text-sm font-bold outline-none focus:border-[#c69f6e]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#bba282] ml-1">Nom Complet</label>
                                    <input
                                        value={userForm.full_name}
                                        onChange={e => setUserForm({ ...userForm, full_name: e.target.value })}
                                        className="w-full h-14 bg-[#fcfaf8] border border-[#e6dace] rounded-2xl px-5 text-sm font-bold outline-none focus:border-[#c69f6e]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#bba282] ml-1">Mot de Passe</label>
                                    <input
                                        type="password"
                                        value={userForm.password}
                                        onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                        className="w-full h-14 bg-[#fcfaf8] border border-[#e6dace] rounded-2xl px-5 text-sm font-bold outline-none focus:border-[#c69f6e]"
                                        placeholder={editingUser ? 'Laisser vide pour garder l\'ancien' : ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#bba282] ml-1">Rôle</label>
                                    <select
                                        value={userForm.role}
                                        onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                                        className="w-full h-14 bg-[#fcfaf8] border border-[#e6dace] rounded-2xl px-5 text-sm font-black outline-none focus:border-[#c69f6e]"
                                    >
                                        <option value="caissier">Caissier</option>
                                        <option value="admin">Administrateur</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setIsUserModalOpen(false)} className="flex-1 h-14 bg-[#fcfaf8] text-[#8c8279] rounded-2xl font-black uppercase tracking-widest text-[10px]">Annuler</button>
                                    <button onClick={handleSaveUser} className="flex-1 h-14 bg-[#4a3426] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#4a3426]/20">Enregistrer</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Device Modal */}
            <AnimatePresence>
                {isDeviceModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-[#1a110a]/80">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#e6dace]"
                        >
                            <div className="p-8 bg-[#fcfaf8] border-b border-[#e6dace]">
                                <h3 className="text-2xl font-black text-[#4a3426] uppercase tracking-tighter italic">
                                    {editingDevice ? 'Modifier Appareil' : 'Nouvel Appareil'}
                                </h3>
                            </div>
                            <div className="p-8 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#bba282] ml-1">Adresse IP</label>
                                    <input
                                        value={deviceForm.ip}
                                        onChange={e => setDeviceForm({ ...deviceForm, ip: e.target.value })}
                                        className="w-full h-14 bg-[#fcfaf8] border border-[#e6dace] rounded-2xl px-5 text-sm font-bold outline-none focus:border-[#c69f6e]"
                                        placeholder="ex: 192.168.1.201"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#bba282] ml-1">Nom</label>
                                    <input
                                        value={deviceForm.name}
                                        onChange={e => setDeviceForm({ ...deviceForm, name: e.target.value })}
                                        className="w-full h-14 bg-[#fcfaf8] border border-[#e6dace] rounded-2xl px-5 text-sm font-bold outline-none focus:border-[#c69f6e]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#bba282] ml-1">Modèle / Type</label>
                                    <select
                                        value={deviceForm.type}
                                        onChange={e => setDeviceForm({ ...deviceForm, type: e.target.value })}
                                        className="w-full h-14 bg-[#fcfaf8] border border-[#e6dace] rounded-2xl px-5 text-sm font-black outline-none focus:border-[#c69f6e]"
                                    >
                                        <option value="ZKTeco">ZKTeco</option>
                                        <option value="HikVision">HikVision</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setIsDeviceModalOpen(false)} className="flex-1 h-14 bg-[#fcfaf8] text-[#8c8279] rounded-2xl font-black uppercase tracking-widest text-[10px]">Annuler</button>
                                    <button onClick={handleSaveDevice} className="flex-1 h-14 bg-[#4a3426] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#4a3426]/20">Enregistrer</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

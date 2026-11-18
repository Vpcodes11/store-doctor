'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  RotateCw,
  Save,
  Image as ImageIcon,
  User,
  ShieldAlert,
  TrendingUp,
  LayoutDashboard,
  Search,
} from 'lucide-react';
import ReAuditModal from '@/components/ReAuditModal';

interface FixTask {
  id: string;
  title: string;
  category: string;
  impact: number;
  ease: number;
  status: string;
  assignedTo: string | null;
  beforeScreenshot: string | null;
  afterScreenshot: string | null;
  developerNotes: string | null;
  completedAt: string | null;
}

interface FixOrder {
  id: string;
  auditId: string;
  customerEmail: string;
  customerName: string | null;
  storeUrl: string;
  collaboratorCode: string | null;
  packageType: string;
  amountPaid: number;
  currency: string;
  status: string;
  notes: string | null;
  createdAt: string;
  audit: {
    id: string;
    url: string;
    storeName: string;
    score: number;
    grade: string;
    desktopShot: string | null;
    mobileShot: string | null;
  };
  tasks: FixTask[];
}

export default function AdminPage() {
  const [orders, setOrders] = useState<FixOrder[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Record<string, Partial<FixTask>>>({});
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [reAuditLoadingId, setReAuditLoadingId] = useState<string | null>(null);
  const [reAuditResult, setReAuditResult] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data.orders || []);
      setStats(data.stats || {});
      if (data.orders?.length > 0 && !expandedOrderId) {
        setExpandedOrderId(data.orders[0].id);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTaskFieldChange = (taskId: string, field: keyof FixTask, value: any) => {
    setEditingTask((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value,
      },
    }));
  };

  const saveTask = async (task: FixTask) => {
    const changes = editingTask[task.id];
    if (!changes) return;

    setSavingTaskId(task.id);
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          ...changes,
        }),
      });

      if (res.ok) {
        await fetchOrders();
        setEditingTask((prev) => {
          const next = { ...prev };
          delete next[task.id];
          return next;
        });
      }
    } catch (e) {
      alert('Failed saving task');
    } finally {
      setSavingTaskId(null);
    }
  };

  const handleTriggerReAudit = async (auditId: string) => {
    setReAuditLoadingId(auditId);
    try {
      const res = await fetch(`/api/audit/${auditId}/re-audit`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Re-audit failed');
      setReAuditResult(data);
      await fetchOrders();
    } catch (e: any) {
      alert(e?.message || 'Failed running re-audit');
    } finally {
      setReAuditLoadingId(null);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.storeUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.audit.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>StoreDoctor Operations Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Done-For-You Fix Queue &amp; Tracking
          </h1>
          <p className="text-xs text-slate-400">
            Assign team members, attach before/after verification shots, and trigger client re-audits.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOrders}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Orders</span>
            <span className="text-2xl font-black text-white">{stats.totalOrders || 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Pending / Active</span>
            <span className="text-2xl font-black text-amber-400">
              {(stats.pendingOrders || 0) + (stats.inProgressOrders || 0)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Completed</span>
            <span className="text-2xl font-black text-emerald-400">{stats.completedOrders || 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-cyan-400 uppercase block mb-1">Total DFY Revenue</span>
            <span className="text-2xl font-black text-cyan-400">
              ${(stats.totalRevenue || 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by store URL, customer email or brand..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading queue...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl bg-slate-900 border border-slate-800">
          <Wrench className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Fix Orders Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Orders placed via the $149 / ₹9,999 Done-For-You Fix Pack will automatically generate a 10-task implementation roadmap here.
          </p>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
          >
            Audit a Store &amp; Book Fix Pack
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const completedCount = order.tasks.filter((t) => t.status === 'completed').length;
            const totalCount = order.tasks.length;
            const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl"
              >
                {/* Order Summary Header */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 sm:p-6 bg-slate-950/70 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {order.audit.storeName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          order.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : order.status === 'in_progress'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Paid: <strong className="text-white">${order.amountPaid} {order.currency}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      <span>Customer: <strong className="text-slate-300">{order.customerEmail}</strong></span>
                      <span>•</span>
                      <span>Collaborator Code: <strong className="text-emerald-400 font-mono">{order.collaboratorCode || 'N/A'}</strong></span>
                      <span>•</span>
                      <Link
                        href={`/audit/${order.auditId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-teal-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Audit Report</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Right side: Progress & Actions */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Progress: {completedCount}/{totalCount} Fixes ({progressPct}%)
                      </span>
                      <div className="w-32 bg-slate-900 rounded-full h-1.5 overflow-hidden mt-1">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerReAudit(order.auditId);
                      }}
                      disabled={reAuditLoadingId === order.auditId}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <RotateCw
                        className={`w-3.5 h-3.5 ${reAuditLoadingId === order.auditId ? 'animate-spin' : ''}`}
                      />
                      <span>{reAuditLoadingId === order.auditId ? 'Auditing...' : 'Verify Fixes'}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Tasks List */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        10-Point Fix Implementation Checklist
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Edit status, assign developers &amp; add before/after screenshots
                      </span>
                    </div>

                    <div className="space-y-3">
                      {order.tasks.map((task, tIdx) => {
                        const taskEdit = editingTask[task.id] || {};
                        const currentStatus = taskEdit.status !== undefined ? taskEdit.status : task.status;
                        const currentAssigned = (taskEdit.assignedTo !== undefined ? taskEdit.assignedTo : task.assignedTo) || '';
                        const currentNotes = (taskEdit.developerNotes !== undefined ? taskEdit.developerNotes : task.developerNotes) || '';
                        const currentBefore = (taskEdit.beforeScreenshot !== undefined ? taskEdit.beforeScreenshot : task.beforeScreenshot) || '';
                        const currentAfter = (taskEdit.afterScreenshot !== undefined ? taskEdit.afterScreenshot : task.afterScreenshot) || '';
                        const isModified = !!editingTask[task.id];

                        return (
                          <div
                            key={task.id}
                            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700/80 transition-colors"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-bold text-slate-400">#{tIdx + 1}</span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">[{task.category}]</span>
                                  <span className="text-[10px] font-bold text-emerald-400">
                                    Impact {task.impact}/5 • Ease {task.ease}/5
                                  </span>
                                </div>
                                <h5 className="text-xs sm:text-sm font-bold text-white">{task.title}</h5>
                              </div>

                              {/* Status Dropdown & Assignee */}
                              <div className="flex flex-wrap items-center gap-2">
                                <select
                                  value={currentStatus}
                                  onChange={(e) => handleTaskFieldChange(task.id, 'status', e.target.value)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>

                                <input
                                  type="text"
                                  value={currentAssigned}
                                  onChange={(e) => handleTaskFieldChange(task.id, 'assignedTo', e.target.value)}
                                  placeholder="Assigned developer..."
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none w-36"
                                />

                                {isModified && (
                                  <button
                                    onClick={() => saveTask(task)}
                                    disabled={savingTaskId === task.id}
                                    className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>{savingTaskId === task.id ? 'Saving...' : 'Save'}</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Screenshots & Developer Notes Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-900 text-xs">
                              <div>
                                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                                  Before Screenshot URL
                                </label>
                                <input
                                  type="text"
                                  value={currentBefore}
                                  onChange={(e) => handleTaskFieldChange(task.id, 'beforeScreenshot', e.target.value)}
                                  placeholder="/screenshots/before_fix.jpg"
                                  className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 placeholder-slate-700"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                                  After Screenshot URL
                                </label>
                                <input
                                  type="text"
                                  value={currentAfter}
                                  onChange={(e) => handleTaskFieldChange(task.id, 'afterScreenshot', e.target.value)}
                                  placeholder="/screenshots/after_fix.jpg"
                                  className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 placeholder-slate-700"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                                  Developer Changelog Notes
                                </label>
                                <input
                                  type="text"
                                  value={currentNotes}
                                  onChange={(e) => handleTaskFieldChange(task.id, 'developerNotes', e.target.value)}
                                  placeholder="e.g. Added sticky ATC button in theme.liquid"
                                  className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 placeholder-slate-700"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Re-Audit Verification Modal */}
      <ReAuditModal
        isOpen={!!reAuditResult}
        onClose={() => setReAuditResult(null)}
        data={reAuditResult}
      />
    </div>
  );
}

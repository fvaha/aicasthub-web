"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Badge, Input, Label } from '@medusajs/ui';
import { ShieldCheck, CurrencyDollar, CheckCircleSolid, ArrowRightOnRectangle } from '@medusajs/icons';

const PUBLISHABLE_KEY = "pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa";
const ADMIN_SECRET = "aicasthub-admin-2026";

interface TierConfig {
    platform_fee_pct: number;
    escrow_fee_pct: number;
    label: string;
    color: string;
}

interface PlatformConfig {
    platform_fee_pct: number;
    escrow_fee_pct: number;
    tiers: {
        none: TierConfig;
        bronze: TierConfig;
        silver: TierConfig;
        gold: TierConfig;
    };
    updated_at: string;
    updated_by: string;
}

const TIER_COLORS: Record<string, string> = {
    none: 'bg-gray-100 dark:bg-gray-800 border-gray-300',
    bronze: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300',
    silver: 'bg-slate-50 dark:bg-slate-800/30 border-slate-300',
    gold: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400',
};

const TIER_LABELS: Record<string, { label: string; emoji: string; badge: 'grey' | 'orange' | 'blue' | 'green' | 'red' | 'purple' }> = {
    none: { label: 'Standard (No Subscription)', emoji: '🔘', badge: 'grey' },
    bronze: { label: 'Bronze Tier', emoji: '🥉', badge: 'orange' },
    silver: { label: 'Silver Tier', emoji: '🥈', badge: 'grey' },
    gold: { label: 'Gold Tier', emoji: '⭐', badge: 'orange' },
};

export default function AdminPlatformConfig() {
    const router = useRouter();
    const [config, setConfig] = useState<PlatformConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [adminKey] = useState(ADMIN_SECRET);

    // Local edit state for each tier
    const [tierEdits, setTierEdits] = useState<Record<string, { platform_fee_pct: string; escrow_fee_pct: string }>>({});

    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        fetch('/api/medusa/store/platform-config', {
            headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
        })
            .then(r => r.json())
            .then(data => {
                setConfig(data.config);
                // Init edit state from live config
                const edits: Record<string, { platform_fee_pct: string; escrow_fee_pct: string }> = {};
                Object.entries(data.config?.tiers || {}).forEach(([key, val]: [string, any]) => {
                    edits[key] = {
                        platform_fee_pct: String(val.platform_fee_pct),
                        escrow_fee_pct: String(val.escrow_fee_pct),
                    };
                });
                setTierEdits(edits);
            })
            .catch(() => showToast('Failed to load config', 'error'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            // Build updated tiers from local edits
            const updatedTiers = { ...config.tiers };
            Object.entries(tierEdits).forEach(([key, val]) => {
                (updatedTiers as any)[key] = {
                    ...(updatedTiers as any)[key],
                    platform_fee_pct: parseFloat(val.platform_fee_pct) || 0,
                    escrow_fee_pct: parseFloat(val.escrow_fee_pct) || 0,
                };
            });

            const res = await fetch('/api/medusa/store/platform-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-publishable-api-key': PUBLISHABLE_KEY,
                    'x-admin-key': adminKey,
                },
                body: JSON.stringify({ tiers: updatedTiers })
            });

            const data = await res.json();
            if (res.ok) {
                setConfig(data.config);
                showToast('✅ Platform fees saved successfully!', 'success');
            } else {
                showToast('Error: ' + (data.message || 'Failed to save'), 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Calculate what buyer actually pays
    const calcTotal = (modelPrice: number, tier: TierConfig) => {
        const platform = modelPrice * (tier.platform_fee_pct / 100);
        const escrow = modelPrice * (tier.escrow_fee_pct / 100);
        return { platform, escrow, total: modelPrice + platform + escrow };
    };

    const examplePrice = 450; // €450 example model price

    return (
        <div className="min-h-screen bg-ui-bg-subtle">
            {/* Header */}
            <header className="bg-ui-bg-base border-b border-ui-border-base px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm">A</div>
                    <div>
                        <Heading level="h1" className="text-base font-bold text-ui-fg-base">AICastHub Admin</Heading>
                        <Text className="text-xs text-ui-fg-muted">Platform Configuration</Text>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge color="red" className="animate-pulse"><ShieldCheck className="h-3 w-3" /> Admin Only</Badge>
                    <Button variant="transparent" size="small" className="text-ui-fg-muted" onClick={() => router.push('/')}>
                        <ArrowRightOnRectangle /> Exit Admin
                    </Button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-8 flex flex-col gap-8">

                {/* Page Title */}
                <div>
                    <Heading level="h2" className="text-2xl font-bold text-ui-fg-base mb-1">Fee Management</Heading>
                    <Text className="text-ui-fg-subtle">
                        Configure platform commission and escrow fee percentages for each subscription tier.
                        These fees are automatically applied and displayed to buyers at checkout.
                    </Text>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-ui-fg-muted">Loading configuration...</div>
                ) : (
                    <>
                        {/* --- HOW IT WORKS --- */}
                        <Container className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 rounded-xl">
                            <Heading level="h3" className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                <CurrencyDollar className="h-4 w-4" /> How Platform Fees Work
                            </Heading>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-700 dark:text-blue-300">
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold">1. Seller sets model price</span>
                                    <span>e.g. €450.00 per project</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold">2. Platform adds fees</span>
                                    <span>Platform % + Escrow % applied to buyer total</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold">3. Buyer sees full price</span>
                                    <span>Breakdown shown on catalog + checkout</span>
                                </div>
                            </div>
                        </Container>

                        {/* --- TIER CARDS --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(TIER_LABELS).map(([tierKey, tierMeta]) => {
                                const edit = tierEdits[tierKey] || { platform_fee_pct: '0', escrow_fee_pct: '0' };
                                const platformPct = parseFloat(edit.platform_fee_pct) || 0;
                                const escrowPct = parseFloat(edit.escrow_fee_pct) || 0;
                                const example = calcTotal(examplePrice, { platform_fee_pct: platformPct, escrow_fee_pct: escrowPct, label: '', color: '' });

                                return (
                                    <div key={tierKey} className={`p-6 rounded-xl border-2 flex flex-col gap-4 ${TIER_COLORS[tierKey]}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{tierMeta.emoji}</span>
                                                <div>
                                                    <Heading level="h3" className="text-sm font-bold text-ui-fg-base">{tierMeta.label}</Heading>
                                                    <Text className="text-xs text-ui-fg-muted">Applied to sellers at this tier</Text>
                                                </div>
                                            </div>
                                            <Badge color={tierMeta.badge}>{tierKey === 'none' ? 'Default' : tierKey.toUpperCase()}</Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor={`${tierKey}-platform`} className="text-xs font-semibold text-ui-fg-subtle">
                                                    Platform Fee (%)
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id={`${tierKey}-platform`}
                                                        type="number"
                                                        step="0.5"
                                                        min="0"
                                                        max="50"
                                                        value={edit.platform_fee_pct}
                                                        onChange={e => setTierEdits(prev => ({
                                                            ...prev,
                                                            [tierKey]: { ...prev[tierKey], platform_fee_pct: e.target.value }
                                                        }))}
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-fg-muted text-xs">%</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor={`${tierKey}-escrow`} className="text-xs font-semibold text-ui-fg-subtle">
                                                    Escrow Fee (%)
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id={`${tierKey}-escrow`}
                                                        type="number"
                                                        step="0.5"
                                                        min="0"
                                                        max="20"
                                                        value={edit.escrow_fee_pct}
                                                        onChange={e => setTierEdits(prev => ({
                                                            ...prev,
                                                            [tierKey]: { ...prev[tierKey], escrow_fee_pct: e.target.value }
                                                        }))}
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-fg-muted text-xs">%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preview calculation */}
                                        <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 text-xs flex flex-col gap-1">
                                            <Text className="font-semibold text-ui-fg-muted uppercase tracking-wide text-[10px] mb-1">
                                                Preview — for €{examplePrice} model
                                            </Text>
                                            <div className="flex justify-between">
                                                <span className="text-ui-fg-subtle">Model price</span>
                                                <span className="font-mono">€{examplePrice.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-orange-600 dark:text-orange-400">
                                                <span>+ Platform fee ({platformPct}%)</span>
                                                <span className="font-mono">€{example.platform.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-blue-600 dark:text-blue-400">
                                                <span>+ Escrow fee ({escrowPct}%)</span>
                                                <span className="font-mono">€{example.escrow.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold border-t border-ui-border-base pt-1 mt-1">
                                                <span>Buyer pays</span>
                                                <span className="font-mono text-green-700 dark:text-green-400">€{example.total.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-ui-fg-muted">
                                                <span>Seller receives</span>
                                                <span className="font-mono">€{examplePrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- SAVE --- */}
                        <div className="flex justify-between items-center">
                            <div>
                                {config?.updated_at && (
                                    <Text className="text-xs text-ui-fg-muted">
                                        Last saved: {new Date(config.updated_at).toLocaleString()} by {config.updated_by}
                                    </Text>
                                )}
                            </div>
                            <Button variant="primary" isLoading={saving} onClick={handleSave} className="flex items-center gap-2">
                                <CheckCircleSolid /> Save All Fees
                            </Button>
                        </div>

                        {/* --- LIVE FEE TABLE --- */}
                        <Container className="p-6">
                            <Heading level="h3" className="text-base font-bold mb-4">Current Live Fee Table</Heading>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-ui-border-base">
                                            <th className="text-left p-3 text-ui-fg-subtle font-medium">Tier</th>
                                            <th className="text-center p-3 text-ui-fg-subtle font-medium">Platform Fee</th>
                                            <th className="text-center p-3 text-ui-fg-subtle font-medium">Escrow Fee</th>
                                            <th className="text-center p-3 text-ui-fg-subtle font-medium">Total Fees</th>
                                            <th className="text-right p-3 text-ui-fg-subtle font-medium">Buyer pays on €450</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {config && Object.entries(config.tiers).map(([key, tier]) => {
                                            const { total } = calcTotal(examplePrice, tier);
                                            const meta = TIER_LABELS[key];
                                            return (
                                                <tr key={key} className="border-b border-ui-border-base hover:bg-ui-bg-subtle">
                                                    <td className="p-3 font-medium flex items-center gap-2">
                                                        <span>{meta?.emoji}</span> {tier.label || meta?.label}
                                                    </td>
                                                    <td className="p-3 text-center text-orange-600 font-mono">{tier.platform_fee_pct}%</td>
                                                    <td className="p-3 text-center text-blue-600 font-mono">{tier.escrow_fee_pct}%</td>
                                                    <td className="p-3 text-center font-bold font-mono">{(tier.platform_fee_pct + tier.escrow_fee_pct).toFixed(1)}%</td>
                                                    <td className="p-3 text-right font-bold font-mono text-green-700">€{total.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Container>
                    </>
                )}
            </main>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                    <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}</span>
                    <span>{toast.msg}</span>
                    <button onClick={() => setToast(null)} className="ml-3 opacity-70 hover:opacity-100">×</button>
                </div>
            )}
        </div>
    );
}

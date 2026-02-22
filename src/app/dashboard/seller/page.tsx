"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Badge, Input, Label, Select, Textarea, FocusModal, Table } from '@medusajs/ui';
import { ChartBar, CurrencyDollar, ChatBubble, Plus, Sparkles, UserGroup, Photo, ArrowRightOnRectangle, Clock } from '@medusajs/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';

export default function SellerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [actors, setActors] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [msgCount, setMsgCount] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/auth');
    };

    // Add actor form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [categoryId, setCategoryId] = useState('');

    // Edit actor state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingActor, setEditingActor] = useState<any>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.role !== 'seller') {
                router.push('/dashboard/buyer');
                return;
            }
            setUser(parsed);

            // Initial fetch
            fetchActors(parsed.id);
            fetchMessages(parsed.id);
            fetchOrders(parsed.id);

            // Real-time badge polling
            const interval = setInterval(() => {
                fetchMessages(parsed.id);
                fetchOrders(parsed.id);
            }, 5000);

            return () => clearInterval(interval);
        } else {
            router.push('/auth');
        }
    }, [router]);

    const PUBLISHABLE_KEY = "pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa";

    const fetchActors = async (sellerId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/medusa/store/seller/actors?seller_id=${sellerId}`, {
                headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
            });
            const data = await res.json();
            // Enrich each actor with price from store products endpoint
            const products = data.products || [];
            // Fetch full product details including variants+prices for each actor
            const enriched = await Promise.all(products.map(async (p: any) => {
                try {
                    const pRes = await fetch(`/api/medusa/store/products/${p.id}`, {
                        headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
                    });
                    const pData = await pRes.json();
                    const variant = pData.product?.variants?.[0];
                    const eurPrice = variant?.prices?.find((pr: any) => pr.currency_code === 'eur');
                    return { ...p, price_amount: eurPrice?.amount || null };
                } catch {
                    return p;
                }
            }));
            setActors(enriched);
        } catch (err) {
            console.error("Failed to fetch actors:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async (sellerId: string) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const emailParam = storedUser.email ? `&seller_email=${encodeURIComponent(storedUser.email)}` : '';
            const res = await fetch(`/api/medusa/store/custom-orders?seller_id=${sellerId}${emailParam}`, {
                headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
            });
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const res = await fetch(`/api/medusa/store/messages?user_id=${userId}`, {
                headers: {
                    'x-publishable-api-key': PUBLISHABLE_KEY
                }
            });
            const data = await res.json();
            setMsgCount(data.unread_count || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddActor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const res = await fetch('/api/medusa/store/seller/actors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-publishable-api-key': PUBLISHABLE_KEY
                },
                body: JSON.stringify({
                    title,
                    description,
                    price: Math.round(parseFloat(price) * 100), // convert EUR → cents
                    image_url: imageUrl,
                    category_id: categoryId,
                    seller_id: user.id
                })
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchActors(user.id);
                setTitle(''); setDescription(''); setPrice(''); setImageUrl('');
                showToast('✅ AI Actor published successfully!', 'success');
            } else {
                const err = await res.json();
                showToast('Error: ' + (err.message || 'Failed to create actor'), 'error');
            }
        } catch (err) {
            console.error("Error adding actor:", err);
            showToast('Network error. Please try again.', 'error');
        }
    };

    const openEditModal = (actor: any) => {
        setEditingActor(actor);
        setEditTitle(actor.title || '');
        setEditDescription(actor.description || '');
        // price_amount is in cents, show in EUR
        setEditPrice(actor.price_amount ? (actor.price_amount / 100).toString() : '');
        setEditImageUrl(actor.thumbnail || '');
        setIsEditModalOpen(true);
    };

    const handleEditActor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingActor) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/medusa/store/seller/actors/${editingActor.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-publishable-api-key': PUBLISHABLE_KEY
                },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    price: editPrice ? Math.round(parseFloat(editPrice) * 100) : undefined, // EUR → cents
                    image_url: editImageUrl || undefined,
                })
            });

            if (res.ok) {
                setIsEditModalOpen(false);
                setEditingActor(null);
                fetchActors(user.id);
                showToast('✅ Actor updated successfully!', 'success');
            } else {
                const err = await res.json();
                showToast('Error: ' + (err.message || 'Update failed'), 'error');
            }
        } catch (err) {
            console.error('Edit error:', err);
            showToast('Network error. Please try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <div className="min-h-screen bg-ui-bg-subtle flex">
                {/* Sidebar */}
                <aside className="w-64 border-r border-ui-border-base bg-ui-bg-base flex flex-col h-screen sticky top-0 shrink-0">
                    <div className="p-4 border-b border-ui-border-base flex justify-between items-center">
                        <Heading level="h2" className="text-xl font-bold tracking-tight text-ui-fg-base cursor-pointer" onClick={() => router.push('/')}>
                            AICastHub
                        </Heading>
                        <div className="flex items-center gap-2">
                            <LanguageToggle />
                            <ThemeToggle />
                        </div>
                    </div>

                    <nav className="flex-1 p-4 flex flex-col gap-2">
                        <Button variant="transparent" className={`justify-start ${activeTab === 'overview' ? 'bg-ui-bg-base-hover shadow-elevation-card-rest' : 'text-ui-fg-subtle'}`} onClick={() => setActiveTab('overview')}>
                            <ChartBar /> Overview
                        </Button>
                        <Button variant="transparent" className={`justify-start ${activeTab === 'actors' ? 'bg-ui-bg-base-hover shadow-elevation-card-rest' : 'text-ui-fg-subtle'}`} onClick={() => setActiveTab('actors')}>
                            <UserGroup /> My AI Actors
                        </Button>
                        <Button variant="transparent" className="justify-start text-ui-fg-subtle flex items-center justify-between group" onClick={() => router.push('/dashboard/seller/messages')}>
                            <div className="flex gap-2 items-center"><ChatBubble /> Messages</div>
                            <Badge color="blue" size="small">{msgCount}</Badge>
                        </Button>
                        <Button variant="transparent" className={`justify-start ${activeTab === 'promote' ? 'bg-ui-bg-base-hover shadow-elevation-card-rest' : 'text-ui-fg-subtle'}`} onClick={() => setActiveTab('promote')}>
                            <Sparkles className="text-ui-fg-interactive" /> Promote Actors
                        </Button>
                        <Button variant="transparent" className={`justify-start ${activeTab === 'orders' ? 'bg-ui-bg-base-hover shadow-elevation-card-rest' : 'text-ui-fg-subtle'}`} onClick={() => setActiveTab('orders')}>
                            <Clock /> Orders & History
                        </Button>
                        <Button variant="transparent" className={`justify-start ${activeTab === 'payouts' ? 'bg-ui-bg-base-hover shadow-elevation-card-rest' : 'text-ui-fg-subtle'}`} onClick={() => setActiveTab('payouts')}>
                            <CurrencyDollar /> Payout Settings
                        </Button>
                        <div className="mt-auto flex flex-col gap-2">
                            <Button variant="transparent" className="justify-start text-ui-fg-interactive soft-pulse" onClick={() => router.push('/pricing')}>
                                <Sparkles /> Upgrade Subscription
                            </Button>
                            <Button variant="transparent" className="justify-start text-ui-fg-muted" onClick={handleLogout}>
                                <ArrowRightOnRectangle /> Logout
                            </Button>
                        </div>
                    </nav>
                </aside>

                {/* Main Panel */}
                <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto flex flex-col gap-8">
                    <header className="flex justify-between items-center">
                        <div>
                            <Heading level="h1" className="text-2xl font-semibold text-ui-fg-base">Seller Dashboard</Heading>
                            <Text className="text-ui-fg-subtle">Welcome, {user.first_name}. Manage your AI talent and bookings.</Text>
                        </div>

                        <FocusModal open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <FocusModal.Trigger asChild>
                                <Button variant="primary">
                                    <Plus /> Add AI Actor
                                </Button>
                            </FocusModal.Trigger>
                            <FocusModal.Content>
                                <FocusModal.Header>
                                    <div className="flex flex-col">
                                        <FocusModal.Title>Create New AI Actor</FocusModal.Title>
                                        <FocusModal.Description className="text-ui-fg-subtle text-sm">Fill in the details for your AI talent.</FocusModal.Description>
                                    </div>
                                </FocusModal.Header>
                                <FocusModal.Body className="p-8 flex flex-col gap-6 max-w-2xl mx-auto w-full">
                                    <form onSubmit={handleAddActor} className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="title">Actor Name</Label>
                                            <Input id="title" placeholder="e.g. Sophia Digital" value={title} onChange={e => setTitle(e.target.value)} required />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="desc">Description</Label>
                                            <Textarea id="desc" placeholder="Tell us about the capabilities..." value={description} onChange={e => setDescription(e.target.value)} required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="price">Hourly Rate (EUR)</Label>
                                                <Input id="price" type="number" placeholder="150" value={price} onChange={e => setPrice(e.target.value)} required />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Select value={categoryId} onValueChange={setCategoryId}>
                                                    <Select.Trigger>
                                                        <Select.Value placeholder="Select a category" />
                                                    </Select.Trigger>
                                                    <Select.Content>
                                                        <Select.Item value="pcat_01KJ1KTSV4S1D5Q82VJ39KFHMB">Fashion & Lifestyle</Select.Item>
                                                        <Select.Item value="pcat_01KJ1KTSWSGYR1RE5K47GR2C81">Commercials & TV</Select.Item>
                                                        <Select.Item value="pcat_01KJ1KTSYGNY8EBS494YYG8SN1">Voice Synthesis</Select.Item>
                                                    </Select.Content>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="img">Image URL (High res)</Label>
                                            <div className="flex gap-2">
                                                <Input id="img" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
                                                <Button variant="secondary"><Photo /></Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 mt-4">
                                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                            <Button type="submit" variant="primary">Publish Actor</Button>
                                        </div>
                                    </form>
                                </FocusModal.Body>
                            </FocusModal.Content>
                        </FocusModal>
                    </header>

                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Container className="p-6">
                                    <Text className="text-ui-fg-subtle text-sm font-medium mb-1">Total Earnings</Text>
                                    <Heading level="h2" className="text-3xl font-bold text-ui-fg-base">
                                        €{(orders.filter(o => o.status === 'completed').reduce((acc, curr) => acc + (curr.total || 0), 0) / 100).toFixed(2)}
                                    </Heading>
                                </Container>

                                <Container className="p-6">
                                    <Text className="text-ui-fg-subtle text-sm font-medium mb-1">Active AI Actors</Text>
                                    <Heading level="h2" className="text-3xl font-bold text-ui-fg-base">{actors.length}</Heading>
                                </Container>

                                <Container className="p-6">
                                    <Text className="text-ui-fg-subtle text-sm font-medium mb-1">Active Escrow</Text>
                                    <Heading level="h2" className="text-3xl font-bold text-ui-fg-base">
                                        {orders.filter(o => o.status !== 'completed').length}
                                    </Heading>
                                </Container>
                            </div>

                            <div className="flex flex-col gap-6">
                                <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">My AI Talent</Heading>
                                {loading ? (
                                    <Text className="text-ui-fg-subtle">Syncing with Medusa Cloud...</Text>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {actors.slice(0, 3).map(actor => (
                                            <Container key={actor.id} className="p-0 overflow-hidden flex flex-col">
                                                <div className="h-40 bg-ui-bg-subtle overflow-hidden">
                                                    <img src={actor.thumbnail} className="w-full h-full object-cover" alt={actor.title} />
                                                </div>
                                                <div className="p-4 flex flex-col gap-2">
                                                    <div className="flex justify-between items-start">
                                                        <Heading level="h3" className="text-base font-semibold">{actor.title}</Heading>
                                                        <Badge color={actor.status === 'published' ? 'green' : 'grey'}>{actor.status}</Badge>
                                                    </div>
                                                    <Text className="text-ui-fg-subtle text-sm truncate">{actor.handle}</Text>
                                                </div>
                                            </Container>
                                        ))}
                                    </div>
                                )}
                                {actors.length > 3 && (
                                    <Button variant="secondary" className="w-full" onClick={() => setActiveTab('actors')}>View All Actors</Button>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'actors' && (
                        <div className="flex flex-col gap-6">
                            <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">All AI Actors ({actors.length})</Heading>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {actors.map(actor => (
                                    <Container key={actor.id} className="p-0 overflow-hidden flex flex-col group">
                                        <div className="h-40 bg-ui-bg-subtle overflow-hidden relative">
                                            <img src={actor.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={actor.title} />
                                            <div className="absolute top-2 right-2">
                                                <Badge color={actor.status === 'published' ? 'green' : 'grey'}>{actor.status}</Badge>
                                            </div>
                                            {actor.price_amount && (
                                                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                                    €{(actor.price_amount / 100).toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col gap-3">
                                            <div>
                                                <Heading level="h3" className="text-base font-semibold">{actor.title}</Heading>
                                                <Text className="text-ui-fg-subtle text-xs mt-0.5 truncate">{actor.handle}</Text>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Text className="text-sm font-bold text-ui-fg-base">
                                                    {actor.price_amount ? `€${(actor.price_amount / 100).toFixed(2)} / project` : <span className="text-ui-fg-muted italic text-xs">No price set</span>}
                                                </Text>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="secondary" size="small" className="flex-1" onClick={() => openEditModal(actor)}>
                                                    ✏️ Edit &amp; Price
                                                </Button>
                                                <Button variant="transparent" size="small" className="text-ui-fg-interactive" onClick={() => setActiveTab('promote')}>Boost</Button>
                                            </div>
                                        </div>
                                    </Container>
                                ))}
                                {actors.length === 0 && (
                                    <div className="col-span-3 text-center py-16 text-ui-fg-subtle">
                                        <Text>No actors yet. Click &quot;Add AI Actor&quot; to get started.</Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">Orders & History</Heading>
                                <Badge color="blue">{orders.length} total</Badge>
                            </div>
                            <Container className="p-0 overflow-hidden">
                                <Table>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Order ID</Table.HeaderCell>
                                            <Table.HeaderCell>AI Actor</Table.HeaderCell>
                                            <Table.HeaderCell>Client</Table.HeaderCell>
                                            <Table.HeaderCell>Date</Table.HeaderCell>
                                            <Table.HeaderCell>Delivery</Table.HeaderCell>
                                            <Table.HeaderCell>Status</Table.HeaderCell>
                                            <Table.HeaderCell>Escrow</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {orders.map((order) => {
                                            const deliverStatus = order.metadata?.deliver_status || 'pending';
                                            const isCompleted = order.status === 'completed';
                                            const isDelivered = deliverStatus === 'delivered';
                                            return (
                                                <Table.Row key={order.id} className="cursor-pointer hover:bg-ui-bg-subtle" onClick={() => router.push('/dashboard/seller/messages')}>
                                                    <Table.Cell className="font-mono text-xs">{order.id.substring(0, 16)}…</Table.Cell>
                                                    <Table.Cell className="font-medium">{order.items?.[0]?.title || 'AI Actor'}</Table.Cell>
                                                    <Table.Cell className="text-ui-fg-subtle font-mono text-xs">{order.customer_id?.substring(0, 10)}…</Table.Cell>
                                                    <Table.Cell className="text-ui-fg-subtle">
                                                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <Badge color={isDelivered ? 'orange' : 'grey'} size="small">
                                                            {isDelivered ? 'Delivered' : 'Pending'}
                                                        </Badge>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <Badge color={isCompleted ? 'green' : 'blue'} size="small">
                                                            {isCompleted ? 'Completed' : 'Active'}
                                                        </Badge>
                                                    </Table.Cell>
                                                    <Table.Cell className="text-right font-semibold text-green-600">
                                                        €{(order.total / 100).toFixed(2)}
                                                    </Table.Cell>
                                                </Table.Row>
                                            );
                                        })}
                                        {orders.length === 0 && (
                                            <Table.Row>
                                                <td colSpan={7} className="text-center py-12 text-ui-fg-subtle italic text-sm">
                                                    No orders yet. When buyers purchase your AI actors, they will appear here.
                                                </td>
                                            </Table.Row>
                                        )}
                                    </Table.Body>
                                </Table>
                            </Container>
                        </div>
                    )}

                    {activeTab === 'promote' && (
                        <Container className="p-8">
                            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                                <div className="text-center">
                                    <Heading level="h1" className="text-3xl font-bold mb-2">Boost Your AI Models</Heading>
                                    <Text className="text-ui-fg-subtle">Select a promotion package to increase your model's visibility and earnings.</Text>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* GOLD TIER */}
                                    <div className="p-6 border-2 border-orange-400 rounded-xl bg-gradient-to-b from-orange-50/50 to-white dark:from-orange-900/10 dark:to-ui-bg-base flex flex-col gap-4 shadow-lg active:scale-[0.98] transition-all">
                                        <div className="flex justify-between items-center">
                                            <Badge color="orange" className="animate-pulse"><Sparkles className="h-3 w-3" /> GOLD TIER</Badge>
                                            <Text className="font-bold text-orange-600 font-mono">€99.00</Text>
                                        </div>
                                        <Heading level="h3" className="text-xl font-bold">Top of Catalog</Heading>
                                        <ul className="text-xs text-ui-fg-subtle flex flex-col gap-2">
                                            <li className="flex gap-2 items-center"><div className="w-1 h-1 rounded-full bg-orange-400" /> 30 Days Guaranteed Top Spot</li>
                                            <li className="flex gap-2 items-center"><div className="w-1 h-1 rounded-full bg-orange-400" /> Featured on Homepage</li>
                                            <li className="flex gap-2 items-center"><div className="w-1 h-1 rounded-full bg-orange-400" /> Search Result Priority #1</li>
                                        </ul>
                                        <div className="mt-auto pt-4">
                                            <Button variant="primary" className="w-full bg-orange-500 hover:bg-orange-600 border-none shadow-md">Activate 30 Days</Button>
                                        </div>
                                    </div>

                                    {/* SILVER TIER */}
                                    <div className="p-6 border border-ui-border-base rounded-xl bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/10 dark:to-ui-bg-base flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-center">
                                            <Badge color="grey"><Sparkles className="h-3 w-3 text-slate-400" /> SILVER TIER</Badge>
                                            <Text className="font-bold text-slate-600 font-mono">€49.00</Text>
                                        </div>
                                        <Heading level="h3" className="text-xl font-bold">Top Picks Section</Heading>
                                        <ul className="text-xs text-ui-fg-subtle flex flex-col gap-2">
                                            <li className="flex gap-2 items-center"><div className="w-1 h-1 rounded-full bg-slate-400" /> 15 Days Boosted Visibility</li>
                                            <li className="flex gap-2 items-center"><div className="w-1 h-1 rounded-full bg-slate-400" /> Top 10 in Category Search</li>
                                            <li className="flex gap-2 items-center"><div className="w-1 h-1 rounded-full bg-slate-400" /> Verified Creator Badge</li>
                                        </ul>
                                        <div className="mt-auto pt-4">
                                            <Button variant="secondary" className="w-full">Activate 15 Days</Button>
                                        </div>
                                    </div>

                                    {/* BRONZE TIER */}
                                    <div className="p-6 border border-ui-border-base rounded-xl bg-white dark:bg-ui-bg-base flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-center">
                                            <Badge color="orange"><Sparkles className="h-3 w-3 text-orange-800" /> BRONZE TIER</Badge>
                                            <Text className="font-bold text-orange-800 font-mono">€19.00</Text>
                                        </div>
                                        <Heading level="h3" className="text-xl font-bold">Search Boost</Heading>
                                        <ul className="text-xs text-ui-fg-subtle flex flex-col gap-2">
                                            <li className="flex gap-2 items-center"><div className="w-1 h-1 rounded-full bg-orange-800" /> 7 Days Visibility Boost</li>
                                            <li className="flex gap-2 items-center"><div className="w-1 h-1 rounded-full bg-orange-800" /> Appears in "Featured" tab</li>
                                        </ul>
                                        <div className="mt-auto pt-4">
                                            <Button variant="secondary" className="w-full">Activate 7 Days</Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 rounded-lg text-center">
                                    <Text className="text-sm text-blue-700 dark:text-blue-300">
                                        Promotions are managed via the <strong>Medusa Promotion Module</strong>. Duration and position are controlled by platform campaigns.
                                    </Text>
                                </div>
                            </div>
                        </Container>
                    )}

                    {activeTab === 'payouts' && (
                        <Container className="p-8">
                            <div className="max-w-2xl mx-auto flex flex-col gap-8">
                                <div>
                                    <Heading level="h2" className="text-2xl font-bold mb-4">Payout Settings</Heading>
                                    <Text className="text-ui-fg-subtle mb-8">Manage how you receive your earnings from AICastHub.</Text>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <Label>Preferred Currency</Label>
                                        <Select value="eur">
                                            <Select.Trigger><Select.Value /></Select.Trigger>
                                            <Select.Content>
                                                <Select.Item value="eur">Euro (€)</Select.Item>
                                                <Select.Item value="usd">US Dollar ($)</Select.Item>
                                            </Select.Content>
                                        </Select>
                                    </div>

                                    <div className="p-6 bg-ui-bg-subtle border border-ui-border-base rounded-lg flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-ui-bg-interactive/10 flex items-center justify-center text-ui-fg-interactive">
                                                <CurrencyDollar />
                                            </div>
                                            <div>
                                                <Text className="font-bold">Bank Account (SEPA)</Text>
                                                <Text className="text-xs text-ui-fg-subtle">Automatically payout every Monday</Text>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 mt-2">
                                            <Input placeholder="IBAN Number" />
                                            <Input placeholder="SWIFT/BIC Code" />
                                            <Button variant="primary" className="w-full">Save Bank Details</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Container>
                    )}
                </main>
            </div>

            {/* ── Edit Actor Modal ── */}
            <FocusModal open={isEditModalOpen} onOpenChange={(open) => { if (!open) { setIsEditModalOpen(false); setEditingActor(null); } }}>
                <FocusModal.Content>
                    <FocusModal.Header>
                        <div className="flex flex-col">
                            <FocusModal.Title>Edit AI Actor</FocusModal.Title>
                            <FocusModal.Description className="text-ui-fg-subtle text-sm">
                                Update details and price for <strong>{editingActor?.title}</strong>
                            </FocusModal.Description>
                        </div>
                    </FocusModal.Header>
                    <FocusModal.Body className="p-8 flex flex-col gap-6 max-w-2xl mx-auto w-full">
                        <form onSubmit={handleEditActor} className="flex flex-col gap-6">

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-title">Actor Name</Label>
                                <Input
                                    id="edit-title"
                                    placeholder="e.g. Sophia Digital"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-desc">Description</Label>
                                <Textarea
                                    id="edit-desc"
                                    placeholder="Describe the actor's capabilities..."
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-price">Price per Project (EUR)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-subtle font-bold">€</span>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        placeholder="450.00"
                                        value={editPrice}
                                        onChange={e => setEditPrice(e.target.value)}
                                        className="pl-7"
                                    />
                                </div>
                                <Text className="text-xs text-ui-fg-muted">This is the price buyers pay per project. Enter the full amount in euros (e.g. 450 = €450.00).</Text>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-img">Cover Image URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="edit-img"
                                        placeholder="https://..."
                                        value={editImageUrl}
                                        onChange={e => setEditImageUrl(e.target.value)}
                                    />
                                    {editImageUrl && (
                                        <img src={editImageUrl} alt="preview" className="h-10 w-10 rounded object-cover border border-ui-border-base" onError={e => (e.currentTarget.style.display = 'none')} />
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-ui-border-base">
                                <Button variant="secondary" type="button" onClick={() => { setIsEditModalOpen(false); setEditingActor(null); }}>Cancel</Button>
                                <Button type="submit" variant="primary" isLoading={isSaving}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </FocusModal.Body>
                </FocusModal.Content>
            </FocusModal>

            {toast && (
                <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                    <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}</span>
                    <span>{toast.msg}</span>
                    <button onClick={() => setToast(null)} className="ml-3 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
                </div>
            )}
        </>
    );
}

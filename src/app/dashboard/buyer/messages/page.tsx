"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Badge, Input, Textarea, Toast } from '@medusajs/ui';
import { ChartBar, CurrencyDollar, ChatBubble, Sparkles, UserGroup, PaperClip, ArrowUpTray, Plus, CheckCircleSolid, LockClosedSolid, PlayMiniSolid, ThumbUp, ThumbDown, SquaresPlus, ShoppingCart, Clock, ArrowRightOnRectangle, ArrowRight, DocumentText } from '@medusajs/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useTranslation } from '@/providers/i18n-provider';

export default function BuyerMessagesPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const activeOrderIdRef = useRef<string | null>(null);

    // Sync ref with state for use in async/intervals
    useEffect(() => {
        activeOrderIdRef.current = activeOrderId;
    }, [activeOrderId]);
    const [messages, setMessages] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState<'positive' | 'negative' | number>('positive');
    const [review, setReview] = useState('');
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/auth');
    };

    const PUBLISHABLE_KEY = "pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa";

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);

            // If user has a mock/hardcoded ID, resolve the real Medusa customer ID
            const isMockId = !parsed.id || parsed.id === 'buyer-1' || parsed.id === 'seller-1' || !parsed.id.startsWith('cus_');
            if (isMockId && parsed.email) {
                fetch('/api/medusa/store/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
                    body: JSON.stringify({ email: parsed.email })
                })
                    .then(r => r.json())
                    .then(data => {
                        if (data.customer?.id) {
                            const fixed = { ...parsed, id: data.customer.id };
                            localStorage.setItem('user', JSON.stringify(fixed));
                            setUser(fixed);
                            fetchOrders(fixed.id);
                        } else {
                            setUser(parsed);
                            fetchOrders(parsed.id);
                        }
                    })
                    .catch(() => {
                        setUser(parsed);
                        fetchOrders(parsed.id);
                    });
            } else {
                setUser(parsed);
                fetchOrders(parsed.id);
            }

            const interval = setInterval(() => {
                if (activeOrderId) {
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    fetchMessages(currentUser.id || parsed.id, activeOrderId);
                }
            }, 3000);

            return () => clearInterval(interval);
        } else {
            router.push('/auth');
        }
    }, [router, activeOrderId]);

    useEffect(() => {
        if (user && activeOrderId) {
            fetchMessages(user.id, activeOrderId);
        }
    }, [activeOrderId, user]);

    const fetchOrders = async (customerId: string) => {
        try {
            console.log("[FETCH_ORDERS] Starting for customer:", customerId);
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const emailParam = storedUser.email ? `&customer_email=${encodeURIComponent(storedUser.email)}` : '';
            const res = await fetch(`/api/medusa/store/custom-orders?customer_id=${customerId}${emailParam}`, {
                headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
            });
            const data = await res.json();

            // Sort by newest first
            const fetchedOrders = (data.orders || []).sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            console.log(`[FETCH_ORDERS] Found ${fetchedOrders.length} orders`);
            setOrders(fetchedOrders);

            // Priority selection: 
            // 1. new_order_id (just finished booking)
            // 2. active_order_id (clicked "Open Chat" from History)
            // 3. Keep current activeOrderId
            // 4. Default to first active order
            const newOrderId = sessionStorage.getItem('new_order_id');
            const historyOrderId = sessionStorage.getItem('active_order_id');

            if (newOrderId) {
                const found = fetchedOrders.find((o: any) => o.id === newOrderId);
                if (found) {
                    setActiveOrderId(newOrderId);
                    sessionStorage.removeItem('new_order_id');
                    showToast('🎉 Project funded! Funds are in escrow. Start messaging the AI Actor.', 'success');
                }
            } else if (historyOrderId) {
                setActiveOrderId(historyOrderId);
                sessionStorage.removeItem('active_order_id');
            } else if (!activeOrderIdRef.current && fetchedOrders.length > 0) {
                const firstActive = fetchedOrders.find((o: any) => o.status !== 'completed' && o.metadata?.escrow_status !== 'released');
                if (firstActive) {
                    setActiveOrderId(firstActive.id);
                } else {
                    setActiveOrderId(fetchedOrders[0].id);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async (userId: string, orderId: string) => {
        try {
            const res = await fetch(`/api/medusa/store/messages?user_id=${userId}&order_id=${orderId}`, {
                headers: {
                    'x-publishable-api-key': PUBLISHABLE_KEY
                }
            });
            const data = await res.json();
            const newMessages = data.messages || [];
            setMessages(newMessages);
            setUnreadCount(data.unread_count || 0);

            // Mark received messages as read
            const unreadIds = newMessages
                .filter((m: any) => m.to_id === userId && !m.is_read)
                .map((m: any) => m.id);

            if (unreadIds.length > 0) {
                await fetch('/api/medusa/store/messages', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-publishable-api-key': PUBLISHABLE_KEY
                    },
                    body: JSON.stringify({
                        message_ids: unreadIds,
                        user_id: userId
                    })
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteProject = async () => {
        if (!activeOrderId || !user) return;
        setIsCompleting(true);

        try {
            const res = await fetch(`/api/medusa/store/custom-orders/${activeOrderId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-publishable-api-key': PUBLISHABLE_KEY
                }
            });

            if (res.ok) {
                setShowRatingModal(true);
                fetchOrders(user.id);
            }
        } catch (err) {
            console.error("Failed to complete project:", err);
        } finally {
            setIsCompleting(false);
        }
    };



    const handleSendMessage = async (e?: React.FormEvent, attachments: any[] = []) => {
        if (e) e.preventDefault();
        if ((!newMessage.trim() && attachments.length === 0) || !user) return;

        try {
            // Get the real seller_id from the active order's metadata
            const activeOrder = orders.find((o: any) => o.id === activeOrderId);
            const toId = activeOrder?.metadata?.seller_id || 'seller-1';
            const res = await fetch('/api/medusa/store/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-publishable-api-key': PUBLISHABLE_KEY
                },
                body: JSON.stringify({
                    from_id: user.id,
                    to_id: toId,
                    order_id: activeOrderId,
                    text: newMessage,
                    attachments: attachments
                })
            });
            if (res.ok) {
                setNewMessage('');
                if (activeOrderId) fetchMessages(user.id, activeOrderId);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReview = async (orderId: string, rating: 'positive' | 'negative') => {
        try {
            const res = await fetch(`/api/medusa/store/custom-orders/${orderId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment: review || `Buyer gave a ${rating} rating.` })
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Your review has been permanently recorded. Thank you!", 'success');
                fetchOrders(user.id);
            } else {
                showToast(data.error || "Failed to submit review.", 'error');
            }
        } catch (err) {
            console.error(err);
            showToast("Server error.", 'error');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !activeOrderId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/medusa/store/upload", {
                method: "POST",
                headers: {
                    'x-publishable-api-key': PUBLISHABLE_KEY
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                await handleSendMessage(undefined, [{
                    url: data.url,
                    name: data.name,
                    type: data.type,
                    size: data.size
                }]);
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-ui-bg-subtle flex overflow-hidden">
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
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle" onClick={() => router.push('/dashboard/buyer')}>
                        <SquaresPlus /> {t('nav.overview')}
                    </Button>
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle" onClick={() => router.push('/actors')}>
                        <ShoppingCart /> {t('nav.catalog')}
                    </Button>
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle flex items-center justify-between group">
                        <div className="flex gap-2 items-center text-ui-fg-interactive font-medium"><ChatBubble /> {t('nav.messages')}</div>
                        <Badge color="blue" size="small">{unreadCount}</Badge>
                    </Button>
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle" onClick={() => router.push('/dashboard/buyer/orders')}>
                        <Clock /> {t('nav.history')}
                    </Button>
                    <div className="mt-auto flex flex-col gap-2">
                        <Button variant="transparent" className="justify-start text-ui-fg-interactive soft-pulse" onClick={() => router.push('/pricing')}>
                            <Sparkles /> {t('nav.upgrade')}
                        </Button>
                        <Button variant="transparent" className="justify-start text-ui-fg-muted" onClick={handleLogout}>
                            <ArrowRightOnRectangle /> {t('nav.logout')}
                        </Button>
                    </div>
                </nav>
            </aside>

            <main className="flex-1 flex overflow-hidden">
                <div className="w-80 border-r border-ui-border-base bg-ui-bg-base flex flex-col h-full shrink-0">
                    <div className="p-6 border-b border-ui-border-base">
                        <Heading level="h2" className="text-xl font-bold text-ui-fg-base">Collaborations</Heading>
                        <Text className="text-xs text-ui-fg-subtle mt-1">Manage project communications</Text>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {/* Active Projects */}
                        {orders.filter(o => o.status !== 'completed' && o.metadata?.escrow_status !== 'released').length > 0 && (
                            <div className="px-6 py-2 bg-ui-bg-subtle/50 border-b border-ui-border-base">
                                <Text className="text-[10px] font-bold text-ui-fg-muted uppercase tracking-wider">{t('messages.active_projects')}</Text>
                            </div>
                        )}
                        {orders.filter(o => o.status !== 'completed' && o.metadata?.escrow_status !== 'released').map((order) => {
                            const deliverStatus = order.metadata?.deliver_status;
                            const isDelivered = deliverStatus === 'delivered';
                            const actorName = order.items?.[0]?.title || 'AI Actor';
                            const escrowEur = order.total ? (order.total / 100).toFixed(2) : '—';
                            const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
                            const isActive = activeOrderId === order.id;
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => setActiveOrderId(order.id)}
                                    className={`p-4 border-b border-ui-border-base cursor-pointer hover:bg-ui-bg-base-hover transition-all ${isActive ? 'bg-ui-bg-subtle border-l-[3px] border-l-ui-border-interactive' : ''}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <Text className={`text-sm font-bold truncate max-w-[145px] ${isActive ? 'text-ui-fg-base' : 'text-ui-fg-subtle'}`}>{actorName}</Text>
                                        <Badge color={isDelivered ? 'orange' : 'blue'} size="small">
                                            {isDelivered ? `📦 ${t('messages.delivered')}` : 'Active'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <Text className="text-xs text-ui-fg-muted">€{escrowEur} {t('messages.escrow_money')}</Text>
                                        <Text className="text-[10px] text-ui-fg-muted">{orderDate}</Text>
                                    </div>
                                    {isDelivered && (
                                        <div className="mt-1.5 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 rounded text-[10px] text-orange-600 dark:text-orange-400 font-semibold">
                                            ⚡ {t('messages.awaiting_approval')}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Completed Projects - Released funds means they are done */}
                        {orders.filter(o => o.status === 'completed' || o.metadata?.escrow_status === 'released').length > 0 && (
                            <div className="px-6 py-2 bg-ui-bg-subtle/50 border-b border-ui-border-base mt-4">
                                <Text className="text-[10px] font-bold text-ui-fg-muted uppercase tracking-wider">{t('messages.completed_archive')}</Text>
                            </div>
                        )}
                        {orders.filter(o => o.status === 'completed' || o.metadata?.escrow_status === 'released').map((order) => {
                            const actorName = order.items?.[0]?.title || 'AI Actor';
                            const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
                            const isActive = activeOrderId === order.id;
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => setActiveOrderId(order.id)}
                                    className={`p-3 opacity-60 border-b border-ui-border-base cursor-pointer hover:bg-ui-bg-base-hover transition-all ${isActive ? 'bg-ui-bg-subtle' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <Text className="text-xs font-medium text-ui-fg-muted truncate">{actorName}</Text>
                                        <Badge color="green" size="small">✓ {t('messages.done')}</Badge>
                                    </div>
                                    <Text className="text-[10px] text-ui-fg-muted mt-1">{orderDate}</Text>
                                </div>
                            );
                        })}

                        {orders.length === 0 && (
                            <div className="p-8 text-center text-ui-fg-subtle italic">No orders found.</div>
                        )}
                    </div>
                </div>

                {activeOrderId ? (
                    <div className="flex-1 flex flex-col bg-ui-bg-subtle h-full relative">
                        <div className="h-16 border-b border-ui-border-base bg-white dark:bg-ui-bg-base flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
                            <div className="flex items-center gap-4">
                                {(() => {
                                    const activeOrder = orders.find(o => o.id === activeOrderId);
                                    const actorName = activeOrder?.items?.[0]?.title || 'AI Actor';
                                    const initials = actorName.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
                                    const escrow = activeOrder?.total ? `€${(activeOrder.total / 100).toFixed(2)} in escrow` : '';
                                    return (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-ui-bg-interactive text-ui-fg-on-inverted flex items-center justify-center font-bold text-sm">
                                                {initials}
                                            </div>
                                            <div>
                                                <Heading level="h2" className="text-base font-bold text-ui-fg-base">{actorName}</Heading>
                                                <Text className="text-xs text-ui-fg-subtle flex items-center gap-2">
                                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span> Active Project</span>
                                                    {escrow && <span className="text-ui-fg-muted">· {escrow}</span>}
                                                </Text>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="flex items-center gap-3">
                                {(() => {
                                    const activeOrder = orders.find(o => o.id === activeOrderId);
                                    const isCompleted = activeOrder?.status === 'completed' || activeOrder?.metadata?.escrow_status === 'released';
                                    const isDelivered = activeOrder?.metadata?.deliver_status === 'delivered';
                                    const hasReview = activeOrder?.metadata?.buyer_review;

                                    if (isCompleted) {
                                        if (hasReview) {
                                            return <Badge color={hasReview.rating === 'positive' ? 'green' : 'red'} className="flex items-center gap-1">
                                                {hasReview.rating === 'positive' ? '👍' : '👎'} {hasReview.rating === 'positive' ? 'Excellent Job' : 'Poor Job'}
                                            </Badge>;
                                        }

                                        if (showRatingModal) {
                                            return (
                                                <div className="flex flex-col gap-2 bg-gradient-to-br from-ui-bg-subtle to-ui-bg-base p-3 rounded-xl border border-ui-border-base shadow-lg min-w-[300px] animate-in slide-in-from-top-2">
                                                    <div className="flex items-center justify-between">
                                                        <Text className="text-xs font-bold flex items-center gap-1">
                                                            {rating === 'positive' ? '👍 Awesome!' : '👎 Not satisfied'}
                                                        </Text>
                                                        <Button variant="transparent" size="small" onClick={() => setShowRatingModal(false)} className="h-6 w-6 p-0 text-ui-fg-muted">×</Button>
                                                    </div>
                                                    <Textarea
                                                        placeholder="What was the reason for this rating? (e.g. speed, quality, communication)"
                                                        className="text-xs min-h-[60px] bg-ui-bg-base"
                                                        value={review}
                                                        onChange={e => setReview(e.target.value)}
                                                    />
                                                    <Button size="small" variant="primary" className="w-full" onClick={() => { setShowRatingModal(false); handleReview(activeOrderId, rating as 'positive' | 'negative'); }}>
                                                        Submit Review
                                                    </Button>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="flex gap-2 items-center bg-ui-bg-subtle p-1 rounded-lg border border-ui-border-base">
                                                <Text className="text-xs font-bold text-ui-fg-muted mr-2">Rate Creator:</Text>
                                                <Button size="small" variant="secondary" className="hover:bg-green-100 hover:text-green-700 font-bold" onClick={() => { setRating('positive' as any); setShowRatingModal(true); }}>
                                                    <span className="text-lg leading-none mr-1">👍</span> Good
                                                </Button>
                                                <Button size="small" variant="secondary" className="hover:bg-red-100 hover:text-red-700 font-bold" onClick={() => { setRating('negative' as any); setShowRatingModal(true); }}>
                                                    <span className="text-lg leading-none mr-1">👎</span> Bad
                                                </Button>
                                            </div>
                                        );
                                    }
                                    return (
                                        <Button
                                            variant="primary"
                                            size="small"
                                            className={isDelivered ? 'bg-green-600 hover:bg-green-700 border-green-700' : 'opacity-50 cursor-not-allowed'}
                                            onClick={isDelivered ? handleCompleteProject : () => showToast('The seller has not marked this project as delivered yet. Please wait for the creator to submit the final work.', 'info')}
                                            isLoading={isCompleting}
                                        >
                                            <CheckCircleSolid /> {isDelivered ? t('messages.approve_release') : t('messages.awaiting_delivery')}
                                        </Button>
                                    );
                                })()}
                                {orders.find(o => o.id === activeOrderId)?.status !== 'completed' && (
                                    <Button variant="secondary" size="small" className="flex gap-2">
                                        <LockClosedSolid className="h-4 w-4" /> {t('messages.secure_escrow')}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 scrollbar-hide" ref={scrollRef}>
                            {messages.length > 0 ? messages.map((msg, i) => {
                                const isMe = msg.from_id === user.id || msg.from_id === 'buyer-1';
                                return (
                                    <div key={i} className={`flex gap-3 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-1 shadow-sm ${isMe ? 'bg-ui-bg-interactive text-ui-fg-on-inverted' : 'bg-ui-bg-component text-ui-fg-muted'
                                            }`}>
                                            {isMe ? 'YOU' : (msg.sender_name?.substring(0, 2).toUpperCase() || 'AI')}
                                        </div>
                                        <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : ''}`}>
                                            <Text className="text-[10px] text-ui-fg-muted px-1 font-medium">{isMe ? 'You' : msg.sender_name}</Text>
                                            {msg.text && (
                                                <div className={`p-4 rounded-2xl text-sm shadow-sm ${isMe
                                                    ? 'bg-blue-600 border border-blue-500 text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-ui-bg-base border border-ui-border-base text-ui-fg-subtle rounded-tl-none'
                                                    }`}>
                                                    <Text>{msg.text}</Text>
                                                </div>
                                            )}
                                            {msg.attachments?.map((file: any, index: number) => (
                                                <div key={index} className="mt-2 group relative">
                                                    {file.type.startsWith('image/') || file.type.startsWith('video/') ? (
                                                        <div className="relative rounded-xl overflow-hidden border border-ui-border-base shadow-lg max-w-sm">
                                                            {file.type.startsWith('video/') ? (
                                                                <video src={file.url} className={`w-full h-auto block ${file.isPreview ? 'grayscale-[0.2]' : ''}`} controls controlsList={file.isPreview ? "nodownload" : ""} muted />
                                                            ) : (
                                                                <img src={file.url} alt={file.name} className={`w-full h-auto block ${file.isPreview ? 'grayscale-[0.2]' : ''}`} />
                                                            )}
                                                            {file.isPreview && (
                                                                <div className="absolute top-2 left-2 z-10">
                                                                    <Badge color="blue" className="shadow-lg flex gap-1 items-center"><Sparkles className="h-3 w-3" /> {t('messages.preview_from_creator')}</Badge>
                                                                </div>
                                                            )}
                                                            {file.isPreview && (
                                                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 select-none overflow-hidden rotate-[-30deg] z-10">
                                                                    <Text className="text-white text-4xl font-black tracking-widest uppercase">
                                                                        AICastHub • PROTECTED
                                                                    </Text>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Text className="text-white text-[10px] truncate">{file.name}</Text>
                                                                <Button variant="transparent" className="text-white h-6 w-6 p-0" onClick={() => window.open(file.url, '_blank')}><ArrowRight className="h-3 w-3" /></Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-ui-bg-base border border-ui-border-base rounded-xl shadow-sm hover:border-ui-border-interactive transition-colors cursor-pointer" onClick={() => window.open(file.url, '_blank')}>
                                                            <DocumentText className="text-ui-fg-interactive" />
                                                            <div className="flex flex-col">
                                                                <Text className="text-sm font-medium text-ui-fg-base">{file.name}</Text>
                                                                <Text className="text-[10px] text-ui-fg-muted">{(file.size / 1024).toFixed(1)} KB • Document</Text>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <Text className="text-[10px] text-ui-fg-muted px-1 mt-1">
                                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </Text>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-40">
                                    <ChatBubble className="h-16 w-16" />
                                    <Heading level="h2">{t('messages.secure_collab_channel')}</Heading>
                                    <Text>{t('messages.start_describing_project')}</Text>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-ui-bg-base border-t border-ui-border-base shrink-0 shadow-lg">
                            <div className="max-w-4xl mx-auto flex items-end gap-3">
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*,video/*,.pdf,.doc,.docx"
                                />
                                <Button
                                    type="button"
                                    variant="transparent"
                                    className={`shrink-0 mb-1 rounded-full hover:bg-ui-bg-subtle text-ui-fg-muted ${isUploading ? 'animate-pulse' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <PaperClip />
                                </Button>
                                <Textarea
                                    className="flex-1 min-h-[44px] max-h-32 rounded-xl resize-none border-ui-border-base focus:border-ui-border-interactive"
                                    placeholder={t('messages.type_message_client')}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e as any);
                                        }
                                    }}
                                />
                                <Button type="submit" variant="primary" className="shrink-0 mb-1 h-11 w-11 p-0 rounded-full">
                                    <ArrowRight />
                                </Button>
                            </div>
                            <div className="flex justify-center mt-2 gap-4">
                                <Text className="text-[10px] text-ui-fg-muted italic flex items-center gap-1">
                                    <LockClosedSolid className="h-3 w-3" /> {t('messages.secure_encrypted')}
                                </Text>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-ui-bg-subtle/50 text-center p-12 gap-4">
                        <div className="w-20 h-20 bg-ui-bg-base rounded-full flex items-center justify-center shadow-soft-elevation">
                            <ChatBubble className="h-10 w-10 text-ui-fg-muted" />
                        </div>
                        <Heading level="h1" className="text-2xl font-bold">{t('messages.no_active_projects')}</Heading>
                        <Text className="text-ui-fg-subtle max-w-xs">{t('messages.no_active_projects_sub')}</Text>
                        <Button variant="primary" className="mt-4" onClick={() => router.push('/actors')}>{t('messages.browse_actors')}</Button>
                    </div>
                )}
            </main>


            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${toast.type === 'success' ? 'bg-green-600' :
                    toast.type === 'error' ? 'bg-red-600' :
                        'bg-blue-600'
                    }`}>
                    <span className="text-base">{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}</span>
                    <span>{toast.msg}</span>
                    <button onClick={() => setToast(null)} className="ml-3 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
                </div>
            )}
        </div>
    );
}

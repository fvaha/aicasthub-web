"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Badge, Table } from '@medusajs/ui';
import { ShoppingCart, Clock, Sparkles, SquaresPlus, ChatBubble, ArrowRightOnRectangle, CheckCircleSolid } from '@medusajs/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';

export default function BuyerOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [msgCount, setMsgCount] = useState(0);

    const PUBLISHABLE_KEY = "pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa";

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            fetchOrders(parsed.id);
            fetchMessages(parsed.id);
        } else {
            router.push('/auth');
        }
    }, [router]);

    const fetchOrders = async (customerId: string) => {
        try {
            const res = await fetch(`/api/medusa/store/custom-orders?customer_id=${customerId}`, {
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
                headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
            });
            const data = await res.json();
            setMsgCount(data.unread_count || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/auth');
    };

    if (!user) return null;

    return (
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
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle" onClick={() => router.push('/dashboard/buyer')}>
                        <SquaresPlus /> Overview
                    </Button>
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle" onClick={() => router.push('/actors')}>
                        <ShoppingCart /> Browse Actors
                    </Button>
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle flex items-center justify-between group" onClick={() => router.push('/dashboard/buyer/messages')}>
                        <div className="flex gap-2 items-center"><ChatBubble /> Messages</div>
                        <Badge color="blue" size="small">{msgCount}</Badge>
                    </Button>
                    <Button variant="transparent" className="justify-start bg-ui-bg-base-hover shadow-elevation-card-rest">
                        <Clock /> History & Orders
                    </Button>
                    <div className="mt-auto flex flex-col gap-2">
                        <Button variant="transparent" className="justify-start text-ui-fg-interactive soft-pulse" onClick={() => router.push('/pricing')}>
                            <Sparkles /> Upgrade Plan
                        </Button>
                        <Button variant="transparent" className="justify-start text-ui-fg-muted" onClick={handleLogout}>
                            <ArrowRightOnRectangle /> Logout
                        </Button>
                    </div>
                </nav>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto flex flex-col gap-8">
                <header>
                    <Heading level="h1" className="text-2xl font-semibold text-ui-fg-base">History & Orders</Heading>
                    <Text className="text-ui-fg-subtle">Complete list of your past and current bookings.</Text>
                </header>

                <Container className="p-0 overflow-hidden shadow-elevation-card-rest">
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Order Date</Table.HeaderCell>
                                <Table.HeaderCell>Project / AI Actor</Table.HeaderCell>
                                <Table.HeaderCell>Order ID</Table.HeaderCell>
                                <Table.HeaderCell>Escrow Amount</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                                <Table.HeaderCell className="text-right">Action</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order) => {
                                const isCompleted = order.status === 'completed' || order.metadata?.escrow_status === 'released';
                                const isReady = order.metadata?.deliver_status === 'delivered';

                                return (
                                    <Table.Row key={order.id} className="hover:bg-ui-bg-base-hover transition-colors">
                                        <Table.Cell className="text-ui-fg-subtle text-sm">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex flex-col">
                                                <Text className="font-bold text-ui-fg-base">{order.items?.[0]?.title || 'Custom Service'}</Text>
                                                <Text className="text-[10px] text-ui-fg-muted uppercase tracking-wider">{order.metadata?.tier_applied || 'Standard'} Tier</Text>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell className="font-mono text-[10px] text-ui-fg-muted">
                                            {order.id}
                                        </Table.Cell>
                                        <Table.Cell className="font-semibold text-ui-fg-base">
                                            €{(order.total / 100).toFixed(2)}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {isCompleted ? (
                                                <Badge color="green" className="flex items-center gap-1 w-fit"><CheckCircleSolid className="h-3 w-3" /> Completed</Badge>
                                            ) : isReady ? (
                                                <Badge color="orange" className="w-fit">📦 Ready for Review</Badge>
                                            ) : (
                                                <Badge color="blue" className="w-fit">Active Collaboration</Badge>
                                            )}
                                        </Table.Cell>
                                        <Table.Cell className="text-right">
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                onClick={() => {
                                                    // Save to session so messages page knows to select this
                                                    sessionStorage.setItem('active_order_id', order.id);
                                                    router.push('/dashboard/buyer/messages');
                                                }}
                                            >
                                                Open Chat
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })}
                            {orders.length === 0 && (
                                <Table.Row>
                                    <td colSpan={6} className="text-center py-12 text-ui-fg-subtle italic">
                                        No orders found in your history.
                                    </td>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                </Container>
            </main>
        </div>
    );
}

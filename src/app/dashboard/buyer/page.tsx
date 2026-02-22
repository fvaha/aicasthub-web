"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Badge, Table } from '@medusajs/ui';
import { ShoppingCart, Clock, Sparkles, SquaresPlus, ChatBubble, ArrowRightOnRectangle } from '@medusajs/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';

export default function BuyerDashboard() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [tier, setTier] = useState<string>('Free');
    const [msgCount, setMsgCount] = useState(0);

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/auth');
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            // Initial fetch
            fetchUserTier(parsed.id);
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

    const fetchOrders = async (customerId: string) => {
        try {
            const res = await fetch(`/api/medusa/store/custom-orders?customer_id=${customerId}`, {
                headers: {
                    'x-publishable-api-key': PUBLISHABLE_KEY
                }
            });
            const data = await res.json();
            setBookings(data.orders || []);
        } catch (err) {
            console.error(err);
        }
    };

    const PUBLISHABLE_KEY = "pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa";

    const fetchUserTier = async (customerId: string) => {
        try {
            const res = await fetch(`/api/medusa/store/custom-customers/${customerId}`, {
                headers: {
                    'x-publishable-api-key': PUBLISHABLE_KEY
                }
            });

            const contentType = res.headers.get("content-type");
            if (!res.ok || !contentType || !contentType.includes("application/json")) {
                console.warn(`[UserTier] Failed to fetch or non-JSON response: ${res.status}`);
                return;
            }

            const data = await res.json();
            if (data.customer?.groups?.length > 0) {
                const groupName = data.customer.groups[0].name;
                setTier(groupName.replace(' Members', ''));
            }
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
            setMsgCount(data.unread_count || 0); // Use unread_count for the badge
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-ui-bg-subtle flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-ui-border-base bg-ui-bg-base flex flex-col h-screen sticky top-0 shrink-0">
                <div className="p-4 border-b border-ui-border-base flex justify-between items-center">
                    <Heading
                        level="h2"
                        className="text-xl font-bold tracking-tight text-ui-fg-base cursor-pointer"
                        onClick={() => router.push('/')}
                    >
                        AICastHub
                    </Heading>
                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2">
                    <Button variant="transparent" className="justify-start bg-ui-bg-base-hover shadow-elevation-card-rest">
                        <SquaresPlus /> Overview
                    </Button>
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle" onClick={() => router.push('/actors')}>
                        <ShoppingCart /> Browse Actors
                    </Button>
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle flex items-center justify-between group" onClick={() => router.push('/dashboard/buyer/messages')}>
                        <div className="flex gap-2 items-center"><ChatBubble /> Messages</div>
                        <Badge color="blue" size="small">{msgCount}</Badge>
                    </Button>
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle" onClick={() => router.push('/dashboard/buyer/orders')}>
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

            {/* Main Panel */}
            <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto flex flex-col gap-8">
                <header className="flex justify-between items-center">
                    <div>
                        <Heading level="h1" className="text-2xl font-semibold text-ui-fg-base">Buyer Dashboard</Heading>
                        <Text className="text-ui-fg-subtle">Hello, {user.first_name}. You are currently on the {tier} tier.</Text>
                    </div>
                    <div className="flex gap-2">
                        <Badge color={tier === 'Gold' ? 'orange' : tier === 'Silver' ? 'blue' : 'grey'} className="p-2 px-3 rounded-full flex gap-2">
                            <Sparkles /> {tier} Member
                        </Badge>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Container className="p-6">
                        <Text className="text-ui-fg-subtle text-sm font-medium mb-1">Total Invested (Euros)</Text>
                        <Heading level="h2" className="text-3xl font-bold text-ui-fg-base">
                            €{(bookings.reduce((acc, curr) => acc + (curr.total || 0), 0) / 100).toFixed(2)}
                        </Heading>
                    </Container>

                    <Container className="p-6">
                        <Text className="text-ui-fg-subtle text-sm font-medium mb-1">Active Collaborations</Text>
                        <Heading level="h2" className="text-3xl font-bold text-ui-fg-base">
                            {bookings.filter(b => b.status !== 'completed' && b.metadata?.escrow_status !== 'released').length}
                        </Heading>
                    </Container>
                </div>

                <Container className="p-0 overflow-hidden">
                    <div className="p-4 border-b border-ui-border-base">
                        <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">Active Escrow Projects</Heading>
                    </div>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Project ID</Table.HeaderCell>
                                <Table.HeaderCell>AI Actor</Table.HeaderCell>
                                <Table.HeaderCell>Date Funded</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                                <Table.HeaderCell>Funds Held</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {bookings
                                .filter(b => b.status !== 'completed' && b.metadata?.escrow_status !== 'released')
                                .map((booking) => (
                                    <Table.Row key={booking.id}>
                                        <Table.Cell className="font-mono text-xs">{booking.id}</Table.Cell>
                                        <Table.Cell className="font-medium">
                                            {booking.items?.[0]?.title || 'AI Actor'}
                                        </Table.Cell>
                                        <Table.Cell className="text-ui-fg-subtle">
                                            {new Date(booking.created_at).toLocaleDateString()}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge color={booking.metadata?.deliver_status === 'delivered' ? 'orange' : 'blue'}>
                                                {booking.metadata?.deliver_status === 'delivered' ? 'READY' : 'IN PROGRESS'}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell className="text-right font-semibold">
                                            €{(booking.total / 100).toFixed(2)}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            {bookings.filter(b => b.status !== 'completed' && b.metadata?.escrow_status !== 'released').length === 0 && (
                                <Table.Row>
                                    <td colSpan={5} className="text-center py-8 text-ui-fg-subtle italic text-sm">
                                        No active escrow projects. Start a new collaboration to see it here.
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

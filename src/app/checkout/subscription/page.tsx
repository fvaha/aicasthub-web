"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Container, Heading, Text, Badge, Input, Label } from '@medusajs/ui';
import { LockClosedSolid, CheckCircleSolid, Sparkles } from '@medusajs/icons';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SubscriptionCheckout() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'bronze';
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/auth');
        }
    }, [router]);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const PUBLISHABLE_KEY = "pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa";
        try {
            const res = await fetch('/api/medusa/store/subscription/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-publishable-api-key': PUBLISHABLE_KEY
                },
                body: JSON.stringify({
                    customer_id: user.id,
                    tier: plan
                })
            });

            if (res.ok) {
                alert(`Welcome to the ${plan.toUpperCase()} tier!`);
                router.push('/dashboard/buyer');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-ui-bg-subtle flex flex-col items-center justify-center p-6">
            <Container className="w-full max-w-lg p-0 overflow-hidden shadow-elevation-card-rest">
                <div className="bg-ui-bg-interactive p-8 text-ui-fg-on-inverted flex flex-col gap-2">
                    <Badge color="orange"><Sparkles /> Pure AI Experience</Badge>
                    <Heading level="h1" className="text-3xl font-bold">Secure Checkout</Heading>
                    <Text className="opacity-80">Upgrading to {plan.toUpperCase()} Membership</Text>
                </div>

                <form onSubmit={handleCheckout} className="p-8 flex flex-col gap-8 bg-ui-bg-base">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-ui-border-base pb-4">
                            <Text className="text-ui-fg-subtle">Monthly Subscription</Text>
                            <Text className="font-bold">{plan === 'gold' ? '€299' : plan === 'silver' ? '€99' : '€29'}.00</Text>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <Text className="text-ui-fg-interactive flex items-center gap-1 font-medium italic"><CheckCircleSolid /> Discount included</Text>
                            <Text className="font-bold italic">€0.00</Text>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Heading level="h2" className="text-sm font-bold uppercase tracking-widest text-ui-fg-muted">Payment Details</Heading>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="card">Card Number</Label>
                            <Input id="card" placeholder="xxxx xxxx xxxx xxxx" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="exp">Expiry</Label>
                                <Input id="exp" placeholder="MM/YY" required />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="cvc">CVC</Label>
                                <Input id="cvc" type="password" placeholder="***" required />
                            </div>
                        </div>
                    </div>

                    <Button variant="primary" size="large" type="submit" isLoading={loading} className="w-full h-14 text-lg">
                        <LockClosedSolid /> Subscribe for {plan === 'gold' ? '€299' : plan === 'silver' ? '€99' : '€29'}
                    </Button>
                </form>
            </Container>
        </div>
    );
}

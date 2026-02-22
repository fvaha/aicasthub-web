"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Badge, Input, Label, Textarea, Tooltip, TooltipProvider } from '@medusajs/ui';
import { ShieldCheck, CheckCircleSolid, CurrencyDollar, LockClosedSolid, ChatBubble } from '@medusajs/icons';
import { Navbar } from '@/components/navbar';

const PUBLISHABLE_KEY = "pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa";

export default function EscrowBookingPage() {
    const router = useRouter();
    const params = useParams();
    const actorId = params.id as string;
    const [user, setUser] = useState<any>(null);
    const [model, setModel] = useState<any>(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [projectDetails, setProjectDetails] = useState('');

    const [config, setConfig] = useState<any>(null);

    // Fetch current user
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }
    }, []);

    // Fetch platform config
    useEffect(() => {
        fetch('/api/medusa/store/platform-config', {
            headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => setConfig(data.config))
            .catch(err => console.error("Config fetch error:", err));
    }, []);

    // Fetch real product/actor data from Medusa
    useEffect(() => {
        if (!actorId) return;
        fetch(`/api/medusa/store/products/${actorId}?fields=*categories,*variants.prices,*metadata`, {
            headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
        })
            .then(res => res.json())
            .then(data => {
                const p = data.product;
                if (p) {
                    const variant = p.variants?.[0];
                    const priceObj = variant?.prices?.find((pr: any) => pr.currency_code === 'eur') || variant?.prices?.[0];
                    setModel({
                        id: p.id,
                        name: p.title,
                        category: p.categories?.[0]?.name || "AI Talent",
                        price: priceObj?.amount || 0,
                        currency: priceObj?.currency_code?.toUpperCase() || "EUR",
                        description: p.description,
                        image: p.thumbnail || p.images?.[0]?.url,
                        seller_id: p.metadata?.seller_id || 'seller-1',
                        tier: p.metadata?.tier || 'none',
                    });
                }
                setLoadingProduct(false);
            })
            .catch(err => {
                console.error("Error fetching product:", err);
                setLoadingProduct(false);
            });
    }, [actorId]);

    const calculateFees = () => {
        if (!model || !config) return { platform: 0, escrow: 0, total: model?.price || 0 };
        const tier = config.tiers[model.tier] || config.tiers['none'];
        const platform = model.price * (tier.platform_fee_pct / 100);
        const escrow = model.price * (tier.escrow_fee_pct / 100);
        return { platform, escrow, total: model.price + platform + escrow };
    }

    const { platform, escrow, total } = calculateFees();

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!model) return;
        setIsProcessing(true);

        try {
            const res = await fetch('/api/medusa/store/custom-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-publishable-api-key': PUBLISHABLE_KEY
                },
                body: JSON.stringify({
                    customer_id: user?.id || 'guest',
                    customer_email: user?.email, // fallback to resolve real Medusa ID
                    unit_price: total, // THE BUYER PAYS THE TOTAL (BASE + FEES)
                    items: [{ title: model.name, unit_price: total, quantity: 1, thumbnail: model.image }],
                    metadata: {
                        project_details: projectDetails,
                        escrow_status: 'funded',
                        actor_id: actorId,
                        seller_id: model.seller_id,
                        deliver_status: 'pending',
                        buyer_email: user?.email,
                        base_price: model.price,
                        platform_fee: platform,
                        escrow_fee: escrow,
                        tier_applied: model.tier
                    }
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.order?.id) {
                    sessionStorage.setItem('new_order_id', data.order.id);
                }
                router.push('/dashboard/buyer/messages');
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error("Booking API error:", errData);
                alert(`Booking failed: ${errData.message || "Internal Server Error"}. Check console for details.`);
                setIsProcessing(false);
            }
        } catch (err) {
            console.error("Booking failed", err);
            alert("Network error or server is down. Please try again later.");
            setIsProcessing(false);
        }
    };

    if (loadingProduct) {
        return (
            <div className="min-h-screen bg-ui-bg-base flex flex-col items-center">
                <Navbar />
                <div className="flex items-center justify-center flex-1 mt-32">
                    <Text className="text-ui-fg-subtle animate-pulse">Syncing with Medusa Cloud...</Text>
                </div>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="min-h-screen bg-ui-bg-base flex flex-col items-center">
                <Navbar />
                <div className="flex flex-col items-center justify-center flex-1 mt-32 gap-4">
                    <Text className="text-ui-fg-subtle">Actor not found.</Text>
                    <Button variant="secondary" onClick={() => router.push('/actors')}>Back to Catalog</Button>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-ui-bg-base flex flex-col items-center pb-20">
                <Navbar />
                <div className="max-w-5xl mx-auto w-full px-6 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="flex flex-col gap-8">
                        <div>
                            <Badge color="green" className="mb-4 shadow-sm py-1 px-3"><ShieldCheck className="h-4 w-4 mr-1.5" /> SECURE ESCROW CONTRACT ACTIVE</Badge>
                            <Heading level="h1" className="text-4xl font-extrabold text-ui-fg-base tracking-tight mb-3">Deposit to Escrow</Heading>
                            <Text className="text-ui-fg-subtle text-lg leading-relaxed">
                                Complete your payment for <strong>{model.name}</strong>. Funds are locked safely and only released when you are happy with the delivery.
                            </Text>
                        </div>

                        <form onSubmit={handlePayment} className="flex flex-col gap-6">
                            <Container className="p-6 flex flex-col gap-4 shadow-elevation-card-rest">
                                <Heading level="h2" className="text-lg font-bold text-ui-fg-base border-b border-ui-border-base pb-3">1. Project Requirements</Heading>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="project-details" className="text-ui-fg-subtle font-semibold">Project Script / Instructions</Label>
                                    <Textarea
                                        id="project-details"
                                        placeholder={`Example: I need ${model.name} to present my company introduction...`}
                                        required
                                        className="h-32 bg-ui-bg-subtle/30"
                                        value={projectDetails}
                                        onChange={(e) => setProjectDetails(e.target.value)}
                                    />
                                </div>
                            </Container>

                            <Container className="p-6 flex flex-col gap-4 border-ui-border-interactive shadow-elevation-card-hover bg-ui-bg-subtle relative overflow-hidden transition-all">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-ui-bg-interactive rounded-bl-full opacity-5 pointer-events-none transition-transform group-hover:scale-110"></div>

                                <Heading level="h2" className="text-lg font-bold text-ui-fg-base border-b border-ui-border-base pb-3 flex items-center gap-2">
                                    <LockClosedSolid className="text-ui-fg-interactive" /> 2. Checkout Payment
                                </Heading>

                                <div className="p-4 bg-ui-bg-base border border-ui-border-base rounded-lg flex flex-col gap-4 shadow-inner">
                                    <div className="flex gap-4">
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            <Label className="text-[10px] text-ui-fg-muted font-bold tracking-widest uppercase">Card Number</Label>
                                            <Input placeholder="1234 5678 9101 1121" required className="h-10" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-[10px] text-ui-fg-muted font-bold tracking-widest uppercase">Expiry Date</Label>
                                            <Input placeholder="MM/YY" required className="h-10" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-[10px] text-ui-fg-muted font-bold tracking-widest uppercase">CVC</Label>
                                            <Input type="password" placeholder="123" required className="h-10" />
                                        </div>
                                    </div>
                                </div>

                                <Button variant="primary" type="submit" isLoading={isProcessing} className="w-full mt-2 h-14 text-lg font-bold shadow-lg">
                                    Fund Project — {model.currency} {(total / 100).toFixed(2)}
                                </Button>
                                <div className="flex items-center justify-center gap-2 mt-2 opacity-70">
                                    <CheckCircleSolid className="h-3 w-3 text-green-600" />
                                    <Text className="text-[10px] text-center text-ui-fg-subtle">
                                        Encrypted by Medusa Core & Stripe. Creator receives funds on delivery.
                                    </Text>
                                </div>
                            </Container>
                        </form>
                    </div>

                    <div className="flex flex-col gap-6">
                        <Container className="p-6 sticky top-24 shadow-elevation-card-rest border border-ui-border-base">
                            <Heading level="h2" className="text-lg font-bold text-ui-fg-base mb-6 border-b border-ui-border-base pb-3">Order Summary</Heading>
                            <div className="flex gap-4 p-4 border border-ui-border-base rounded-xl bg-ui-bg-subtle mb-8 shadow-inner">
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-ui-bg-base shrink-0 shadow-sm">
                                    {model.image && <img src={model.image} alt={model.name} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <Heading level="h3" className="text-lg font-bold text-ui-fg-base leading-tight mb-1">{model.name}</Heading>
                                    <div className="flex items-center gap-1.5">
                                        <Badge color="grey" size="small">{model.category}</Badge>
                                        {model.tier !== 'none' && <Badge color="orange" size="small">Verified {model.tier.charAt(0).toUpperCase() + model.tier.slice(1)}</Badge>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 pb-6 border-b border-ui-border-base">
                                <div className="justify-between flex items-center text-sm">
                                    <Text className="text-ui-fg-subtle font-medium">Model Booking Rate</Text>
                                    <Text className="text-ui-fg-base font-bold">{model.currency} {(model.price / 100).toFixed(2)}</Text>
                                </div>
                                <div className="justify-between flex items-center text-sm group">
                                    <div className="flex items-center gap-1.5">
                                        <Text className="text-ui-fg-subtle font-medium">Platform Fee</Text>
                                        <Tooltip content="Infrastructure costs and platform support">
                                            <Badge color="grey" rounded="full" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">?</Badge>
                                        </Tooltip>
                                    </div>
                                    <Text className="text-ui-fg-interactive font-bold">+ {model.currency} {(platform / 100).toFixed(2)}</Text>
                                </div>
                                <div className="justify-between flex items-center text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Text className="text-ui-fg-subtle font-medium">Secure Escrow Service</Text>
                                        <Tooltip content="Protects your funds until delivery is verified">
                                            <Badge color="blue" rounded="full" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">✓</Badge>
                                        </Tooltip>
                                    </div>
                                    <Text className="text-blue-600 font-bold">+ {model.currency} {(escrow / 100).toFixed(2)}</Text>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-6 mb-8 bg-ui-bg-subtle/30 -mx-6 px-6">
                                <div className="flex flex-col">
                                    <Heading level="h2" className="text-sm font-bold text-ui-fg-muted uppercase tracking-widest">Total to Fund</Heading>
                                    <Text className="text-[10px] text-ui-fg-muted italic">Incl. all taxes & fees</Text>
                                </div>
                                <Heading level="h2" className="text-3xl font-black text-ui-fg-base leading-none">{model.currency} {(total / 100).toFixed(2)}</Heading>
                            </div>

                            <div className="bg-ui-bg-base border border-ui-border-base p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <ChatBubble className="text-blue-600 h-4 w-4" />
                                    </div>
                                    <div>
                                        <Text className="text-sm font-bold text-ui-fg-base mb-1">Live Collaboration</Text>
                                        <Text className="text-xs text-ui-fg-subtle leading-relaxed">
                                            After funding, you'll enter a private studio to chat with the creator and provide feedback.
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}


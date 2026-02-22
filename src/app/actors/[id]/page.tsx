"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Badge } from '@medusajs/ui';
import { Star, ShieldCheck, ChatBubble, ArrowRight, Sparkles, CheckCircleSolid, PlayMiniSolid } from '@medusajs/icons';
import { Navbar } from '@/components/navbar';

const PUBLISHABLE_KEY = "pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa";

const SAMPLE_PORTFOLIO = [
    { label: "Commercial Ad", desc: "30s brand spot for a tech startup" },
    { label: "Social Campaign", desc: "Instagram video series × 12 episodes" },
    { label: "Film Narration", desc: "Documentary voiceover, 18 min" },
];

const SAMPLE_REVIEWS = [
    { name: "Sarah K.", rating: 5, text: "Incredible quality — delivered ahead of schedule. The AI actor captured the brand voice perfectly.", date: "Jan 2026" },
    { name: "Marco D.", rating: 5, text: "We saved 3 weeks of production time using this AI actor. Stunning realism.", date: "Dec 2025" },
    { name: "Li Wei", rating: 4, text: "Very professional. Minor revisions needed but overall outstanding work.", date: "Nov 2025" },
];

export default function ActorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const actorId = params.id as string;
    const [model, setModel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews'>('about');
    const [portfolioItems, setPortfolioItems] = useState<any[]>([]);

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
                        description: p.description || "A premium AI actor available for commercial, fashion, and creative projects. Trained on thousands of hours of authentic performance data for maximum realism.",
                        category: p.categories?.[0]?.name || "AI Talent",
                        price: priceObj?.amount || 0,
                        currency: priceObj?.currency_code?.toUpperCase() || "EUR",
                        rating: p.metadata?.rating || 5.0,
                        tier: p.metadata?.tier || 'none',
                        image: p.thumbnail || p.images?.[0]?.url,
                        seller_id: p.metadata?.seller_id || 'seller-1',
                        completedProjects: p.metadata?.completed_jobs || Math.floor(Math.random() * 80) + 20,
                        responseTime: "~2 hours",
                        languages: ["English", "Spanish", "French"],
                        specialties: ["Commercial", "Fashion", "Voice-over", "Social Media"],
                        positive_reviews: p.metadata?.positive_reviews_count || 0,
                        negative_reviews: p.metadata?.negative_reviews_count || 0,
                        total_reviews: p.metadata?.total_reviews || 0,
                        gender: p.metadata?.gender || 'Any',
                        age: p.metadata?.age || 'Any',
                        style: p.metadata?.style || 'Realistic',
                        resolution: p.metadata?.resolution || '4K',
                        speed: p.metadata?.speed || 'Standard',
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));

        fetch(`/api/medusa/store/products/${actorId}/portfolio`, {
            headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
        })
            .then(res => res.json())
            .then(data => {
                if (data.portfolio) setPortfolioItems(data.portfolio);
            })
            .catch(console.error);

    }, [actorId]);

    const getTierBadge = (tier: string) => {
        if (tier === 'gold') return <Badge color="orange"><Sparkles /> Gold Featured</Badge>;
        if (tier === 'silver') return <Badge color="grey"><Sparkles /> Silver Pick</Badge>;
        if (tier === 'bronze') return <Badge color="orange"><Sparkles /> Bronze</Badge>;
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-ui-bg-base flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Text className="text-ui-fg-subtle animate-pulse">Loading actor profile…</Text>
                </div>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="min-h-screen bg-ui-bg-base flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Text className="text-ui-fg-subtle">Actor not found.</Text>
                    <Button variant="secondary" onClick={() => router.push('/actors')}>Back to Catalog</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ui-bg-base flex flex-col">
            <Navbar />

            {/* Hero Banner */}
            <div className="relative w-full h-72 overflow-hidden bg-ui-bg-subtle">
                {model.image && (
                    <img src={model.image} alt={model.name} className="w-full h-full object-cover object-top" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ui-bg-base via-ui-bg-base/40 to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto w-full px-6 pb-24 -mt-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Profile */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Profile Header */}
                        <div className="flex items-end gap-6">
                            <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-ui-bg-base shadow-elevation-card-hover shrink-0">
                                {model.image && <img src={model.image} alt={model.name} className="w-full h-full object-cover object-top" />}
                            </div>
                            <div className="pb-2">
                                {model.tier !== 'none' && getTierBadge(model.tier)}
                                <Heading level="h1" className="text-3xl font-extrabold text-ui-fg-base mt-1">{model.name}</Heading>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <Badge color="green" className="text-xs flex items-center gap-1">
                                        👍 {model.positive_reviews}
                                    </Badge>
                                    <Badge color="red" className="text-[10px] flex items-center gap-1">
                                        👎 {model.negative_reviews}
                                    </Badge>
                                    <Text className="text-ui-fg-subtle text-sm">· {model.category}</Text>
                                    <Text className="text-ui-fg-subtle text-sm">·</Text>
                                    <Text className="text-ui-fg-subtle text-sm">✓ {model.completedProjects} projects done</Text>
                                </div>
                            </div>
                        </div>

                        {/* Tab Bar */}
                        <div className="flex gap-1 border-b border-ui-border-base">
                            {(['about', 'portfolio', 'reviews'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab
                                        ? 'border-ui-border-interactive text-ui-fg-base'
                                        : 'border-transparent text-ui-fg-subtle hover:text-ui-fg-base'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'about' && (
                            <Container className="p-6 flex flex-col gap-5">
                                <div>
                                    <Heading level="h2" className="text-lg font-bold mb-2">About this AI Actor</Heading>
                                    <Text className="text-ui-fg-subtle leading-relaxed">{model.description}</Text>
                                </div>
                                <div className="bg-ui-bg-subtle p-4 rounded-xl border border-ui-border-base">
                                    <Heading level="h3" className="text-sm font-semibold text-ui-fg-base mb-4">Actor Specifications</Heading>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-2">
                                        <div className="flex flex-col gap-0.5">
                                            <Text className="text-[10px] uppercase tracking-wider font-bold text-ui-fg-muted">Gender</Text>
                                            <Text className="text-sm font-semibold">{model.gender}</Text>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <Text className="text-[10px] uppercase tracking-wider font-bold text-ui-fg-muted">Age Group</Text>
                                            <Text className="text-sm font-semibold">{model.age}</Text>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <Text className="text-[10px] uppercase tracking-wider font-bold text-ui-fg-muted">Visual Style</Text>
                                            <Text className="text-sm font-semibold">{model.style}</Text>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <Text className="text-[10px] uppercase tracking-wider font-bold text-ui-fg-muted">Max Resolution</Text>
                                            <Text className="text-sm font-semibold">{model.resolution}</Text>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <Text className="text-[10px] uppercase tracking-wider font-bold text-ui-fg-muted">Delivery Speed</Text>
                                            <Text className="text-sm font-semibold">{model.speed}</Text>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Heading level="h3" className="text-sm font-semibold text-ui-fg-muted uppercase tracking-wider mb-3">Specialties</Heading>
                                    <div className="flex flex-wrap gap-2">
                                        {model.specialties.map((s: string) => (
                                            <Badge key={s} color="blue">{s}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Heading level="h3" className="text-sm font-semibold text-ui-fg-muted uppercase tracking-wider mb-3">Languages</Heading>
                                    <div className="flex flex-wrap gap-2">
                                        {model.languages.map((l: string) => (
                                            <Badge key={l} color="grey">{l}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-ui-border-base">
                                    <div className="text-center">
                                        <Text className="text-2xl font-bold text-ui-fg-base">{model.completedProjects}+</Text>
                                        <Text className="text-xs text-ui-fg-subtle">Projects Done</Text>
                                    </div>
                                    <div className="text-center">
                                        <Text className="text-2xl font-bold text-ui-fg-base">{model.rating}</Text>
                                        <Text className="text-xs text-ui-fg-subtle">Avg. Rating</Text>
                                    </div>
                                    <div className="text-center">
                                        <Text className="text-2xl font-bold text-ui-fg-base">{model.responseTime}</Text>
                                        <Text className="text-xs text-ui-fg-subtle">Avg. Response</Text>
                                    </div>
                                </div>
                            </Container>
                        )}

                        {activeTab === 'portfolio' && (
                            <div className="flex flex-col gap-4">
                                {portfolioItems.length === 0 ? (
                                    <div className="p-8 text-center bg-ui-bg-subtle/50 rounded-xl border border-ui-border-base border-dashed flex flex-col items-center">
                                        <PlayMiniSolid className="w-8 h-8 text-ui-fg-muted mb-2 shadow-sm" />
                                        <Text className="text-ui-fg-base font-semibold">No finished projects yet</Text>
                                        <Text className="text-sm text-ui-fg-subtle">Check back later or be the first to book.</Text>
                                    </div>
                                ) : (
                                    portfolioItems.map((item: any, i: number) => (
                                        <Container key={i} className="p-0 overflow-hidden flex flex-col md:flex-row shadow-sm group border-ui-border-base hover:border-ui-border-strong transition-all">
                                            <div className="md:w-1/3 bg-black flex items-center justify-center relative min-h-[160px]">
                                                {item.delivery_type && item.delivery_type.startsWith('video') ? (
                                                    <video src={item.delivery} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" controls />
                                                ) : item.delivery ? (
                                                    <img src={item.delivery} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                ) : (
                                                    <PlayMiniSolid className="text-ui-fg-muted" />
                                                )}
                                                <Badge color="green" size="small" className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white border-0">Delivered</Badge>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col gap-2">
                                                <Text className="text-xs text-ui-fg-muted font-bold tracking-widest uppercase">What was requested:</Text>
                                                <Text className="text-sm text-ui-fg-subtle italic border-l-2 border-ui-border-interactive pl-3 line-clamp-3">"{item.request}"</Text>
                                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-ui-border-base border-dashed">
                                                    <Text className="text-[10px] text-ui-fg-muted">Project completed globally securely.</Text>
                                                    {item.review && (
                                                        <Badge color={item.review.rating === 'positive' ? 'green' : 'red'}>
                                                            {item.review.rating === 'positive' ? <>👍 Buyer Approved</> : <>👎 Poor outcome</>}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </Container>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-6 p-6 bg-ui-bg-subtle rounded-xl border border-ui-border-base">
                                    <div className="flex flex-col gap-1 items-center">
                                        <Heading level="h1" className="text-4xl text-green-600 font-black">{model.positive_reviews}</Heading>
                                        <Text className="text-[10px] uppercase font-bold text-ui-fg-muted flex items-center gap-1">👍 Great Jobs</Text>
                                    </div>
                                    <div className="w-px h-12 bg-ui-border-strong"></div>
                                    <div className="flex flex-col gap-1 items-center">
                                        <Heading level="h1" className="text-4xl text-red-600 font-black">{model.negative_reviews}</Heading>
                                        <Text className="text-[10px] uppercase font-bold text-ui-fg-muted flex items-center gap-1">👎 Poor Jobs</Text>
                                    </div>
                                    <div className="ml-auto">
                                        <Text className="text-sm font-semibold text-ui-fg-subtle italic flex flex-col items-end">
                                            <span className="text-ui-fg-base font-bold">{model.total_reviews} verified reviews.</span>
                                            <span>Scores are permanent. No deletions allowed.</span>
                                        </Text>
                                    </div>
                                </div>

                                {portfolioItems.filter(p => p.review).length === 0 ? (
                                    <Text className="text-sm text-center italic text-ui-fg-muted mt-8">No formal reviews received yet.</Text>
                                ) : (
                                    portfolioItems.filter(p => p.review).map((r, i) => (
                                        <Container key={i} className="p-5 flex flex-col gap-3 group hover:border-ui-border-strong transition-all">
                                            <div className="flex justify-between items-center pb-2 border-b border-ui-border-base border-dashed">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-ui-bg-base border border-ui-border-strong text-ui-fg-base flex items-center justify-center text-xs font-bold shrink-0">
                                                        B
                                                    </div>
                                                    <div>
                                                        <Text className="font-semibold text-sm">Verified Buyer</Text>
                                                        <Text className="text-[10px] text-ui-fg-muted">{new Date(r.review.date).toLocaleDateString()}</Text>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 items-center bg-ui-bg-subtle px-2 py-1 rounded">
                                                    {r.review.rating === 'positive' ? (
                                                        <>👍 <Text className="text-xs text-green-700 font-bold">Good</Text></>
                                                    ) : (
                                                        <>👎 <Text className="text-xs text-red-700 font-bold">Bad</Text></>
                                                    )}
                                                </div>
                                            </div>
                                            <Text className="text-sm text-ui-fg-base leading-relaxed break-words">{r.review.comment}</Text>

                                        </Container>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Booking Card */}
                    <div className="flex flex-col gap-4">
                        <Container className="p-6 flex flex-col gap-5 sticky top-24">
                            <div>
                                <Text className="text-xs text-ui-fg-muted uppercase tracking-wider font-medium">Project Rate</Text>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <Heading level="h1" className="text-3xl font-extrabold text-ui-fg-base">
                                        {model.currency} {(model.price / 100).toFixed(2)}
                                    </Heading>
                                    <Text className="text-ui-fg-subtle text-sm">/ project</Text>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full h-12 text-base font-semibold"
                                onClick={() => router.push(`/actors/${actorId}/book`)}
                            >
                                <ShieldCheck /> Book with Escrow
                            </Button>

                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => router.push('/auth')}
                            >
                                <ChatBubble /> Message First
                            </Button>

                            <div className="flex flex-col gap-3 pt-3 border-t border-ui-border-base text-sm text-ui-fg-subtle">
                                <div className="flex items-center gap-2">
                                    <CheckCircleSolid className="text-green-500 shrink-0" />
                                    <Text className="text-xs">Funds held in escrow until delivery approved</Text>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleSolid className="text-green-500 shrink-0" />
                                    <Text className="text-xs">Full refund if project is not delivered</Text>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleSolid className="text-green-500 shrink-0" />
                                    <Text className="text-xs">Respond time: {model.responseTime}</Text>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleSolid className="text-green-500 shrink-0" />
                                    <Text className="text-xs">Commercial license included</Text>
                                </div>
                            </div>
                        </Container>

                        {/* Trust Badge */}
                        <Container className="p-4 flex items-center gap-3 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                            <ShieldCheck className="text-green-600 shrink-0" />
                            <div>
                                <Text className="text-xs font-semibold text-green-700 dark:text-green-400">AICastHub Verified Actor</Text>
                                <Text className="text-[10px] text-green-600/80 dark:text-green-500/60">Tested, verified, and protected by our platform guarantee.</Text>
                            </div>
                        </Container>
                    </div>
                </div>
            </div>
        </div>
    );
}

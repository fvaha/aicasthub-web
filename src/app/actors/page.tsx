"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Badge, Input } from '@medusajs/ui';
import { MagnifyingGlass, Funnel, Star, Sparkles } from '@medusajs/icons';
import { Navbar } from '@/components/navbar';
import { useTranslation } from '../../providers/i18n-provider';

export default function ActorsPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        category: '',
        gender: '',
        age: '',
        style: '',
        resolution: '',
        speed: ''
    });

    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        // Fetch platform fees
        fetch('/api/medusa/store/platform-config', {
            headers: { 'x-publishable-api-key': 'pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa' }
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => setConfig(data.config))
            .catch(err => console.error("Config fetch error:", err));

        fetch('/api/medusa/store/products?fields=*categories,*variants.prices,*metadata', {
            headers: {
                'x-publishable-api-key': 'pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa'
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (data.products) {
                    const mapped = data.products
                        .filter((p: any) => !p.metadata?.is_subscription) // Filter out the invisible promotion packages
                        .map((p: any) => {
                            const variant = p.variants?.[0];
                            const priceObj = variant?.prices?.find((pr: any) => pr.currency_code === 'eur') || variant?.prices?.[0];

                            return {
                                id: p.id,
                                name: p.title,
                                category: p.categories?.[0]?.name || "AI Talent",
                                price: priceObj?.amount || 0,
                                currency: priceObj?.currency_code?.toUpperCase() || "EUR",
                                rating: p.metadata?.rating || 5.0,
                                tier: p.metadata?.tier || 'none',
                                image_url: p.thumbnail || (p.images?.[0]?.url),
                                gender: p.metadata?.gender || 'Any',
                                age: p.metadata?.age || 'Any',
                                style: p.metadata?.style || 'Realistic',
                                resolution: p.metadata?.resolution || '4K',
                                speed: p.metadata?.speed || 'Standard',
                                completed_jobs: p.metadata?.completed_jobs || 0,
                                positive_reviews: p.metadata?.positive_reviews || 100
                            };
                        });

                    // Sort models by tier priority: gold > silver > bronze > none
                    const tierPriority: Record<string, number> = { gold: 4, silver: 3, bronze: 2, none: 1 };
                    const sorted = mapped.sort((a: any, b: any) => {
                        const prioA = tierPriority[a.tier] || 0;
                        const prioB = tierPriority[b.tier] || 0;
                        if (prioA !== prioB) return prioB - prioA;
                        return a.name.localeCompare(b.name);
                    });

                    setModels(sorted);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching AI products for catalog:", err);
                setModels([]); // Set empty on error to avoid broken states
                setLoading(false);
            });
    }, []);

    const calculateTotal = (base: number, tierKey: string) => {
        if (!config) return { total: base, platform: 0, escrow: 0 };
        const tier = config.tiers[tierKey] || config.tiers['none'];
        const platform = base * (tier.platform_fee_pct / 100);
        const escrow = base * (tier.escrow_fee_pct / 100);
        return { total: base + platform + escrow, platform, escrow };
    }

    const getTierBadge = (tier: string) => {
        switch (tier) {
            case 'gold': return <Badge color="orange" className="shadow-sm"><Sparkles /> {t('actors.gold')}</Badge>;
            case 'silver': return <Badge color="grey" className="shadow-sm"><Sparkles /> {t('actors.silver')}</Badge>;
            case 'bronze': return <Badge color="orange" className="shadow-sm"><Sparkles /> {t('actors.bronze')}</Badge>;
            default: return null;
        }
    }

    return (
        <div className="min-h-screen bg-ui-bg-base flex flex-col items-center">
            <Navbar />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 mt-8 p-6 w-full">
                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
                    <Container className="p-4 flex gap-2 items-center justify-between">
                        <div className="flex gap-2 items-center"><Funnel /> <Text weight="plus">{t('actors.filters')}</Text></div>
                        {Object.values(filters).some(v => v !== '') && (
                            <Text className="text-[10px] text-ui-fg-interactive cursor-pointer hover:underline" onClick={() => setFilters({ category: '', gender: '', age: '', style: '', resolution: '', speed: '' })}>Clear All</Text>
                        )}
                    </Container>
                    <div className="flex flex-col gap-4">
                        <Container>
                            <Heading level="h3" className="mb-2 text-ui-fg-base text-sm font-semibold">{t('actors.category')}</Heading>
                            <div className="flex flex-col gap-1.5">
                                {['Fashion & Lifestyle', 'Commercials & TV', 'Voice Synthesis', 'Virtual Influencers'].map(cat => (
                                    <Text key={cat} onClick={() => setFilters({ ...filters, category: filters.category === cat ? '' : cat })} className={`text-sm cursor-pointer border-l-2 pl-2 transition-all ${filters.category === cat ? 'text-ui-fg-interactive border-ui-border-interactive font-semibold' : 'text-ui-fg-subtle border-transparent hover:text-ui-fg-base hover:border-ui-border-strong'}`}>{cat}</Text>
                                ))}
                            </div>
                        </Container>

                        <Container>
                            <Heading level="h3" className="mb-2 text-ui-fg-base text-sm font-semibold">{t('actors.gender')}</Heading>
                            <div className="flex flex-col gap-1.5">
                                {['Female', 'Male', 'Stylized/Creature'].map(gender => (
                                    <Text key={gender} onClick={() => setFilters({ ...filters, gender: filters.gender === gender ? '' : gender })} className={`text-sm cursor-pointer border-l-2 pl-2 transition-all ${filters.gender === gender ? 'text-ui-fg-interactive border-ui-border-interactive font-semibold' : 'text-ui-fg-subtle border-transparent hover:text-ui-fg-base hover:border-ui-border-strong'}`}>{gender}</Text>
                                ))}
                            </div>
                        </Container>

                        <Container>
                            <Heading level="h3" className="mb-2 text-ui-fg-base text-sm font-semibold">Age Group</Heading>
                            <div className="flex flex-col gap-1.5">
                                {['Young', 'Adult', 'Senior'].map(age => (
                                    <Text key={age} onClick={() => setFilters({ ...filters, age: filters.age === age ? '' : age })} className={`text-sm cursor-pointer border-l-2 pl-2 transition-all ${filters.age === age ? 'text-ui-fg-interactive border-ui-border-interactive font-semibold' : 'text-ui-fg-subtle border-transparent hover:text-ui-fg-base hover:border-ui-border-strong'}`}>{age}</Text>
                                ))}
                            </div>
                        </Container>

                        <Container>
                            <Heading level="h3" className="mb-2 text-ui-fg-base text-sm font-semibold">Visual Style</Heading>
                            <div className="flex flex-col gap-1.5">
                                {['Realistic', 'Cartoon', 'Anime', 'Cinematic'].map(style => (
                                    <Text key={style} onClick={() => setFilters({ ...filters, style: filters.style === style ? '' : style })} className={`text-sm cursor-pointer border-l-2 pl-2 transition-all ${filters.style === style ? 'text-ui-fg-interactive border-ui-border-interactive font-semibold' : 'text-ui-fg-subtle border-transparent hover:text-ui-fg-base hover:border-ui-border-strong'}`}>{style}</Text>
                                ))}
                            </div>
                        </Container>

                        <Container>
                            <Heading level="h3" className="mb-2 text-ui-fg-base text-sm font-semibold">Max Resolution</Heading>
                            <div className="flex flex-col gap-1.5">
                                {['1080p', '4K', '8K'].map(res => (
                                    <Text key={res} onClick={() => setFilters({ ...filters, resolution: filters.resolution === res ? '' : res })} className={`text-sm cursor-pointer border-l-2 pl-2 transition-all ${filters.resolution === res ? 'text-ui-fg-interactive border-ui-border-interactive font-semibold' : 'text-ui-fg-subtle border-transparent hover:text-ui-fg-base hover:border-ui-border-strong'}`}>{res}</Text>
                                ))}
                            </div>
                        </Container>

                        <Container>
                            <Heading level="h3" className="mb-2 text-ui-fg-base text-sm font-semibold">Delivery Speed</Heading>
                            <div className="flex flex-col gap-1.5">
                                {['24h Delivery', '48h Delivery', 'Standard'].map(speed => (
                                    <Text key={speed} onClick={() => setFilters({ ...filters, speed: filters.speed === speed ? '' : speed })} className={`text-sm cursor-pointer border-l-2 pl-2 transition-all ${filters.speed === speed ? 'text-ui-fg-interactive border-ui-border-interactive font-semibold' : 'text-ui-fg-subtle border-transparent hover:text-ui-fg-base hover:border-ui-border-strong'}`}>{speed}</Text>
                                ))}
                            </div>
                        </Container>
                    </div>
                </aside>

                {/* Catalog */}
                <main className="flex-1 flex flex-col gap-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Input
                                className="w-full bg-ui-bg-subtle/50"
                                type="search"
                                placeholder={t('actors.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-40">
                            <Text className="text-ui-fg-subtle animate-pulse">Syncing with Medusa Cloud...</Text>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {models.filter(m => {
                                if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                                if (filters.category && m.category !== filters.category) return false;
                                if (filters.gender && m.gender !== filters.gender && m.gender !== 'Any') return false;
                                if (filters.age && m.age !== filters.age && m.age !== 'Any') return false;
                                if (filters.style && m.style !== filters.style) return false;
                                if (filters.resolution && m.resolution !== filters.resolution) return false;
                                if (filters.speed && m.speed !== filters.speed) return false;
                                return true;
                            }).map((model) => {
                                const { total, platform, escrow } = calculateTotal(model.price, model.tier);

                                return (
                                    <Container
                                        key={model.id}
                                        className="p-0 overflow-hidden cursor-pointer flex flex-col group relative hover-card-effect transition-all duration-300 hover:border-ui-border-strong hover:shadow-elevation-card-hover border-ui-border-base bg-ui-bg-base"
                                        onClick={() => router.push(`/actors/${model.id}`)}
                                    >
                                        {model.tier !== 'none' && (
                                            <div className="absolute top-3 left-3 z-10 scale-90 origin-top-left transition-transform group-hover:scale-100">
                                                {getTierBadge(model.tier)}
                                            </div>
                                        )}

                                        <div className="h-56 relative overflow-hidden bg-ui-bg-subtle">
                                            <img src={model.image_url} alt={model.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute top-3 right-3 bg-ui-bg-base/90 rounded-md p-1 px-2 border border-ui-border-base shadow-sm backdrop-blur-md flex items-center gap-1">
                                                <Star className="text-yellow-400 h-3 w-3" />
                                                <Text className="text-xs text-ui-fg-base font-bold">{model.rating}</Text>
                                            </div>
                                            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                <Badge color="green" size="small" className="bg-green-500 text-white border-none">Ready for Booking</Badge>
                                            </div>
                                        </div>

                                        <div className="p-4 flex flex-col gap-4">
                                            <div>
                                                <Heading level="h3" className="text-lg text-ui-fg-base font-bold truncate tracking-tight">{model.name}</Heading>
                                                <Text className="text-ui-fg-subtle text-xs truncate bg-ui-bg-subtle inline-block px-1.5 rounded -ml-0.5 mt-1">{model.category}</Text>
                                            </div>

                                            <div className="pt-4 border-t border-ui-border-base flex flex-col gap-3">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex flex-col">
                                                        <Text className="text-[10px] text-ui-fg-muted uppercase font-bold tracking-widest leading-none mb-1">Total Funded Escrow</Text>
                                                        <div className="flex items-baseline gap-1">
                                                            <Text className="text-lg text-ui-fg-base font-extrabold leading-none">{model.currency} {(total / 100).toFixed(2)}</Text>
                                                            <Text className="text-[10px] text-ui-fg-muted">per project</Text>
                                                        </div>
                                                    </div>
                                                    <Button size="small" variant="primary" className="shadow-none" onClick={(e) => { e.stopPropagation(); router.push(`/actors/${model.id}/book`); }}>
                                                        {t('actors.contact')}
                                                    </Button>
                                                </div>

                                                {/* Price Breakdown Preview on Hover */}
                                                <div className="hidden group-hover:flex flex-col gap-1 text-[10px] text-ui-fg-subtle pt-2 border-t border-dashed border-ui-border-base animate-in fade-in slide-in-from-top-1">
                                                    <div className="flex justify-between">
                                                        <span>Base Model Rate:</span>
                                                        <span>{model.currency} {(model.price / 100).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-ui-fg-interactive">
                                                        <span>Platform & Escrow Fees:</span>
                                                        <span>+ {model.currency} {((platform + escrow) / 100).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Container>
                                )
                            })}
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}

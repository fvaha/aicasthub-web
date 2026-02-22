"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Badge, RadioGroup, Label } from '@medusajs/ui';
import { ChartBar, CheckCircleSolid, CurrencyDollar, ChatBubble, Sparkles, UserGroup } from '@medusajs/icons';
import { ThemeToggle } from '../../../../components/theme-toggle';
import { LanguageToggle } from '../../../../components/language-toggle';

export default function PromotionsPage() {
    const router = useRouter();

    const tiers = [
        {
            id: 'bronze',
            name: 'Bronze Sponsored',
            price: '$20',
            period: '/ month',
            color: 'brown',
            features: [
                'Boosted search ranking',
                'Bronze badge on profile',
                'Appears in "More Models" section',
                'Normal customer support'
            ]
        },
        {
            id: 'silver',
            name: 'Silver Featured',
            price: '$50',
            period: '/ month',
            color: 'grey',
            features: [
                'High search visibility',
                'Silver "Featured" badge',
                'Guaranteed Top 3 in 1 category',
                'Priority customer support'
            ],
            recommended: true
        },
        {
            id: 'gold',
            name: 'Gold Promoted',
            price: '$120',
            period: '/ month',
            color: 'orange',
            features: [
                '#1 Spot on Homepage "Trending"',
                'Gold Glow & Crown badge',
                'Unlimited category boosting',
                'Dedicated account manager',
                '0% Payment Escrow Fee'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-ui-bg-subtle flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-ui-border-base bg-ui-bg-base flex flex-col h-screen sticky top-0 shrink-0">
                <div className="p-4 border-b border-ui-border-base flex justify-between items-center cursor-pointer" onClick={() => router.push('/')}>
                    <Heading level="h2" className="text-xl font-bold tracking-tight text-ui-fg-base">
                        AICastHub
                    </Heading>
                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2">
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle" onClick={() => router.push('/dashboard/seller')}>
                        <ChartBar /> Overview
                    </Button>
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle">
                        <UserGroup /> My AI Actors
                    </Button>
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle flex items-center justify-between group" onClick={() => router.push('/dashboard/seller/messages')}>
                        <div className="flex gap-2 items-center"><ChatBubble /> Messages</div>
                        <Badge color="blue" size="small">3</Badge>
                    </Button>
                    <Button variant="transparent" className="justify-start bg-ui-bg-base-hover shadow-elevation-card-rest" onClick={() => router.push('/dashboard/seller/promotions')}>
                        <Sparkles className="text-ui-fg-interactive" /> Promote Actors
                    </Button>
                    <Button variant="transparent" className="justify-start text-ui-fg-subtle mt-auto">
                        <CurrencyDollar /> Payout Settings
                    </Button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto flex flex-col gap-12">
                <header className="mb-4 text-center max-w-2xl mx-auto flex flex-col gap-4">
                    <Badge className="mx-auto" color="blue"><Sparkles /> Promotions</Badge>
                    <Heading level="h1" className="text-4xl font-bold text-ui-fg-base tracking-tight">Skyrocket your Bookings</Heading>
                    <Text className="text-lg text-ui-fg-subtle">
                        Get your AI Actors featured on the homepage and at the top of search results.
                        Sponsored models get up to 5x more clicks from top brands.
                    </Text>
                </header>

                {/* Pricing Tiers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers.map((tier) => (
                        <Container
                            key={tier.id}
                            className={`p-6 flex flex-col gap-6 relative ${tier.recommended ? 'border-ui-border-interactive shadow-elevation-card-hover' : ''}`}
                        >
                            {tier.recommended && (
                                <Badge color="blue" className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                            )}

                            <div>
                                <Heading level="h3" className="text-xl font-bold text-ui-fg-base mb-2">{tier.name}</Heading>
                                <div className="flex items-end gap-1">
                                    <Heading level="h1" className="text-3xl font-extrabold text-ui-fg-base">{tier.price}</Heading>
                                    <Text className="text-ui-fg-muted pb-1">{tier.period}</Text>
                                </div>
                            </div>

                            <div className="w-full h-px bg-ui-border-base"></div>

                            <div className="flex flex-col gap-3 flex-1">
                                {tier.features.map((feature, idx) => (
                                    <div key={idx} className="flex gap-2 items-start">
                                        <CheckCircleSolid className="text-ui-fg-interactive mt-0.5 shrink-0" />
                                        <Text className="text-sm text-ui-fg-subtle">{feature}</Text>
                                    </div>
                                ))}
                            </div>

                            <Button variant={tier.recommended ? 'primary' : 'secondary'} className="w-full justify-center">
                                Select {tier.name.split(' ')[0]}
                            </Button>
                        </Container>
                    ))}
                </div>

                {/* Select Model Section */}
                <Container className="p-8 flex flex-col gap-6">
                    <Heading level="h3" className="text-xl font-bold text-ui-fg-base">Which Actor do you want to promote?</Heading>

                    <RadioGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 border border-ui-border-interactive rounded-md bg-ui-bg-base shadow-elevation-card-rest">
                            <Label htmlFor="model-1" className="flex items-center gap-4 cursor-pointer flex-1">
                                <div className="w-12 h-12 bg-ui-bg-subtle rounded-md overflow-hidden shrink-0">
                                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop" alt="Elena V3" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <Text className="text-ui-fg-base font-semibold">Elena V3</Text>
                                    <Text className="text-ui-fg-subtle text-xs">Currently: Free Tier</Text>
                                </div>
                            </Label>
                            <RadioGroup.Item value="model-1" id="model-1" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-ui-border-base rounded-md hover:bg-ui-bg-base cursor-pointer">
                            <Label htmlFor="model-2" className="flex items-center gap-4 cursor-pointer flex-1">
                                <div className="w-12 h-12 bg-ui-bg-subtle rounded-md overflow-hidden shrink-0">
                                    <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop" alt="Aria" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <Text className="text-ui-fg-base font-semibold">Aria HyperReal</Text>
                                    <Text className="text-ui-fg-subtle text-xs">Currently: Free Tier</Text>
                                </div>
                            </Label>
                            <RadioGroup.Item value="model-2" id="model-2" />
                        </div>
                    </RadioGroup>

                    <div className="mt-4 flex justify-end">
                        <Button variant="primary">Proceed to Checkout</Button>
                    </div>
                </Container>

            </main>
        </div>
    );
}

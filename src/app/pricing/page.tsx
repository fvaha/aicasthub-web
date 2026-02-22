"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Badge } from '@medusajs/ui';
import { CheckCircleSolid, Sparkles } from '@medusajs/icons';
import { Navbar } from '@/components/navbar';

export default function PricingPage() {
    const router = useRouter();

    const plans = [
        {
            name: "Bronze",
            price: "€29",
            description: "Perfect for starters and small creators.",
            features: ["Access to 5 AI Actors", "Standard Support", "Basic Licensing"],
            buttonText: "Join Bronze",
            color: "orange"
        },
        {
            name: "Silver",
            price: "€99",
            description: "Most popular for growing brands.",
            features: ["Access to all Silver Actors", "Priority Support", "Commercial Licensing", "No Watermarks"],
            buttonText: "Join Silver",
            color: "blue",
            premium: true
        },
        {
            name: "Gold",
            price: "€299",
            description: "Unlock the full potential of AI Casting.",
            features: ["Full Catalog Access", "Dedicated Manager", "Unlimited Projects", "Custom AI Training"],
            buttonText: "Go Gold",
            color: "orange"
        }
    ];

    const handleJoinPlan = (plan: string) => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/auth');
            return;
        }
        router.push(`/checkout/subscription?plan=${plan.toLowerCase()}`);
    };

    return (
        <div className="min-h-screen bg-ui-bg-base flex flex-col items-center pb-20">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-20 flex flex-col items-center gap-16 text-center">
                <div className="max-w-2xl flex flex-col gap-4">
                    <Badge color="orange"><Sparkles /> Premium Plans</Badge>
                    <Heading level="h1" className="text-5xl font-extrabold tracking-tight text-ui-fg-base">
                        Choose your membership tier.
                    </Heading>
                    <Text className="text-ui-fg-subtle text-lg">
                        Save up to 40% on hourly rates with our membership tiers.
                    </Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full p-6">
                    {plans.map((plan) => (
                        <Container
                            key={plan.name}
                            className={`p-8 flex flex-col gap-6 relative overflow-hidden flex-1 ${plan.premium ? 'border-ui-border-interactive shadow-elevation-card-hover' : ''}`}
                        >
                            {plan.premium && (
                                <div className="absolute top-0 right-0 bg-ui-bg-interactive text-ui-fg-on-inverted px-3 py-1 text-xs font-bold rounded-bl-lg">
                                    RECOMMENDED
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                <Heading level="h2" className="text-2xl font-bold">{plan.name}</Heading>
                                <div className="flex items-baseline gap-1">
                                    <Heading level="h1" className="text-4xl font-extrabold">{plan.price}</Heading>
                                    <Text className="text-ui-fg-subtle">/month</Text>
                                </div>
                                <Text className="text-ui-fg-subtle text-sm text-left">{plan.description}</Text>
                            </div>

                            <div className="flex flex-col gap-3 text-left">
                                {plan.features.map(f => (
                                    <div key={f} className="flex items-center gap-2 text-sm text-ui-fg-base">
                                        <CheckCircleSolid className="text-ui-fg-interactive" /> {f}
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={plan.premium ? "primary" : "secondary"}
                                className="mt-auto w-full"
                                onClick={() => handleJoinPlan(plan.name)}
                            >
                                {plan.buttonText}
                            </Button>
                        </Container>
                    ))}
                </div>
            </main>
        </div>
    );
}

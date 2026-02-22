"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Badge } from '@medusajs/ui';
import { Sparkles, ArrowRight, PlayMiniSolid } from '@medusajs/icons';
import { Navbar } from '@/components/navbar';
import { useTranslation } from '../providers/i18n-provider';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    // Fetching via Proxy to avoid CORS
    fetch('/api/medusa/store/products?fields=*categories,*variants.prices,*metadata', {
      headers: {
        'x-publishable-api-key': 'pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          const mapped = data.products
            .filter((p: any) => !p.metadata?.is_subscription)
            .map((p: any) => {
              // Find EUR price if available
              const variant = p.variants?.[0];
              const priceObj = variant?.prices?.find((pr: any) => pr.currency_code === 'eur') || variant?.prices?.[0];

              return {
                id: p.id,
                name: p.title,
                category: p.categories?.[0]?.name || "AI Talent",
                price: priceObj?.amount || 0,
                currency: priceObj?.currency_code?.toUpperCase() || "EUR",
                rating: p.metadata?.rating || 5.0,
                image: p.thumbnail || (p.images?.[0]?.url)
              };
            });
          setModels(mapped);
        }
      })
      .catch(err => console.error("Error fetching AI products:", err));
  }, []);

  return (
    <div className="min-h-screen bg-ui-bg-base flex flex-col items-center">
      {/* Navbar Minimal */}
      <Navbar />

      <main className="flex-1 w-full max-w-7xl px-6 py-20 flex flex-col gap-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
          <Badge color="blue" className="mb-2">
            <Sparkles />
            {t('home.badge')}
          </Badge>
          <Heading level="h1" className="text-5xl font-extrabold tracking-tight text-ui-fg-base mb-2">
            {t('home.hero_title')}
          </Heading>
          <Text className="text-ui-fg-subtle text-lg">
            {t('home.hero_subtitle')}
          </Text>
          <div className="flex gap-4 mt-4">
            <Button variant="primary" onClick={() => router.push('/actors')}>
              {t('home.explore')} <ArrowRight />
            </Button>
            <Button variant="secondary" onClick={() => router.push('/auth')}>
              {t('home.get_started')}
            </Button>
          </div>
        </div>

        {/* Featured Models Grid */}
        <div className="flex flex-col gap-6 w-full">
          <div>
            <Heading level="h2" className="text-ui-fg-base font-bold text-2xl">{t('home.trending')}</Heading>
            <Text className="text-ui-fg-subtle">{t('home.trending_sub')}</Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.length > 0 ? models.map((model) => (
              <Container key={model.id} className="p-0 overflow-hidden cursor-pointer flex flex-col hover:border-ui-border-strong transition-colors hover-card-effect" onClick={() => router.push(`/actors/${model.id}`)}>
                <div className="h-48 relative overflow-hidden bg-ui-bg-subtle">
                  <img src={model.image} alt={model.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Heading level="h3" className="text-base text-ui-fg-base font-semibold">{model.name}</Heading>
                      <Text className="text-ui-fg-subtle text-sm">{model.category}</Text>
                    </div>
                    <Badge color="green">★ {model.rating}</Badge>
                  </div>
                  <div className="pt-3 border-t border-ui-border-base flex justify-between items-center mt-auto">
                    <div>
                      <Text className="text-ui-fg-subtle text-xs">{t('home.starting_from')}</Text>
                      <Text className="text-ui-fg-base font-semibold">{model.currency} {(model.price / 100).toFixed(2)}</Text>
                    </div>
                    <Button size="small" variant="secondary" onClick={(e) => { e.stopPropagation(); router.push(`/actors/${model.id}/book`); }}>
                      <PlayMiniSolid /> {t('home.book_actor')}
                    </Button>
                  </div>
                </div>
              </Container>
            )) : (
              <div className="col-span-full text-center py-20">
                <Text className="text-ui-fg-subtle">Loading AI Actors...</Text>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

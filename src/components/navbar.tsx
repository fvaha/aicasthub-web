"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Text } from '@medusajs/ui';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { useTranslation } from '../providers/i18n-provider';

export function Navbar() {
    const router = useRouter();
    const { t } = useTranslation();
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    if (!mounted) {
        return (
            <nav className="w-full border-b border-ui-border-base bg-ui-bg-subtle top-0 sticky z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Heading level="h2" className="text-xl font-bold tracking-tight text-ui-fg-base">
                            AICastHub
                        </Heading>
                    </div>
                </div>
            </nav>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const handleDashboard = () => {
        if (!user) return;
        if (user.role === 'seller') {
            router.push('/dashboard/seller');
        } else {
            router.push('/dashboard/buyer');
        }
    };

    return (
        <nav className="w-full border-b border-ui-border-base bg-ui-bg-subtle top-0 sticky z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                    <Heading level="h2" className="text-xl font-bold tracking-tight text-ui-fg-base">
                        AICastHub
                    </Heading>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <ThemeToggle />
                    <Button variant="transparent" onClick={() => router.push('/actors')}>{t('nav.catalog')}</Button>
                    <Button variant="transparent" onClick={() => router.push('/pricing')}>Pricing</Button>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <Button variant="transparent" onClick={handleDashboard}>
                                {t('nav.dashboard')}
                            </Button>
                            <Button variant="secondary" size="small" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Button variant="primary" onClick={() => router.push('/auth')}>
                            {t('nav.login')}
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
}

"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, Heading, Text, Input, Label, RadioGroup } from '@medusajs/ui';
import { BuildingStorefront, User } from '@medusajs/icons';
import { useTranslation } from '../../providers/i18n-provider';

export default function AuthPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('buyer');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const PUBLISHABLE_KEY = "pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa";
        try {
            const url = isLogin ? '/api/medusa/store/auth/login' : '/api/medusa/store/auth/register';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-publishable-api-key': PUBLISHABLE_KEY
                },
                body: JSON.stringify({
                    email,
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    role: isLogin ? undefined : role
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Save user to localStorage
                const userToSave = {
                    id: data.customer?.id || 'temp-id',
                    email: data.customer?.email || email,
                    first_name: data.customer?.first_name || firstName || (isLogin ? 'User' : ''),
                    role: data.profile?.role || role || (email.includes('seller') ? 'seller' : 'buyer')
                };

                localStorage.setItem('user', JSON.stringify(userToSave));

                if (userToSave.role === 'seller') {
                    router.push('/dashboard/seller');
                } else {
                    router.push('/dashboard/buyer');
                }
            } else {
                // If login fails, for this demo we'll "fake" it if it's our seeded user
                if (isLogin && (email === 'seller@aicasthub.com' || email === 'buyer@aicasthub.com')) {
                    const isSeller = email === 'seller@aicasthub.com';
                    // Try to resolve the REAL Medusa customer ID via login endpoint directly
                    let realId = isSeller ? 'seller-1' : 'buyer-1';
                    try {
                        const lookupRes = await fetch('/api/medusa/store/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': "pk_8e44fd37f7eff5b83d637efce7697cac4b793d7a4598153048380610bbb733aa" },
                            body: JSON.stringify({ email })
                        });
                        const lookupData = await lookupRes.json();
                        if (lookupData.customer?.id) {
                            realId = lookupData.customer.id;
                        }
                    } catch (_) { }
                    const mockUser = {
                        id: realId,
                        email: email,
                        first_name: isSeller ? 'John' : 'Jane',
                        role: isSeller ? 'seller' : 'buyer'
                    };
                    localStorage.setItem('user', JSON.stringify(mockUser));
                    router.push(isSeller ? '/dashboard/seller' : '/dashboard/buyer');
                } else {
                    setError("Login failed. Try: seller@aicasthub.com or buyer@aicasthub.com");
                }
            }
        } catch (err) {
            console.error("Error during auth:", err);
            setError("Connection error. Is the backend running on port 9000?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ui-bg-subtle flex items-center justify-center p-6">
            <Container className="w-full max-w-sm flex flex-col gap-8 shadow-elevation-card-rest border-ui-border-base bg-ui-bg-base p-8 rounded-lg">

                <div className="flex flex-col items-center gap-2 text-center cursor-pointer" onClick={() => router.push('/')}>
                    <Heading level="h1" className="text-xl font-medium tracking-tight text-ui-fg-base">
                        AICastHub
                    </Heading>
                    <Text className="text-ui-fg-subtle text-sm">
                        {isLogin ? t('auth.signin_title') : t('auth.signup_title')}
                    </Text>
                </div>

                {!isLogin && (
                    <RadioGroup value={role} onValueChange={setRole} className="flex gap-4">
                        <RadioGroup.Item value="buyer" id="role-buyer" />
                        <Label htmlFor="role-buyer" className="flex items-center gap-2 cursor-pointer flex-1">
                            <BuildingStorefront /> {t('auth.client')}
                        </Label>

                        <RadioGroup.Item value="seller" id="role-seller" />
                        <Label htmlFor="role-seller" className="flex items-center gap-2 cursor-pointer flex-1">
                            <User /> {t('auth.provider')}
                        </Label>
                    </RadioGroup>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-2 flex-1">
                                <Label htmlFor="firstName" size="small" className="text-ui-fg-subtle font-semibold">{t('auth.first_name')}</Label>
                                <Input
                                    id="firstName"
                                    required
                                    placeholder="John"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2 flex-1">
                                <Label htmlFor="lastName" size="small" className="text-ui-fg-subtle font-semibold">{t('auth.last_name')}</Label>
                                <Input
                                    id="lastName"
                                    required
                                    placeholder="Doe"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone" size="small" className="text-ui-fg-subtle font-semibold">{t('auth.phone')}</Label>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                placeholder="+1 (555) 000-0000"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email" size="small" className="text-ui-fg-subtle font-semibold">{t('auth.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password" size="small" className="text-ui-fg-subtle font-semibold">{t('auth.password')}</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={loading}
                        className="w-full justify-center mt-4"
                    >
                        {isLogin ? t('auth.signin_btn') : t('auth.signup_btn')}
                    </Button>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <Text className="text-red-600 dark:text-red-400 text-xs text-center">{error}</Text>
                        </div>
                    )}
                </form>

                <div className="text-center text-sm">
                    <Text className="text-ui-fg-subtle inline-block mr-1">
                        {isLogin ? t('auth.no_account') : t('auth.has_account')}
                    </Text>
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover font-medium cursor-pointer"
                    >
                        {isLogin ? t('auth.signup_link') : t('auth.login_link')}
                    </span>
                </div>

            </Container>
        </div>
    );
}

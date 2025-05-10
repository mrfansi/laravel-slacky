import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { MessageSquare, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Props {
    auth: {
        user: User;
    };
}

export default function Dashboard({ auth }: Props) {
    // Ensure auth and user are defined
    const userName = auth?.user?.name || 'User';
    const userEmail = auth?.user?.email || '';
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="container py-8 px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome to Slacky, {userName}!</h1>
                    <p className="text-muted-foreground">Your real-time messaging platform for team collaboration</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Channels</CardTitle>
                            <CardDescription>Join or create channels to communicate with your team</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center p-6">
                                <MessageSquare className="h-12 w-12 text-primary" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/channels">View Channels</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Direct Messages</CardTitle>
                            <CardDescription>Send private messages to team members</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center p-6">
                                <Users className="h-12 w-12 text-primary" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/channels">Start Messaging</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Profile</CardTitle>
                            <CardDescription>Manage your account settings and preferences</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center p-6 space-y-2">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xl font-bold text-primary">{userName.split(' ').map(n => n?.[0] || '').join('').toUpperCase()}</span>
                                </div>
                                <p className="font-medium">{userName}</p>
                                <p className="text-sm text-muted-foreground">{userEmail}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/settings/profile">Edit Profile</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

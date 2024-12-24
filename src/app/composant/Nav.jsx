"use client"
import React, { useEffect, useState } from 'react'
import '@flaticon/flaticon-uicons/css/all/all.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Nav() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Récupérer les informations de l'utilisateur au chargement
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            setUser(JSON.parse(currentUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setUser(null);
        router.push('/');
    };

    return (
        <nav className="flex justify-between items-center py-4 pl-10">
            {/* logo */}
            <div>
                <Link href="/">
                    <img className="h-20" src="/logo.png" alt="" />
                </Link>
            </div>

            {/* icons enregistrer et se connecter */}
            <div className="flex items-center gap-10 pr-10">
                {/* Message de bienvenue */}
                {user && (
                    <span className="text-[#eab256] font-medium">
                        Bonjour, {user.name}
                    </span>
                )}
                
                {/* logo enregistrer */}
                <div className="group relative flex items-center gap-2 cursor-pointer">
                    <i className="fi fi-rr-bookmark text-2xl transition-colors duration-300 text-gray-200 group-hover:text-[#c48d3f]"></i>
                    {/* Tooltip */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1a1a1a] text-[#c48d3f] text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg border border-[#2a2a2a]">
                        Ma liste
                    </div>
                </div>

                {/* logo se connecter/déconnecter */}
                {user ? (
                    <div 
                        onClick={handleLogout}
                        className="group relative flex items-center gap-2 cursor-pointer"
                    >
                        <i className="fi fi-rr-sign-out-alt text-2xl transition-colors duration-300 text-gray-200 group-hover:text-[#c48d3f]"></i>
                        {/* Tooltip */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1a1a1a] text-[#c48d3f] text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg border border-[#2a2a2a]">
                            Se déconnecter
                        </div>
                    </div>
                ) : (
                    <div 
                        onClick={() => router.push('/auth')}
                        className="group relative flex items-center gap-2 cursor-pointer"
                    >
                        <i className="fi fi-rr-user text-2xl transition-colors duration-300 text-gray-200 group-hover:text-[#c48d3f]"></i>
                        {/* Tooltip */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1a1a1a] text-[#c48d3f] text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg border border-[#2a2a2a]">
                            Se connecter
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

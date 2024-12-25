'use client'
import { useState, useEffect, useCallback } from 'react'

export default function CarouselCard({ content, type = 'movie', onClick, initialSavedState = false }) {
    const [user, setUser] = useState(null);
    const [isSaved, setIsSaved] = useState(initialSavedState);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            setUser(JSON.parse(currentUser));
        }
    }, []);

    const checkIfSaved = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await fetch(`/api/saved?userId=${user.id}`, {
                headers: {
                    'Cache-Control': 'no-store',
                    'Pragma': 'no-cache'
                }
            });
            if (!response.ok) throw new Error('Erreur réseau');
            
            const data = await response.json();
            const savedItems = type === 'movie' ? data.movies : data.tvShows;
            const isItemSaved = savedItems?.some(item => item.tmdbId === content.id) || false;
            setIsSaved(isItemSaved);
        } catch (error) {
            console.error('Erreur lors de la vérification:', error);
        }
    }, [user, content.id, type]);

    useEffect(() => {
        checkIfSaved();
    }, [checkIfSaved]);

    const handleSaveToggle = async (e) => {
        e.stopPropagation();

        if (!user) {
            window.location.href = '/auth';
            return;
        }

        setIsLoading(true);

        try {
            if (isSaved) {
                const response = await fetch(`/api/saved?userId=${user.id}`);
                if (!response.ok) throw new Error('Erreur réseau');
                
                const data = await response.json();
                const savedItem = (type === 'movie' ? data.movies : data.tvShows)
                    .find(item => item.tmdbId === content.id);

                if (savedItem) {
                    const deleteResponse = await fetch(`/api/saved?type=${type}&id=${savedItem.id}`, {
                        method: 'DELETE'
                    });
                    if (!deleteResponse.ok) throw new Error('Erreur de suppression');
                }
            } else {
                const saveResponse = await fetch('/api/saved', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type,
                        userId: user.id,
                        content
                    })
                });
                if (!saveResponse.ok) throw new Error('Erreur de sauvegarde');
            }

            setIsSaved(!isSaved);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            // Recharger l'état en cas d'erreur
            checkIfSaved();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer"
            onClick={onClick}
        >
            <button
                onClick={handleSaveToggle}
                disabled={isLoading}
                className={`absolute top-2 right-2 z-20 p-2 rounded-full 
                    ${isSaved ? 'bg-[#eab256] text-white' : 'bg-black/50 text-gray-300'} 
                    hover:scale-110 transition-all duration-200
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <i className={`fi ${isSaved ? 'fi-sr-bookmark' : 'fi-rr-bookmark'} text-lg`}></i>
            </button>

            <img 
                src={`https://image.tmdb.org/t/p/w500${content.poster_path}`}
                alt={type === 'movie' ? content.title : content.name}
                className="w-full h-full object-cover"
                loading="lazy"
            />
            
            {/* Overlay au hover */}
            <div className="absolute inset-0 bg-black bg-opacity-80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-xl font-bold text-white mb-2">
                    {type === 'movie' ? content.title : content.name}
                </h3>
                <div className="flex items-center justify-between text-white">
                    <span className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        {(content.vote_average || 0).toFixed(1)}
                    </span>
                    <span>
                        {type === 'movie' 
                            ? (content.release_date ? new Date(content.release_date).getFullYear() : 'N/A')
                            : (content.first_air_date ? new Date(content.first_air_date).getFullYear() : 'N/A')}
                    </span>
                </div>
            </div>
        </div>
    );
}

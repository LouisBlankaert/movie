'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function FilmsEtSeriesSave() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [savedContent, setSavedContent] = useState({
    movies: [],
    tvShows: []
  });
  const [activeTab, setActiveTab] = useState('movies');
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSavedContent = useCallback(async (userId) => {
    try {
      const response = await fetch(`/api/saved?userId=${userId}`, {
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) throw new Error('Erreur de chargement');
      
      const data = await response.json();
      setSavedContent({
        movies: data.movies || [],
        tvShows: data.tvShows || []
      });
    } catch (error) {
      console.error('Erreur lors du chargement des contenus:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    
    const userObj = JSON.parse(currentUser);
    setUser(userObj);
    loadSavedContent(userObj.id);
  }, [router, loadSavedContent]);

  const handleDelete = async (type, id) => {
    try {
      const response = await fetch(`/api/saved?type=${type}&id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur de suppression');

      setSavedContent(prev => ({
        ...prev,
        [type === 'movie' ? 'movies' : 'tvShows']: prev[type === 'movie' ? 'movies' : 'tvShows']
          .filter(item => item.id !== id)
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // Recharger en cas d'erreur
      if (user) loadSavedContent(user.id);
    }
  };

  const handleRefresh = () => {
    if (user && !isRefreshing) {
      setIsRefreshing(true);
      loadSavedContent(user.id);
    }
  };

  const handleItemClick = (type, tmdbId) => {
    router.push(`/details/${type}/${tmdbId}`);
  };

  const getSortedContent = (content) => {
    return [...content].sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.addedAt) - new Date(a.addedAt);
        case 'oldest':
          return new Date(a.addedAt) - new Date(b.addedAt);
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  };

  const renderContent = (item, type) => (
    <div key={item.id} className="bg-[#1a1a1a] rounded-lg overflow-hidden shadow-lg group">
      <div 
        className="cursor-pointer"
        onClick={() => handleItemClick(type, item.tmdbId)}
      >
        {item.posterPath && (
          <div className="relative h-[400px]">
            <Image
              src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={true}
            />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(type, item.id);
            }}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <i className="fi fi-rr-trash text-xl"></i>
          </button>
        </div>
        
        <p className="text-gray-400 text-sm mb-2">
          {new Date(item.addedAt).toLocaleDateString()}
        </p>
        
        {item.overview && (
          <p className="text-gray-300 text-sm line-clamp-3">
            {item.overview}
          </p>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] p-8">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'movies'
                  ? 'bg-[#eab256] text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              Films ({savedContent.movies.length})
            </button>
            <button
              onClick={() => setActiveTab('tvShows')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'tvShows'
                  ? 'bg-[#eab256] text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              Séries ({savedContent.tvShows.length})
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg"
            >
              <option value="newest">Plus récent</option>
              <option value="oldest">Plus ancien</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors duration-200 ${
                isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <i className={`fi fi-rr-refresh ${isRefreshing ? 'animate-spin' : ''}`}></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {getSortedContent(
            activeTab === 'movies' ? savedContent.movies : savedContent.tvShows
          ).map((item) => renderContent(item, activeTab === 'movies' ? 'movie' : 'tv'))}
        </div>

        {((activeTab === 'movies' && savedContent.movies.length === 0) ||
          (activeTab === 'tvShows' && savedContent.tvShows.length === 0)) && (
          <div className="text-center text-gray-400 mt-8">
            <p>Aucun contenu sauvegardé</p>
          </div>
        )}
      </div>
    </div>
  );
}

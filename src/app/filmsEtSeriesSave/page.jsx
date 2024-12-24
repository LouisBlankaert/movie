'use client'
import React, { useState, useEffect } from 'react'
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
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'az', 'za'

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    
    const userObj = JSON.parse(currentUser);
    setUser(userObj);

    const loadSavedContent = async () => {
      try {
        const response = await fetch(`/api/saved?userId=${userObj.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setSavedContent({
            movies: data.movies || [],
            tvShows: data.tvShows || []
          });
        } else {
          console.error('Erreur:', data.error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des contenus:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedContent();
  }, [router]);

  const handleDelete = async (type, id) => {
    try {
      const response = await fetch(`/api/saved?type=${type}&id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSavedContent(prev => ({
          ...prev,
          [type === 'movie' ? 'movies' : 'tvShows']: prev[type === 'movie' ? 'movies' : 'tvShows']
            .filter(item => item.id !== id)
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
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
            />
          </div>
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.overview}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {type === 'movie' ? item.releaseDate : item.firstAirDate}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(type, item.id);
              }}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              <i className="fi fi-rr-trash text-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#eab256]"></div>
      </div>
    );
  }

  const currentContent = activeTab === 'movies' ? savedContent.movies : savedContent.tvShows;
  const sortedContent = getSortedContent(currentContent);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Ma Liste</h1>
        
        {/* Menu de tri */}
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Trier par:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-[#1a1a1a] text-gray-300 px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-[#eab256]"
          >
            <option value="newest">Plus récent</option>
            <option value="oldest">Plus ancien</option>
            <option value="az">A à Z</option>
            <option value="za">Z à A</option>
          </select>
        </div>
      </div>
      
      <div className="flex mb-6 space-x-4">
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
            activeTab === 'movies'
              ? 'bg-[#eab256] text-white'
              : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
          }`}
        >
          Films ({savedContent.movies.length})
        </button>
        <button
          onClick={() => setActiveTab('tvShows')}
          className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
            activeTab === 'tvShows'
              ? 'bg-[#eab256] text-white'
              : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
          }`}
        >
          Séries ({savedContent.tvShows.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedContent.length > 0 ? (
          sortedContent.map(item => renderContent(item, activeTab === 'movies' ? 'movie' : 'tv'))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            <i className={`fi ${activeTab === 'movies' ? 'fi-rr-film' : 'fi-rr-tv'} text-4xl mb-4 block`}></i>
            <p>Aucun {activeTab === 'movies' ? 'film' : 'série'} sauvegardé pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}

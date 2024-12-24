"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Mousewheel } from 'swiper/modules';
import { useRouter } from 'next/navigation';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/carousel.css';
import CarouselCard from './CarouselCard';

export default function Acceuil() {
    const router = useRouter();
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [trailers, setTrailers] = useState([]);
    const [trailerSearch, setTrailerSearch] = useState('');
    const [isSearchingTrailer, setIsSearchingTrailer] = useState(false);
    const [activeTrailer, setActiveTrailer] = useState(null);
    const [movieSearch, setMovieSearch] = useState('');
    const [seriesSearch, setSeriesSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [noMovieResults, setNoMovieResults] = useState(false);
    const [noSeriesResults, setNoSeriesResults] = useState(false);

    const fetchTrailers = async (movieId) => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
            );
            const data = await response.json();
            // Si pas de bande-annonce en français, chercher en anglais
            let trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
            if (!trailer) {
                const enResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`
                );
                const enData = await enResponse.json();
                trailer = enData.results.find(video => video.type === "Trailer" && video.site === "YouTube");
            }
            return trailer || null;
        } catch (error) {
            console.error("Erreur lors de la récupération de la bande-annonce:", error);
            return null;
        }
    };

    const fetchTrending = async () => {
        try {
            const movieResponse = await fetch(
                `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
            );
            const movieData = await movieResponse.json();
            setMovies(movieData.results);

            // Récupérer les bandes-annonces pour les 10 premiers films
            const trailerPromises = movieData.results.slice(0, 10).map(async (movie) => {
                const trailer = await fetchTrailers(movie.id);
                if (trailer) {
                    return {
                        ...trailer,
                        movieTitle: movie.title,
                        moviePoster: movie.backdrop_path,
                        releaseDate: movie.release_date
                    };
                }
                return null;
            });

            const trailerResults = await Promise.all(trailerPromises);
            setTrailers(trailerResults.filter(trailer => trailer !== null));

            const seriesResponse = await fetch(
                `https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
            );
            const seriesData = await seriesResponse.json();
            setSeries(seriesData.results);
        } catch (error) {
            console.error("Erreur lors de la récupération des tendances:", error);
        }
    };

    const handleSearch = useCallback(async (type, query) => {
        if (!query.trim()) {
            fetchTrending();
            setNoMovieResults(false);
            setNoSeriesResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/search/${type}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR&query=${query}&page=1`
            );
            const data = await response.json();
            
            if (type === 'movie') {
                setMovies(data.results);
                setNoMovieResults(data.results.length === 0);
                // Mettre à jour les bandes-annonces pour les nouveaux films trouvés
                if (data.results.length > 0) {
                    const trailerPromises = data.results.slice(0, 10).map(async (movie) => {
                        const trailer = await fetchTrailers(movie.id);
                        if (trailer) {
                            return {
                                ...trailer,
                                movieTitle: movie.title,
                                moviePoster: movie.backdrop_path,
                                releaseDate: movie.release_date
                            };
                        }
                        return null;
                    });
                    const trailerResults = await Promise.all(trailerPromises);
                    setTrailers(trailerResults.filter(trailer => trailer !== null));
                }
            } else {
                setSeries(data.results);
                setNoSeriesResults(data.results.length === 0);
            }
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
        }
        setIsSearching(false);
    }, []);

    const searchTrailers = useCallback(async (query) => {
        if (!query.trim()) {
            fetchTrending();
            return;
        }

        setIsSearchingTrailer(true);
        try {
            // Rechercher les films correspondants à la requête
            const searchResponse = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR&query=${query}&page=1`
            );
            const searchData = await searchResponse.json();

            // Récupérer les bandes-annonces pour les films trouvés
            const trailerPromises = searchData.results.slice(0, 5).map(async (movie) => {
                const trailer = await fetchTrailers(movie.id);
                if (trailer) {
                    return {
                        ...trailer,
                        movieTitle: movie.title,
                        moviePoster: movie.backdrop_path,
                        releaseDate: movie.release_date
                    };
                }
                return null;
            });

            const trailerResults = await Promise.all(trailerPromises);
            setTrailers(trailerResults.filter(trailer => trailer !== null));
        } catch (error) {
            console.error("Erreur lors de la recherche des bandes-annonces:", error);
        }
        setIsSearchingTrailer(false);
    }, []);

    // Gestionnaire de délai pour la recherche
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch('movie', movieSearch);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [movieSearch, handleSearch]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch('tv', seriesSearch);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [seriesSearch, handleSearch]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchTrailers(trailerSearch);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [trailerSearch, searchTrailers]);

    const resetSearch = (type) => {
        if (type === 'movie') {
            setMovieSearch('');
            setNoMovieResults(false);
        } else {
            setSeriesSearch('');
            setNoSeriesResults(false);
        }
        fetchTrending();
    };

    useEffect(() => {
        fetchTrending();
    }, []);

    const swiperSettings = {
        modules: [Pagination, Autoplay, Mousewheel],
        spaceBetween: 20,
        slidesPerGroup: 2,
        grabCursor: true,
        mousewheel: {
            forceToAxis: true,
            thresholdDelta: 50,
            eventsTarget: 'container'
        },
        pagination: { 
            clickable: true,
            dynamicBullets: true
        },
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        breakpoints: {
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
            1536: { slidesPerView: 6 },
        }
    };

    const trailerSwiperSettings = {
        ...swiperSettings,
        slidesPerGroup: 1,
        mousewheel: {
            forceToAxis: true,
            thresholdDelta: 50,
            eventsTarget: 'container'
        },
        breakpoints: {
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 2 },
            1280: { slidesPerView: 3 },
            1536: { slidesPerView: 3 },
        }
    };

    const handleItemClick = (type, id) => {
        router.push(`/details/${type}/${id}`);
    };

    return (
        <div className="px-4 py-6">
            {/* liste des films */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-white">Films Tendances</h2>
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            value={movieSearch}
                            onChange={(e) => setMovieSearch(e.target.value)}
                            placeholder="Rechercher des films..."
                            className="w-full px-4 py-3 pl-12 pr-12 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none transition-colors"
                        />
                        <i className="fi fi-rr-search text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                        {movieSearch && (
                            <button
                                onClick={() => resetSearch('movie')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                                <i className="fi fi-rr-cross text-sm"></i>
                            </button>
                        )}
                    </div>
                    {noMovieResults && movieSearch && (
                        <div className="text-gray-400 text-center mt-4">
                            Aucun film trouvé pour "{movieSearch}"
                        </div>
                    )}
                </div>
                {/* carousel de films */}
                <Swiper {...swiperSettings} className="movie-swiper">
                    {movies.map((movie) => (
                        <SwiperSlide key={movie.id}>
                            <CarouselCard
                                content={movie}
                                type="movie"
                                onClick={() => handleItemClick('movie', movie.id)}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* liste des series */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-white">Séries Tendances</h2>
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            value={seriesSearch}
                            onChange={(e) => setSeriesSearch(e.target.value)}
                            placeholder="Rechercher des séries..."
                            className="w-full px-4 py-3 pl-12 pr-12 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none transition-colors"
                        />
                        <i className="fi fi-rr-search text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                        {seriesSearch && (
                            <button
                                onClick={() => resetSearch('tv')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                                <i className="fi fi-rr-cross text-sm"></i>
                            </button>
                        )}
                    </div>
                    {noSeriesResults && seriesSearch && (
                        <div className="text-gray-400 text-center mt-4">
                            Aucune série trouvée pour "{seriesSearch}"
                        </div>
                    )}
                </div>
                {/* carousel de series */}
                <Swiper {...swiperSettings} className="series-swiper">
                    {series.map((serie) => (
                        <SwiperSlide key={serie.id}>
                            <CarouselCard
                                content={serie}
                                type="tv"
                                onClick={() => handleItemClick('tv', serie.id)}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* liste des bandes annonces */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-white">Bandes Annonces</h2>
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            value={trailerSearch}
                            onChange={(e) => setTrailerSearch(e.target.value)}
                            placeholder="Rechercher des bandes-annonces par titre de film..."
                            className="w-full px-4 py-3 pl-12 pr-12 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none transition-colors"
                        />
                        <i className="fi fi-rr-search text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                        {trailerSearch && (
                            <button
                                onClick={() => {
                                    setTrailerSearch('');
                                    fetchTrending();
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                                <i className="fi fi-rr-cross text-sm"></i>
                            </button>
                        )}
                    </div>
                </div>
                {isSearchingTrailer ? (
                    <div className="text-center text-gray-400">
                        Recherche des bandes-annonces...
                    </div>
                ) : trailers.length === 0 && trailerSearch ? (
                    <div className="text-center text-gray-400">
                        Aucune bande-annonce trouvée pour "{trailerSearch}"
                    </div>
                ) : (
                    <Swiper {...trailerSwiperSettings} className="trailer-swiper">
                        {trailers.map((trailer) => (
                            <SwiperSlide key={trailer.id}>
                                <div className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w1280${trailer.moviePoster}`}
                                        alt={trailer.movieTitle}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={() => setActiveTrailer(trailer)}
                                            className="text-[#eab256] transform hover:scale-110 transition-transform duration-300"
                                        >
                                            <i className="fi fi-rr-play text-5xl drop-shadow-lg"></i>
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                        <h3 className="text-xl font-bold text-white mb-2">{trailer.movieTitle}</h3>
                                        <p className="text-gray-200">
                                            {trailer.releaseDate ? new Date(trailer.releaseDate).getFullYear() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>

            {/* Modal de la bande-annonce */}
            {activeTrailer && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="relative w-full max-w-4xl aspect-video">
                        <button
                            onClick={() => setActiveTrailer(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                        >
                            <i className="fi fi-rr-cross text-2xl"></i>
                        </button>
                        <iframe
                            src={`https://www.youtube.com/embed/${activeTrailer.key}?autoplay=1`}
                            title={activeTrailer.movieTitle}
                            className="w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    )
}

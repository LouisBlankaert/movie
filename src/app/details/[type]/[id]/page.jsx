"use client"
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function DetailPage() {
    const params = useParams();
    const [details, setDetails] = useState(null);
    const [credits, setCredits] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                // Récupérer les détails du film/série
                const detailsResponse = await fetch(
                    `https://api.themoviedb.org/3/${params.type}/${params.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
                );
                const detailsData = await detailsResponse.json();
                setDetails(detailsData);

                // Récupérer les crédits (acteurs, réalisateur)
                const creditsResponse = await fetch(
                    `https://api.themoviedb.org/3/${params.type}/${params.id}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
                );
                const creditsData = await creditsResponse.json();
                setCredits(creditsData);
            } catch (error) {
                console.error("Erreur lors de la récupération des détails:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.type && params.id) {
            fetchDetails();
        }
    }, [params.type, params.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#121212]">
                <div className="text-white">Chargement...</div>
            </div>
        );
    }

    if (!details || !credits) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-4">
                <div className="text-white mb-4">Une erreur s'est produite lors du chargement des données.</div>
                <Link href="/" className="text-blue-400 hover:text-blue-300">
                    Retourner à l'accueil
                </Link>
            </div>
        );
    }

    const director = credits.crew.find(person => person.job === "Director");
    const mainActors = credits.cast.slice(0, 5);
    const releaseDate = params.type === 'movie' ? details.release_date : details.first_air_date;
    const title = params.type === 'movie' ? details.title : details.name;

    return (
        <div className="min-h-screen p-8 bg-[#121212]">
            <div className="max-w-7xl mx-auto">
                <Link 
                    href="/"
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <i className="fi fi-rr-angle-left mr-2"></i>
                    Retour à l'accueil
                </Link>

                <div className="bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                    <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="md:w-1/3 relative">
                            <img
                                src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Informations */}
                        <div className="md:w-2/3 p-8">
                            <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
                            
                            <div className="flex items-center gap-4 text-gray-400 mb-6">
                                <span>{new Date(releaseDate).getFullYear()}</span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <span className="text-yellow-500 mr-1">★</span>
                                    {details.vote_average.toFixed(1)}
                                </span>
                                {details.runtime && (
                                    <>
                                        <span>•</span>
                                        <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}min</span>
                                    </>
                                )}
                            </div>

                            <p className="text-gray-300 mb-6">{details.overview}</p>

                            {director && (
                                <div className="mb-4">
                                    <span className="text-gray-400">Réalisateur: </span>
                                    <span className="text-white">{director.name}</span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h2 className="text-gray-400 mb-2">Acteurs principaux:</h2>
                                <div className="flex flex-wrap gap-2">
                                    {mainActors.map(actor => (
                                        <span key={actor.id} className="text-white bg-[#2a2a2a] px-3 py-1 rounded-full">
                                            {actor.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {details.genres && (
                                <div>
                                    <h2 className="text-gray-400 mb-2">Genres:</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {details.genres.map(genre => (
                                            <span key={genre.id} className="text-white bg-[#2a2a2a] px-3 py-1 rounded-full">
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

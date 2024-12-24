import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';

// Récupérer la liste des films et séries sauvegardés
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 });
        }

        // Récupérer les films sauvegardés
        const movies = await prisma.savedMovie.findMany({
            where: { userId },
            orderBy: { addedAt: 'desc' }
        });

        // Récupérer les séries sauvegardées
        const tvShows = await prisma.savedTvShow.findMany({
            where: { userId },
            orderBy: { addedAt: 'desc' }
        });

        return NextResponse.json({ movies, tvShows });
    } catch (error) {
        console.error('Erreur lors de la récupération des contenus sauvegardés:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des contenus' },
            { status: 500 }
        );
    }
}

// Sauvegarder un film ou une série
export async function POST(request) {
    try {
        const { type, userId, content } = await request.json();

        if (!userId || !type || !content) {
            return NextResponse.json(
                { error: 'Données manquantes' },
                { status: 400 }
            );
        }

        if (type === 'movie') {
            const savedMovie = await prisma.savedMovie.create({
                data: {
                    userId,
                    tmdbId: content.id,
                    title: content.title,
                    posterPath: content.poster_path,
                    overview: content.overview,
                    releaseDate: content.release_date
                }
            });
            return NextResponse.json(savedMovie);
        } else if (type === 'tv') {
            const savedTvShow = await prisma.savedTvShow.create({
                data: {
                    userId,
                    tmdbId: content.id,
                    title: content.name,
                    posterPath: content.poster_path,
                    overview: content.overview,
                    firstAirDate: content.first_air_date
                }
            });
            return NextResponse.json(savedTvShow);
        }

        return NextResponse.json(
            { error: 'Type de contenu non valide' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la sauvegarde' },
            { status: 500 }
        );
    }
}

// Supprimer un film ou une série sauvegardé
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        
        if (!type || !id) {
            return NextResponse.json(
                { error: 'Type et ID requis' },
                { status: 400 }
            );
        }

        if (type === 'movie') {
            await prisma.savedMovie.delete({
                where: { id }
            });
        } else if (type === 'tv') {
            await prisma.savedTvShow.delete({
                where: { id }
            });
        } else {
            return NextResponse.json(
                { error: 'Type de contenu non valide' },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}

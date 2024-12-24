import prisma from '../../lib/db'

export async function saveMovie(userId, tmdbId, title, posterPath, overview, releaseDate) {
  try {
    const existingMovie = await prisma.savedMovie.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    if (existingMovie) {
      return { error: 'Film déjà sauvegardé' };
    }

    const movie = await prisma.savedMovie.create({
      data: {
        userId,
        tmdbId,
        title,
        posterPath,
        overview,
        releaseDate,
      },
    });

    return { movie };
  } catch (error) {
    console.error('Erreur sauvegarde film:', error);
    return { error: 'Erreur lors de la sauvegarde du film' };
  }
}

export async function saveTvShow(userId, tmdbId, title, posterPath, overview, firstAirDate) {
  try {
    const existingTvShow = await prisma.savedTvShow.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    if (existingTvShow) {
      return { error: 'Série déjà sauvegardée' };
    }

    const tvShow = await prisma.savedTvShow.create({
      data: {
        userId,
        tmdbId,
        title,
        posterPath,
        overview,
        firstAirDate,
      },
    });

    return { tvShow };
  } catch (error) {
    console.error('Erreur sauvegarde série:', error);
    return { error: 'Erreur lors de la sauvegarde de la série' };
  }
}

export async function getUserMedia(userId) {
  try {
    const media = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        savedMovies: true,
        savedTvShows: true,
      },
    });
    return { media };
  } catch (error) {
    console.error('Erreur récupération média:', error);
    return { error: 'Erreur lors de la récupération des médias' };
  }
}

import { NextResponse } from 'next/server'
import { saveMovie, saveTvShow } from '../../../utils/media'

export async function POST(request) {
  try {
    const { userId, mediaType, mediaData } = await request.json()

    if (!userId || !mediaType || !mediaData) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    let result
    if (mediaType === 'movie') {
      result = await saveMovie(
        userId,
        mediaData.id,
        mediaData.title,
        mediaData.poster_path,
        mediaData.overview,
        mediaData.release_date
      )
    } else if (mediaType === 'tv') {
      result = await saveTvShow(
        userId,
        mediaData.id,
        mediaData.name,
        mediaData.poster_path,
        mediaData.overview,
        mediaData.first_air_date
      )
    } else {
      return NextResponse.json(
        { error: 'Type de média invalide' },
        { status: 400 }
      )
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur API media:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      )
    }

    const { media, error } = await getUserMedia(userId)

    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      )
    }

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Erreur API media:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

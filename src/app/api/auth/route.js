import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'
import bcrypt from 'bcryptjs'

export const config = {
  api: {
    bodyParser: true,
  },
}

export async function POST(request) {
  try {
    const { action, name, email, password } = await request.json()
    console.log('Action reçue:', action)
    console.log('Données reçues:', { name, email })

    if (action === 'login') {
      console.log('Tentative de connexion pour:', email)
      const user = await prisma.user.findUnique({
        where: { email }
      })
      console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non')

      if (!user) {
        return NextResponse.json({
          error: 'Compte non trouvé. Voulez-vous créer un compte ?',
          suggestion: 'register'
        }, { status: 404 })
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      console.log('Mot de passe valide:', isPasswordValid)
      
      if (!isPasswordValid) {
        return NextResponse.json({
          error: 'Mot de passe incorrect'
        }, { status: 401 })
      }

      // Ne pas renvoyer le mot de passe
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ user: userWithoutPassword })

    } else if (action === 'register') {
      console.log('Tentative d\'inscription pour:', email)
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      console.log('Utilisateur existant:', existingUser ? 'Oui' : 'Non')

      if (existingUser) {
        return NextResponse.json({
          error: 'Un compte existe déjà avec cet email. Connectez-vous !',
          suggestion: 'login'
        }, { status: 400 })
      }

      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      console.log('Création du nouvel utilisateur...')
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })
      console.log('Nouvel utilisateur créé:', newUser.id)

      // Ne pas renvoyer le mot de passe
      const { password: _, ...userWithoutPassword } = newUser
      return NextResponse.json({ user: userWithoutPassword })
    }

    return NextResponse.json(
      { error: 'Action non valide' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erreur détaillée:', error)
    return NextResponse.json(
      { error: 'Erreur serveur: ' + error.message },
      { status: 500 }
    )
  }
}

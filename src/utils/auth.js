import prisma from '../../lib/db'

export async function createUser(name, email, password) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: 'Un compte existe déjà avec cet email' };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // Note: Dans un environnement de production, le mot de passe devrait être hashé
      },
    });

    return { user };
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    return { error: 'Erreur lors de la création du compte' };
  }
}

export async function loginUser(email, password) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { error: 'Compte non trouvé' };
    }

    if (user.password !== password) { // Note: Dans un environnement de production, comparer les hash
      return { error: 'Mot de passe incorrect' };
    }

    return { user };
  } catch (error) {
    console.error('Erreur connexion:', error);
    return { error: 'Erreur lors de la connexion' };
  }
}

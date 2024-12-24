"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Base de données utilisateurs temporaire
const mockUsers = [];

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                // Vérification de connexion
                const user = mockUsers.find(u => u.email === formData.email);
                
                if (!user) {
                    throw new Error('Aucun compte trouvé avec cet email. Veuillez créer un compte.');
                }
                
                if (user.password !== formData.password) {
                    throw new Error('Mot de passe incorrect');
                }

                // Connexion réussie
                localStorage.setItem('currentUser', JSON.stringify(user));
                router.push('/');
            } else {
                // Vérification du nom
                if (!formData.name.trim()) {
                    throw new Error('Le nom est requis');
                }

                // Vérification du mot de passe
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Les mots de passe ne correspondent pas');
                }

                if (formData.password.length < 6) {
                    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
                }

                // Vérifier si l'email existe déjà
                const existingUser = mockUsers.find(u => u.email === formData.email);
                if (existingUser) {
                    throw new Error('Un compte existe déjà avec cet email');
                }

                // Création du compte
                const newUser = {
                    name: formData.name.trim(),
                    email: formData.email,
                    password: formData.password
                };
                mockUsers.push(newUser);

                // Connexion automatique après inscription
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                router.push('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-[#1a1a1a] rounded-xl shadow-2xl">
                {/* Bouton retour */}
                <Link 
                    href="/"
                    className="inline-flex items-center text-[#eab256] hover:text-[#c48d3f] transition-colors duration-200 mb-4"
                >
                    <i className="fi fi-rr-angle-left mr-2"></i>
                    Retour
                </Link>

                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[#eab256]">
                        {isLogin ? 'Connexion' : 'Créer un compte'}
                    </h2>
                    <p className="mt-2 text-gray-400">
                        {isLogin ? 'Bienvenue sur Movies' : 'Rejoignez Movies dès aujourd\'hui'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg relative" role="alert">
                        <div className="flex items-center">
                            <i className="fi fi-rr-exclamation mr-2"></i>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="text-gray-300">Nom</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-[#eab256] focus:border-transparent text-white"
                                    placeholder="Votre nom"
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="text-gray-300">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-[#eab256] focus:border-transparent text-white"
                                placeholder="votre@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="text-gray-300">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-[#eab256] focus:border-transparent text-white"
                                placeholder="••••••••"
                            />
                        </div>
                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className="text-gray-300">Confirmer le mot de passe</label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-[#eab256] focus:border-transparent text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-[#eab256] transition-colors duration-200 ${
                                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#c48d3f]'
                            }`}
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <i className={`fi ${isLoading ? 'fi-rr-spinner-alt animate-spin' : 'fi-rr-user'} text-white group-hover:text-white/90`}></i>
                            </span>
                            {isLoading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setFormData({
                                    name: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: ''
                                });
                            }}
                            className="text-[#eab256] hover:text-[#c48d3f] transition-colors duration-200"
                        >
                            {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

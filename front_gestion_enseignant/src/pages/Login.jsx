import { useState } from "react"
import { useAuth } from "../hooks/useAuth" // Assure-toi que useAuth est bien ton AuthContext
import { Link, Navigate, useNavigate } from "react-router-dom" // Ajout de useNavigate pour la redirection
import { useUser } from "../hooks/useUser"

export function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [validationErrors, setValidationErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false) 

    const [showPassword, setShowPassword] = useState(false)
    const { state, login, setUserState } = useAuth()
    const {fetchUser } = useUser()

    const Spinner = () => (
    <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>)

    if(state==undefined)
        return <Spinner/>

    else if(state==true)
        return <Navigate to="/dashboard" />




    // Fonction de validation côté client
    const validateField = (name, value) => {
        let errors = { ...validationErrors }

        switch (name) {
            case 'email':
                if (!value) {
                    errors.email = 'L\'email est requis'
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    errors.email = 'Format d\'email invalide'
                } else {
                    delete errors.email
                }
                break
            case 'password':
                if (!value) {
                    errors.password = 'Le mot de passe est requis'
                } else if (value.length < 6) {
                    errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
                } else {
                    delete errors.password
                }
                break
            default:
                break
        }
        setValidationErrors(errors)
        // Retourne true si AUCUNE erreur n'est présente pour TOUS les champs après validation
        // Cela est important pour la soumission finale
        return Object.keys(errors).length === 0
    }

    // Gère les changements dans les champs du formulaire
    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData(prev => ({
            ...prev,
            [id]: value
        }))
    }

    // Gère le blur (quand l'utilisateur quitte le champ)
    const handleBlur = (e) => {
        validateField(e.target.id, e.target.value)
    }

    // Gère la soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Valider tous les champs avant de soumettre
        const isEmailValid = validateField('email', formData.email)
        const isPasswordValid = validateField('password', formData.password)

        if (!isEmailValid || !isPasswordValid) {
            console.log('Validation client échouée. Impossible de soumettre.')
            return
        }

        setIsSubmitting(true) // Active le spinner
        try {
            await login(formData)
            setUserState(true)
            await fetchUser()
        } catch (error) {
            console.error('Erreur de connexion:', error)
            if (error.response && error.response.data && error.response.data.errors) {
                // setValidationErrors(error.response.data.errors)
                setFormData((data)  => {
                    return {
                        ...data,
                        password: ''
                    }
                })
                setValidationErrors({password: 'identifiants invalides'})
            }
        } finally {
            setIsSubmitting(false) // Désactive le spinner
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Section gauche - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-800 relative overflow-hidden">
                {/* Cercles statiques en arrière-plan */}
                <div className="absolute inset-0">
                    <div className="absolute w-24 h-24 bg-teal-400 rounded-full opacity-30 bottom-1/3 left-0"></div>
                    <div className="absolute w-20 h-20 bg-teal-300 rounded-full opacity-25 top-16 right-2 "></div>
                    <div className="absolute w-28 h-28 bg-teal-600 rounded-full opacity-15 bottom-1/4 right-1/3"></div>
                </div>

                {/* Contenu principal */}
                <div className="relative z-10 flex flex-col justify-center items-center mx-auto text-center px-8">
                    {/* Logo */}
                    <div className="mb-8">
                        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                            <div className="text-slate-800 text-4xl font-bold">
                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Titre et sous-titre */}
                    <h1 className="text-4xl font-bold text-white mb-4">
                        TimeSync
                    </h1>
                    <h2 className="text-3xl font-semibold text-white mb-6">
                        Maîtrisez votre temps
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                        La solution professionnelle de gestion d'emplois du temps
                    </p>
                </div>
            </div>

            {/* Section droite - Formulaire de connexion */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-8 py-12 relative">
                <div className="max-w-md w-full relative z-10">
                    {/* En-tête du formulaire */}
                    <div className="text-center mb-8">
                        {/* Logo mobile */}
                        <div className="lg:hidden mb-6">
                            <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 mt-2">TimeSync</h1>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Connexion</h2>
                        <p className="text-slate-600">Accédez à votre espace personnel</p>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Champ Email */}
                        <div className=" mb-10">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 placeholder-slate-400 ${
                                        validationErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-teal-500'
                                    } mb-1`} 
                                    placeholder="votre@email.com"
                                />
                                <div className={`overflow-hidden absolute transition-all duration-300 ease-in-out ${validationErrors.email ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {validationErrors.email && (
                                        <p className="text-sm text-red-600">
                                            {validationErrors.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Champ Mot de passe */}
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                    Mot de passe
                                </label>
                                <Link to="#" className="text-sm text-teal-600 hover:text-teal-500">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 placeholder-slate-400 ${
                                        validationErrors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-teal-500'
                                    } mb-1`} 
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <div className={`overflow-hidden absolute transition-all duration-300 ease-in-out ${validationErrors.password ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {validationErrors.password && (
                                        <p className="text-sm text-red-600">
                                            {validationErrors.password}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bouton de connexion */}
                        <button
                            type="submit"
                            disabled={isSubmitting} // Utilise l'état local pour désactiver le bouton
                            className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>

                    {/* Lien d'inscription */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-600">
                            Pas encore de compte ?{' '}
                            <Link to="#" className="text-teal-600 hover:text-teal-500 font-medium">
                                S'inscrire →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
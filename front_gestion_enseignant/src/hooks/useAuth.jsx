import { createContext, useContext, useEffect, useState} from "react"
import axios from "axios"
import { toast } from "sonner"

axios.defaults.withCredentials = true
axios.defaults.withXSRFToken=true
axios.defaults.baseURL = 'http://localhost:8000'


const authContext = createContext()


export function AuthContextProvider({children})
{
    const [user, setUser] = useState(null)

    const [role, setRole] = useState([])

    const [state, setUserState] = useState(undefined)

    const [loading, setLoading] = useState(true)

    const checkAuth = async () => {
    try {
        await axios.get('/sanctum/csrf-cookie');
        const response = await axios.get('/api/user');
        console.log(response)

        if (response.status === 200) {
            setUser(response.data);
            //setRole(response.data.roles.map((el) => el.name))
            //console.log(role)
            setUserState(true);
        } else {
            setUserState(false);
            setUser(null);
        }
    } catch (error) {
        setUserState(false);
        setUser(null);
        console.log("Vous n'êtes pas connecté", error);

    } finally {
        setLoading(false);
    }
};

    useEffect(()=>{

        checkAuth()  
        
    }, [state])


    const logout = async () => {
        try {
            await axios.post("/api/logout"); // Appel à l'endpoint de déconnexion
            setUser(null); 
            setRole([]); 
            setUserState(false); 
        } catch (error) {
            console.error("Erreur lors de la déconnexion", error);
        }
    };

    const login = async (formData) =>{
        try {
            await axios.get('/sanctum/csrf-cookie')
            const response = await axios.post('/api/login', {
                'email': formData.email,
                'password': formData.password
            })

            setUser(response.data)
            //setRole(response.data.roles.map((el) => el.name))
            //console.log(role)
            
            toast.success("Connexion réussie ! Bienvenue."); // <-- Toast de succès
            return true;

            
        } catch(error) {
            let errorMessage = "Échec de la connexion. Veuillez réessayer.";
            if (error.response && error.response.status === 422 && error.response.data.errors) {
                // Erreurs de validation de Laravel (ex: email/password requis)
                // Ces erreurs sont déjà gérées par Precognition au niveau du champ,
                // mais on peut ajouter un toast générique si on veut en plus.
                errorMessage = "Veuillez vérifier vos informations de connexion.";
            } else if (error.response && error.response.status === 401) {
                // Erreur d'authentification (ex: identifiants invalides)
                errorMessage = error.response.data.message || "Email ou mot de passe incorrect.";
            } else if (error.response) {
                // Autres erreurs serveur
                errorMessage = `Erreur du serveur : ${error.response.status}`;
            }

            toast.error(errorMessage); // <-- Toast d'erreur
            setUser(null);
            setUserState(false);
            throw error; // Important pour que LoginPage puisse gérer la redirection ou d'autres logiques.
        } finally{
            setLoading(false)
        }
    }   


    return <authContext.Provider value={{user, setUser, loading, login, logout ,setUserState, state, role, setRole}}>
        {children}
    </authContext.Provider>
}

export const useAuth = ()=>{
    return useContext(authContext)
}
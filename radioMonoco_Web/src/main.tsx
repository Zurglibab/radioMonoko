import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import {AuthProvider} from "./context/AuthContext.tsx";
import {AppearanceProvider} from "./context/AppearanceContext.tsx";
import {GoogleOAuthProvider} from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log("GOOGLE CLIENT ID FRONT:", googleClientId);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId={googleClientId}>
    <BrowserRouter>
        <AuthProvider>
            <AppearanceProvider>
                <App />
            </AppearanceProvider>
        </AuthProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
)

import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from "./context/AuthContext.tsx";
import { AppearanceProvider } from "./context/AppearanceContext.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { I18nextProvider } from 'react-i18next';
import i18n from "./i18n";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
            <AuthProvider>
                <AppearanceProvider>
                    <I18nextProvider i18n={i18n}>
                        <App />
                    </I18nextProvider>
                </AppearanceProvider>
            </AuthProvider>
        </BrowserRouter>
    </GoogleOAuthProvider>
)
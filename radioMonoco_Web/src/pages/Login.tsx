import {useState} from "react";
import {useAuth} from "../context/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {login} = useAuth();
    const navigate = useNavigate();
    const {user} = useAuth();

    useEffect(() => {
        if (user) {
            navigate("/feed");
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent)  => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100">
            <form onSubmit={handleSubmit} className="bg-neutral-500 p-8 rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" className="w-full py-2 mt-4 bg-black text-white font-medium rounded-lg hover:bg-neutral-200 transition">Login</button>
            </form>
        </div>
    )
}

export default Login
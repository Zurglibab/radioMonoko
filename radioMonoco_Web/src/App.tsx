import{Routes, Route} from "react-router-dom";
import Layout from "./components/Layout.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Feed from "./pages/Feed.tsx";


function App() {
    return (
        <Routes>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="/" element={<Layout />}>
                <Route index element={<div>Home</div>} />

                <Route
                    path="feed"
                    element={
                        <ProtectedRoute>
                            <Feed />
                        </ProtectedRoute>
                    }
                />
                </Route>
        </Routes>
    )
}

export default App


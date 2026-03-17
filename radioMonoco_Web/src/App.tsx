import { Routes, Route } from "react-router-dom";
import Layout from "./components/utils/Layout.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Feed from "./pages/Feed.tsx";
import HomePage from "./pages/HomePage.tsx";
import { RadioProvider } from "./context/RadioContext.tsx";
import RadioPage from "./pages/RadioPage.tsx";

function App() {
    return (
        <RadioProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage/>} />

                    <Route
                        path="/feed"
                        element={
                            <ProtectedRoute>
                                <Feed />
                            </ProtectedRoute>
                        }
                    />

                    <Route path={"/radio"} element={<RadioPage />} />
                </Route>
            </Routes>
        </RadioProvider>
    )
}

export default App;
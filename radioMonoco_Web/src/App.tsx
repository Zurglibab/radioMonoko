import { Routes, Route } from "react-router-dom";
import Layout from "./components/utils/Layout.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ProtectedRoute from "./components/utils/ProtectedRoute.tsx";
import AdminRoute from "./components/utils/AdminRoute.tsx";
import Feed from "./pages/Feed.tsx";
import HomePage from "./pages/HomePage.tsx";
import { RadioProvider } from "./context/RadioContext.tsx";
import RadioPage from "./pages/RadioPage.tsx";
import Collections from "./pages/Collections/Collections.tsx";
import CollectionsDetails from "./pages/Collections/CollectionsDetails.tsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.tsx";
import AdminReviews from "./pages/Admin/AdminReviews.tsx";
import AdminUsers from "./pages/Admin/AdminUsers.tsx";
import AdminReports from "./pages/Admin/AdminReports.tsx";
//import AdminRecommendations from "./pages/Admin/AdminRecommendations.tsx";

function App() {
    return (
        <RadioProvider>
            <Routes>
                <Route path= "/admin" element={ <AdminRoute><AdminDashboard /></AdminRoute> } />
                <Route path= "/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path= "/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
                <Route path= "/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
                {/*<Route path= "/admin/recommendations" element={<AdminRecommendations />} />*/}
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
                    <Route
                        path="/collections"
                        element={
                            <ProtectedRoute>
                                <Collections />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/collections/:id"
                        element={
                            <ProtectedRoute>
                                <CollectionsDetails />
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
import { Routes, Route } from "react-router-dom";
import Layout from "./components/utils/Layout.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ProtectedRoute from "./components/utils/ProtectedRoute.tsx";
import Feed from "./pages/Feed.tsx";
import HomePage from "./pages/HomePage.tsx";
import { RadioProvider } from "./context/RadioContext.tsx";
import RadioPage from "./pages/RadioPage.tsx";
import Collections from "./pages/Collections/Collections.tsx";
import CollectionsDetails from "./pages/Collections/CollectionsDetails.tsx";

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

                    {/*<Route*/}
                    {/*    path="/collections/playlists"*/}
                    {/*    element={*/}
                    {/*        <ProtectedRoute>*/}
                    {/*            <CollectionsPlaylists />*/}
                    {/*        </ProtectedRoute>*/}
                    {/*    }*/}
                    {/*/>*/}

                    {/*<Route*/}
                    {/*    path="/collections/albums"*/}
                    {/*    element={*/}
                    {/*        <ProtectedRoute>*/}
                    {/*            <CollectionsAlbums />*/}
                    {/*        </ProtectedRoute>*/}
                    {/*    }*/}
                    {/*/>*/}

                    {/*<Route*/}
                    {/*    path="/collections/artists"*/}
                    {/*    element={*/}
                    {/*        <ProtectedRoute>*/}
                    {/*            <CollectionsArtists />*/}
                    {/*        </ProtectedRoute>*/}
                    {/*    }*/}
                    {/*/>*/}


                    <Route path={"/radio"} element={<RadioPage />} />
                </Route>
            </Routes>
        </RadioProvider>
    )
}

export default App;
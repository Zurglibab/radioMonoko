import{Routes, Route} from "react-router-dom";
import Layout from "./components/Layout.tsx";


function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="/" element={<h1 className= "text-4xl font-bold text-red-500">Home</h1>} />
                <Route path="search" element={<h1>Search</h1>} />
                <Route path="feed" element={<h1>Feed</h1>} />
                <Route path="collection" element={<h1>Collection</h1>} />
            </Route>
        </Routes>
    )
}

export default App


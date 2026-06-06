import {useEffect, useState} from "react";
import SearchService, {type Show} from "../services/SearchService.ts";

export const useSearch = (station:string) => {
    const [query, setQuery] = useState("");
    const [show, setShow] = useState<Show[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (!query.trim()) {
                setShow([]);
                return;
            }
            setLoading(true);
            try {
                const data = await SearchService.searchShows(station, query);
                setShow(data);
            } catch (error) {
                console.error("Erreur lors de la recherche :", error);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [query, station]);

    return {query, setQuery, show , loading};
};
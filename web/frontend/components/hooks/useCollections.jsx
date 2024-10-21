import { useEffect, useState } from "react";

export default function useCollections() {
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await fetch('/api/collections', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch collections');
                }

                const data = await response.json();
                console.log("Fetched collections using graphql api", data);
                setCollections(data.body.data.collections.edges);
            } catch (error) {
                console.error('Error fetching collections:', error);
            }
        };

        fetchCollections();
    }, []);

    return collections;
}
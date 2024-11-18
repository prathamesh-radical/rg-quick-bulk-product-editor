import { useEffect, useState } from "react";

export default function useFetchData(apiEndpoint) {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(apiEndpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch data from ${apiEndpoint}`);
                }

                const data = await response.json();

                if(apiEndpoint === "/api/products") {
                    setData(data.products);
                    console.log("Fetched products",data.products);
                } else if(apiEndpoint === "/api/collections") {
                    setData(data.body.data.collections.edges);
                    console.log("Fetched collections",data.body.data.collections.edges);
                } else if(apiEndpoint === "/api/inventorylevel") {
                    setData(data.data);
                    console.log("Fetched inventory",data.data);
                } else if(apiEndpoint === "/api/domain") {
                    setData(data.domain);
                    console.log("Fetched domain",data.domain);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiEndpoint]);

    return { data, error, loading };
}
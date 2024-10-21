import { useEffect, useState } from "react";

export default function useInventory() {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await fetch('/api/inventorylevel', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch inventory');
                }

                const data = await response.json();
                console.log("Fetched inventory using rest api", data.data);
                setInventory(data.data);
            } catch (error) {
                console.error('Error fetching inventory:', error);
            }
        };

        fetchInventory();
    }, []);

    return inventory;
}
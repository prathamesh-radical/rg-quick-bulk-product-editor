import { ChoiceList, useIndexResourceState } from "@shopify/polaris";
import React, { useCallback, useEffect, useState } from "react";
import RowMarkup from "../products/rowMarkup.jsx";
import { sortOptions } from "../utils/constants.jsx";
import useFetchData from "./useFetchData.jsx";

export default function useProductlists() {
    const { data: fetchedProducts } = useFetchData('/api/products');
    const { data: fetchedCollections } = useFetchData('/api/collections');
    const { data: fetchedInventory } = useFetchData('/api/inventorylevel');

    const [sortSelected, setSortSelected] = useState(['title asc']);
    const [products, setProducts] = useState(fetchedProducts);
    const [productStatus, setProductStatus] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState(fetchedProducts);
    const [queryValue, setQueryValue] = useState("");
    const [selected, setSelected] = useState(0);
    const [itemStrings, setItemStrings] = useState(["All", "Active", "Draft", "Archived"]);
    const [taggedWith, setTaggedWith] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedGiftCard, setSelectedGiftCard] = useState(false);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const handleSelectedCategoryChange = useCallback((value) => {
        setSelectedCategory(value[0]);
    }, []);

    const handleSelectedGiftCardChange = useCallback((value) => {
        setSelectedGiftCard(value[0] === "true");
    }, []);

    const handleProductStatusChange = useCallback(
        (value) => setProductStatus(value),
        [],
    );

    const handleTaggedWithChange = useCallback(
        (value) => setTaggedWith(value),
        [],
    );

    useEffect(() => {
        if (fetchedProducts !== products) {
            setProducts(fetchedProducts);
            setFilteredProducts(fetchedProducts);
        }
    }, [fetchedProducts, products]);
    

    useEffect(() => {
        const [sortKey, sortDirection] = sortSelected[0].split(' ');
        const sortedProducts = sortProducts(filteredProducts, sortKey, sortDirection);
        setFilteredProducts(sortedProducts);
    }, [sortSelected, filteredProducts]);

    useEffect(() => {
        let filtered = [...products];

        // Filter by status
        if (Array.isArray(productStatus) && productStatus.length > 0) {
            filtered = filtered.filter((product) => productStatus.includes(product.node.status));
        }

        // Filter by tags
        if (Array.isArray(taggedWith) && taggedWith.length > 0) {
            filtered = filtered.filter((product) =>
                taggedWith.every(tag => product.node.tags.includes(tag))
            );
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter((product) =>
                product.node.collections.edges.some(edge => edge.node.id === selectedCategory)
            );
        }

        // Filter by gift card
        if (selectedGiftCard) {
            filtered = filtered.filter((product) => product.node.giftCard === true);
        }
    
        if (selected !== 0) {
            filtered = filtered.filter((product) => {
                switch (selected) {
                    case 1: return product.node.status === "ACTIVE";
                    case 2: return product.node.status === "DRAFT";
                    case 3: return product.node.status === "ARCHIVED";
                    default: return true;
                }
            });
        }

        const [sortKey, sortDirection] = sortSelected[0].split(' ');
    
        filtered = sortProducts(filtered, sortKey, sortDirection);
        setFilteredProducts(filtered);
    }, [selected, products, productStatus, sortSelected, taggedWith, selectedCategory, selectedGiftCard]);

    useEffect(() => {
        if (queryValue) {
            const filtered = products.filter(product =>
                product.node.title.toLowerCase().includes(queryValue.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            filterProductsByTab(selected);
        }
    }, [queryValue, products]);

    const deleteView = (index) => {
        const newItemStrings = [...itemStrings];
        newItemStrings.splice(index, 1);
        setItemStrings(newItemStrings);
        setSelected(0);
    };

    const sortProducts = (productsToSort, key, direction) => {
        if (!productsToSort || productsToSort.length === 0 || !key) return [];
    
        return [...productsToSort].sort((a, b) => {
            let aValue, bValue;
    
            switch (key) {
                case "title":
                    aValue = a.node.title.toLowerCase();
                    bValue = b.node.title.toLowerCase();
                    break;
                case "created":
                    aValue = new Date(a.node.createdAt);
                    bValue = new Date(b.node.createdAt);
                    break;
                case "updated":
                    aValue = new Date(a.node.updatedAt);
                    bValue = new Date(b.node.updatedAt);
                    break;
                case "inventory":
                    aValue = a.node.totalInventory;
                    bValue = b.node.totalInventory;
                    break;
                case "collection":
                    aValue = a.node.collections.edges[0]?.node?.title || "";
                    bValue = b.node.collections.edges[0]?.node?.title || "";
                    break;
                default:
                    return 0;
            }
    
            if (aValue < bValue) return direction === "asc" ? -1 : 1;
            if (aValue > bValue) return direction === "asc" ? 1 : -1;
            return 0;
        });
    };

    const onHandleCancel = () => {
        setQueryValue("");
        filterProductsByTab(selected);
    };

    const onCreateNewView = async (value) => {
        await sleep(500);
        setItemStrings([...itemStrings, value]);
        setSelected(itemStrings.length);
        return true;
    };

    const onHandleSave = async () => {
        await sleep(1);
        return true;
    };

    const primaryAction = selected === 0 ? {
        type: 'save-as',
        onAction: onCreateNewView,
        disabled: false,
        loading: false,
    } : {
        type: 'save',
        onAction: onHandleSave,
        disabled: false,
        loading: false,
    };

    const filterProductsByTab = (selectedTab) => {
        let filtered = products;
    
        if (!products || products.length === 0) {
            setFilteredProducts([]);
            return;
        }
    
        switch (selectedTab) {
            case 1:
                filtered = products.filter((product) => product.node.status === "ACTIVE");
                break;
            case 2:
                filtered = products.filter((product) => product.node.status === "DRAFT");
                break;
            case 3:
                filtered = products.filter((product) => product.node.status === "ARCHIVED");
                break;
            default:
                break;
        }
    
        setFilteredProducts(filtered);
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(filteredProducts);
    const handleFiltersQueryChange = useCallback((value) => setQueryValue(value), []);

    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => {
            setSelected(index);
            filterProductsByTab(index);
        },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions: index === 0 ? [] :
        [
            {
                type: 'rename',
                onAction: () => {},
                onPrimaryAction: async (value) => {
                    const newItemsStrings = tabs.map((item, idx) => {
                        if (idx === index) {
                            return value;
                        }
                        return item.content;
                    });
                    await sleep(1);
                    setItemStrings(newItemsStrings);
                    return true;
                },
            },
            {
                type: 'delete',
                onPrimaryAction: async () => {
                    await sleep(1);
                    deleteView(index);
                    return true;
                },
            },
        ],
    }));

    const getUniqueTags = (products) => {
        const allTags = products.reduce((acc, product) => {
            return acc.concat(product.node.tags);
        }, []);
        return [...new Set(allTags)];
    };

    const filters = [
        {
            key: "category",
            label: "Category",
            filter: (
                <ChoiceList
                    title="Category"
                    titleHidden
                    choices={fetchedCollections.map((collection) => ({
                        label: collection.node.title,
                        value: collection.node.id,
                    }))}
                    selected={selectedCategory ? [selectedCategory] : []}
                    onChange={handleSelectedCategoryChange}
                    allowMultiple={false}
                />
            ),
            shortcut: true,
        },
        {
            key: "giftCard",
            label: "Gift Card",
            filter: (
                <ChoiceList
                    title="Gift Card"
                    titleHidden
                    choices={[{ label: "Gift Card", value: true }]}
                    selected={selectedGiftCard ? [true] : []}
                    onChange={handleSelectedGiftCardChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: "productStatus",
            label: "Status",
            filter: (
                <ChoiceList
                    title="Product Status"
                    titleHidden
                    choices={[
                        { label: "Active", value: "ACTIVE" },
                        { label: "Draft", value: "DRAFT" },
                        { label: "Archived", value: "ARCHIVED" },
                    ]}
                    selected={productStatus ? productStatus : []}
                    onChange={handleProductStatusChange}
                    allowMultiple={false}
                />
            ),
            shortcut: true,
        },
        {
            key: "taggedWith",
            label: "Tagged With",
            filter: (
                <ChoiceList
                    title="Tagged With"
                    titleHidden
                    choices={getUniqueTags(fetchedProducts).map(tag => ({ label: tag, value: tag }))}
                    selected={taggedWith ? taggedWith : []}
                    onChange={handleTaggedWithChange}
                    allowMultiple={false}
                />
            ),
            shortcut: true,
        }
    ];
    const handleTaggedWithRemove = useCallback(() => setTaggedWith(''), []);
    const handleProductStatusRemove = useCallback(() => setProductStatus([]), [],);
    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleSelectedCategory = useCallback(() => setSelectedCategory(""), []);
    const handleSelectedGiftCard = useCallback(() => setSelectedGiftCard(false), []);
    const handleFiltersClearAll = useCallback(() => {
        setSelected(0);
        filterProductsByTab(0);
        handleSelectedGiftCard()
        handleSelectedCategory();
        handleTaggedWithRemove();
        handleQueryValueRemove();
        handleProductStatusRemove();
    }, [
        setSelected,
        filterProductsByTab,
        handleSelectedGiftCard,
        handleSelectedCategory,
        handleTaggedWithRemove,
        handleQueryValueRemove,
        handleProductStatusRemove,
    ]);

    function disambiguateLabel(key, value) {
        switch (key) {
        case 'productStatus':
            return `Product Status: ${productStatus.join(", ")}`;
        case 'taggedWith':
            return `Tagged With: ${value.join(", ")}`;
        default:
            return value;
        }
    }

    function isEmpty(value) {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === '' || value == null;
        }
    }

    const appliedFilters = [];
    if (productStatus?.length && !isEmpty(productStatus?.length)) {
        const key = "productStatus";
        appliedFilters.push({
            key: "productStatus",
            label: disambiguateLabel(key, productStatus),
            onRemove: handleProductStatusRemove,
        });
    }
    if (taggedWith?.length && !isEmpty(taggedWith)) {
        const key = "taggedWith";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, taggedWith),
            onRemove: handleTaggedWithRemove,
        });
    }

    const rowMarkup = filteredProducts.map(({ node: product, cursor }, index) => (
        <RowMarkup
            key={product.id || cursor || index}
            product={product}
            cursor={cursor}
            index={index}
            inventory={fetchedInventory}
            collections={fetchedCollections}
            selected={selectedResources.includes(cursor)}
            onSelect={() => handleSelectionChange(cursor)}
        />
    ));

    return {tabs, filters, selected, queryValue, sortOptions, sortSelected, filteredProducts, appliedFilters, rowMarkup, primaryAction, selectedResources, allResourcesSelected, setSortSelected, setSelected, onCreateNewView, setQueryValue, onHandleCancel, handleSelectionChange, handleFiltersQueryChange, handleFiltersClearAll};
}
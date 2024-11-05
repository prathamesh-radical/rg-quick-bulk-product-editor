import { Frame, IndexFilters, IndexTable, LegacyCard, Spinner, useSetIndexFiltersMode } from "@shopify/polaris";
import React from "react";
import useProductlists from "../components/hooks/useProductsLists.jsx";
import { heading, resourceName } from "../components/utils/constants.jsx";

export default function Productlists() {
    const { mode, setMode } = useSetIndexFiltersMode();
    const {
        tabs, filters, selected, queryValue, sortOptions, sortSelected, filteredProducts, appliedFilters, rowMarkup,  primaryAction, selectedResources, allResourcesSelected, isLoading, setSortSelected, setSelected, onCreateNewView, setQueryValue, onHandleCancel, handleSelectionChange, handleFiltersQueryChange, handleFiltersClearAll
    } = useProductlists();

    const isHeaderCheckboxSelected = allResourcesSelected || selectedResources.length > 0;

    const handleHeaderSelectionChange = (selected) => {
        if (selected) {
            handleSelectionChange(filteredProducts.map(product => product.node.id));
        } else {
            handleSelectionChange([]);
        }
    };

    const dynamicHeadings = isHeaderCheckboxSelected
    ? [{ title: `${selectedResources.length} selected` }]
    : heading;

    const handleRowSelectionChange = (id) => {
        const newSelectedResources = selectedResources.includes(id)
            ? selectedResources.filter(resourceId => resourceId !== id)
            : [...selectedResources, id];

        handleSelectionChange(newSelectedResources);
    };
    

    return (
        <div style={{ padding: "1rem" }}>
            <Frame>
                <LegacyCard>
                    <IndexFilters
                        sortOptions={sortOptions}
                        sortSelected={sortSelected}
                        queryValue={queryValue}
                        queryPlaceholder="Searching in all"
                        onQueryChange={handleFiltersQueryChange}
                        onQueryClear={() => setQueryValue("")}
                        onSort={setSortSelected}
                        primaryAction={primaryAction}
                        cancelAction={{
                            onAction: onHandleCancel,
                            disabled: false,
                            loading: false,
                        }}
                        tabs={tabs}
                        selected={selected}
                        onSelect={setSelected}
                        canCreateNewView
                        onCreateNewView={onCreateNewView}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        onClearAll={handleFiltersClearAll}
                        mode={mode}
                        setMode={setMode}
                    />
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <Spinner accessibilityLabel="Loading products" size="large" />
                        </div>
                    ) : (
                        <IndexTable
                            resourceName={resourceName}
                            itemCount={filteredProducts?.length || 0}
                            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
                            onSelectionChange={handleSelectionChange}
                            headings={dynamicHeadings}
                            onHeaderSelectionChange={handleHeaderSelectionChange}
                        >
                            {rowMarkup.map((rowMarkup, index) => {
                                return React.cloneElement(rowMarkup, {
                                    onSelect: () => handleRowSelectionChange(filteredProducts[index].node.id),
                                    selected: selectedResources.includes(filteredProducts[index].node.id)
                                });
                            })}
                        </IndexTable>
                    )}
                </LegacyCard>
            </Frame>
        </div>
    );
}

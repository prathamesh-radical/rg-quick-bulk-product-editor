import { Frame, IndexFilters, IndexTable, LegacyCard, Spinner, useSetIndexFiltersMode } from "@shopify/polaris";
import React from "react";
import useProductlists from "../components/hooks/useProductsLists.jsx";
import { heading, resourceName } from "../components/utils/constants.jsx";

export default function Productlists() {
    const { mode, setMode } = useSetIndexFiltersMode();
    const {
        tabs, filters, selected, queryValue, sortOptions, sortSelected, filteredProducts, appliedFilters, rowMarkup,  primaryAction, selectedResources, allResourcesSelected, isLoading, setSortSelected, setSelected, onCreateNewView, setQueryValue, onHandleCancel, handleSelectionChange, handleFiltersQueryChange, handleFiltersClearAll
    } = useProductlists();
    

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
                            headings={heading}
                        >
                            {rowMarkup}
                        </IndexTable>
                    )}
                </LegacyCard>
            </Frame>
        </div>
    );
}

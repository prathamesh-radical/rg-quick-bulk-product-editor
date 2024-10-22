import { Button, Collapsible, LegacyCard, LegacyStack, Toast } from '@shopify/polaris';
import { EditMinor } from '@shopify/polaris-icons';
import { useCallback, useState } from 'react';
import { btn } from '../utils/constants.jsx';
import ProductForm from './form.jsx';
import './style.css';

export default function Update({ product, stock, inventory, inventoryId, collections }) {
    const [open, setOpen] = useState(false);
    const [toastActive, setToastActive] = useState(false);

    const handleToggle = useCallback(() => setOpen((open) => !open), []);
    const toggleToastActive = useCallback(() => setToastActive((toastActive) => !toastActive), []);

    const toastMarkup = toastActive ? (
        <Toast content="Product updated successfully" onDismiss={toggleToastActive} />
    ) : null;

    const handleSubmit = async (updatedProductData, updatedInventoryData) => {
        const response = await fetch(`/api/products/${product.id.split("/").pop()}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProductData),
        });

        // const inventoryResponse = await fetch(`/api/inventorylevel/${inventoryId}`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(updatedInventoryData),
        // });

        if (!response.ok) {
            throw new Error(`Error updating product: ${response.statusText}`);
        }

        // if (!inventoryResponse.ok) {
        //     throw new Error(`Error updating inventory: ${inventoryResponse.statusText}`);
        // }

        setToastActive(true);
        handleToggle();

        const result = await response.json();
        return result;
    };

    return (
        <div style={btn}>
            <Button
                icon={EditMinor}
                ariaExpanded={open}
                ariaControls="basic-collapsible"
                onClick={handleToggle}
                monochrome
            >
                Edit
            </Button>
            <LegacyStack>
                <Collapsible open={open} id="basic-collapsible" transition={{ duration: '500ms', timingFunction: 'ease-in-out' }} expandOnPrint>
                    <div style={{ marginTop: '1rem', width: '72rem' }}>
                        <LegacyCard sectioned>
                            <ProductForm
                                product={product}
                                stock={stock}
                                inventory={inventory}
                                inventoryId={inventoryId}
                                collections={collections}
                                onSubmit={handleSubmit}
                                onCancel={handleToggle}
                            />
                        </LegacyCard>
                    </div>
                </Collapsible>
            </LegacyStack>
            {toastMarkup}
        </div>
    );
}
import { Collapsible, LegacyCard, LegacyStack, Toast } from '@shopify/polaris';
import { useCallback, useState } from 'react';
import { btn, collapsibleFormCss } from '../utils/constants.jsx';
import ProductForm from './form.jsx';
import './style.css';

export default function Update({ open, product, stock, inventory, inventoryId, collections, handleToggle }) {
    const [toastActive, setToastActive] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastError, setToastError] = useState(false);

    const toggleToastActive = useCallback(() => setToastActive((toastActive) => !toastActive), []);

    const toastMarkup = toastActive ? (
        <Toast content={toastMessage} error={toastError} onDismiss={toggleToastActive} />
    ) : null;

    const handleSubmit = async (updatedProductData, updatedInventoryData) => {
        const productId = product.id.split("/").pop();
        try {
            const response = await fetch(`/api/products/${productId}`, {
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
            //     body: JSON.stringify({
            //         inventory_item_id: inventoryId,
            //         available: Number(updatedInventoryData.available),
            //         locationId: updatedInventoryData.locationId,
            //     }),
            // });

            if (!response.ok) {
                throw new Error(`Error updating product: ${response.statusText}`);
            }

            // if (!inventoryResponse.ok) {
            //     throw new Error(`Error updating inventory: ${inventoryResponse.statusText}`);
            // }

            setToastMessage("Product updated successfully");
            setToastError(false);
            setToastActive(true);
            handleToggle();

            const result = await response.json();
            return result;
        } catch (error) {
            setToastMessage(error.message || "An error occurred while updating the product");
            setToastError(true);
            setToastActive(true);
        }
    };

    return (
        <div style={btn}>
            <LegacyStack>
                <Collapsible open={open} id="basic-collapsible" transition={{ duration: '500ms', timingFunction: 'ease-in-out' }} expandOnPrint>
                    <div style={collapsibleFormCss}>
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
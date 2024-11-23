import { Collapsible, LegacyCard, LegacyStack, Toast } from '@shopify/polaris';
import { useCallback, useState } from 'react';
import { btn } from '../utils/constants.jsx';
import ProductForm from './form.jsx';
import './style.css';

export default function Update({ open, product, handleToggle }) {
    const [toastActive, setToastActive] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastError, setToastError] = useState(false);

    const toggleToastActive = useCallback(() => setToastActive((toastActive) => !toastActive), []);

    const toastMarkup = toastActive ? (
        <Toast content={toastMessage} error={toastError} onDismiss={toggleToastActive} />
    ) : null;

    const handleSubmit = async (updatedData,) => {
        const productId = product.id.split("/").pop();
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error(`Error updating product: ${response.statusText}`);
            }

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
                    <div style={{ marginTop: '1rem' }}>
                        <LegacyCard sectioned>
                            <ProductForm product={product} onSubmit={handleSubmit} onCancel={handleToggle} />
                        </LegacyCard>
                    </div>
                </Collapsible>
            </LegacyStack>
            {toastMarkup}
        </div>
    );
}
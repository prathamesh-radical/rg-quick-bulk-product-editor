import { Autocomplete, Button, ButtonGroup, Form, Text, TextField } from '@shopify/polaris';
import { CancelMinor, SendMajor } from '@shopify/polaris-icons';
import { useCallback, useState } from 'react';
import { statusOptions } from '../utils/constants.jsx';

export default function ProductForm({ product, onSubmit, onCancel }) {
    const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);

    const [formData, setFormData] = useState({
        title: product.title,
        slug: product.handle,
        status: product.status,
        sku: product.variants.edges[0]?.node.sku || "-",
        salePrice: product.variants.edges[0]?.node.price || "-",
        price: product.variants.edges[0]?.node.compareAtPrice || "-",
        tags: product.tags.join(', ') || "",
    });
    const [inputStatusValue, setInputStatusValue] = useState(formData.status);
    const [loading, setLoading] = useState(false);

    const handleChange = (field) => (value) => {
        setFormData({ ...formData, [field]: value });
    };

    const updateStatusText = useCallback(
        (value) => setInputStatusValue(value), [],
    );

    const statusTextField = (
        <Autocomplete.TextField
            onChange={updateStatusText}
            label="Status"
            value={inputStatusValue}
            placeholder="Set the status"
            autoComplete="off"
        />
    );

    const updateStatusSelection = useCallback(
        (selected) => {
            const selectedValue = selected.map((selectedItem) => {
                const matchedOption = statusOptions.find((option) => {
                    return option.value.match(selectedItem);
                });
                return matchedOption && matchedOption.label;
            });

            setSelectedStatusOptions(selected);
            setInputStatusValue(selectedValue[0] || '');
        },
        [statusOptions],
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const productId = product.id.split("/").pop();
        const variantId = product.variants.edges[0]?.node.id.split("/").pop();
    
        setLoading(true);
    
        try {
            await onSubmit({
                product: {
                    id: productId,
                    title: formData.title,
                    handle: formData.slug,
                    variants: [{
                        id: variantId,
                        price: parseFloat(formData.salePrice) || 0,
                        sku: formData.sku,
                        compare_at_price: parseFloat(formData.price) || 0,
                    }],
                    collections: selectedCollectionIds.map(id => ({
                        id,
                        title: collections.find(collection => collection.node.id === id)?.node.title,
                    })),
                    tags: formData.tags.split(',').map(tag => tag.trim()),
                    status: inputStatusValue.toLowerCase(),
                }
            });
        } catch (error) {
            console.error('Error updating product:', error);
        } finally {
            console.log('Product updated successfully', product);
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: '2rem', width: '100%', marginBottom: '1rem' }}>
                {/* Column 1: Quick Edit and Product Data */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Text as="p" fontWeight="bold">QUICK EDIT</Text>
                    <TextField
                        label="Title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange('title')}
                        fullWidth
                    />
                    <TextField
                        label="Slug"
                        type="text"
                        value={formData.slug}
                        onChange={handleChange('slug')}
                        fullWidth
                    />
                    <Autocomplete
                        options={statusOptions}
                        selected={selectedStatusOptions}
                        onSelect={updateStatusSelection}
                        textField={statusTextField}
                    />
                    <TextField
                        label="SKU"
                        type="number"
                        value={formData.sku}
                        onChange={handleChange('sku')}
                        fullWidth
                    />
                </div>
                {/* Column 2: Product Tags */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Text as="p" fontWeight="bold">Product Data</Text>
                    <TextField
                        label="Product Tags"
                        type="text"
                        value={formData.tags}
                        onChange={handleChange('tags')}
                        helpText='Separate tags with commas'
                        multiline
                        fullWidth
                    />
                    <TextField
                        label="Price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange('price')}
                        fullWidth
                    />
                    <TextField
                        label="Sale Price"
                        type="number"
                        value={formData.salePrice}
                        onChange={handleChange('salePrice')}
                        fullWidth
                    />
                </div>
            </div>
            <ButtonGroup>
                <Button icon={SendMajor} loading={loading} primary submit>Update</Button>
                <Button icon={CancelMinor} onClick={onCancel} reset monochrome>Cancel</Button>
            </ButtonGroup>
        </Form>
    );
}
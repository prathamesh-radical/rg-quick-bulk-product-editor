import { Autocomplete, Button, ButtonGroup, Checkbox, Form, Text, TextField } from '@shopify/polaris';
import { CancelMinor, SendMajor } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import { checkboxCss, statusOptions } from '../utils/constants.jsx';

export default function ProductForm({ product, stock, inventory, inventoryId, collections, onSubmit, onCancel }) {
    const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);

    const [selectedCollectionIds, setSelectedCollectionIds] = useState(
        product.collections.edges.map(collection => collection.node.id)
    );

    const [formData, setFormData] = useState({
        title: product.title,
        slug: product.handle,
        status: product.status,
        stock: stock,
        sku: product.variants.edges[0]?.node.sku || "-",
        salePrice: product.variants.edges[0]?.node.price || "-",
        price: product.variants.edges[0]?.node.compareAtPrice || "-",
        collection: product.collections.edges.map(collection => collection.node.title).join(', '),
        tags: product.tags.join(', ') || "",
    });
    const [inputStatusValue, setInputStatusValue] = useState(formData.status);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSelectedCollectionIds(product.collections.edges.map(collection => collection.node.id));
    }, [product]);

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

    const handleCollectionChange = (collectionId) => {
        setSelectedCollectionIds((prevSelected) => {
            if (prevSelected.includes(collectionId)) {
                return prevSelected.filter(id => id !== collectionId);
            } else {
                return [...prevSelected, collectionId];
            }
        });
    };

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
            }, //{
            //     inventory_item_id: inventoryId,
            //     available: parseInt(formData.stock, 10),
            //     locationId: inventory.location_id,
            // }
            );
        } catch (error) {
            console.error('Error updating product:', error);
        } finally {
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
                        label="Product Tags"
                        type="text"
                        value={formData.tags}
                        onChange={handleChange('tags')}
                        helpText='Separate tags with commas'
                        multiline
                        fullWidth
                    />
                </div>
                {/* Column 2: Product Tags */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Text as="p" fontWeight="bold">Product Data</Text>
                    <TextField
                        label="SKU"
                        type="number"
                        value={formData.sku}
                        onChange={handleChange('sku')}
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
                    <TextField
                        label="Stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange('stock')}
                        fullWidth
                    />
                </div>
                {/* Column 3: Product Category */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Text as='p'>Product Category</Text>
                    <div style={checkboxCss}>
                        {collections.map((collection) => (
                            <Checkbox
                                key={collection.node.id}
                                label={collection.node.title}
                                checked={selectedCollectionIds.includes(collection.node.id)}
                                onChange={() => handleCollectionChange(collection.node.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <ButtonGroup>
                <Button icon={SendMajor} loading={loading} primary submit>Update</Button>
                <Button icon={CancelMinor} onClick={onCancel} reset monochrome>Cancel</Button>
            </ButtonGroup>
        </Form>
    );
}
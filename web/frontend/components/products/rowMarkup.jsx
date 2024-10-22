import { Badge, Icon, IndexTable, Thumbnail } from "@shopify/polaris";
import { ImageMajor } from '@shopify/polaris-icons';
import React from "react";
import './style.css';
import Update from "./update.jsx";

export default function RowMarkup({ product, cursor, index, inventory, collections, selected, onSelect }) {
    const title = product?.title || "-";
    const status =  product?.status || "-";
    const id = product?.variants?.edges[0]?.node?.inventoryItem?.id.split("/").pop().trim() || 0;
    const productInventory = inventory.find(item => item.inventory_item_id.toString().trim() === id);
    const stock = productInventory?.available !== undefined ? productInventory.available : "out of stock";
    const inventoryId = productInventory?.inventory_item_id;
    const price = product?.variants?.edges[0]?.node?.price || "-";
    const collection = product?.collections?.edges?.map((collect) => (collect.node.title)).join(", ") || "-";
    const imageUrl = product?.featuredImage?.originalSrc || "No Image Available";

    let stat = null;

    if(status === "ACTIVE") {
        stat = "success";
    } else if(status === "DRAFT") {
        stat = "info";
    } else if(status === "INACTIVE") {
        stat = "attention";
    }

    return (
        <>
            <IndexTable.Row
                id={cursor}
                key={cursor}
                selected={selected}
                position={index}
                onClick={onSelect}
            >
                <IndexTable.Cell>
                    {imageUrl !== "No Image Available" ? (
                        <Thumbnail source={imageUrl} alt={`${title} thumbnail`} size="small" />
                    ) : (
                        <div className="defaultIcon">
                            <Icon source={ImageMajor} tone="base" />
                        </div>
                    )}
                </IndexTable.Cell>
                <IndexTable.Cell>{title}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge status={stat}>
                        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                    </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>{stock}</IndexTable.Cell>
                <IndexTable.Cell>{price}</IndexTable.Cell>
                <IndexTable.Cell>{collection}</IndexTable.Cell>
            </IndexTable.Row>
            <tr>
                <td colSpan="6">
                    <Update
                        product={product}
                        stock={stock}
                        inventoryId={inventoryId}
                        inventory={productInventory}
                        collections={collections}
                    />
                </td>
            </tr>
        </>
    );
}
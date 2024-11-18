import { Badge, Icon, IndexTable, Thumbnail, Tooltip } from "@shopify/polaris";
import { EditMinor, ImageMajor, ViewMinor } from '@shopify/polaris-icons';
import React, { useCallback, useState } from "react";
import './style.css';
import Update from "./update.jsx";

export default function RowMarkup({ product, domain, index, inventory, selected, onSelect }) {
    const [open, setOpen] = useState(false);

    const title = product?.title || "-";
    const status = product?.status || "-";
    const variant = product?.variants?.edges?.[0]?.node;
    const id = variant?.inventoryItem?.id?.split("/").pop().trim() || 0;
    const productInventory = inventory.find(
        item => item.inventory_item_id.toString().trim() === id
    );
    const stock = productInventory?.available ?? "out of stock";
    const price = variant?.price || "-";
    const collection = product?.collections?.edges
        ?.map((collect) => collect.node.title)
        .join(", ") || "-";
    const imageUrl = product?.featuredImage?.originalSrc || "No Image Available";
    const handle = product?.handle;

    let stat = null;
    if(status === "ACTIVE") {
        stat = "success";
    } else if(status === "DRAFT") {
        stat = "info";
    } else if(status === "ARCHIVED") {
        stat = null;
    }

    const handleToggle = useCallback(() => setOpen((open) => !open), []);

    return (
        <>
            <IndexTable.Row
                id={product.id}
                key={product.id}
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
                <IndexTable.Cell>
                <div className="title">
                    {title}
                    <div className="viewIcon">
                        <Tooltip content="Preview on Online Store">
                            <a
                                className="viewBtn"
                                href={`https://${domain}/products/${handle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Preview on Online Store"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <Icon source={ViewMinor} />
                            </a>
                        </Tooltip>
                        <Tooltip content="Quick edit">
                            <a
                                className="editBtn"
                                aria-expanded={open}
                                onClick={handleToggle}
                                aria-controls="basic-collapsible"
                            >
                                <Icon source={EditMinor} />
                            </a>
                        </Tooltip>
                    </div>
                </div>
                </IndexTable.Cell>
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
                        open={open}
                        product={product}
                        handleToggle={handleToggle}
                    />
                </td>
            </tr>
        </>
    );
}
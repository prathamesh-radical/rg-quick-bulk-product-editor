// @ts-check
import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import serveStatic from "serve-static";
import PrivacyWebhookHandlers from "./privacy.js";
import productCreator from "./product-creator.js";
import shopify from "./shopify.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

// Add this after the existing product count endpoint
app.get('/api/domain', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    if (session && session.shop) {
      res.status(200).json({ domain: session.shop });
    } else {
      res.status(404).json({ error: 'Session not found or invalid' });
    }
  } catch (error) {
    console.error('Error retrieving myShopifyDomain:', error);
    res.status(500).json({ error: 'Failed to retrieve myShopifyDomain' });
  }
});

app.get("/api/products", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  let allProducts = [];
  let cursor = null;

  do {
    const productData = await client.request(`
      query($cursor: String) {
        products(first: 50, after: $cursor) {
          edges {
            node {
              id
              title
              handle
              updatedAt
              isGiftCard
              productType
              descriptionHtml
              standardizedProductType {
                productTaxonomyNode {
                  name
                  fullName
                }
              }
              featuredImage {
                id
                originalSrc
              }
              images(first: 10) {
                edges {
                  node {
                    id
                    originalSrc
                    altText
                    height
                  }
                }
              }
              media(first: 10) {
                edges {
                  node {
                    ... on Video {
                      id
                      sources {
                        url
                        format
                        height
                        width
                      }
                    }
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    sku
                    price
                    compareAtPrice
                    inventoryQuantity
                    inventoryItem {
                      id
                      sku
                      __typename
                    }
                    metafields(namespace: "shipping", first: 3) {
                      edges {
                        node {
                          key
                          value
                        }
                      }
                    }
                  }
                }
              }
              collections(first: 10) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
              metafields(first: 10) {
                edges {
                  node {
                    id
                    namespace
                    key
                    value
                  }
                }
              }
              createdAt
              status
              tags
              vendor
              __typename
              totalInventory
            }
            cursor
            __typename
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `, { variables: { cursor } });

    allProducts = allProducts.concat(productData.data.products.edges);

    cursor = productData.data.products.pageInfo.hasNextPage
      ? productData.data.products.pageInfo.endCursor
      : null;

  } while (cursor);

  res.status(200).send({ products: allProducts });
});

app.get('/api/collections', async (req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  try {
    const collections = await client.query({
      data: `
        {
          collections(first: 10) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }
      `,
    });

    res.status(200).json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

app.get('/api/product', async (req, res) => {
  const session = res.locals.shopify.session;

  try {
    const product = await shopify.api.rest.Product.all({
      session: session,
      limit: 250,
    });
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error.response);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.get('/api/inventorylevel', async (req, res) => {
  const session = res.locals.shopify.session;

  try {
    const inventoryLevels = await shopify.api.rest.InventoryLevel.all({
      session: session,
      location_ids: "83114426690",
      limit: 250,
    });
    res.status(200).json(inventoryLevels);
  } catch (error) {
    console.error('Error fetching inventory level:', error.response);
    res.status(500).json({ error: 'Failed to fetch inventory level' });
  }
});

app.put('/api/inventorylevel/:id', async (req, res) => {
  const inventoryItemId = req.params.id;
  const { available, locationId } = req.body;

  const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
  });

  try {
      const updatedInventoryLevel = await client.put({
          path: 'inventory_levels/set',
          data: {
              inventory_item_id: inventoryItemId,
              available: available,
              location_id: locationId,
          },
          type: 'application/json',
      });
      res.status(200).send(updatedInventoryLevel);
  } catch (error) {
      console.error('Error updating inventory level:', error);
      res.status(400).send({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  const { product } = req.body;

  const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
  });

  try {
      const updatedProduct = await client.put({
          path: `products/${productId}`,
          data: {product},
          type: 'application/json',
      });
      res.status(200).send(updatedProduct);
  } catch (error) {
      console.error('Error updating product:', error);
      res.status(400).send({ error: error.message });
  }
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);

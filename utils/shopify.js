const { shopifyApi } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');

class ShopifyClient {
  constructor() {
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    this.tokenExpiry = null;

    this.shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_CLIENT_ID,
      apiSecretKey: process.env.SHOPIFY_CLIENT_SECRET,
      scopes: ['read_customers', 'write_customers'],
      hostName: process.env.SHOPIFY_STORE_URL.replace('https://', '').replace('http://', ''),
      apiVersion: '2024-10',
      isEmbeddedApp: false,
    });
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(
        `https://${process.env.SHOPIFY_STORE_URL}/admin/oauth/access_token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.SHOPIFY_CLIENT_ID,
            client_secret: process.env.SHOPIFY_CLIENT_SECRET,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      console.log('✅ Access token refreshed successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to refresh access token:', error);
      throw error;
    }
  }

  async ensureValidToken() {
    if (!this.tokenExpiry || Date.now() >= this.tokenExpiry - 300000) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }

  async makeRequest(endpoint, options = {}) {
    await this.ensureValidToken();

    const url = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-10${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async createCustomer(customerData) {
    return this.makeRequest('/customers.json', {
      method: 'POST',
      body: JSON.stringify({ customer: customerData }),
    });
  }

  async getCustomer(customerId) {
    return this.makeRequest(`/customers/${customerId}.json`);
  }

  async updateCustomer(customerId, updates) {
    return this.makeRequest(`/customers/${customerId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ customer: updates }),
    });
  }

  async setCustomerMetafield(customerId, key, value) {
    const metafield = {
      namespace: 'verification',
      key: key,
      value: value,
      type: 'single_line_text_field',
    };

    return this.makeRequest(`/customers/${customerId}/metafields.json`, {
      method: 'POST',
      body: JSON.stringify({ metafield }),
    });
  }

  async getCustomerMetafields(customerId) {
    return this.makeRequest(`/customers/${customerId}/metafields.json`);
  }

  async tagCustomer(customerId, tags) {
    const customer = await this.getCustomer(customerId);
    const existingTags = customer.customer.tags ? customer.customer.tags.split(', ') : [];
    const newTags = Array.isArray(tags) ? tags : [tags];
    const allTags = [...new Set([...existingTags, ...newTags])];

    return this.updateCustomer(customerId, {
      tags: allTags.join(', '),
    });
  }

  async removeCustomerTag(customerId, tagToRemove) {
    const customer = await this.getCustomer(customerId);
    const existingTags = customer.customer.tags ? customer.customer.tags.split(', ') : [];
    const filteredTags = existingTags.filter(tag => tag !== tagToRemove);

    return this.updateCustomer(customerId, {
      tags: filteredTags.join(', '),
    });
  }

  async searchCustomers(query) {
    return this.makeRequest(`/customers/search.json?query=${encodeURIComponent(query)}`);
  }
}

const shopifyClient = new ShopifyClient();

module.exports = shopifyClient;

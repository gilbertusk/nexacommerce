export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Product Service API', version: '1.0.0', description: 'Product catalog, categories, brands, and inventory' },
  servers: [{ url: '/api/v1' }],
  tags: [
    { name: 'Products', description: 'Product catalog management' },
    { name: 'Categories', description: 'Product category management' },
    { name: 'Brands', description: 'Brand management' },
  ],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' }, name: { type: 'string' }, slug: { type: 'string' },
          description: { type: 'string' }, price: { type: 'number' }, stock: { type: 'integer' },
          weight: { type: 'integer', description: 'Weight in grams' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'] },
          rating: { type: 'number' }, totalReviews: { type: 'integer' },
          categoryId: { type: 'string' }, category: { $ref: '#/components/schemas/Category' },
          brandId: { type: 'string', nullable: true }, brand: { $ref: '#/components/schemas/Brand' },
          sellerId: { type: 'string' },
          images: { type: 'array', items: { $ref: '#/components/schemas/ProductImage' } },
        },
      },
      CreateProductBody: {
        type: 'object', required: ['name', 'slug', 'description', 'price', 'stock', 'categoryId', 'weight'],
        properties: {
          name: { type: 'string', maxLength: 200 }, slug: { type: 'string' },
          description: { type: 'string' }, price: { type: 'number', minimum: 0 },
          stock: { type: 'integer', minimum: 0 }, weight: { type: 'integer', minimum: 1 },
          categoryId: { type: 'string' }, brandId: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
        },
      },
      Category: {
        type: 'object',
        properties: { id: { type: 'string' }, name: { type: 'string' }, slug: { type: 'string' } },
      },
      Brand: {
        type: 'object',
        properties: { id: { type: 'string' }, name: { type: 'string' }, slug: { type: 'string' }, logoUrl: { type: 'string', nullable: true } },
      },
      ProductImage: {
        type: 'object',
        properties: { id: { type: 'string' }, url: { type: 'string' }, alt: { type: 'string' }, isMain: { type: 'boolean' }, sortOrder: { type: 'integer' } },
      },
      PaginatedProducts: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
          meta: { type: 'object', properties: { page: { type: 'integer' }, limit: { type: 'integer' }, total: { type: 'integer' }, totalPages: { type: 'integer' } } },
        },
      },
    },
  },
  paths: {
    '/products/products': {
      get: {
        tags: ['Products'], summary: 'List/search products (public)',
        parameters: [
          { in: 'query', name: 'keyword', schema: { type: 'string' }, description: 'Search by name or description' },
          { in: 'query', name: 'categoryId', schema: { type: 'string' } },
          { in: 'query', name: 'brandId', schema: { type: 'string' } },
          { in: 'query', name: 'sellerId', schema: { type: 'string' } },
          { in: 'query', name: 'minPrice', schema: { type: 'number' } },
          { in: 'query', name: 'maxPrice', schema: { type: 'number' } },
          { in: 'query', name: 'minRating', schema: { type: 'number', minimum: 0, maximum: 5 } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'] } },
          { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'best_selling', 'highest_rating'], default: 'newest' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 12 } },
        ],
        responses: { 200: { description: 'Paginated product list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedProducts' } } } } },
      },
      post: {
        tags: ['Products'], summary: 'Create a product (SELLER/ADMIN)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductBody' } } } },
        responses: { 201: { description: 'Product created', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Product' } } } } } }, 400: { description: 'Validation error' }, 403: { description: 'SELLER or ADMIN only' } },
      },
    },
    '/products/products/{id}': {
      get: {
        tags: ['Products'], summary: 'Get product detail by ID (public)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product detail', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Product' } } } } } }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Products'], summary: 'Update product (owner SELLER or ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductBody' } } } },
        responses: { 200: { description: 'Product updated' }, 403: { description: 'Must be owner or ADMIN' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Products'], summary: 'Delete product — sets status to ARCHIVED (owner SELLER or ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product archived' }, 403: { description: 'Must be owner or ADMIN' } },
      },
    },
    '/products/products/{id}/images': {
      post: {
        tags: ['Products'], summary: 'Add image to product', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['url'], properties: { url: { type: 'string' }, alt: { type: 'string' }, isMain: { type: 'boolean' }, sortOrder: { type: 'integer' } } } } } },
        responses: { 201: { description: 'Image added', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/ProductImage' } } } } } } },
      },
    },
    '/products/products/{id}/images/upload': {
      post: {
        tags: ['Products'], summary: 'Upload a product image (SELLER owner or ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['image'], properties: { image: { type: 'string', format: 'binary' } } } } } },
        responses: { 201: { description: 'Image normalized to WebP and stored' }, 400: { description: 'Invalid image' }, 403: { description: 'Must be product owner or ADMIN' }, 413: { description: 'Upload exceeds 5 MB' }, 503: { description: 'Media storage is not configured' } },
      },
    },
    '/products/categories': {
      get: { tags: ['Categories'], summary: 'List all categories (public)', responses: { 200: { description: 'Category list', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } } } } } },
      post: {
        tags: ['Categories'], summary: 'Create category (ADMIN)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'slug'], properties: { name: { type: 'string' }, slug: { type: 'string' } } } } } },
        responses: { 201: { description: 'Category created' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/products/brands': {
      get: { tags: ['Brands'], summary: 'List all brands (public)', responses: { 200: { description: 'Brand list', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Brand' } } } } } } } } },
      post: {
        tags: ['Brands'], summary: 'Create brand (ADMIN)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'slug'], properties: { name: { type: 'string' }, slug: { type: 'string' }, logoUrl: { type: 'string' } } } } } },
        responses: { 201: { description: 'Brand created' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/products/brands/{id}': {
      patch: {
        tags: ['Brands'], summary: 'Update brand (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, slug: { type: 'string' }, logoUrl: { type: 'string' } } } } } },
        responses: { 200: { description: 'Brand updated' }, 403: { description: 'ADMIN only' } },
      },
      delete: {
        tags: ['Brands'], summary: 'Delete brand (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Brand deleted' }, 403: { description: 'ADMIN only' } },
      },
    },
  },
};

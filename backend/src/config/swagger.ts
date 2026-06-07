import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kütüphane Takip Sistemi API',
      version: '1.0.0',
      description: 'Kütüphane yönetim sistemi için RESTful API',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            code: { type: 'string' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
                hasNext: { type: 'boolean' },
                hasPrev: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Kimlik doğrulama işlemleri' },
      { name: 'Books', description: 'Kitap yönetimi' },
      { name: 'Members', description: 'Üye yönetimi' },
      { name: 'Borrowings', description: 'Ödünç işlemleri' },
      { name: 'Categories', description: 'Kategori yönetimi' },
      { name: 'Authors', description: 'Yazar yönetimi' },
      { name: 'Reservations', description: 'Rezervasyon işlemleri' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export default swaggerJsdoc(options);

# NexaCommerce API Documentation

## API Gateway
Single entry point on Port 3000.

### Downstream Proxy Targets
- `/api/v1/auth/*` proxies to Auth Service (Port 3001)
- `/api/v1/products/*` proxies to Product Service (Port 3003)

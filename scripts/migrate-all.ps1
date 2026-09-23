$services = @("auth-service", "user-service", "product-service", "inventory-service", "order-service", "payment-service", "voucher-service", "shipping-service", "review-service", "notification-service", "analytics-service")

Write-Host "Running migrations for all services..."

foreach ($service in $services) {
    $schemaPath = "apps/$service/prisma/schema.prisma"
    if (Test-Path $schemaPath) {
        Write-Host "--------------------------------------------------"
        Write-Host "Migrating: $service"
        Write-Host "--------------------------------------------------"
        Push-Location "apps/$service"
        npx prisma migrate deploy
        Pop-Location
    }
}

Write-Host "All migrations complete."

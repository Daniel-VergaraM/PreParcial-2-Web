# Etapa 1: Construcción
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci || npm install

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN (npm ci --only=production || npm install --only=production) && npm cache clean --force

# Copiar código compilado desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Cambiar propietario de los archivos
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/travel-plans', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Comando de inicio
CMD ["node", "dist/main"]

# Etapa de desarrollo para depurar problemas de compilación
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Configurar el puerto para Next.js
ENV PORT=8080

# Exponer el puerto para desarrollo
EXPOSE 8080

# Comando predeterminado para ejecutar el servidor de desarrollo
CMD ["npm", "run", "dev"]
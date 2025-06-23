# Usa un'immagine base di Node.js
FROM node:18

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file del progetto
COPY package*.json ./
RUN npm install

RUN npm install -g serve

COPY . .

# Esegui la build (se necessario)
RUN npm run build

# Espone la porta 3000
EXPOSE 3000

# Comando per avviare l'app
CMD ["serve", "-s", "dist"]
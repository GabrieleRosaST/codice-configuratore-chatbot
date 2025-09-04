# Usa una base Node.js (18 va bene)
FROM node:18

# Directory di lavoro
WORKDIR /app

# Copia solo i file necessari per installare le dipendenze
COPY package*.json ./

# Installa le dipendenze (solo quelle in package.json, niente build)
RUN npm install

# Copia TUTTO il resto del codice sorgente nella directory di lavoro
COPY . .

# Espone la porta (usa quella nel tuo app.js: 3002)
EXPOSE 3002

# Comando per avviare il backend (entrypoint: app.js)
CMD ["node", "app.js"]
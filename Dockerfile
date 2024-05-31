#Imagen base
FROM node

# Lo siguiente crea una carpeta donde guardaremos el proyecto
WORKDIR /app

#Copiamos los packages json a la carpeta actual
COPY package*.json ./

#Luego de copiar eso hace el npm install para que cree el node_modules
RUN npm install

#Luego copia todo el código a la carpeta
COPY . .

#exponemos un puerto para que éste escuche a partir del puerto de nuestra compu
EXPOSE 8080

#Esto ejecuta el comando start
CMD ["npm", "run", "dev"]
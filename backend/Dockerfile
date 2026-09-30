FROM node:18-alpine
WORKDIR /app

# Install network diagnostic tools required for the traceroute endpoint
RUN apk update && apk add --no-cache traceroute iproute2 bind-tools

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
# Use the official Node.js image as base
FROM node:latest

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# build app
RUN npm run build

# Expose the port Next.js runs on (usually 3000)
EXPOSE 3000

# Command to start the Next.js server
CMD ["npm", "run", "start"]

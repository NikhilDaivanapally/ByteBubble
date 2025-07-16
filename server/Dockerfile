# Use a base image that includes Node.js and is suitable for your needs.
# 'node:20-bookworm-slim' is a good choice:
# - 'node:20' specifies Node.js version 20. Adjust if you need a different version.
# - 'bookworm-slim' is a slim Debian-based distribution, which means it's smaller
#   and uses 'apt' for package management, which is what we need for poppler-utils.
FROM node:20-bookworm-slim

# Install poppler-utils.
# RUN commands execute during the image build process.
# During this build, the filesystem is writable.
# - 'apt-get update': Updates the package list (essential before installing).
# - 'apt-get install -y poppler-utils': Installs poppler-utils without prompting.
RUN apt-get update && apt-get install -y poppler-utils

# Set the working directory inside the container.
# All subsequent commands (COPY, RUN, CMD) will be executed from this directory.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) first.
# This is a Docker best practice called "layer caching." If these files don't change,
# Docker can reuse the result of the 'npm install' step, speeding up subsequent builds.
COPY package*.json ./

# Install Node.js dependencies.
RUN npm install --production # Use --production to install only production dependencies, keeping the image smaller.
                            # Omit if you need dev dependencies at runtime.

# Copy the rest of your application code into the working directory.
# The '.' on the left refers to your local project directory.
# The '.' on the right refers to the current WORKDIR (/usr/src/app) inside the container.
COPY . .

# Build your application if you have a build step (e.g., for TypeScript, React, etc.).
# If your 'npm run build' command generates static assets or transpiled code,
# this step is crucial. If your Express app is pure Node.js and doesn't
# have a separate build step, you can remove or comment out this line.
RUN npm run build

# Expose the port your Express app listens on.
# This tells Docker that the container listens on this port.
# Render will use this information but also respect your service's port settings.
# Common ports: 3000, 8080. Make sure this matches your Express app's port.
EXPOSE 3000

# Define the command to run your application when the container starts.
# This is what Render will execute to start your Express server.
# Ensure this matches the script you use to start your app (e.g., "node server.js").
CMD [ "npm", "start" ]
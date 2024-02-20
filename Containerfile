FROM docker.io/debian:bookworm-slim
LABEL maintainer="team@penumbralabs.xyz"

# Install curl and gnupg for Node.js installation
RUN apt-get update && apt-get install -y curl gnupg

# Copy only the .nvmrc file to use the specified Node.js version
COPY .nvmrc .

# Use the version specified in .nvmrc to install Node.js
RUN curl -sL https://deb.nodesource.com/setup_$(cat .nvmrc | xargs).x | bash - && \
    apt-get install -y nodejs

# Install Yarn
RUN npm install -g yarn

# Set the project directory
WORKDIR /home/penumbra/dex-explorer

# Copy the rest of the project files
COPY . .

# Install dependencies
RUN yarn install

# Normal user settings
ARG USERNAME=penumbra
ARG UID=1000
ARG GID=1000
RUN groupadd --gid ${GID} ${USERNAME} && \
    useradd -m -d /home/${USERNAME} -g ${GID} -u ${UID} ${USERNAME} && \
    chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}

USER ${USERNAME}
EXPOSE 3000

# Start the app
CMD ["yarn", "dev"]

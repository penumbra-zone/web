FROM docker.io/debian:bookworm-slim
LABEL maintainer="team@penumbralabs.xyz"

# Initial packages for dummy container
RUN apt-get update && apt-get install -y \
        python3 \
        curl \
        jq

# Normal user settings
ARG USERNAME=penumbra
ARG UID=1000
ARG GID=1000
RUN groupadd --gid ${GID} ${USERNAME} \
        && useradd -m -d /home/${USERNAME} -g ${GID} -u ${UID} ${USERNAME}


# Create an example docroot, so we can verify deployment is working.
RUN mkdir -p /home/${USERNAME}/docroot && bash -c "echo 'Hello, world!' > /home/${USERNAME}/docroot/index.html"
WORKDIR /home/${USERNAME}/docroot
USER ${USERNAME}
EXPOSE 8000
CMD [ "python3", "-m", "http.server" ]

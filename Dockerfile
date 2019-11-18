FROM maven:3.6-jdk-11

# Copy Bash script and Maven settings
COPY ./entrypoint.sh /entrypoint.sh
COPY ./settings.xml /settings.xml

# Make Bash script executable
RUN ["chmod", "+x", "/entrypoint.sh"]

ENTRYPOINT ["/entrypoint.sh"]

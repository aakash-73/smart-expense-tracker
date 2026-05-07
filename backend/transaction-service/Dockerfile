# ---- Build Stage ----
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# ---- Runtime Stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/transaction-service-0.0.1-SNAPSHOT.jar app.jar

# Copy shared .env manually (adjust path if needed)
COPY ../.env .env

# Set environment variables from .env
RUN apt-get update && apt-get install -y dos2unix && \
    dos2unix .env && \
    cat .env | grep -v '^#' | xargs -d '\n' -I {} bash -c 'echo export {} >> /etc/profile.d/env_vars.sh'

EXPOSE 8082
ENTRYPOINT ["sh", "-c", "source /etc/profile.d/env_vars.sh && java -jar app.jar"]

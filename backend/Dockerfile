# ---------- Etapa build ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Primero solo el pom: las dependencias quedan en caché si no cambia
COPY pom.xml .
RUN mvn -q dependency:go-offline

COPY src ./src
RUN mvn -q -DskipTests package

# ---------- Etapa run ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/app.jar /app/app.jar

# Vercel enruta al puerto 80 por defecto; Spring lo toma de server.port=${PORT}
ENV PORT=80
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:TieredStopAtLevel=1"

EXPOSE 80
ENTRYPOINT ["java","-jar","/app/app.jar"]

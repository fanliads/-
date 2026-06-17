# 构建阶段
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY req-common/pom.xml req-common/
COPY req-system/pom.xml req-system/
COPY req-requirement/pom.xml req-requirement/
COPY req-sprint/pom.xml req-sprint/
COPY req-admin/pom.xml req-admin/
RUN mvn dependency:go-offline -B || true
COPY . .
RUN mvn package -DskipTests -B

# 运行阶段
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/req-admin/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --spring.profiles.active=prod"]

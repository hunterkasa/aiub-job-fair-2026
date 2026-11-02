# Multi-stage Dockerfile for ASP.NET Core Web API (.NET 10)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for caching dependency restore
COPY AIUB.JobFair.sln ./
COPY AIUB.JobFair.slnx ./
COPY src/Domain/Domain.csproj src/Domain/
COPY src/Application/Application.csproj src/Application/
COPY src/Infrastructure/Infrastructure.csproj src/Infrastructure/
COPY src/Infrastructure.Migrations.PostgreSql/Infrastructure.Migrations.PostgreSql.csproj src/Infrastructure.Migrations.PostgreSql/
COPY src/Infrastructure.Migrations.SqlServer/Infrastructure.Migrations.SqlServer.csproj src/Infrastructure.Migrations.SqlServer/
COPY src/Api/Api.csproj src/Api/
COPY tests/Api.Tests/Api.Tests.csproj tests/Api.Tests/
COPY tests/Application.Tests/Application.Tests.csproj tests/Application.Tests/

RUN dotnet restore AIUB.JobFair.sln

# Copy the remaining source code
COPY . .

# Build and publish Api project
WORKDIR /src/src/Api
RUN dotnet publish Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true

EXPOSE 5000

# Create a non-root user for security
RUN adduser --disabled-password --home /app --gecos '' appuser && chown -R appuser /app
USER appuser

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Api.dll"]

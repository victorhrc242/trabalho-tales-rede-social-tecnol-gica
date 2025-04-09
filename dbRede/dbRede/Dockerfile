# Etapa 1: build
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

# Copia os arquivos
COPY . . 

# Restaura dependências
RUN dotnet restore

# Compila e publica
RUN dotnet publish -c Release -o /out

# Etapa 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build /out .

# Expõe a porta padrão da aplicação
EXPOSE 80

# Comando para rodar a aplicação
ENTRYPOINT ["dotnet", "dbRede.dll"]

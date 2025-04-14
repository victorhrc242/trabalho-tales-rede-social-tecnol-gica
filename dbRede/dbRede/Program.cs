using dbRede.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "dbRede API",
        Version = "v1"
    });
}); ;
builder.Services.AddSingleton<SupabaseService>();
// ✅ Adiciona o SignalR
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});
var app = builder.Build();
// ✅ Mapeia o Hub

// Configure the HTTP request pipeline.
app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "dbRede API v1");
    c.RoutePrefix = "swagger"; // ou "" se quiser acessar direto na raiz
});
app.UseHttpsRedirection();

app.UseAuthorization();
app.MapHub<FeedHub>("/feedHub");
app.MapControllers();

app.Run(); 
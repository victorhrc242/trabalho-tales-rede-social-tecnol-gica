using Microsoft.Extensions.Configuration;
using Supabase;
using System;
using System.Threading.Tasks;

public class SupabaseService
{
    private readonly Client _supabase;

    public SupabaseService(IConfiguration configuration)
    {
        string url = configuration["Supabase:Url"];
        string key = configuration["Supabase:Key"];

        _supabase = new Client(url, key);
    }

    public Client GetClient() => _supabase;
}

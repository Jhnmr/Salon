<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\Stylist;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Faker\Factory as Faker;

class PostsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('=ø Seeding Posts...');

        // Clear existing posts
        Post::query()->delete();

        $faker = Faker::create('es_ES');

        // Get all stylists
        $stylists = Stylist::all();

        if ($stylists->isEmpty()) {
            $this->command->warn('   No stylists found. Please run StylistsSeeder first.');
            return;
        }

        // Caption templates for beauty posts
        $captionTemplates = [
            '( Transformación increíble de hoy {hashtags}',
            'Nuevo look para {name}. ¿Qué les parece? {hashtags}',
            '=‡@ Amando este resultado {hashtags}',
            'Color perfecto para {season} {hashtags}',
            'Antes y después espectacular {hashtags}',
            '< Cada cliente es una obra de arte {hashtags}',
            'Tendencia {year}: {style} {hashtags}',
            'Feliz con este resultado =• {hashtags}',
            ' Detalles que marcan la diferencia {hashtags}',
            'Pasión por lo que hago d {hashtags}',
            'Nuevo estilo, nueva actitud {hashtags}',
            '=% Hot! Este color está de moda {hashtags}',
            'Dedicación y amor en cada corte {hashtags}',
            'Mi trabajo favorito de la semana {hashtags}',
            '=Ž Elegancia y estilo {hashtags}',
            'Cabello sano y hermoso {hashtags}',
            '<: Inspiración tropical {hashtags}',
            'Arte en movimiento {hashtags}',
            'Porque tú lo vales =Q {hashtags}',
            'Realzando tu belleza natural {hashtags}',
        ];

        // Hashtag groups
        $hashtagGroups = [
            'hair' => ['#hair', '#hairstyle', '#haircolor', '#haircut', '#hairtransformation', '#hairgoals', '#hairinspo'],
            'color' => ['#balayage', '#highlights', '#haircolor', '#colormelt', '#colorista', '#hairdye'],
            'style' => ['#hairstylist', '#beautysalon', '#salonlife', '#behindthechair', '#modernsalon'],
            'beauty' => ['#beauty', '#belleza', '#beautiful', '#glam', '#gorgeous', '#stunning'],
            'general' => ['#salon', '#peluqueria', '#estilista', '#beforeandafter', '#makeover', '#transformation'],
        ];

        // Style types
        $styles = ['Balayage', 'Mechas', 'Bob', 'Pixie', 'Long Layers', 'Curls', 'Straight', 'Updo'];

        $count = 0;

        // Create 80 posts distributed over past 6 months
        for ($i = 0; $i < 80; $i++) {
            // Select random stylist
            $stylist = $stylists->random();

            // Random date in past 6 months
            $daysAgo = $faker->numberBetween(1, 180);
            $publishedAt = Carbon::now()->subDays($daysAgo);

            // Generate caption
            $captionTemplate = $faker->randomElement($captionTemplates);

            // Select random hashtags (5-10 hashtags)
            $selectedHashtags = [];
            $numGroups = $faker->numberBetween(2, 4);
            $groupKeys = $faker->randomElements(array_keys($hashtagGroups), $numGroups);

            foreach ($groupKeys as $groupKey) {
                $selectedHashtags = array_merge(
                    $selectedHashtags,
                    $faker->randomElements($hashtagGroups[$groupKey], $faker->numberBetween(2, 3))
                );
            }

            $hashtags = implode(' ', array_unique($selectedHashtags));

            // Replace variables in caption
            $caption = str_replace(
                ['{hashtags}', '{name}', '{season}', '{year}', '{style}'],
                [
                    $hashtags,
                    $faker->firstName,
                    $faker->randomElement(['primavera', 'verano', 'otoño', 'invierno']),
                    date('Y'),
                    $faker->randomElement($styles),
                ],
                $captionTemplate
            );

            // Generate image URLs (1-3 images per post)
            $numImages = $faker->numberBetween(1, 3);
            $images = [];
            $imageUrl = null;

            for ($j = 0; $j < $numImages; $j++) {
                $seed = $faker->uuid;
                $url = 'https://picsum.photos/seed/' . $seed . '/1080/1080';
                $images[] = $url;

                if ($j === 0) {
                    $imageUrl = $url; // First image is the main image
                }
            }

            // Extract hashtags for tags array
            preg_match_all('/#(\w+)/', $caption, $matches);
            $tags = $matches[1] ?? [];

            // Random likes (5-200)
            $likesCount = $faker->numberBetween(5, 200);

            // Random comments (0-50)
            $commentsCount = $faker->numberBetween(0, 50);

            // 90% are portfolio posts
            $isPortfolio = $faker->boolean(90);

            Post::create([
                'stylist_id' => $stylist->id,
                'caption' => $caption,
                'image_url' => $imageUrl,
                'images' => $images,
                'tags' => $tags,
                'is_portfolio' => $isPortfolio,
                'is_visible' => true,
                'likes_count' => $likesCount,
                'comments_count' => $commentsCount,
                'published_at' => $publishedAt,
                'created_at' => $publishedAt,
                'updated_at' => $publishedAt,
            ]);

            $count++;
        }

        $this->command->info(' ' . $count . ' posts created');
        $this->command->info('   Distributed over past 6 months');
        $this->command->info('   Total likes: ' . Post::sum('likes_count'));
        $this->command->info('   Total comments: ' . Post::sum('comments_count'));
    }
}

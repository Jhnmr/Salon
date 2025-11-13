<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Faker\Factory as Faker;

class ConversationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('💬 Seeding Conversations...');

        // Clear existing conversations and messages
        Message::query()->delete();
        Conversation::query()->delete();

        $faker = Faker::create('es_ES');

        // Get clients and stylists
        $clients = User::whereHas('roles', function ($query) {
            $query->where('name', 'client');
        })->get();

        $stylists = User::whereHas('roles', function ($query) {
            $query->where('name', 'stylist');
        })->get();

        if ($clients->isEmpty() || $stylists->isEmpty()) {
            $this->command->warn('⚠️  No clients or stylists found.');
            return;
        }

        // Message templates for conversations
        $clientMessages = [
            // Booking inquiries
            '¡Hola! ¿Tienes disponibilidad para esta semana?',
            'Buenos días, quisiera agendar una cita',
            '¿Me podrías decir tus horarios disponibles?',
            'Hola, ¿cuánto cuesta el servicio de {service}?',
            '¿Tienes espacio para mañana?',

            // Service questions
            '¿Cuánto tiempo toma el servicio de {service}?',
            '¿Qué productos utilizas para {service}?',
            '¿Recomiendas algún tratamiento específico para mi tipo de cabello?',
            '¿El precio incluye el peinado?',
            '¿Necesito llevar algo en particular?',

            // Follow-ups
            'Muchas gracias, quedó increíble!',
            '¿Cuándo debería volver para el retoque?',
            '¿Me recomiendas algún producto para el cuidado en casa?',
            'Perfecto, nos vemos entonces',
            'Gracias por la recomendación',

            // Confirmations
            'Confirmo mi cita para {date}',
            '¿Puedo cambiar la hora a las {time}?',
            'Necesito cancelar, ¿puedo reagendar?',
            '¿A qué hora llegó?',
            'Voy 10 minutos tarde, disculpa',
        ];

        $stylistMessages = [
            // Responses
            '¡Hola! Claro, tengo disponibilidad. ¿Qué día te viene mejor?',
            'Buenos días, con gusto. ¿Qué servicio necesitas?',
            'Tengo disponible el {day} a las {time}. ¿Te viene bien?',
            'El precio es ${price}. ¿Te parece?',
            'Perfecto, te agendo para el {day} a las {time}',

            // Service info
            'El servicio toma aproximadamente {duration} minutos',
            'Utilizo productos profesionales de alta calidad',
            'Te recomendaría {service}, va muy bien con tu tipo de cabello',
            'Sí, el precio incluye todo',
            'No necesitas traer nada, yo tengo todo aquí',

            // Care advice
            'Te recomiendo este shampoo sin sulfatos',
            'Evita usar plancha por 3 días después del tratamiento',
            'Vuelve en 6-8 semanas para el retoque',
            'Usa protector térmico siempre que uses calor',
            'Te mandé la info de los productos por mensaje',

            // Confirmations
            'Listo, estás agendada para {date}',
            'Sin problema, te cambio a las {time}',
            'Claro, ¿qué día te viene mejor?',
            'Te espero entonces 😊',
            'No hay problema, nos vemos!',
        ];

        $services = ['balayage', 'corte', 'color', 'tratamiento', 'manicura', 'peinado'];
        $days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        $times = ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

        $conversationCount = 0;
        $messageCount = 0;

        // Create 40 conversations
        for ($i = 0; $i < 40; $i++) {
            $client = $clients->random();
            $stylist = $stylists->random();

            // Ensure user1_id is always smaller (to avoid duplicates)
            $user1Id = min($client->id, $stylist->id);
            $user2Id = max($client->id, $stylist->id);

            // Random start date (within past 3 months)
            $conversationStartDate = Carbon::now()->subDays($faker->numberBetween(1, 90));

            // Create conversation
            $conversation = Conversation::create([
                'user1_id' => $user1Id,
                'user2_id' => $user2Id,
                'last_message_id' => null,
                'last_message_at' => null,
                'is_active' => true,
                'created_at' => $conversationStartDate,
                'updated_at' => $conversationStartDate,
            ]);

            $conversationCount++;

            // Create 5-10 messages per conversation
            $numMessages = $faker->numberBetween(5, 10);
            $messages = [];
            $currentTime = $conversationStartDate->copy();

            for ($j = 0; $j < $numMessages; $j++) {
                // Alternate between client and stylist
                $isClientSending = $j % 2 === 0;

                $sender = $isClientSending ? $client : $stylist;
                $receiver = $isClientSending ? $stylist : $client;

                // Select message template
                $messageTemplate = $isClientSending
                    ? $faker->randomElement($clientMessages)
                    : $faker->randomElement($stylistMessages);

                // Replace variables
                $messageText = str_replace(
                    ['{service}', '{date}', '{time}', '{day}', '{duration}', '{price}'],
                    [
                        $faker->randomElement($services),
                        $faker->date('d/m/Y'),
                        $faker->randomElement($times),
                        $faker->randomElement($days),
                        $faker->numberBetween(45, 180),
                        $faker->numberBetween(30, 150),
                    ],
                    $messageTemplate
                );

                // Messages are sent with some time between them (5 min to 2 hours)
                if ($j > 0) {
                    $currentTime->addMinutes($faker->numberBetween(5, 120));
                }

                // Some messages are read, some are not
                $isRead = $faker->boolean(80); // 80% read
                $readAt = $isRead ? $currentTime->copy()->addMinutes($faker->numberBetween(1, 30)) : null;

                $message = Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $sender->id,
                    'receiver_id' => $receiver->id,
                    'message' => $messageText,
                    'attachment_url' => null,
                    'attachment_type' => null,
                    'read_at' => $readAt,
                    'is_system_message' => false,
                    'created_at' => $currentTime->copy(),
                    'updated_at' => $currentTime->copy(),
                ]);

                $messages[] = $message;
                $messageCount++;
            }

            // Update conversation with last message
            $lastMessage = end($messages);
            if ($lastMessage) {
                $conversation->update([
                    'last_message_id' => $lastMessage->id,
                    'last_message_at' => $lastMessage->created_at,
                    'updated_at' => $lastMessage->created_at,
                ]);
            }
        }

        $this->command->info('✅ ' . $conversationCount . ' conversations created');
        $this->command->info('   ' . $messageCount . ' messages created');
        $this->command->info('   Average: ' . round($messageCount / $conversationCount) . ' messages per conversation');
    }
}

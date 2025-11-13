<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class InvoicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('📄 Seeding Invoices...');

        // Clear existing invoices
        Invoice::query()->delete();

        $faker = Faker::create('es_ES');

        // Get all completed payments
        $payments = Payment::with('branch')
            ->where('status', Payment::STATUS_COMPLETED)
            ->where('requires_invoice', true)
            ->orderBy('created_at')
            ->get();

        if ($payments->isEmpty()) {
            $this->command->warn('⚠️  No completed payments found.');
            return;
        }

        $count = 0;
        $invoiceCounters = []; // Track invoice numbers per branch

        foreach ($payments as $payment) {
            $branch = $payment->branch;

            if (!$branch) {
                continue;
            }

            // Initialize counter for this branch if not exists
            if (!isset($invoiceCounters[$branch->id])) {
                $invoiceCounters[$branch->id] = 1;
            }

            // Generate invoice number: INV-2024-00001, INV-2024-00002, etc.
            $year = $payment->created_at->format('Y');
            $invoiceNumber = sprintf('INV-%s-%05d', $year, $invoiceCounters[$branch->id]);
            $invoiceCounters[$branch->id]++;

            // Invoice type (most are electronic)
            $invoiceType = $faker->boolean(90) ? Invoice::TYPE_ELECTRONIC : Invoice::TYPE_MANUAL;

            // Hacienda status distribution
            // 80% accepted, 15% pending, 5% rejected
            $statusDistribution = array_merge(
                array_fill(0, 80, Invoice::HACIENDA_ACCEPTED),
                array_fill(0, 15, Invoice::HACIENDA_PENDING),
                array_fill(0, 5, Invoice::HACIENDA_REJECTED)
            );
            $haciendaStatus = $faker->randomElement($statusDistribution);

            // Generate Hacienda key (50 characters)
            $haciendaKey = $invoiceType === Invoice::TYPE_ELECTRONIC
                ? $faker->numerify('##############################################################')
                : null;

            // Hacienda consecutive (20 digits)
            $haciendaConsecutive = $invoiceType === Invoice::TYPE_ELECTRONIC
                ? $faker->numerify('####################')
                : null;

            // XML content (simulated)
            $xmlContent = $invoiceType === Invoice::TYPE_ELECTRONIC
                ? base64_encode('<?xml version="1.0" encoding="UTF-8"?><FacturaElectronica>...</FacturaElectronica>')
                : null;

            $xmlSigned = $invoiceType === Invoice::TYPE_ELECTRONIC
                ? base64_encode('Signed XML content here...')
                : null;

            // PDF URL
            $pdfUrl = 'https://storage.salon.com/invoices/' . $invoiceNumber . '.pdf';

            // Dates
            $issuedAt = $payment->payment_date ?? $payment->created_at;
            $sentToHaciendaAt = $invoiceType === Invoice::TYPE_ELECTRONIC
                ? $issuedAt->copy()->addMinutes($faker->numberBetween(5, 30))
                : null;

            $haciendaResponseAt = $sentToHaciendaAt
                ? $sentToHaciendaAt->copy()->addMinutes($faker->numberBetween(2, 15))
                : null;

            // Response messages
            $messages = [
                Invoice::HACIENDA_ACCEPTED => 'Factura aceptada por Hacienda',
                Invoice::HACIENDA_PENDING => 'En proceso de validación',
                Invoice::HACIENDA_REJECTED => 'Factura rechazada - error en datos',
            ];

            $responseCodes = [
                Invoice::HACIENDA_ACCEPTED => '001',
                Invoice::HACIENDA_PENDING => null,
                Invoice::HACIENDA_REJECTED => '500',
            ];

            Invoice::create([
                'payment_id' => $payment->id,
                'branch_id' => $branch->id,
                'invoice_number' => $invoiceNumber,
                'invoice_type' => $invoiceType,
                'hacienda_key' => $haciendaKey,
                'hacienda_consecutive' => $haciendaConsecutive,
                'xml_content' => $xmlContent,
                'xml_signed' => $xmlSigned,
                'pdf_url' => $pdfUrl,
                'hacienda_status' => $haciendaStatus,
                'hacienda_message' => $messages[$haciendaStatus],
                'response_code' => $responseCodes[$haciendaStatus],
                'issued_at' => $issuedAt,
                'sent_to_hacienda_at' => $sentToHaciendaAt,
                'hacienda_response_at' => $haciendaResponseAt,
                'send_attempts' => $invoiceType === Invoice::TYPE_ELECTRONIC ? 1 : 0,
                'created_at' => $issuedAt,
                'updated_at' => now(),
            ]);

            // Update payment to mark invoice as generated
            $payment->update(['invoice_generated' => true]);

            $count++;
        }

        $this->command->info('✅ ' . $count . ' invoices created');
        $this->command->info('   - ' . Invoice::where('hacienda_status', Invoice::HACIENDA_ACCEPTED)->count() . ' accepted');
        $this->command->info('   - ' . Invoice::where('hacienda_status', Invoice::HACIENDA_PENDING)->count() . ' pending');
        $this->command->info('   - ' . Invoice::where('hacienda_status', Invoice::HACIENDA_REJECTED)->count() . ' rejected');
    }
}

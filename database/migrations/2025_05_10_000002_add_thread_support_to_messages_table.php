<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ensure parent_message_id column exists and is properly indexed
        Schema::table('messages', function (Blueprint $table) {
            if (! Schema::hasColumn('messages', 'parent_message_id')) {
                $table->foreignId('parent_message_id')->nullable()->constrained('messages')->onDelete('cascade');
            }

            // Add thread_reply_count for performance
            if (! Schema::hasColumn('messages', 'thread_reply_count')) {
                $table->integer('thread_reply_count')->default(0);
            }

            // Add last_reply_at for sorting threads
            if (! Schema::hasColumn('messages', 'last_reply_at')) {
                $table->timestamp('last_reply_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (Schema::hasColumn('messages', 'thread_reply_count')) {
                $table->dropColumn('thread_reply_count');
            }

            if (Schema::hasColumn('messages', 'last_reply_at')) {
                $table->dropColumn('last_reply_at');
            }

            // Don't drop parent_message_id as it might be used elsewhere
        });
    }
};

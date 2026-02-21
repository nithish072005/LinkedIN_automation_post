const cron = require('node-cron');

console.log('Starting Scheduler...');

// Run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
    console.log('[SCHEDULER] Triggering daily post generation and publishing...');

    try {
        // Step 1: Generate the post
        const generateResponse = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ manualDay: null }),
        });

        const generatedPost = await generateResponse.json();
        console.log('[SCHEDULER] Post generated:', generatedPost.id);

        // Step 2: Pre-publish validation guards
        if (!generatedPost.isValid) {
            console.log('[SCHEDULER] ❌ Post is not valid. Skipping publish.');
            return;
        }

        // Check LinkedIn connection status
        const connectionResponse = await fetch('http://localhost:3000/api/linkedin/connect');
        const connectionStatus = await connectionResponse.json();

        if (!connectionStatus.connected) {
            console.log('[SCHEDULER] ⚠ LinkedIn not connected. Skipping publish.');
            return;
        }

        if (connectionStatus.tokenExpired) {
            console.log('[SCHEDULER] ⚠ LinkedIn token expired. Manual reconnection required.');
            return;
        }



        // Step 3: Publish to LinkedIn
        console.log('[SCHEDULER] ✓ All guards passed. Publishing to LinkedIn...');

        const publishResponse = await fetch('http://localhost:3000/api/linkedin/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId: generatedPost.id }),
        });

        const publishResult = await publishResponse.json();

        if (publishResponse.ok) {
            console.log('[SCHEDULER] ✅ Post published successfully!', publishResult.linkedinPostId);
        } else {
            console.error('[SCHEDULER] ❌ Publishing failed:', publishResult.error);
        }

    } catch (error) {
        console.error('[SCHEDULER] ❌ Scheduler error:', error.message);
    }
});

console.log('Scheduler is running. Waiting for cron trigger at 9:00 AM daily...');

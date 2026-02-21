const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSettings() {
    try {
        const settings = await prisma.settings.findFirst();

        if (!settings) {
            console.log('❌ No settings found in database');
            return;
        }

        console.log('✅ Settings found:');
        console.log('ID:', settings.id);
        console.log('LinkedIn Access Token:', settings.linkedinAccessToken ? `EXISTS (${settings.linkedinAccessToken.substring(0, 20)}...)` : 'NULL');
        console.log('LinkedIn User ID:', settings.linkedinUserId || 'NULL');
        console.log('LinkedIn Token Expiry:', settings.linkedinTokenExpiry || 'NULL');
        console.log('LinkedIn Connected At:', settings.linkedinConnectedAt || 'NULL');

        if (settings.linkedinTokenExpiry) {
            const now = new Date();
            const expiry = new Date(settings.linkedinTokenExpiry);
            const isExpired = now >= expiry;
            console.log('Token Expired:', isExpired ? '❌ YES' : '✅ NO');
            console.log('Time until expiry:', Math.floor((expiry - now) / 1000 / 60 / 60 / 24), 'days');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkSettings();

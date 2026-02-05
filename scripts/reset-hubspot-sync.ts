/**
 * Reset HubSpot Sync State
 *
 * This script resets the HubSpot sync state to allow re-syncing from a specific date.
 * Useful when syncs have failed and you need to start fresh.
 *
 * Usage: yarn hubspot:reset-sync
 */

import { prisma } from '@vrm/database';

async function resetSyncState() {
  console.log('🔄 Resetting HubSpot sync state...\n');

  try {
    // Get current sync state
    const currentState = await prisma.hubSpotSyncState.findFirst();

    if (currentState) {
      console.log('Current sync state:');
      console.log(`  Last Successful Sync: ${currentState.lastSuccessfulSync.toISOString()}`);
      console.log(`  Deals Processed: ${currentState.dealsProcessed}`);
      console.log(`  Projects Created: ${currentState.projectsCreated}`);
      console.log(`  Projects Updated: ${currentState.projectsUpdated}`);
      console.log(`  Clients Created: ${currentState.clientsCreated}`);
      console.log(`  Failed Imports: ${currentState.failedImports}\n`);

      // Reset to January 1, 2025 (or adjust this date as needed)
      const resetDate = new Date('2025-01-01T00:00:00Z');

      await prisma.hubSpotSyncState.update({
        where: { id: currentState.id },
        data: {
          lastSuccessfulSync: resetDate,
          dealsProcessed: 0,
          clientsCreated: 0,
          projectsCreated: 0,
          projectsUpdated: 0,
          failedImports: 0,
        },
      });

      console.log('✅ Sync state reset successfully!');
      console.log(`   New Last Successful Sync: ${resetDate.toISOString()}\n`);
    } else {
      console.log('ℹ️  No sync state found. Will be created on next sync.\n');
    }

    // Optionally, show recent failed sync logs
    console.log('Recent sync logs:');
    const recentLogs = await prisma.hubSpotSyncLog.findMany({
      take: 5,
      orderBy: { executedAt: 'desc' },
      select: {
        syncType: true,
        status: true,
        dealId: true,
        errorMessage: true,
        executedAt: true,
      },
    });

    if (recentLogs.length > 0) {
      recentLogs.forEach((log) => {
        const statusIcon = log.status === 'SUCCESS' ? '✅' : log.status === 'FAILED' ? '❌' : '⚠️';
        console.log(`  ${statusIcon} ${log.syncType} - ${log.status} (${log.executedAt.toISOString()})`);
        if (log.errorMessage) {
          console.log(`     Error: ${log.errorMessage.substring(0, 100)}${log.errorMessage.length > 100 ? '...' : ''}`);
        }
      });
    } else {
      console.log('  No sync logs found.');
    }

    console.log('\n🎉 You can now run the sync again!\n');
  } catch (error) {
    console.error('❌ Error resetting sync state:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetSyncState()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

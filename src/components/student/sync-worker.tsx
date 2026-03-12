"use client";

import { useEffect, useCallback } from "react";
import { useTestTakingStore } from "@/lib/store/test-taking-store";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/db";

export function SyncWorker() {
  const { token, tenantSlug } = useAuth();
  const store = useTestTakingStore();

  const sync = useCallback(async () => {
    if (!token || !store.attemptId) return;

    try {
      // 1. Get unsynced answers from Dexie
      const unsynced = await db.answers
        .where({ attemptId: store.attemptId, synced: 0 })
        .toArray();

      if (unsynced.length === 0) return;

      console.log(`[SyncWorker] Syncing ${unsynced.length} answers...`);

      // 2. Batch push to API
      // Note: The API might expect multiple answers in one call or individual. 
      // Based on PRD "Batched API POST every 30 seconds", we should try to batch if backend supports it.
      // If backend only supports single, we loop. Assuming batch endpoint /answers/batch exist or using existing one.
      
      const response = await api(`/v1/student/attempts/${store.attemptId}/answers/batch`, {
        method: "POST",
        token,
        tenant: tenantSlug || undefined,
        body: JSON.stringify({
          answers: unsynced.map(a => ({
            question_id: a.questionId,
            selected_options: a.selectedOptions,
            status: a.status,
            time_spent: a.timeSpent,
            updated_at: a.updatedAt
          }))
        })
      });

      if (response.success) {
        // 3. Mark all as synced in Store and Dexie
        for (const ans of unsynced) {
           store.markAsSynced(ans.questionId);
        }
        console.log(`[SyncWorker] Successfully synced ${unsynced.length} answers`);
      }
    } catch (error) {
      console.error("[SyncWorker] Sync failed:", error);
    }
  }, [token, tenantSlug, store]);

  useEffect(() => {
    // Initial sync
    sync();

    // Periodic sync every 30 seconds
    const interval = setInterval(sync, 30000);

    // Sync on window beforeunload
    const handleBeforeUnload = () => sync();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sync]);

  return null; // Invisible component
}

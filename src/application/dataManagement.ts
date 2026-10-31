import { BackupSharePort, Clock, LocalProgressRepository } from "./ports";

export const BACKUP_VERSION = "2.2.0";
export function createDataManagement(local: LocalProgressRepository, backup: BackupSharePort, clock: Clock) {
  async function exportUserDataJSON() {
    return JSON.stringify({ version: BACKUP_VERSION, exportedAt: new Date(clock.wallNow()).toISOString(), data: await local.load() }, null, 2);
  }
  return {
    exportUserDataJSON,
    async importUserDataJSON(json: string) {
      try {
        const parsed = JSON.parse(json);
        await local.save(parsed.data || parsed);
        return await local.load();
      } catch {
        throw new Error("Geçersiz yedekleme dosyası formatı.");
      }
    },
    async exportBackup() {
      const json = await exportUserDataJSON();
      return await backup.export(json) ? null : json;
    },
  };
}

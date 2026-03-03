import Dexie, { Table } from 'dexie';

export interface LocalAnswer {
  id?: number;
  testId: string;
  attemptId: string;
  questionId: string;
  selectedOptions: string[];
  status: string;
  timeSpent: number;
  synced: number; // 0 for false, 1 for true
  updatedAt: number;
}

export class TestMasterDatabase extends Dexie {
  answers!: Table<LocalAnswer>;

  constructor() {
    super('TestMasterDB');
    this.version(1).stores({
      answers: '++id, [testId+attemptId+questionId], attemptId, synced, updatedAt'
    });
  }
}

export const db = new TestMasterDatabase();

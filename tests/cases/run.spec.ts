import { DI } from '../../src';
import { MyStore } from '../store';

const delay = (time = 1) => new Promise(s => setTimeout(s, time));

describe('Run', () => {
  let count1 = 0;
  let count2 = 0;

  class Z extends MyStore {
    clearStore() {
      count1++;
    }
    async initStore() {
      await delay();
      count2++;
    }
  }

  test('Sync', () => {
    const di = new DI<typeof MyStore>();
    di.set(Z).init();

    expect(count1).toEqual(0);
    di.run(store => store.clearStore());
    expect(count1).toEqual(1);
  });

  test('Async', async () => {
    const di = new DI<typeof MyStore>();
    di.set(Z).init();

    expect(count2).toEqual(0);
    await di.runAsync(store => store.initStore());
    expect(count2).toEqual(1);
  });
});

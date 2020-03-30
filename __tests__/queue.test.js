import {Queue} from '../src/module/queue';

it('queue_overflow', () => {
  const queue = new Queue(3, true);
  const expected = [2, 3, 4];
  queue.enqueue(1);
  queue.display();
  queue.enqueue(2);
  queue.display();
  queue.enqueue(3);
  queue.display();
  queue.enqueue(4);
  queue.display();
  expect(queue.getAll()).toEqual(expected);
});

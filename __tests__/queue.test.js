import {Queue} from '../src/module/queue';

it('queue_init', () => {
  const queue = new Queue(3, true);
  queue.enqueue(1);
  queue.display();
  queue.enqueue(2);
  queue.display();
  queue.enqueue(3);
  queue.display();
  queue.enqueue(4);
  queue.display();
});

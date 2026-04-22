from redis import Redis
from rq import Queue

from worker.config import settings
from worker.jobs import generate_weekly_report, refresh_forecasts


def main() -> None:
    queue = Queue(settings.worker_queue, connection=Redis.from_url(settings.redis_url))
    queue.enqueue(refresh_forecasts)
    queue.enqueue(generate_weekly_report)
    print("Default jobs enqueued.")


if __name__ == "__main__":
    main()


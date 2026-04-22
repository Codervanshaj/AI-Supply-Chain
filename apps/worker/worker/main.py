from redis import Redis
from rq import Worker
from rq.connections import connections

from worker.config import settings


def main() -> None:
    redis = Redis.from_url(settings.redis_url)
    with Connection(redis):
        worker = Worker([settings.worker_queue])
        worker.work(with_scheduler=True)


if __name__ == "__main__":
    main()


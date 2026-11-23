from locust import HttpUser, task, between

class MentorLinkUser(HttpUser):
    wait_time = between(1, 2)

    @task(2)
    def check_health(self):
        self.client.get("/health")

    @task(1)
    def list_mentors(self):
        self.client.get("/api/mentors")
